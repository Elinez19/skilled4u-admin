import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { bookings } from "./bookings";
import { artisans } from "./artisans";

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  bachsTransactionId: text("bachs_transaction_id"),
  bookingId: text("booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  artisanId: text("artisan_id").references(() => artisans.id, {
    onDelete: "set null",
  }),
  artisanName: text("artisan_name").notNull(),
  amount: integer("amount").notNull(),
  platformFee: integer("platform_fee").notNull().default(0),
  artisanPayout: integer("artisan_payout").notNull().default(0),
  currency: text("currency").notNull().default("NGN"), // "NGN" | "USD" | "GHS" | "KES" | "USDT"
  paymentMethod: text("payment_method").notNull().default("card"), // "card" | "bank_transfer" | "mobile_money" | "usdt"
  status: text("status").notNull().default("initialized"), // "initialized" | "escrowed" | "settled" | "failed" | "refunded"
  escrowStatus: text("escrow_status").notNull().default("pending"), // "pending" | "held" | "released" | "refunded"
  checkoutUrl: text("checkout_url"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  paidAt: timestamp("paid_at"),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PaymentRow = typeof payments.$inferSelect;
export type NewPaymentRow = typeof payments.$inferInsert;

