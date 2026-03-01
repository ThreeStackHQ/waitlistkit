export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@waitlistkit/db";
import { waitlists, subscribers } from "@waitlistkit/db";
import { eq, and, count, sql } from "@waitlistkit/db";

interface RouteParams {
  params: { id: string };
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/waitlists/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [wl] = await db
    .select()
    .from(waitlists)
    .where(and(eq(waitlists.id, params.id), eq(waitlists.userId, session.user.id)))
    .limit(1);

  if (!wl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Stats
  const [stats] = await db
    .select({
      total: count(),
      confirmed: sql<number>`COUNT(*) FILTER (WHERE ${subscribers.confirmed} = true)`,
      withReferrals: sql<number>`COUNT(*) FILTER (WHERE ${subscribers.totalReferrals} > 0)`,
    })
    .from(subscribers)
    .where(eq(subscribers.waitlistId, params.id));

  const total = Number(stats?.total ?? 0);
  const confirmed = Number(stats?.confirmed ?? 0);
  const withReferrals = Number(stats?.withReferrals ?? 0);
  const referralConversionRate = total > 0 ? Math.round((withReferrals / total) * 100) : 0;

  return NextResponse.json({
    waitlist: wl,
    stats: { total, confirmed, withReferrals, referralConversionRate },
  });
}

// PATCH /api/waitlists/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db
    .select({ id: waitlists.id })
    .from(waitlists)
    .where(and(eq(waitlists.id, params.id), eq(waitlists.userId, session.user.id)))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const updates: Partial<typeof waitlists.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description ?? null;
  if (parsed.data.logoUrl !== undefined) updates.logoUrl = parsed.data.logoUrl ?? null;
  if (parsed.data.primaryColor !== undefined) updates.primaryColor = parsed.data.primaryColor;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;

  const [updated] = await db
    .update(waitlists)
    .set(updates)
    .where(eq(waitlists.id, params.id))
    .returning();

  return NextResponse.json({ waitlist: updated });
}

// DELETE /api/waitlists/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db
    .select({ id: waitlists.id })
    .from(waitlists)
    .where(and(eq(waitlists.id, params.id), eq(waitlists.userId, session.user.id)))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(waitlists).where(eq(waitlists.id, params.id)); // cascades to subscribers

  return NextResponse.json({ success: true });
}
