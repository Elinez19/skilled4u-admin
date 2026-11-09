import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { normalizeUserRole, requireAdmin } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { db } from "@/db";
import { session as sessionTable, user as userTable } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * GET /api/v1/users?role=client|admin|artisan
 * Lists users stored in PostgreSQL (Admin only).
 */
export async function GET(req: NextRequest) {
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
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const role = normalizeUserRole(rawRole);

    // Granular RBAC: Only a Super Admin can create or modify Administrator accounts
    if (role === "admin") {
      const superGuard = await requireAdmin(req, ["super_admin"]);
      if (!superGuard.ok) return superGuard.response;
    }

    const resolvedCity = city || "Abuja (Wuse II)";
    const resolvedPhone = phone || "+234 803 550 1920";
    const resolvedPassword =
      password || (role === "admin" ? "Admin@2026" : "Customer@2026");
    const enforceAdminPasswordReset =
      role === "admin" ? (body.mustChangePassword ?? true) : false;

    const [existing] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (existing) {
      const [updatedExisting] = await db
        .update(userTable)
        .set({
          name: String(name).trim(),
          phone: resolvedPhone,
          city: resolvedCity,
          address: address || resolvedCity,
          role,
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
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, existing.id))
        .returning();

      return NextResponse.json({ data: updatedExisting }, { status: 200 });
    }

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
      },
    });

    const userId = signUpRes.user.id;

    // Delete the temporary session created by signUpEmail so the current Admin's session is unaffected
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

    if (
      typeof role === "string" &&
      normalizeUserRole(role) === "admin"
    ) {
      const superGuard = await requireAdmin(req, ["super_admin"]);
      if (!superGuard.ok) return superGuard.response;
    }
    if (
      typeof adminRoleTitle === "string" ||
      typeof adminPermissions === "string"
    ) {
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

    const updatedRows = await db
      .update(userTable)
      .set(updateValues)
      .where(
        targetIds.length === 1
          ? eq(userTable.id, targetIds[0])
          : inArray(userTable.id, targetIds)
      )
      .returning();

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
 * Deletes user record(s) (Admin only).
 */
export async function DELETE(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

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

    await db
      .delete(userTable)
      .where(
        targetIds.length === 1
          ? eq(userTable.id, targetIds[0])
          : inArray(userTable.id, targetIds)
      );
    return NextResponse.json({ success: true, deletedCount: targetIds.length });
  } catch (error) {
    console.error("DELETE /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
