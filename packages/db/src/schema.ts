import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const planEnum = pgEnum("plan", ["free", "starter", "growth", "scale"]);
export const emailTypeEnum = pgEnum("email_type", ["welcome", "rank_up", "digest"]);
export const emailStatusEnum = pgEnum("email_status", ["pending", "sent", "failed"]);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const waitlists = pgTable("waitlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#8b5cf6"),
  isActive: boolean("is_active").notNull().default(true),
  totalSubscribers: integer("total_subscribers").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    waitlistId: uuid("waitlist_id")
      .notNull()
      .references(() => waitlists.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    referralCode: text("referral_code").notNull().unique(),
    referredBy: uuid("referred_by"), // FK → subscribers(id), set after insert to avoid circular
    position: integer("position").notNull(),
    totalReferrals: integer("total_referrals").notNull().default(0),
    confirmed: boolean("confirmed").notNull().default(false),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    waitlistEmailUniq: uniqueIndex("subscribers_waitlist_email_idx").on(t.waitlistId, t.email),
    referralCodeIdx: index("subscribers_referral_code_idx").on(t.referralCode),
  })
);

export const referralEvents = pgTable("referral_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  waitlistId: uuid("waitlist_id")
    .notNull()
    .references(() => waitlists.id, { onDelete: "cascade" }),
  referrerId: uuid("referrer_id")
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  referredId: uuid("referred_id")
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailQueue = pgTable("email_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriberId: uuid("subscriber_id")
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  emailType: emailTypeEnum("email_type").notNull(),
  status: emailStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("active"),
  plan: planEnum("plan").notNull().default("free"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  waitlists: many(waitlists),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));

export const waitlistsRelations = relations(waitlists, ({ one, many }) => ({
  user: one(users, { fields: [waitlists.userId], references: [users.id] }),
  subscribers: many(subscribers),
  referralEvents: many(referralEvents),
  emailQueue: many(emailQueue),
}));

export const subscribersRelations = relations(subscribers, ({ one, many }) => ({
  waitlist: one(waitlists, { fields: [subscribers.waitlistId], references: [waitlists.id] }),
  emailQueue: many(emailQueue),
  referralsMade: many(referralEvents, { relationName: "referrer" }),
  referredByEvent: many(referralEvents, { relationName: "referred" }),
}));

export const referralEventsRelations = relations(referralEvents, ({ one }) => ({
  waitlist: one(waitlists, { fields: [referralEvents.waitlistId], references: [waitlists.id] }),
  referrer: one(subscribers, {
    fields: [referralEvents.referrerId],
    references: [subscribers.id],
    relationName: "referrer",
  }),
  referred: one(subscribers, {
    fields: [referralEvents.referredId],
    references: [subscribers.id],
    relationName: "referred",
  }),
}));

export const emailQueueRelations = relations(emailQueue, ({ one }) => ({
  subscriber: one(subscribers, {
    fields: [emailQueue.subscriberId],
    references: [subscribers.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Waitlist = typeof waitlists.$inferSelect;
export type NewWaitlist = typeof waitlists.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type ReferralEvent = typeof referralEvents.$inferSelect;
export type NewReferralEvent = typeof referralEvents.$inferInsert;
export type EmailQueue = typeof emailQueue.$inferSelect;
export type NewEmailQueue = typeof emailQueue.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
