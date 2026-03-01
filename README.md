# WaitlistKit

**Pre-launch waitlist for indie SaaS** — embed a waitlist form, auto-send invite emails, track referral growth.

## What it does
- Beautiful embeddable waitlist form (vanilla JS widget)
- Auto-send welcome + invite emails (Resend)
- Referral tracking: "move up in line by inviting friends"
- Dashboard: signups, referrals, invite queue

## Stack
- Next.js 14 + TypeScript + TailwindCSS + Drizzle ORM
- Resend for transactional email
- Vanilla JS widget (<3KB, zero dependencies)

## Structure
```
apps/web      — Dashboard + API
apps/widget   — Embeddable waitlist form
packages/db   — Schema + client
packages/config — Shared configs
```
