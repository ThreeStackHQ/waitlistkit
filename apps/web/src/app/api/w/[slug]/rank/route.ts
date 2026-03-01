export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@waitlistkit/db";
import { waitlists, subscribers } from "@waitlistkit/db";
import { eq, and, lt, count } from "@waitlistkit/db";

interface RouteParams {
  params: { slug: string };
}

// CORS headers for cross-origin embed access
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400, headers: CORS_HEADERS });

  // Find waitlist
  const [wl] = await db
    .select({ id: waitlists.id })
    .from(waitlists)
    .where(eq(waitlists.slug, params.slug))
    .limit(1);

  if (!wl) return NextResponse.json({ error: "Waitlist not found" }, { status: 404, headers: CORS_HEADERS });

  // Find subscriber by code
  const [sub] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.referralCode, code), eq(subscribers.waitlistId, wl.id)))
    .limit(1);

  if (!sub) return NextResponse.json({ error: "Referral code not found" }, { status: 404, headers: CORS_HEADERS });

  // Count subscribers ahead (lower position number = earlier in queue)
  const [aheadResult] = await db
    .select({ total: count() })
    .from(subscribers)
    .where(and(eq(subscribers.waitlistId, wl.id), lt(subscribers.position, sub.position)));

  const totalAhead = Number(aheadResult?.total ?? 0);
  const referralLink = `${APP_URL}/w/${params.slug}?ref=${code}`;

  return NextResponse.json(
    {
      position: sub.position,
      total_referrals: sub.totalReferrals,
      referral_link: referralLink,
      total_ahead: totalAhead,
    },
    { headers: CORS_HEADERS }
  );
}
