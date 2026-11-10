import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  assertCanManageTarget,
  normalizeUserRole,
  requireAdmin,
} from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { recordAdminAudit } from "@/lib/audit";
import { db } from "@/db";
import { session as sessionTable, user as userTable } from "@/db/schema";
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    // Resending credentials with a temporary password is restricted to Super Admins
    const superGuard = await requireAdmin(req, ["super_admin"]);
    if (!superGuard.ok) return superGuard.response;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const [targetUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const check = assertCanManageTarget(
      superGuard.auth.user,
      targetUser,
      "resend credentials for"
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const tempPassword = generateSecureTempPassword();

    // Use Better Auth admin API to set new temporary password
    try {
      await auth.api.setUserPassword({
        body: {
          userId: targetUser.id,
          newPassword: tempPassword,
        },
        headers: req.headers,
      });
    } catch {
      // Fallback: If session headers aren't recognized by adminMiddleware, update via account table
      // Better Auth hashPassword
      const { hashPassword } = await import("better-auth/crypto");
      const hashedPassword = await hashPassword(tempPassword);
      const { account } = await import("@/db/schema");
      await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(account.userId, targetUser.id));
    }

    // Set mustChangePassword = true
    await db
      .update(userTable)
      .set({
        mustChangePassword: true,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, targetUser.id));

    // Invalidate existing sessions so user is forced through 2-Step Login + Password Rotation
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, targetUser.id));

    // Send email with new temporary credentials
    await sendWelcomeOnboardingEmail({
      to: targetUser.email,
      name: targetUser.name,
      role: normalizeUserRole(targetUser.role),
      city: targetUser.city || "Abuja",
      adminRoleTitle: targetUser.adminRoleTitle || "Operations Administrator",
      temporaryPassword: tempPassword,
    });

    await recordAdminAudit({
      actorId: superGuard.auth.user.id,
      actorEmail: superGuard.auth.user.email,
      action: "create_admin",
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      targetRole: targetUser.role,
      details: {
        actionNote: "Resent credentials with fresh temporary password",
        mustChangePassword: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Fresh credentials and login instructions sent to ${targetUser.email}`,
    });
  } catch (error) {
    console.error("POST /api/v1/users/[id]/resend-invite error:", error);
    return NextResponse.json(
      { error: "Failed to resend credentials" },
      { status: 500 }
    );
  }
}

