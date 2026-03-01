export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@waitlistkit/db";
import { waitlists, subscribers, referralEvents, emailQueue } from "@waitlistkit/db";
import { eq, and, max, sql } from "@waitlistkit/db";

interface RouteParams {
  params: { slug: string };
}

const joinSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  ref_code: z.string().length(8).optional(),
});

// Simple in-memory rate limiter: 5 signups/min per IP
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimiter.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Find waitlist by slug
  const [wl] = await db
    .select()
    .from(waitlists)
    .where(and(eq(waitlists.slug, params.slug), eq(waitlists.isActive, true)))
    .limit(1);

  if (!wl) return NextResponse.json({ error: "Waitlist not found or inactive" }, { status: 404 });

  const body = await req.json() as unknown;
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { email, name, ref_code } = parsed.data;

  // Check email uniqueness per waitlist
  const [existing] = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(and(eq(subscribers.waitlistId, wl.id), eq(subscribers.email, email)))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Email already registered for this waitlist" }, { status: 409 });
  }

  // Resolve referrer
  let referrerSubscriber: { id: string; totalReferrals: number } | null = null;
  if (ref_code) {
    const [referrer] = await db
      .select({ id: subscribers.id, totalReferrals: subscribers.totalReferrals })
      .from(subscribers)
      .where(and(eq(subscribers.referralCode, ref_code), eq(subscribers.waitlistId, wl.id)))
      .limit(1);
    if (referrer) referrerSubscriber = referrer;
  }

  // Generate unique referral code
  let referralCode = nanoid(8);
  let attempts = 0;
  while (attempts < 5) {
    const [dup] = await db
      .select({ id: subscribers.id })
      .from(subscribers)
      .where(eq(subscribers.referralCode, referralCode))
      .limit(1);
    if (!dup) break;
    referralCode = nanoid(8);
    attempts++;
  }

  // Get next position
  const [maxPos] = await db
    .select({ max: max(subscribers.position) })
    .from(subscribers)
    .where(eq(subscribers.waitlistId, wl.id));

  const position = (maxPos?.max ?? 0) + 1;

  // Insert subscriber
  const [newSub] = await db
    .insert(subscribers)
    .values({
      waitlistId: wl.id,
      email,
      name: name ?? null,
      referralCode,
      referredBy: referrerSubscriber?.id ?? null,
      position,
    })
    .returning();

  // Handle referral
  if (referrerSubscriber && newSub) {
    await db.insert(referralEvents).values({
      waitlistId: wl.id,
      referrerId: referrerSubscriber.id,
      referredId: newSub.id,
    });

    await db
      .update(subscribers)
      .set({ totalReferrals: referrerSubscriber.totalReferrals + 1 })
      .where(eq(subscribers.id, referrerSubscriber.id));
  }

  // Queue welcome email
  if (newSub) {
    await db.insert(emailQueue).values({
      subscriberId: newSub.id,
      emailType: "welcome",
      status: "pending",
    });
  }

  // Update waitlist total
  await db
    .update(waitlists)
    .set({ totalSubscribers: sql`${waitlists.totalSubscribers} + 1` })
    .where(eq(waitlists.id, wl.id));

  const referralLink = `${APP_URL}/w/${params.slug}?ref=${referralCode}`;

  return NextResponse.json(
    {
      id: newSub!.id,
      position,
      referral_code: referralCode,
      referral_link: referralLink,
    },
    { status: 201 }
  );
}
