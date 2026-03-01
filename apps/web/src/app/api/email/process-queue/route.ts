export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@waitlistkit/db";
import { emailQueue, subscribers, waitlists } from "@waitlistkit/db";
import { eq, and, asc } from "@waitlistkit/db";
import { sendWelcomeEmail, sendRankUpEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  // Simple security: require a secret header or allow internal cron calls
  const cronSecret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch pending emails (batch of 50)
  const pending = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.status, "pending"))
    .orderBy(asc(emailQueue.createdAt))
    .limit(50);

  let sent = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      // Get subscriber + waitlist
      const [sub] = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.id, item.subscriberId))
        .limit(1);

      if (!sub) {
        await db
          .update(emailQueue)
          .set({ status: "failed", sentAt: new Date() })
          .where(eq(emailQueue.id, item.id));
        failed++;
        continue;
      }

      const [wl] = await db
        .select()
        .from(waitlists)
        .where(eq(waitlists.id, sub.waitlistId))
        .limit(1);

      if (!wl) {
        await db
          .update(emailQueue)
          .set({ status: "failed", sentAt: new Date() })
          .where(eq(emailQueue.id, item.id));
        failed++;
        continue;
      }

      if (item.emailType === "welcome") {
        await sendWelcomeEmail(sub, wl);
      } else if (item.emailType === "rank_up") {
        // For rank_up we need old vs new position — we store current as new, old = current + 3 (approximate)
        // A more robust system would store old position in the queue; this is good enough for v1
        const oldPosition = sub.position + 3;
        await sendRankUpEmail(sub, wl, sub.position, oldPosition);
      }
      // digest emails are sent separately via admin trigger

      await db
        .update(emailQueue)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailQueue.id, item.id));

      sent++;
    } catch (err) {
      console.error("[process-queue] Failed to send email", item.id, err);
      await db
        .update(emailQueue)
        .set({ status: "failed", sentAt: new Date() })
        .where(eq(emailQueue.id, item.id));
      failed++;
    }
  }

  return NextResponse.json({ processed: pending.length, sent, failed });
}
