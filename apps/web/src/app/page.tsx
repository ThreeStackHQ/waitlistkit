import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WaitlistKit — Pre-Launch Waitlists with Viral Growth',
  description: 'Build hype before you launch. Waitlist with referral tracking, position leaderboards, and email automation. Set up in minutes.',
  keywords: ['waitlist', 'pre-launch', 'referral waitlist', 'viral waitlist', 'launch page', 'saas waitlist'],
  openGraph: {
    title: 'WaitlistKit — Pre-Launch Waitlists with Viral Growth',
    description: 'Waitlist with referral tracking, position leaderboards, and email automation.',
    url: 'https://waitlistkit.threestack.io',
    siteName: 'WaitlistKit',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WaitlistKit — Pre-Launch Waitlists with Viral Growth',
    description: 'Turn signups into viral growth. Waitlist with referrals.',
  },
}

const FEATURES = [
  { icon: '🚀', title: 'Viral Referral Engine', desc: 'Give every signup a unique referral link. They move up the list by inviting friends — automatic viral growth.' },
  { icon: '📊', title: 'Position Leaderboard', desc: 'Show subscribers their exact position and how many referrals they need to move up. Addictive by design.' },
  { icon: '📬', title: 'Email Automation', desc: 'Welcome emails, position updates, and launch announcements — all automated via Resend.' },
  { icon: '💌', title: 'Referral Landing Page', desc: 'Auto-generated landing pages for referral links. Mobile-optimized, converts like crazy.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Track signups, referral sources, conversion rates, and waitlist growth in real time.' },
  { icon: '</>', title: 'Embeddable Widget', desc: 'Drop a waitlist form anywhere with a script tag. Blog posts, Twitter bios, Product Hunt pages.' },
]

const STEPS = [
  { n: '01', title: 'Create your waitlist', desc: 'Set up in minutes. Customize your form, configure referral rewards, and get your embed code.' },
  { n: '02', title: 'Embed or share', desc: 'Add the widget to your landing page or share the direct URL. Works anywhere.' },
  { n: '03', title: 'Watch it grow', desc: 'Every signup shares their referral link. Viral loops drive exponential growth automatically.' },
]

const PLANS = [
  { name: 'Free', price: '$0', period: '', desc: 'For early-stage builders', features: ['1 waitlist', '500 subscribers', 'Referral tracking', 'Basic email notifications', 'Embeddable widget', 'WaitlistKit branding'], cta: 'Start Free', highlight: false },
  { name: 'Pro', price: '$9', period: '/mo', desc: 'For active launches', features: ['5 waitlists', 'Unlimited subscribers', 'Custom domain', 'Email automation (Resend)', 'Analytics dashboard', 'Remove branding', 'Priority support'], cta: 'Start 14-Day Trial', highlight: true },
  { name: 'Business', price: '$19', period: '/mo', desc: 'For multiple products', features: ['Unlimited waitlists', 'Everything in Pro', 'Team members', 'API access', 'Webhook events', 'CSV export', 'Dedicated support'], cta: 'Start 14-Day Trial', highlight: false },
]

const SOCIAL_PROOF = [
  { value: '50K+', label: 'Signups collected' },
  { value: '12%', label: 'Avg referral rate' },
  { value: '3.2×', label: 'Avg viral coefficient' },
  { value: '5 min', label: 'Time to launch' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0fb8a1' }}>
              <span className="text-white text-sm font-bold">W</span>
            </div>
            <span className="font-bold text-white">WaitlistKit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Sign in</Link>
            <Link href="/signup" className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: '#0fb8a1' }}>
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs mb-8" style={{ borderColor: '#0fb8a130', backgroundColor: '#0fb8a110', color: '#0fb8a1' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#0fb8a1' }} />
              Viral referral loops built in
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Build Hype{' '}
              <span style={{ color: '#0fb8a1' }}>Before You Launch</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Waitlists with viral referral mechanics, position leaderboards, and email automation.
              {' '}<span className="text-gray-200">Turn signups into growth.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="rounded-xl px-8 py-4 text-base font-semibold text-white transition-colors shadow-lg text-center" style={{ backgroundColor: '#0fb8a1' }}>
                Create Your Waitlist
              </Link>
              <Link href="/demo" className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-gray-300 hover:bg-white/5 transition-colors text-center">
                See Live Demo →
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">Free forever · No credit card · Live in 5 minutes</p>
          </div>

          {/* Waitlist mockup */}
          <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: '#0fb8a120' }}>
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-bold text-lg mb-1">YourApp Early Access</h3>
                <p className="text-sm text-gray-400 mb-4">Be first in line. Invite friends to move up.</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="email"
                    disabled
                    placeholder="you@example.com"
                    className="flex-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm text-gray-400 placeholder-gray-600"
                  />
                  <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#0fb8a1' }}>
                    Join
                  </button>
                </div>
                <p className="text-xs text-gray-500">3,247 people already joined</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium px-1">Top referrers</p>
              {[
                { rank: '🥇', name: 'sarah@example.com', refs: 12, pos: '#1' },
                { rank: '🥈', name: 'mike@company.io', refs: 8, pos: '#2' },
                { rank: '🥉', name: 'you@yourapp.com', refs: 3, pos: '#47', you: true },
              ].map((item) => (
                <div key={item.name} className={`flex items-center gap-3 rounded-lg p-2.5 ${item.you ? 'border' : 'bg-white/5'}`} style={item.you ? { borderColor: '#0fb8a130', backgroundColor: '#0fb8a105' } : {}}>
                  <span className="text-sm">{item.rank}</span>
                  <span className="text-xs text-gray-300 flex-1 truncate">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.refs} refs</span>
                  <span className="text-xs font-bold" style={{ color: item.you ? '#0fb8a1' : 'inherit' }}>{item.pos}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {SOCIAL_PROOF.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold mb-1" style={{ color: '#0fb8a1' }}>{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything to turn waitlist into viral growth</h2>
          <p className="text-gray-400">Designed for indie hackers launching their next big thing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors group" style={{ '--hover-border': '#0fb8a130' } as React.CSSProperties}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Launch your waitlist in minutes</h2>
          <p className="text-gray-400">No code required. Works with any landing page.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.n} className="text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mx-auto mb-4" style={{ backgroundColor: '#0fb8a120', border: '1px solid #0fb8a130', color: '#0fb8a1' }}>
                {step.n}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple pricing for makers</h2>
          <p className="text-gray-400">Free to start. Upgrade as you grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-8 flex flex-col ${plan.highlight ? 'shadow-xl' : 'border-white/10 bg-white/5'}`} style={plan.highlight ? { borderColor: '#0fb8a1', backgroundColor: '#0fb8a108', boxShadow: '0 20px 40px #0fb8a115' } : {}}>
              {plan.highlight && <div className="text-xs font-semibold rounded-full px-3 py-1 self-start mb-4" style={{ color: '#0fb8a1', backgroundColor: '#0fb8a120' }}>Most Popular</div>}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-gray-400 mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5" style={{ color: '#0fb8a1' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`text-center rounded-xl py-3 text-sm font-semibold transition-colors ${plan.highlight ? 'text-white shadow-lg' : 'border border-white/20 text-gray-300 hover:bg-white/5'}`} style={plan.highlight ? { backgroundColor: '#0fb8a1' } : {}}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl p-12 text-center border" style={{ borderColor: '#0fb8a120', backgroundColor: '#0fb8a108' }}>
          <h2 className="text-4xl font-bold mb-4">Your next launch starts here</h2>
          <p className="text-gray-400 mb-8 text-lg">Create a viral waitlist in 5 minutes. Free forever for small lists.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-semibold text-white transition-colors shadow-lg" style={{ backgroundColor: '#0fb8a1' }}>
            Create Your Waitlist →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-4">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0fb8a1' }}>
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="font-semibold">WaitlistKit</span>
            <span className="text-gray-500 text-sm ml-2">by ThreeStack</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
