import { pgTable, text, uuid, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlists = pgTable("waitlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  apiKey: text("api_key").notNull().unique(), // wk_live_...
  headline: text("headline").notNull().default("Join the waitlist"),
  description: text("description"),
  buttonText: text("button_text").notNull().default("Join Waitlist"),
  accentColor: text("accent_color").notNull().default("#8b5cf6"),
  referralEnabled: boolean("referral_enabled").notNull().default(true),
  totalSignups: integer("total_signups").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signups = pgTable("signups", {
  id: uuid("id").primaryKey().defaultRandom(),
  waitlistId: uuid("waitlist_id").notNull().references(() => waitlists.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name"),
  referralCode: text("referral_code").notNull().unique(), // their own code to share
  referredBy: text("referred_by"), // code of who referred them
  referralCount: integer("referral_count").notNull().default(0),
  position: integer("position").notNull(), // position in queue
  status: text("status").notNull().default("waiting"), // waiting, invited, joined
  invitedAt: timestamp("invited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  waitlistEmailUniq: index("signups_waitlist_email_idx").on(t.waitlistId, t.email),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier").notNull().default("free"),
  status: text("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlistsRelations = relations(waitlists, ({ one, many }) => ({
  user: one(users, { fields: [waitlists.userId], references: [users.id] }),
  signups: many(signups),
}));
export const signupsRelations = relations(signups, ({ one }) => ({
  waitlist: one(waitlists, { fields: [signups.waitlistId], references: [waitlists.id] }),
}));

export type User = typeof users.$inferSelect;
export type Waitlist = typeof waitlists.$inferSelect;
export type Signup = typeof signups.$inferSelect;
export type NewSignup = typeof signups.$inferInsert;
