export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@waitlistkit/db";
import { waitlists, subscribers } from "@waitlistkit/db";
import { eq, and, desc } from "@waitlistkit/db";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const [wl] = await db
    .select({ id: waitlists.id })
    .from(waitlists)
    .where(and(eq(waitlists.id, params.id), eq(waitlists.userId, session.user.id)))
    .limit(1);

  if (!wl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const top10 = await db
    .select({
      name: subscribers.name,
      email: subscribers.email,
      totalReferrals: subscribers.totalReferrals,
    })
    .from(subscribers)
    .where(eq(subscribers.waitlistId, params.id))
    .orderBy(desc(subscribers.totalReferrals))
    .limit(10);

  // Anonymize names: "John Doe" → "John D."
  const leaderboard = top10.map((s) => {
    const displayName = s.name ?? s.email.split("@")[0];
    const parts = displayName.split(" ");
    const anonymized =
      parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : displayName;
    return { name: anonymized, totalReferrals: s.totalReferrals };
  });

  return NextResponse.json({ leaderboard });
}
