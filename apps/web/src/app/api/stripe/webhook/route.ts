export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@waitlistkit/db";
import { users, subscriptions } from "@waitlistkit/db";
import { eq } from "@waitlistkit/db";
import { PLAN_PRICES } from "@/lib/tier";
import type { Plan } from "@/lib/tier";

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = req.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await getRawBody(req);
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkoutSession, stripe);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] Handler error", event.type, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  if (session.mode !== "subscription") return;

  const userId = session.metadata?.userId;
  if (!userId) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const priceId = stripeSubscription.items.data[0]?.price.id ?? "";
  const planInfo = PLAN_PRICES[priceId];
  const plan: Plan = planInfo?.plan ?? "starter";
  const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

  // Upsert subscription record
  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        plan,
        currentPeriodEnd: periodEnd,
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({
      userId,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      plan,
      currentPeriodEnd: periodEnd,
    });
  }

  // Update user plan
  await db.update(users).set({ plan }).where(eq(users.id, userId));
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price.id ?? "";
  const planInfo = PLAN_PRICES[priceId];
  const plan: Plan = planInfo?.plan ?? "free";
  const periodEnd = new Date(sub.current_period_end * 1000);

  await db
    .update(subscriptions)
    .set({
      status: sub.status,
      plan,
      currentPeriodEnd: periodEnd,
    })
    .where(eq(subscriptions.userId, userId));

  await db.update(users).set({ plan }).where(eq(users.id, userId));
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  await db
    .update(subscriptions)
    .set({ status: "canceled", plan: "free" })
    .where(eq(subscriptions.userId, userId));

  // Downgrade user to free
  await db.update(users).set({ plan: "free" }).where(eq(users.id, userId));
}
