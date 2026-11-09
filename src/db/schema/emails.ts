import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const emailLogs = pgTable("email_logs", {
  id: text("id").primaryKey(),
  direction: text("direction").notNull().default("outbound"), // "outbound" | "inbound"
  resendId: text("resend_id"),
  fromEmail: text("from_email").notNull(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  templateType: text("template_type").notNull().default("transactional"), // "otp_verification" | "otp_signin" | "password_reset" | "welcome_customer" | "welcome_artisan" | "welcome_admin" | "kyc_status" | "inbound_email" | "transactional"
  textBody: text("text_body"),
  htmlBody: text("html_body"),
  status: text("status").notNull().default("sent"), // "sent" | "delivered" | "received" | "logged_dev" | "bounced" | "complained" | "failed"
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type EmailLogRow = typeof emailLogs.$inferSelect;
export type NewEmailLogRow = typeof emailLogs.$inferInsert;

