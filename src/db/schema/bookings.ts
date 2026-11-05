import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { artisans } from "./artisans";
import { categories } from "./categories";

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  bookingCode: text("booking_code").notNull().unique(),
  clientId: text("client_id"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  artisanId: text("artisan_id")
    .notNull()
    .references(() => artisans.id, { onDelete: "cascade" }),
  artisanName: text("artisan_name").notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  serviceTitle: text("service_title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "in_progress" | "completed" | "cancelled" | "disputed"
  scheduledDate: text("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  address: text("address").notNull(),
  agreedAmount: integer("agreed_amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("unpaid"), // "unpaid" | "escrowed" | "released" | "refunded"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BookingRow = typeof bookings.$inferSelect;
export type NewBookingRow = typeof bookings.$inferInsert;

