'use client'

import { useState } from 'react'
import { Users, TrendingUp, Share2, BarChart2, Download } from 'lucide-react'

const BRAND = '#0fb8a1'

// 30 days fake bar data
const barData = [12, 18, 9, 24, 31, 27, 19, 42, 38, 56, 49, 61, 55, 72, 68, 83, 77, 90, 85, 101, 95, 112, 108, 127, 119, 134, 127, 143, 138, 127]

const topReferrers = [
  { rank: 1, name: 'Sarah Chen', email: 'sa***@acme.com', referrals: 47, status: 'Paid' },
  { rank: 2, name: 'Marco Rossi', email: 'ma***@startup.io', referrals: 31, status: 'Pending' },
  { rank: 3, name: 'Priya Patel', email: 'pr***@design.co', referrals: 28, status: 'Paid' },
  { rank: 4, name: 'Jordan Kim', email: 'jo***@apps.dev', referrals: 22, status: 'Pending' },
  { rank: 5, name: 'Emily Torres', email: 'em***@shop.com', referrals: 17, status: 'Paid' },
]

const sources = [
  { label: 'Direct', pct: 45 },
  { label: 'Twitter / X', pct: 32 },
  { label: 'Email', pct: 23 },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const maxBar = Math.max(...barData)

  const stats = [
    { label: 'Total Subscribers', value: '4,821', icon: Users, delta: '+127 today' },
    { label: 'Daily Growth', value: '+127', icon: TrendingUp, delta: '+12% vs yesterday' },
    { label: 'Referral Rate', value: '34%', icon: Share2, delta: '+2% this week' },
    { label: 'Conversion Rate', value: '8.2%', icon: BarChart2, delta: '+0.4% vs last month' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your waitlist growth and referral performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-900 border border-white/10 rounded-lg p-1">
            {['7d', '30d', '90d'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                style={period === p ? { background: BRAND } : {}}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-gray-200 transition-colors">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, delta }) => (
          <div key={label} className="bg-gray-900/60 border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">{label}</p>
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${BRAND}20` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: BRAND }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-[11px]" style={{ color: BRAND }}>{delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-gray-900/60 border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Subscriber Growth</h2>
              <p className="text-xs text-gray-400 mt-0.5">New subscribers per day (last 30 days)</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">4,821</p>
              <p className="text-xs" style={{ color: BRAND }}>+34% month</p>
            </div>
          </div>
          <div className="flex items-end gap-1 h-32">
            {barData.map((val, i) => (
              <div key={i} className="flex-1 flex items-end">
                <div
                  className="w-full rounded-sm transition-all hover:opacity-80"
                  style={{
                    height: `${(val / maxBar) * 100}%`,
                    background: i === barData.length - 1 ? BRAND : `${BRAND}60`,
                    minHeight: '3px',
                  }}
                  title={`Day ${i + 1}: ${val} subscribers`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-600">
            <span>Day 1</span><span>Day 15</span><span>Day 30</span>
          </div>
        </div>

        {/* Referral Sources */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Referral Sources</h2>
          <p className="text-xs text-gray-400 mb-4">Where your subscribers come from</p>
          <div className="space-y-4">
            {sources.map(({ label, pct }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-300">{label}</span>
                  <span className="text-xs font-semibold text-white">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: BRAND }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.07]">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold text-white">1,638</p>
                <p className="text-[10px] text-gray-500">Total referrals</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold" style={{ color: BRAND }}>34%</p>
                <p className="text-[10px] text-gray-500">Referral rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers Table */}
      <div className="bg-gray-900/60 border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Top Referrers</h2>
          <span className="text-xs text-gray-500">All time</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {['Rank', 'Name', 'Email', 'Referrals', 'Reward Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topReferrers.map((r, i) => (
              <tr key={r.rank} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === topReferrers.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-5 py-3">
                  <span className="text-sm font-bold" style={{ color: r.rank === 1 ? '#f59e0b' : r.rank === 2 ? '#9ca3af' : r.rank === 3 ? '#b45309' : '#6b7280' }}>
                    #{r.rank}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm font-medium text-white">{r.name}</td>
                <td className="px-5 py-3 text-sm text-gray-400 font-mono">{r.email}</td>
                <td className="px-5 py-3 text-sm font-medium text-white">{r.referrals}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Paid' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
