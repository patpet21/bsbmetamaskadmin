import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const menu = pgTable("menu", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image_url: text("image_url").notNull(),
  available: boolean("available").notNull().default(true),
  category_id: integer("category_id").references(() => categories.id),
});

export const extras = pgTable("extras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  paid: boolean("paid").notNull().default(false),
  tx_id: text("tx_id"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertMenuSchema = createInsertSchema(menu).omit({
  id: true,
});

export const insertExtrasSchema = createInsertSchema(extras).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
});

export type Category = typeof categories.$inferSelect;
export type Menu = typeof menu.$inferSelect;
export type Extra = typeof extras.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type InsertExtra = z.infer<typeof insertExtrasSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
