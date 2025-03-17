import { pgTable, text, serial, timestamp, integer, jsonb, boolean, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subscription tier enum
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'basic', 'premium', 'enterprise']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default('free').notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  interval: varchar("interval", { length: 50 }).notNull(), // monthly, yearly
  tier: subscriptionTierEnum("tier").notNull(),
  features: jsonb("features").notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Regular frequency reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  frequency: integer("frequency").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  frequency: true,
  description: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Threat reports for security incidents
export const threatReports = pgTable("threat_reports", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull().unique(), // Client-generated unique ID
  type: text("type").notNull(), // 'v2k', 'sound-cannon', 'laser', 'unknown'
  status: text("status").notNull().default('active'), // 'active', 'resolved', 'investigating'
  signalStrength: integer("signal_strength").notNull(),
  frequencyRange: text("frequency_range").notNull(),
  detectionTime: timestamp("detection_time").notNull(),
  lastUpdateTime: timestamp("last_update_time").notNull(),
  location: jsonb("location").default(null), // Optional location data
  deviceInfo: jsonb("device_info").notNull(), // Device information
  networkInfo: jsonb("network_info").default(null), // Optional network information
  signalPatterns: jsonb("signal_patterns").default(null), // Optional signal pattern data
  advancedMetrics: jsonb("advanced_metrics").default(null), // Optional advanced metrics
  sourceAnalysis: jsonb("source_analysis").default(null), // Optional source analysis
  isCountermeasureActive: boolean("is_countermeasure_active").default(false),
  notes: text("notes").default(''),
});

// Schema for creating a new threat report
export const insertThreatReportSchema = z.object({
  reportId: z.string(),
  type: z.enum(['v2k', 'sound-cannon', 'laser', 'unknown']),
  signalStrength: z.number(),
  frequencyRange: z.string(),
  detectionTime: z.date(),
  deviceInfo: z.record(z.string(), z.any()),
  location: z.record(z.string(), z.any()).optional(),
  networkInfo: z.record(z.string(), z.any()).optional(),
  signalPatterns: z.record(z.string(), z.any()).optional(),
  advancedMetrics: z.record(z.string(), z.any()).optional(),
  isCountermeasureActive: z.boolean().optional(),
});

export type InsertThreatReport = z.infer<typeof insertThreatReportSchema>;
export type ThreatReport = typeof threatReports.$inferSelect;
