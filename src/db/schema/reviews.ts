import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { bookings } from "./bookings";
import { artisans } from "./artisans";

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),
  artisanId: text("artisan_id")
    .notNull()
    .references(() => artisans.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  clientAvatar: text("client_avatar"),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  serviceTitle: text("service_title").notNull(),
  isVerified: boolean("is_verified").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;

