import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

export interface RecordAdminAuditInput {
  actorId?: string | null;
  actorEmail: string;
  action:
    | "create_user"
    | "create_admin"
    | "update_user"
    | "update_admin"
    | "suspend_user"
    | "reactivate_user"
    | "delete_user"
    | "reset_password"
    | "revoke_sessions"
    | "verify_artisan"
    | "reject_artisan";
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  targetRole?: string | null;
  details?: Record<string, unknown> | null;
}

export async function recordAdminAudit(input: RecordAdminAuditInput): Promise<void> {
  try {
    const id = `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(adminAuditLogs).values({
      id,
      actorId: input.actorId || null,
      actorEmail: input.actorEmail,
      action: input.action,
      targetUserId: input.targetUserId || null,
      targetUserEmail: input.targetUserEmail || null,
      targetRole: input.targetRole || null,
      details: input.details || null,
    });
  } catch (err) {
    console.error("Failed to record admin audit log:", err);
  }
}
