import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin, assertCanManageTarget } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { recordAdminAudit } from "@/lib/audit";
import { db } from "@/db";
import { session as sessionTable, user as userTable } from "@/db/schema";

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
      "revoke sessions for"
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const deletedSessions = await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, targetUser.id))
      .returning({ id: sessionTable.id });

    await recordAdminAudit({
      actorId: adminGuard.auth.user.id,
      actorEmail: adminGuard.auth.user.email,
      action: "revoke_sessions",
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      targetRole: targetUser.role,
      details: { revokedCount: deletedSessions.length },
    });

    return NextResponse.json({
      success: true,
      message: `Revoked ${deletedSessions.length} active session(s) for ${targetUser.name}`,
      revokedCount: deletedSessions.length,
    });
  } catch (error) {
    console.error("POST /api/v1/users/[id]/revoke-sessions error:", error);
    return NextResponse.json(
      { error: "Failed to revoke user sessions" },
      { status: 500 }
    );
  }
}

