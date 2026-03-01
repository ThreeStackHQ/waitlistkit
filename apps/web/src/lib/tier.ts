import { db } from "@waitlistkit/db";
import { users, subscriptions, waitlists } from "@waitlistkit/db";
import { eq, count } from "@waitlistkit/db";

export type Plan = "free" | "starter" | "growth" | "scale";

export const PLAN_LIMITS: Record<Plan, { waitlists: number | null; subscribers: number }> = {
  free:    { waitlists: 1,    subscribers: 100 },
  starter: { waitlists: 3,    subscribers: 1_000 },
  growth:  { waitlists: null, subscribers: 10_000 },
  scale:   { waitlists: null, subscribers: 100_000 },
};

export const PLAN_PRICES: Record<string, { plan: Plan; name: string; price: number }> = {
  [process.env.STRIPE_STARTER_PRICE_ID ?? "starter"]: { plan: "starter", name: "Starter", price: 9 },
  [process.env.STRIPE_GROWTH_PRICE_ID ?? "growth"]:   { plan: "growth",  name: "Growth",  price: 29 },
  [process.env.STRIPE_SCALE_PRICE_ID ?? "scale"]:     { plan: "scale",   name: "Scale",   price: 79 },
};

export async function getUserTier(userId: string): Promise<Plan> {
  const [user] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return (user?.plan ?? "free") as Plan;
}

export async function canCreateWaitlist(userId: string): Promise<boolean> {
  const plan = await getUserTier(userId);
  const limit = PLAN_LIMITS[plan].waitlists;
  if (limit === null) return true;

  const [result] = await db
    .select({ c: count() })
    .from(waitlists)
    .where(eq(waitlists.userId, userId));

  return (result?.c ?? 0) < limit;
}

export async function getSubLimit(userId: string): Promise<number> {
  const plan = await getUserTier(userId);
  return PLAN_LIMITS[plan].subscribers;
}
