import crypto from "node:crypto";
import { NextRequest, NextResponse, connection } from "next/server";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  assertCanManageTarget,
  normalizeUserRole,
  requireAdmin,
  resolveAdminScope,
} from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { recordAdminAudit } from "@/lib/audit";
import { db } from "@/db";
import {
  bookings,
  session as sessionTable,
  user as userTable,
} from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

function generateSecureTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `Sk4U!${code}`;
}

/**
 * GET /api/v1/users?role=client|admin|artisan
 * Lists users stored in PostgreSQL (Admin only).
 */
export async function GET(req: NextRequest) {
  try {
    await connection();
  } catch {
    // Direct invocation outside Next.js request store
  }

  try {
    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    const rows = roleFilter
      ? await db
          .select()
          .from(userTable)
          .where(eq(userTable.role, normalizeUserRole(roleFilter)))
          .orderBy(desc(userTable.createdAt))
      : await db
          .select()
          .from(userTable)
          .orderBy(desc(userTable.createdAt));

    return NextResponse.json({ data: rows });
  } catch (error) {
    if (
      (error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("GET /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/users
 * Creates a new Customer, Administrator, or Artisan user via Better Auth (Admin only)
 * and sends a Resend welcome/onboarding email.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      city,
      address,
      role: rawRole,
      accountStatus,
      adminRoleTitle,
      adminPermissions,
      adminScope,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const role = normalizeUserRole(rawRole);

    // Granular RBAC: Only a Super Admin can create Administrator accounts
    if (role === "admin") {
      const superGuard = await requireAdmin(req, ["super_admin"]);
      if (!superGuard.ok) return superGuard.response;
    }

    const resolvedCity = city || "Abuja (Wuse II)";
    const resolvedPhone = phone || "+234 803 550 1920";
    const resolvedPassword =
      (password && String(password).trim().length >= 8)
        ? String(password).trim()
        : generateSecureTempPassword();

    const enforceAdminPasswordReset =
      role === "admin" ? (body.mustChangePassword ?? true) : false;

    // Strict 1-Email-1-Role: Reject if email already exists
    const [existing] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          error: `An account with this email address already exists (${normalizeUserRole(
            existing.role
          )} role). Each email is strictly bound to one account.`,
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    const resolvedAdminScope =
      role === "admin"
        ? (adminScope &&
          ["super_admin", "kyc_moderator", "dispatch_support"].includes(adminScope)
            ? adminScope
            : "dispatch_support")
        : null;

    const signUpRes = await auth.api.signUpEmail({
      body: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: resolvedPassword,
        phone: resolvedPhone,
        city: resolvedCity,
        address: address || resolvedCity,
        onboardingStatus: "completed",
        onboardingStep: role === "admin" ? 5 : 3,
        accountStatus:
          accountStatus || (role === "admin" ? "verified" : "active"),
        adminRoleTitle:
          role === "admin"
            ? adminRoleTitle || "Operations Coordinator"
            : undefined,
        adminPermissions:
          role === "admin"
            ? adminPermissions ||
              "User verification, booking dispatch & escrow support"
            : undefined,
        adminScope: resolvedAdminScope || undefined,
      },
    });

    const userId = signUpRes.user.id;

    // Delete the temporary session created by signUpEmail so current Admin's session is unaffected
    if (signUpRes.token) {
      const baseTok = signUpRes.token.includes(".")
        ? signUpRes.token.split(".")[0]
        : signUpRes.token;
      await db.delete(sessionTable).where(eq(sessionTable.token, baseTok));
    }

    const [createdUser] = await db
      .update(userTable)
      .set({
        role,
        phone: resolvedPhone,
        city: resolvedCity,
        address: address || resolvedCity,
        emailVerified: true,
        onboardingStatus: "completed",
        onboardingStep: role === "admin" ? 5 : 3,
        accountStatus:
          accountStatus || (role === "admin" ? "verified" : "active"),
        adminRoleTitle:
          role === "admin"
            ? adminRoleTitle || "Operations Coordinator"
            : null,
        adminPermissions:
          role === "admin"
            ? adminPermissions ||
              "User verification, booking dispatch & escrow support"
            : null,
        adminScope: resolvedAdminScope,
        mustChangePassword: enforceAdminPasswordReset,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId))
      .returning();

    await sendWelcomeOnboardingEmail({
      to: normalizedEmail,
      name: String(name).trim(),
      role,
      city: resolvedCity,
      adminRoleTitle: adminRoleTitle || "Operations Coordinator",
      temporaryPassword: enforceAdminPasswordReset ? resolvedPassword : undefined,
    });

    await recordAdminAudit({
      actorId: adminGuard.auth.user.id,
      actorEmail: adminGuard.auth.user.email,
      action: role === "admin" ? "create_admin" : "create_user",
      targetUserId: createdUser.id,
      targetUserEmail: createdUser.email,
      targetRole: role,
      details: {
        adminScope: resolvedAdminScope,
        adminRoleTitle,
        mustChangePassword: enforceAdminPasswordReset,
      },
    });

    return NextResponse.json({ data: createdUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/users error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/users
 * Updates single or multiple users' details, role, permissions, or account status (Admin only).
 */
export async function PATCH(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

    const body = await req.json();
    const {
      id,
      ids,
      name,
      email,
      phone,
      city,
      address,
      role,
      accountStatus,
      onboardingStatus,
      onboardingStep,
      adminRoleTitle,
      adminPermissions,
      adminScope,
      banned,
      banReason,
    } = body;

    const targetIds: string[] = Array.isArray(ids)
      ? ids.map(String)
      : id
        ? [String(id)]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: "User id or ids array is required" },
        { status: 400 }
      );
    }

    const targetUsers = await db
      .select()
      .from(userTable)
      .where(
        targetIds.length === 1
          ? eq(userTable.id, targetIds[0])
          : inArray(userTable.id, targetIds)
      );

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: "No matching user accounts found" },
        { status: 404 }
      );
    }

    // Enforce target protection and RBAC
    for (const targetUser of targetUsers) {
      const check = assertCanManageTarget(
        adminGuard.auth.user,
        targetUser,
        "modify or suspend"
      );
      if (!check.ok) {
        return NextResponse.json(
          { error: check.error },
          { status: check.status }
        );
      }
    }

    // Role elevation to admin or scope modification strictly requires super_admin
    const isPromotingToAdmin =
      typeof role === "string" && normalizeUserRole(role) === "admin";
    const isModifyingAdminDetails =
      typeof adminRoleTitle === "string" ||
      typeof adminPermissions === "string" ||
      typeof adminScope === "string";

    if (isPromotingToAdmin || isModifyingAdminDetails) {
      const superGuard = await requireAdmin(req, ["super_admin"]);
      if (!superGuard.ok) return superGuard.response;
    }

    const updateValues: Partial<typeof userTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof name === "string" && name.trim()) updateValues.name = name.trim();
    if (typeof email === "string" && email.trim()) {
      updateValues.email = email.trim().toLowerCase();
    }
    if (typeof phone === "string") updateValues.phone = phone.trim();
    if (typeof city === "string") updateValues.city = city.trim();
    if (typeof address === "string") updateValues.address = address.trim();
    if (typeof role === "string") {
      updateValues.role = normalizeUserRole(role);
    }
    if (typeof adminScope === "string") {
      updateValues.adminScope = adminScope;
    }
    if (typeof accountStatus === "string") {
      updateValues.accountStatus = accountStatus;
      if (accountStatus === "suspended") {
        updateValues.banned = true;
      } else if (accountStatus === "active" || accountStatus === "verified") {
        updateValues.banned = false;
      }
    }
    if (typeof onboardingStatus === "string") {
      updateValues.onboardingStatus = onboardingStatus;
    }
    if (typeof onboardingStep === "number") {
      updateValues.onboardingStep = onboardingStep;
    }
    if (typeof adminRoleTitle === "string") {
      updateValues.adminRoleTitle = adminRoleTitle.trim();
    }
    if (typeof adminPermissions === "string") {
      updateValues.adminPermissions = adminPermissions.trim();
    }
    if (typeof banned === "boolean") {
      updateValues.banned = banned;
    }
    if (typeof banReason === "string") {
      updateValues.banReason = banReason;
    }

    // If suspending user(s), immediately revoke all their active sessions
    if (accountStatus === "suspended" || banned === true) {
      await db
        .delete(sessionTable)
        .where(
          targetIds.length === 1
            ? eq(sessionTable.userId, targetIds[0])
            : inArray(sessionTable.userId, targetIds)
        );
    }

    const updatedRows = await db
      .update(userTable)
      .set(updateValues)
      .where(
        targetIds.length === 1
          ? eq(userTable.id, targetIds[0])
          : inArray(userTable.id, targetIds)
      )
      .returning();

    for (const targetUser of targetUsers) {
      const isSuspended = accountStatus === "suspended" || banned === true;
      const isReactivated =
        (accountStatus === "active" || accountStatus === "verified") &&
        targetUser.accountStatus === "suspended";

      await recordAdminAudit({
        actorId: adminGuard.auth.user.id,
        actorEmail: adminGuard.auth.user.email,
        action: isSuspended
          ? "suspend_user"
          : isReactivated
            ? "reactivate_user"
            : targetUser.role === "admin"
              ? "update_admin"
              : "update_user",
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        targetRole: targetUser.role,
        details: {
          updatedFields: Object.keys(updateValues),
          banReason: banReason || null,
        },
      });
    }

    return NextResponse.json({
      data: targetIds.length === 1 ? updatedRows[0] : updatedRows,
    });
  } catch (error) {
    console.error("PATCH /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/users?id=... or ?ids=id1,id2
 * Hard deletes user record(s) (Super Admin only).
 */
export async function DELETE(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const superGuard = await requireAdmin(req, ["super_admin"]);
    if (!superGuard.ok) return superGuard.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    const targetIds = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : id
        ? [id]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: "User id or ids is required" },
        { status: 400 }
      );
    }

    const targetUsers = await db
      .select()
      .from(userTable)
      .where(
        targetIds.length === 1
          ? eq(userTable.id, targetIds[0])
          : inArray(userTable.id, targetIds)
      );

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: "No matching user accounts found to delete" },
        { status: 404 }
      );
    }

    // Safety checks for every target user
    for (const targetUser of targetUsers) {
      const check = assertCanManageTarget(
        superGuard.auth.user,
        targetUser,
        "delete"
      );
      if (!check.ok) {
        return NextResponse.json(
          { error: check.error },
          { status: check.status }
        );
      }

      // Check if target user is the last active super_admin
      if (
        normalizeUserRole(targetUser.role) === "admin" &&
        resolveAdminScope(targetUser) === "super_admin"
      ) {
        const otherAdmins = await db
          .select()
          .from(userTable)
          .where(
            and(
              eq(userTable.role, "admin"),
              ne(userTable.id, targetUser.id),
              ne(userTable.accountStatus, "suspended")
            )
          );
        const hasOtherSuperAdmin = otherAdmins.some(
          (u) => resolveAdminScope(u) === "super_admin"
        );
        if (!hasOtherSuperAdmin) {
          return NextResponse.json(
            {
              error:
                "Cannot delete the last remaining active Super Administrator account.",
            },
            { status: 400 }
          );
        }
      }
    }

    // Check if target users have existing bookings
    const linkedBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(inArray(bookings.clientId, targetIds))
      .limit(1);

    if (linkedBookings.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot permanently delete user account with existing booking records. Please suspend the account instead to maintain historical records.",
          code: "ACCOUNT_HAS_BOOKINGS",
        },
        { status: 400 }
      );
    }

    // Delete active sessions first
    await db
      .delete(sessionTable)
      .where(
        targetIds.length === 1
          ? eq(sessionTable.userId, targetIds[0])
          : inArray(sessionTable.userId, targetIds)
      );

    // Delete users
    await db
      .delete(userTable)
      .where(
        targetIds.length === 1
          ? eq(userTable.id, targetIds[0])
          : inArray(userTable.id, targetIds)
      );

    for (const targetUser of targetUsers) {
      await recordAdminAudit({
        actorId: superGuard.auth.user.id,
        actorEmail: superGuard.auth.user.email,
        action: "delete_user",
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        targetRole: targetUser.role,
        details: { deletedAt: new Date().toISOString() },
      });
    }

    return NextResponse.json({
      success: true,
      deletedCount: targetIds.length,
    });
  } catch (error) {
    console.error("DELETE /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
