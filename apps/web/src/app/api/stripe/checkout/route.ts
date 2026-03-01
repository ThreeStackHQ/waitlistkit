export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@waitlistkit/db";
import { users } from "@waitlistkit/db";
import { eq } from "@waitlistkit/db";

const checkoutSchema = z.object({
  priceId: z.string(),
});

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID ?? "",
  growth:  process.env.STRIPE_GROWTH_PRICE_ID ?? "",
  scale:   process.env.STRIPE_SCALE_PRICE_ID ?? "",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  // Get or create Stripe customer
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const priceId = parsed.data.priceId;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${APP_URL}/dashboard/billing`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
