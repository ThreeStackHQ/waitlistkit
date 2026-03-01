export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canCreateWaitlist } from "@/lib/tier";
import { db } from "@waitlistkit/db";
import { waitlists, subscribers } from "@waitlistkit/db";
import { eq, count, sql } from "@waitlistkit/db";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// GET /api/waitlists
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: waitlists.id,
      slug: waitlists.slug,
      name: waitlists.name,
      description: waitlists.description,
      logoUrl: waitlists.logoUrl,
      primaryColor: waitlists.primaryColor,
      isActive: waitlists.isActive,
      totalSubscribers: waitlists.totalSubscribers,
      createdAt: waitlists.createdAt,
      subscriberCount: count(subscribers.id),
    })
    .from(waitlists)
    .leftJoin(subscribers, eq(subscribers.waitlistId, waitlists.id))
    .where(eq(waitlists.userId, session.user.id))
    .groupBy(waitlists.id);

  return NextResponse.json({ waitlists: rows });
}

// POST /api/waitlists
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canCreate = await canCreateWaitlist(session.user.id);
  if (!canCreate) {
    return NextResponse.json(
      { error: "Plan limit reached. Upgrade to create more waitlists." },
      { status: 403 }
    );
  }

  const body = await req.json() as unknown;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { name, slug, description, logoUrl, primaryColor } = parsed.data;

  // Check slug uniqueness
  const existing = await db
    .select({ id: waitlists.id })
    .from(waitlists)
    .where(eq(waitlists.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const [wl] = await db
    .insert(waitlists)
    .values({
      userId: session.user.id,
      name,
      slug,
      description: description ?? null,
      logoUrl: logoUrl ?? null,
      primaryColor: primaryColor ?? "#8b5cf6",
    })
    .returning();

  return NextResponse.json({ waitlist: wl }, { status: 201 });
}
