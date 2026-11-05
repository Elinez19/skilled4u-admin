import { pgTable, text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  iconName: text("icon_name").notNull().default("wrench"),
  iconFamily: text("icon_family").notNull().default("MaterialCommunityIcons"),
  description: text("description"),
  subServices: jsonb("sub_services").$type<string[]>().notNull().default([]),
  basePrice: integer("base_price").notNull().default(10000),
  isPopular: boolean("is_popular").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

