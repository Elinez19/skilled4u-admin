import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categories } from "./categories";

export const artisans = pgTable("artisans", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  trade: text("trade").notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  serviceKey: text("service_key").notNull().default("general"),
  profileImage: text("profile_image").notNull(),
  hourlyRate: text("hourly_rate").notNull(),
  hourlyRateNumeric: integer("hourly_rate_numeric").notNull().default(15000),
  about: text("about").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  portfolioImages: jsonb("portfolio_images").$type<string[]>().notNull().default([]),
  rating: doublePrecision("rating").notNull().default(5.0),
  reviewsCount: integer("reviews_count").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),
  distance: text("distance").notNull().default("2.0 km"),
  city: text("city").notNull().default("Lagos"),
  address: text("address").notNull().default("Lekki Phase 1, Lagos"),
  latitude: doublePrecision("latitude").notNull().default(6.4474),
  longitude: doublePrecision("longitude").notNull().default(3.4723),
  isOnline: boolean("is_online").notNull().default(true),
  kycStatus: text("kyc_status").notNull().default("verified"), // "pending" | "verified" | "rejected"
  ninNumber: text("nin_number"), // Stores masked NIN at rest ("*******4519")
  ninEncrypted: text("nin_encrypted"), // AES-256-GCM encrypted 11-digit NIN
  ninHash: text("nin_hash"), // HMAC-SHA256 blind index for duplicate NIN detection
  kycSelfieUrl: text("kyc_selfie_url"),
  kycIdDocumentUrl: text("kyc_id_document_url"),
  kycIdType: text("kyc_id_type"),
  kycRejectionReason: text("kyc_rejection_reason"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountName: text("bank_account_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ArtisanRow = typeof artisans.$inferSelect;
export type NewArtisanRow = typeof artisans.$inferInsert;

