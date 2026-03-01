'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Twitter, Linkedin, Mail, Users, ArrowUp } from 'lucide-react'

// Sprint 2.4 — Public Waitlist Page — Wren
// Public-facing viral waitlist at /w/[slug]

// ─── Types ─────────────────────────────────────────────────────────────────────

type WaitlistState = 'idle' | 'submitting' | 'joined' | 'error'

interface WaitlistSignup {
  position: number
  referralCode: string
  referralCount: number
  queueSize: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_WAITLIST = {
  name: 'AppName Early Access',
  headline: 'Join the waitlist for AppName',
  tagline: 'The fastest way to ship your next SaaS. Sign up to get early access and jump the queue by referring friends.',
  cta: 'Join Waitlist',
  signupCount: 1247,
  referralReward: 'Refer 3 friends → move up 50 spots',
  brandColor: '#0fb8a1',
  logoText: 'AN',
  benefits: [
    '🚀 Early access before public launch',
    '💰 Founding member pricing (50% off forever)',
    '🎯 Direct influence on the roadmap',
    '📞 1-on-1 onboarding call',
  ],
}

// ─── Utility ───────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString()
}

// ─── Share Button ──────────────────────────────────────────────────────────────

function ShareButton({ icon: Icon, label, onClick, color }: {
  icon: typeof Twitter
  label: string
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 ${color}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

// ─── Copy Link ─────────────────────────────────────────────────────────────────

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 w-full">
      <span className="flex-1 text-sm text-gray-600 truncate font-mono">{url}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
        style={{ background: copied ? '#10b981' : MOCK_WAITLIST.brandColor }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function ReferralProgress({ count, target = 3 }: { count: number; target?: number }) {
  const pct = Math.min((count / target) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-600">{count} / {target} referrals</span>
        <span className="font-medium" style={{ color: MOCK_WAITLIST.brandColor }}>
          {target - count > 0 ? `${target - count} more to unlock reward` : '🎉 Reward unlocked!'}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: MOCK_WAITLIST.brandColor }}
        />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PublicWaitlistPage({ params }: { params: { slug: string } }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [state, setState] = useState<WaitlistState>('idle')
  const [signup, setSignup] = useState<WaitlistSignup | null>(null)
  const [totalCount, setTotalCount] = useState(MOCK_WAITLIST.signupCount)

  const referralUrl = signup
    ? `https://app.waitlistkit.com/w/${params.slug}?ref=${signup.referralCode}`
    : `https://app.waitlistkit.com/w/${params.slug}`

  const handleJoin = async () => {
    if (!email.trim()) return
    setState('submitting')
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000))
    const position = totalCount + 1
    setSignup({
      position,
      referralCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      referralCount: 0,
      queueSize: position,
    })
    setTotalCount(prev => prev + 1)
    setState('joined')
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`I just joined the waitlist for ${MOCK_WAITLIST.name}! Sign up with my link to jump the queue 🚀 ${referralUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join me on ${MOCK_WAITLIST.name}`)
    const body = encodeURIComponent(`Hey! I just joined the waitlist for ${MOCK_WAITLIST.name}. Use my referral link to skip the queue: ${referralUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 50%, #f0fdfa 100%)' }}>
      {/* Navbar */}
      <nav className="px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: MOCK_WAITLIST.brandColor }}>
            {MOCK_WAITLIST.logoText}
          </div>
          <span className="text-sm font-semibold text-gray-800">{MOCK_WAITLIST.name}</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Social proof counter */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center text-white"
                  style={{ background: `hsl(${160 + i * 20}, 60%, 50%)` }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{formatNumber(totalCount)}</span> people waiting
            </span>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1.5" style={{ background: `linear-gradient(to right, ${MOCK_WAITLIST.brandColor}, #06b6d4)` }} />

            <div className="p-8">
              {state !== 'joined' ? (
                /* ── Sign-up state ── */
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {MOCK_WAITLIST.headline}
                    </h1>
                    <p className="text-gray-500 text-base leading-relaxed">{MOCK_WAITLIST.tagline}</p>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div className="grid grid-cols-1 gap-2">
                      {MOCK_WAITLIST.benefits.map((b, i) => (
                        <p key={i} className="text-sm text-gray-700">{b}</p>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email address *"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleJoin()}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors"
                    />
                    <button
                      onClick={handleJoin}
                      disabled={!email.trim() || state === 'submitting'}
                      className="w-full py-4 rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:scale-100"
                      style={{ background: MOCK_WAITLIST.brandColor }}
                    >
                      {state === 'submitting' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Joining...
                        </span>
                      ) : (
                        MOCK_WAITLIST.cta
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400">No spam, ever. Unsubscribe at any time.</p>
                  </div>
                </>
              ) : (
                /* ── Joined state ── */
                signup && (
                  <>
                    {/* Position badge */}
                    <div className="text-center mb-8">
                      <div
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center mx-auto mb-4 border-4"
                        style={{ borderColor: MOCK_WAITLIST.brandColor, background: `${MOCK_WAITLIST.brandColor}15` }}
                      >
                        <span className="text-2xl font-bold" style={{ color: MOCK_WAITLIST.brandColor }}>
                          #{formatNumber(signup.position)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        You're on the list! 🎉
                      </h2>
                      <p className="text-gray-500 text-sm">
                        You're <strong>#{formatNumber(signup.position)}</strong> of {formatNumber(signup.queueSize)} in line.
                      </p>
                    </div>

                    {/* Referral section */}
                    <div className="bg-gray-50 rounded-2xl p-5 mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowUp className="w-4 h-4" style={{ color: MOCK_WAITLIST.brandColor }} />
                        <h3 className="text-sm font-semibold text-gray-900">Jump the queue</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">{MOCK_WAITLIST.referralReward}. Share your unique link:</p>

                      <CopyLink url={referralUrl} />

                      <div className="mt-4">
                        <ReferralProgress count={signup.referralCount} target={3} />
                      </div>
                    </div>

                    {/* Share buttons */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 text-center mb-3">Share with your network</p>
                      <div className="grid grid-cols-3 gap-2">
                        <ShareButton icon={Twitter}  label="Twitter"  onClick={shareOnTwitter}  color="bg-sky-500 hover:bg-sky-600" />
                        <ShareButton icon={Linkedin} label="LinkedIn" onClick={shareOnLinkedIn} color="bg-blue-700 hover:bg-blue-800" />
                        <ShareButton icon={Mail}     label="Email"    onClick={shareViaEmail}   color="bg-gray-700 hover:bg-gray-800" />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-gray-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900">
                          <Users className="w-4 h-4 text-gray-400" />
                          {formatNumber(totalCount)}
                        </div>
                        <p className="text-xs text-gray-500">Total signups</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: MOCK_WAITLIST.brandColor }}>
                          {signup.referralCount}
                        </div>
                        <p className="text-xs text-gray-500">Your referrals</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          #{formatNumber(signup.position)}
                        </div>
                        <p className="text-xs text-gray-500">Your position</p>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>

          {/* Bottom badge */}
          <div className="text-center mt-6">
            <a
              href="https://waitlistkit.threestack.io"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ background: MOCK_WAITLIST.brandColor }}>
                W
              </span>
              Powered by WaitlistKit
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
