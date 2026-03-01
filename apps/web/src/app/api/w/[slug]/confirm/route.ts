export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@waitlistkit/db";
import { waitlists, subscribers, emailQueue } from "@waitlistkit/db";
import { eq, and, gte, lte, sql } from "@waitlistkit/db";

interface RouteParams {
  params: { slug: string };
}

// CORS headers for cross-origin embed access
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/w/[slug]/confirm?token=REFERRAL_CODE
 *
 * Confirms a subscriber's email. Uses the referral_code as the confirmation token.
 * After confirmation, if the subscriber was referred, the referrer moves up 3 spots.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400, headers: CORS_HEADERS });

  // Find waitlist
  const [wl] = await db
    .select({ id: waitlists.id, primaryColor: waitlists.primaryColor })
    .from(waitlists)
    .where(eq(waitlists.slug, params.slug))
    .limit(1);

  if (!wl) return NextResponse.json({ error: "Waitlist not found" }, { status: 404, headers: CORS_HEADERS });

  // Find subscriber by referral code (used as confirm token)
  const [sub] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.referralCode, token), eq(subscribers.waitlistId, wl.id)))
    .limit(1);

  if (!sub) return NextResponse.json({ error: "Invalid token" }, { status: 404, headers: CORS_HEADERS });

  if (sub.confirmed) {
    return NextResponse.json({ message: "Already confirmed", position: sub.position }, { headers: CORS_HEADERS });
  }

  // Confirm the subscriber
  await db
    .update(subscribers)
    .set({ confirmed: true })
    .where(eq(subscribers.id, sub.id));

  // If this subscriber was referred, move the referrer up 3 spots
  if (sub.referredBy) {
    const [referrer] = await db
      .select({ id: subscribers.id, position: subscribers.position, totalReferrals: subscribers.totalReferrals })
      .from(subscribers)
      .where(eq(subscribers.id, sub.referredBy))
      .limit(1);

    if (referrer) {
      const oldPosition = referrer.position;
      const newPosition = Math.max(1, oldPosition - 3);

      if (newPosition < oldPosition) {
        // Shift everyone between newPosition and oldPosition-1 down by 1
        await db
          .update(subscribers)
          .set({ position: sql`${subscribers.position} + 1` })
          .where(
            and(
              eq(subscribers.waitlistId, wl.id),
              gte(subscribers.position, newPosition),
              lte(subscribers.position, oldPosition - 1),
              // Don't shift the referrer itself
              sql`${subscribers.id} != ${referrer.id}`
            )
          );

        // Update referrer position
        await db
          .update(subscribers)
          .set({ position: newPosition })
          .where(eq(subscribers.id, referrer.id));

        // Queue rank_up email for referrer
        await db.insert(emailQueue).values({
          subscriberId: referrer.id,
          emailType: "rank_up",
          status: "pending",
        });
      }
    }
  }

  return NextResponse.json({ message: "Email confirmed", position: sub.position }, { headers: CORS_HEADERS });
}
