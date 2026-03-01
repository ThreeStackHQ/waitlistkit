export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@waitlistkit/db";
import { users } from "@waitlistkit/db";
import { eq } from "@waitlistkit/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({ email, name: name ?? null, passwordHash }).returning({ id: users.id, email: users.email, name: users.name });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("[signup]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
