'use client'

import { useState } from 'react'
import { Copy, Check, Twitter, Linkedin, Share2, Users, ArrowUp, Gift, Zap, Star } from 'lucide-react'

// Sprint 2.5 — Referral Landing Page — Wren
// Viral referral landing page at /w/[slug]/r/[code]
// Dark navy bg #0a1628 + teal #0fb8a1 theme

// ─── Types ─────────────────────────────────────────────────────────────────────

type PageState = 'idle' | 'submitting' | 'joined' | 'error'

interface SignupResult {
  position: number
  referralCode: string
  referralCount: number
  queueSize: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BRAND = '#0fb8a1'
const BG_DARK = '#0a1628'
const TOTAL_COUNT = 1247
const MOCK_POSITION = 482

// Mock referrer name derivation — in production this would come from the API
function getReferrerName(code: string): string {
  const names: Record<string, string> = {
    ABC123: 'Alex',
    XYZ789: 'Sam',
    DEF456: 'Jordan',
  }
  return names[code.toUpperCase()] ?? 'a friend'
}

// ─── Utility ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString()
}

// ─── CopyLink ──────────────────────────────────────────────────────────────────

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 w-full"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      <span className="flex-1 text-sm text-gray-300 truncate font-mono">{url}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 shrink-0"
        style={{ background: copied ? '#10b981' : BRAND }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

// ─── WhatsApp icon (not in lucide) ─────────────────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ReferralLandingPage({
  params,
}: {
  params: { slug: string; code: string }
}) {
  const { slug, code } = params
  const referrerName = getReferrerName(code)

  const [email, setEmail] = useState('')
  const [state, setState] = useState<PageState>('idle')
  const [result, setResult] = useState<SignupResult | null>(null)
  const [totalCount, setTotalCount] = useState(TOTAL_COUNT)

  const ownReferralUrl = result
    ? `https://waitlistkit.threestack.io/w/${slug}?ref=${result.referralCode}`
    : `https://waitlistkit.threestack.io/w/${slug}?ref=${code}`

  const handleJoin = async () => {
    if (!email.trim()) return
    setState('submitting')
    await new Promise(r => setTimeout(r, 1000))
    const position = MOCK_POSITION
    setResult({
      position,
      referralCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      referralCount: 0,
      queueSize: totalCount + 1,
    })
    setTotalCount(prev => prev + 1)
    setState('joined')
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `Just joined the waitlist! 🚀 Sign up with my link to skip ahead in line: ${ownReferralUrl}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ownReferralUrl)}`,
      '_blank'
    )
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! I just joined the waitlist and you can skip ahead by using my link 👉 ${ownReferralUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG_DARK }}>
      {/* Subtle top accent line */}
      <div className="h-1" style={{ background: `linear-gradient(to right, ${BRAND}, #06b6d4)` }} />

      {/* Nav */}
      <nav className="px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: BRAND }}
            >
              W
            </div>
            <span className="text-sm font-semibold text-white opacity-90">WaitlistKit</span>
          </div>
          {/* Social proof pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
            style={{ background: 'rgba(15,184,161,0.12)', color: BRAND, border: `1px solid rgba(15,184,161,0.25)` }}
          >
            <Users className="w-3 h-3" />
            <span className="font-semibold">{fmt(totalCount)} waiting</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {state !== 'joined' ? (
            /* ══════════════════ SIGN-UP STATE ══════════════════ */
            <>
              {/* Referrer badge */}
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{ background: 'rgba(15,184,161,0.15)', color: BRAND, border: `1px solid rgba(15,184,161,0.3)` }}
                >
                  <Gift className="w-4 h-4" />
                  <span>Invited by <strong>{referrerName}</strong></span>
                </div>

                <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
                  Join {referrerName}&apos;s waitlist{' '}
                  <span className="inline-block">🎉</span>
                </h1>
                <p className="text-gray-400 text-base leading-relaxed">
                  {referrerName} wants you on the list. Sign up now and you can both skip ahead.
                </p>
              </div>

              {/* Benefits card */}
              <div
                className="rounded-2xl p-5 mb-6 space-y-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Why join?</p>
                {[
                  { icon: <ArrowUp className="w-4 h-4" style={{ color: BRAND }} />, text: 'Skip ahead by 3 spots for every friend you refer' },
                  { icon: <Zap className="w-4 h-4" style={{ color: '#facc15' }} />, text: 'Early access before the public launch' },
                  { icon: <Star className="w-4 h-4" style={{ color: '#c084fc' }} />, text: 'Founding member pricing — locked in forever' },
                  { icon: <Gift className="w-4 h-4" style={{ color: '#fb923c' }} />, text: 'Exclusive perks for waitlist members only' },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="shrink-0">{icon}</div>
                    <span className="text-sm text-gray-300">{text}</span>
                  </div>
                ))}
              </div>

              {/* Social proof avatars */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        borderColor: BG_DARK,
                        background: `hsl(${160 + i * 25}, 55%, 45%)`,
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  <span className="text-white font-semibold">{fmt(totalCount)}</span> people already waiting
                </span>
              </div>

              {/* Form card */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    className="w-full px-4 py-4 rounded-xl text-base text-white placeholder-gray-500 focus:outline-none transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = BRAND }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  />
                  <button
                    onClick={handleJoin}
                    disabled={!email.trim() || state === 'submitting'}
                    className="w-full py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                    style={{ background: BRAND }}
                  >
                    {state === 'submitting' ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining...
                      </span>
                    ) : (
                      '🎉 Claim My Spot'
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-600">No spam. Unsubscribe anytime.</p>
                </div>
              </div>
            </>
          ) : (
            /* ══════════════════ JOINED STATE ══════════════════ */
            result && (
              <>
                {/* Position hero */}
                <div className="text-center mb-8">
                  <div
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center mx-auto mb-5"
                    style={{
                      background: `radial-gradient(circle, rgba(15,184,161,0.25) 0%, rgba(15,184,161,0.05) 100%)`,
                      border: `3px solid ${BRAND}`,
                    }}
                  >
                    <span className="text-xs text-gray-400 font-medium">you&apos;re</span>
                    <span className="text-2xl font-extrabold" style={{ color: BRAND }}>
                      #{fmt(result.position)}
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">You&apos;re in! 🚀</h2>
                  <p className="text-gray-400 text-sm">
                    You&apos;re <strong className="text-white">#{fmt(result.position)}</strong> of{' '}
                    {fmt(result.queueSize)} people on the list.
                  </p>
                </div>

                {/* Move up section */}
                <div
                  className="rounded-2xl p-5 mb-4"
                  style={{ background: 'rgba(15,184,161,0.08)', border: `1px solid rgba(15,184,161,0.2)` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUp className="w-4 h-4" style={{ color: BRAND }} />
                    <h3 className="text-sm font-bold text-white">Skip ahead in line</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Get <strong className="text-white">3 spots higher</strong> for every friend who signs up with your link.
                  </p>

                  {/* Referral link */}
                  <CopyLink url={ownReferralUrl} />
                </div>

                {/* Share buttons */}
                <div
                  className="rounded-2xl p-5 mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p className="text-xs font-semibold text-gray-500 mb-3 text-center uppercase tracking-widest">
                    Share with your friends
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: '#1DA1F2' }}
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="hidden sm:inline">Twitter</span>
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: '#0A66C2' }}
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </button>
                    <button
                      onClick={shareOnWhatsApp}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: '#25D366' }}
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div
                  className="rounded-2xl p-4 flex items-center justify-around"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">#{fmt(result.position)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Your position</div>
                  </div>
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: BRAND }}>{result.referralCount}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Referrals</div>
                  </div>
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{fmt(totalCount)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Total signups</div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center">
        <a
          href="https://waitlistkit.threestack.io"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <span
            className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white"
            style={{ background: BRAND }}
          >
            W
          </span>
          Powered by WaitlistKit
        </a>
      </footer>
    </div>
  )
}
