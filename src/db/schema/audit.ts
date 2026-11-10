import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  targetUserId: text("target_user_id"),
  targetUserEmail: text("target_user_email"),
  targetRole: text("target_role"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdminAuditLogRow = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLogRow = typeof adminAuditLogs.$inferInsert;

