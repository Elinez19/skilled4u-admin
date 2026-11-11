import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requireAdmin, assertCanManageTarget } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { recordAdminAudit } from "@/lib/audit";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

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

    // Check RBAC permissions
    const check = assertCanManageTarget(
      adminGuard.auth.user,
      targetUser,
      "trigger password reset for"
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://skilled4u.com";

    await auth.api.requestPasswordReset({
      body: {
        email: targetUser.email,
        redirectTo: `${appUrl}/reset-password`,
      },
      headers: req.headers,
    });

    await recordAdminAudit({
      actorId: adminGuard.auth.user.id,
      actorEmail: adminGuard.auth.user.email,
      action: "reset_password",
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      targetRole: targetUser.role,
      details: { requestedByAdmin: adminGuard.auth.user.email },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset link sent to ${targetUser.email}`,
    });
  } catch (error) {
    console.error("POST /api/v1/users/[id]/reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to request password reset" },
      { status: 500 }
    );
  }
}

