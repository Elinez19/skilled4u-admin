import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/auth-guard";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * GET /api/v1/users?role=client|admin|artisan
 * Lists users stored in NeonDB PostgreSQL.
 */
export async function GET(req: NextRequest) {
  try {
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
      { error: "Failed to fetch users from NeonDB" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/users
 * Creates a new Customer, Administrator, or Artisan user in NeonDB via Better Auth
 * and sends a Resend welcome/onboarding email.
 */
export async function POST(req: NextRequest) {
  try {
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
    const resolvedCity = city || "Abuja (Wuse II)";
    const resolvedPhone = phone || "+234 803 550 1920";
    const resolvedPassword =
      password || (role === "admin" ? "Admin@2026" : "Customer@2026");

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
 * Updates user details, role, permissions, or account status in NeonDB.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
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

    if (!id) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
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

    const [updated] = await db
      .update(userTable)
      .set(updateValues)
      .where(eq(userTable.id, String(id)))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to update user in NeonDB" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/users?id=...
 * Deletes a user record from NeonDB.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }

    await db.delete(userTable).where(eq(userTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to delete user from NeonDB" },
      { status: 500 }
    );
  }
}
