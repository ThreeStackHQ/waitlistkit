/**
 * WaitlistKit Embed Widget
 * Embeds a waitlist signup form with referral growth on any site.
 * Usage: <script src="https://cdn.waitlistkit.threestack.io/widget.js" data-api-key="wk_live_..."></script>
 *        <div id="waitlistkit-form"></div>
 */
interface WaitlistConfig { apiKey: string; containerId?: string; theme?: "light" | "dark"; }
interface SignupResponse { position: number; referralCode: string; referralUrl: string; total: number; }
const API = "https://waitlistkit.threestack.io";

async function submitSignup(apiKey: string, email: string, name: string, referredBy?: string): Promise<SignupResponse> {
  const r = await fetch(`${API}/api/widget/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ email, name, referredBy }),
  });
  if (!r.ok) { const e = await r.json() as { error: string }; throw new Error(e.error || "Signup failed"); }
  return r.json() as Promise<SignupResponse>;
}

function injectCSS(color: string, isDark: boolean) {
  const s = document.createElement("style");
  s.textContent = `
    .wk-form{font-family:system-ui,sans-serif;background:${isDark?"#111827":"#fff"};border:1px solid ${isDark?"#374151":"#e5e7eb"};border-radius:12px;padding:24px;max-width:420px;margin:0 auto}
    .wk-form h2{font-size:20px;font-weight:700;color:${isDark?"#f9fafb":"#111"};margin:0 0 6px}
    .wk-form p{font-size:14px;color:${isDark?"#9ca3af":"#6b7280"};margin:0 0 16px}
    .wk-input{width:100%;padding:10px 12px;background:${isDark?"#1f2937":"#f9fafb"};border:1px solid ${isDark?"#374151":"#e5e7eb"};border-radius:8px;font-size:14px;color:${isDark?"#f9fafb":"#111"};box-sizing:border-box;margin-bottom:8px;outline:none}
    .wk-input:focus{border-color:${color}}
    .wk-btn{width:100%;padding:11px;background:${color};color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .2s}
    .wk-btn:hover{opacity:.85}
    .wk-success{text-align:center;padding:8px 0}
    .wk-pos{font-size:36px;font-weight:800;color:${color}}
    .wk-pos-lbl{font-size:14px;color:${isDark?"#9ca3af":"#6b7280"};margin-bottom:12px}
    .wk-ref-box{background:${isDark?"#1f2937":"#f9fafb"};border:1px solid ${isDark?"#374151":"#e5e7eb"};border-radius:8px;padding:12px;margin-top:12px}
    .wk-ref-title{font-size:13px;font-weight:600;color:${isDark?"#f9fafb":"#111"};margin-bottom:6px}
    .wk-ref-row{display:flex;gap:6px}
    .wk-ref-url{flex:1;padding:6px 8px;background:${isDark?"#111827":"#fff"};border:1px solid ${isDark?"#374151":"#e5e7eb"};border-radius:6px;font-size:11px;color:${isDark?"#9ca3af":"#6b7280"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .wk-copy{padding:6px 12px;background:${color};color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
    .wk-err{color:#ef4444;font-size:13px;margin-top:6px}
  `;
  document.head.appendChild(s);
}

export function init(config: WaitlistConfig) {
  const { apiKey, containerId = "waitlistkit-form", theme = "dark" } = config;
  const container = document.getElementById(containerId);
  if (!container) { console.error(`WaitlistKit: #${containerId} not found`); return; }
  const color = "#8b5cf6";
  const isDark = theme === "dark";
  injectCSS(color, isDark);
  // check for referral code in URL
  const refCode = new URLSearchParams(window.location.search).get("ref") || undefined;
  container.innerHTML = `
    <div class="wk-form">
      <h2>Get Early Access</h2>
      <p>Be the first to know when we launch. Join the waitlist.</p>
      <input class="wk-input" id="wk-name" type="text" placeholder="Your name (optional)" />
      <input class="wk-input" id="wk-email" type="email" placeholder="your@email.com" required />
      <button class="wk-btn" id="wk-submit">Join Waitlist →</button>
      <div class="wk-err" id="wk-err" style="display:none"></div>
    </div>`;
  document.getElementById("wk-submit")!.addEventListener("click", async () => {
    const email = (document.getElementById("wk-email") as HTMLInputElement).value.trim();
    const name = (document.getElementById("wk-name") as HTMLInputElement).value.trim();
    const err = document.getElementById("wk-err")!;
    const btn = document.getElementById("wk-submit") as HTMLButtonElement;
    if (!email) { err.textContent = "Email is required."; err.style.display = "block"; return; }
    btn.textContent = "Joining…"; btn.disabled = true; err.style.display = "none";
    try {
      const res = await submitSignup(apiKey, email, name, refCode);
      const form = container.querySelector(".wk-form")!;
      form.innerHTML = `
        <div class="wk-success">
          <div class="wk-pos">#${res.position}</div>
          <div class="wk-pos-lbl">Your position in line · ${res.total} total signups</div>
          <div class="wk-ref-box">
            <div class="wk-ref-title">🚀 Move up by referring friends</div>
            <div class="wk-ref-row">
              <div class="wk-ref-url">${res.referralUrl}</div>
              <button class="wk-copy" id="wk-ref-copy">Copy</button>
            </div>
          </div>
        </div>`;
      document.getElementById("wk-ref-copy")?.addEventListener("click", (e) => {
        navigator.clipboard.writeText(res.referralUrl);
        (e.target as HTMLButtonElement).textContent = "Copied!";
      });
    } catch (e: unknown) {
      btn.textContent = "Join Waitlist →"; btn.disabled = false;
      err.textContent = e instanceof Error ? e.message : "Something went wrong"; err.style.display = "block";
    }
  });
}

const s = document.currentScript as HTMLScriptElement | null;
if (s?.dataset.apiKey) {
  document.addEventListener("DOMContentLoaded", () => init({ apiKey: s.dataset.apiKey!, theme: (s.dataset.theme as "light"|"dark") || "dark" }));
}
(window as unknown as Record<string, unknown>).WaitlistKit = { init };
