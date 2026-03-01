'use client'

import { useState } from 'react'
import { ListOrdered, Plus, MoreVertical, Edit2, Pause, Trash2, Users, Share2, TrendingUp, X, ToggleLeft, ToggleRight } from 'lucide-react'

const BRAND = '#0fb8a1'

const initialWaitlists = [
  { id: 1, name: 'Product Launch Beta', desc: 'Early access to our v2 release', subscribers: 1420, referrals: 384, conversion: 9.2, status: 'Active', referralEnabled: true },
  { id: 2, name: 'Mobile App Waitlist', desc: 'iOS & Android early birds', subscribers: 876, referrals: 201, conversion: 6.7, status: 'Active', referralEnabled: true },
  { id: 3, name: 'Enterprise Pilot', desc: 'Invite-only for enterprise prospects', subscribers: 143, referrals: 12, conversion: 14.3, status: 'Paused', referralEnabled: false },
  { id: 4, name: 'Affiliate Program', desc: 'Partner & affiliate sign-ups', subscribers: 58, referrals: 0, conversion: 0, status: 'Draft', referralEnabled: false },
]

const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Paused: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  Draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
}

function StatusBadge({ status }: { status: string }) {
  const s = statusBadge[status] ?? statusBadge['Draft']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

function CardMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 w-32 bg-gray-800 border border-white/10 rounded-lg shadow-xl py-1">
          <button onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/5"><Edit2 className="w-3.5 h-3.5" />Edit</button>
          <button onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/5"><Pause className="w-3.5 h-3.5" />Pause</button>
          <button onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" />Delete</button>
        </div>
      )}
    </div>
  )
}

export default function WaitlistsPage() {
  const [waitlists, setWaitlists] = useState(initialWaitlists)
  const [showModal, setShowModal] = useState(false)

  // Modal state
  const [mName, setMName] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mMaxSize, setMMaxSize] = useState('')
  const [mReferral, setMReferral] = useState(true)

  function handleCreate() {
    if (!mName.trim()) return
    setWaitlists(prev => [...prev, {
      id: Date.now(),
      name: mName.trim(),
      desc: mDesc.trim() || 'New waitlist',
      subscribers: 0,
      referrals: 0,
      conversion: 0,
      status: 'Draft',
      referralEnabled: mReferral,
    }])
    setMName(''); setMDesc(''); setMMaxSize(''); setMReferral(true)
    setShowModal(false)
  }

  const inputCls = 'w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500/60 transition-colors'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Waitlists</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your viral waitlists</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
          <Plus className="w-4 h-4" />New Waitlist
        </button>
      </div>

      {/* Cards grid */}
      {waitlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {waitlists.map(wl => (
            <div key={wl.id} className="bg-gray-900/60 border border-white/[0.07] rounded-xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND}20` }}>
                    <ListOrdered className="w-4.5 h-4.5" style={{ color: BRAND }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{wl.name}</p>
                    <p className="text-xs text-gray-500 truncate">{wl.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <StatusBadge status={wl.status} />
                  <CardMenu />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { icon: Users, label: 'Subscribers', val: wl.subscribers.toLocaleString() },
                  { icon: Share2, label: 'Referrals', val: wl.referrals.toLocaleString() },
                  { icon: TrendingUp, label: 'Conversion', val: `${wl.conversion}%` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-gray-800/50 rounded-lg p-2.5 text-center">
                    <div className="flex justify-center mb-1"><Icon className="w-3.5 h-3.5 text-gray-500" /></div>
                    <p className="text-sm font-semibold text-white">{val}</p>
                    <p className="text-[10px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-[11px] flex items-center gap-1" style={{ color: wl.referralEnabled ? BRAND : '#6b7280' }}>
                  <Share2 className="w-3 h-3" />
                  {wl.referralEnabled ? 'Referrals enabled' : 'Referrals off'}
                </span>
                <button className="text-xs px-3 py-1 rounded-md border border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200 transition-colors">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ background: `${BRAND}18`, borderColor: `${BRAND}30` }}>
            <ListOrdered className="w-8 h-8" style={{ color: BRAND }} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Create your first waitlist</h2>
          <p className="text-sm text-gray-400 max-w-sm mb-6">Launch a viral waitlist with referral mechanics. Embed it on any website in 2 minutes.</p>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white" style={{ background: BRAND }}>
            <Plus className="w-4 h-4" />New Waitlist
          </button>
        </div>
      )}

      {/* Create Waitlist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Create Waitlist</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Waitlist Name <span className="text-red-400">*</span></label>
                <input value={mName} onChange={e => setMName(e.target.value)} className={inputCls} placeholder="e.g. Product Launch Beta" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Description</label>
                <textarea value={mDesc} onChange={e => setMDesc(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="What is this waitlist for?" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Max Size</label>
                <input value={mMaxSize} onChange={e => setMMaxSize(e.target.value)} type="number" min="1" className={inputCls} placeholder="Unlimited" />
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-medium text-gray-300">Enable Referrals</p>
                  <p className="text-[11px] text-gray-500">Users earn rewards for referring friends</p>
                </div>
                <button onClick={() => setMReferral(r => !r)} className="transition-colors">
                  {mReferral
                    ? <ToggleRight className="w-8 h-8" style={{ color: BRAND }} />
                    : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-gray-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
                Create Waitlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
