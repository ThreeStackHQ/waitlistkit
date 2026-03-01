import { Resend } from "resend";
import type { Subscriber, Waitlist, User } from "@waitlistkit/db";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "hello@waitlistkit.threestack.io";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseLayout(content: string, color = "#8b5cf6") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>WaitlistKit</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
      <tr><td style="background:${color};padding:24px 32px;">
        <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">WaitlistKit ⚡</span>
      </td></tr>
      <tr><td style="padding:32px;">${content}</td></tr>
      <tr><td style="padding:16px 32px 24px;border-top:1px solid #2a2a2a;">
        <p style="margin:0;color:#555;font-size:12px;">
          You received this email because you signed up for a waitlist powered by
          <a href="${APP_URL}" style="color:${color};">WaitlistKit</a>.
          <br/>
          <a href="${APP_URL}/unsubscribe" style="color:#555;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendWelcomeEmail(
  subscriber: Subscriber,
  waitlist: Waitlist
) {
  const referralLink = `${APP_URL}/w/${waitlist.slug}?ref=${subscriber.referralCode}`;
  const twitterText = encodeURIComponent(
    `I just joined the ${waitlist.name} waitlist! Get early access 👉 ${referralLink}`
  );
  const linkedinUrl = encodeURIComponent(referralLink);
  const color = waitlist.primaryColor ?? "#8b5cf6";

  const content = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:700;">You're on the list! 🎉</h2>
    <p style="color:#aaa;margin:0 0 24px;font-size:15px;">Welcome to <strong style="color:#fff;">${waitlist.name}</strong>. Here's where you stand:</p>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;color:#aaa;font-size:14px;">Your position</p>
      <p style="margin:4px 0 0;color:#fff;font-size:48px;font-weight:800;">#${subscriber.position}</p>
    </div>

    <p style="color:#aaa;font-size:15px;margin:0 0 16px;">
      🚀 <strong style="color:#fff;">Move up the list faster</strong> — share your referral link and jump ahead!
    </p>

    <div style="background:#111;border:1px solid ${color}33;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#aaa;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Your unique referral link</p>
      <a href="${referralLink}" style="color:${color};font-size:14px;word-break:break-all;">${referralLink}</a>
    </div>

    <p style="color:#aaa;font-size:14px;margin:0 0 16px;">Share on social:</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding-right:8px;">
          <a href="https://twitter.com/intent/tweet?text=${twitterText}" style="display:inline-block;background:#1da1f2;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">
            Share on Twitter
          </a>
        </td>
        <td>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${linkedinUrl}" style="display:inline-block;background:#0077b5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">
            Share on LinkedIn
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#555;font-size:13px;margin:0;">
      Each successful referral moves you up the list. We'll notify you as your position improves!
    </p>
  `;

  return getResend().emails.send({
    from: FROM,
    to: subscriber.email,
    subject: `You're #${subscriber.position} on the ${waitlist.name} waitlist!`,
    html: baseLayout(content, color),
  });
}

export async function sendRankUpEmail(
  subscriber: Subscriber,
  waitlist: Waitlist,
  newPosition: number,
  oldPosition: number
) {
  const referralLink = `${APP_URL}/w/${waitlist.slug}?ref=${subscriber.referralCode}`;
  const color = waitlist.primaryColor ?? "#8b5cf6";
  const spotsJumped = oldPosition - newPosition;

  const content = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:700;">You moved up! 🚀</h2>
    <p style="color:#aaa;margin:0 0 24px;font-size:15px;">Great news — you jumped <strong style="color:#fff;">${spotsJumped} spot${spotsJumped !== 1 ? "s" : ""}</strong> on the <strong style="color:#fff;">${waitlist.name}</strong> waitlist.</p>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:24px;display:flex;text-align:center;">
      <table width="100%"><tr>
        <td style="text-align:center;padding:0 16px;border-right:1px solid #2a2a2a;">
          <p style="margin:0;color:#555;font-size:13px;">Was</p>
          <p style="margin:4px 0 0;color:#aaa;font-size:32px;font-weight:700;text-decoration:line-through;">#${oldPosition}</p>
        </td>
        <td style="text-align:center;padding:0 16px;">
          <p style="margin:0;color:#555;font-size:13px;">Now</p>
          <p style="margin:4px 0 0;color:${color};font-size:40px;font-weight:800;">#${newPosition}</p>
        </td>
      </tr></table>
    </div>

    <p style="color:#aaa;font-size:15px;margin:0 0 16px;">
      Keep sharing your referral link to move even higher!
    </p>

    <div style="background:#111;border:1px solid ${color}33;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#aaa;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Your referral link</p>
      <a href="${referralLink}" style="color:${color};font-size:14px;word-break:break-all;">${referralLink}</a>
    </div>

    <p style="color:#555;font-size:13px;margin:0;">You have ${subscriber.totalReferrals} referral${subscriber.totalReferrals !== 1 ? "s" : ""} so far. Every referral = 3 spots up!</p>
  `;

  return getResend().emails.send({
    from: FROM,
    to: subscriber.email,
    subject: `You moved up to #${newPosition} on ${waitlist.name}! 🚀`,
    html: baseLayout(content, color),
  });
}

export interface DigestStats {
  newSignups: number;
  totalSubscribers: number;
  topReferrers: Array<{ name: string; totalReferrals: number }>;
}

export async function sendAdminDigestEmail(
  user: User,
  waitlist: Waitlist,
  stats: DigestStats
) {
  const color = waitlist.primaryColor ?? "#8b5cf6";
  const dashboardLink = `${APP_URL}/dashboard/waitlists/${waitlist.id}`;

  const topReferrersHtml = stats.topReferrers.length
    ? stats.topReferrers
        .map(
          (r, i) =>
            `<tr><td style="padding:8px 0;color:#aaa;font-size:14px;">${i + 1}. ${r.name}</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${r.totalReferrals} referral${r.totalReferrals !== 1 ? "s" : ""}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="padding:8px 0;color:#555;font-size:14px;">No referrals yet</td></tr>`;

  const content = `
    <h2 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:700;">Weekly Digest 📊</h2>
    <p style="color:#aaa;margin:0 0 24px;font-size:15px;">Here's how <strong style="color:#fff;">${waitlist.name}</strong> performed this week.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:0 8px 0 0;width:50%;">
          <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:13px;">New this week</p>
            <p style="margin:4px 0 0;color:${color};font-size:32px;font-weight:800;">+${stats.newSignups}</p>
          </div>
        </td>
        <td style="padding:0 0 0 8px;width:50%;">
          <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:13px;">Total subscribers</p>
            <p style="margin:4px 0 0;color:#fff;font-size:32px;font-weight:800;">${stats.totalSubscribers}</p>
          </div>
        </td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">Top Referrers</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:0 16px;margin-bottom:24px;">
      <tbody>${topReferrersHtml}</tbody>
    </table>

    <a href="${dashboardLink}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;">
      View Dashboard →
    </a>
  `;

  return getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: `Weekly digest: ${waitlist.name} — +${stats.newSignups} new signups`,
    html: baseLayout(content, color),
  });
}
