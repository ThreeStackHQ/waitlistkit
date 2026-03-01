import { ListOrdered, Plus } from 'lucide-react'
export default function WaitlistsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Waitlists</h1>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white" style={{ background: '#0fb8a1' }}><Plus className="w-4 h-4" />New Waitlist</button>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ background: '#0fb8a118', borderColor: '#0fb8a130' }}>
          <ListOrdered className="w-8 h-8" style={{ color: '#0fb8a1' }} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Create your first waitlist</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">Launch a viral waitlist with referral mechanics. Embed it on any website in 2 minutes.</p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white" style={{ background: '#0fb8a1' }}><Plus className="w-4 h-4" />New Waitlist</button>
      </div>
    </div>
  )
}
