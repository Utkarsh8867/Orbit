import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { listRepos, getRepoAnalyses } from '../api'
import type { Repository } from '../types'

const PROVIDER_META: Record<string, { label: string; color: string; icon: string }> = {
  google: { label: 'Google', color: '#4285F4', icon: 'account_circle' },
  github: { label: 'GitHub', color: '#dbe2f6', icon: 'code' },
  gitlab: { label: 'GitLab', color: '#fc6d26', icon: 'orbit' },
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [repos, setRepos] = useState<Repository[]>([])
  const [analysisCount, setAnalysisCount] = useState(0)

  useEffect(() => {
    listRepos().then(r => {
      setRepos(r)
      Promise.all(r.map((repo: Repository) => getRepoAnalyses(repo.id)))
        .then(all => setAnalysisCount(all.flat().length))
        .catch(() => {})
    }).catch(() => {})
  }, [])

  if (!user) return null

  const provider = PROVIDER_META[user.provider] ?? { label: user.provider, color: '#ffb597', icon: 'person' }
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="px-8 py-10 max-w-3xl space-y-8">
      {/* Header */}
      <div className="animate-entrance">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(255,181,151,0.08)', border: '1px solid rgba(255,181,151,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#ffb597' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#ffb597' }}>Profile</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>My Profile</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Account details & activity</p>
      </div>

      {/* Profile card */}
      <div className="hyper-glass rounded-2xl p-6 flex items-center gap-6 animate-entrance" style={{ animationDelay: '0.05s' }}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover shrink-0"
            style={{ border: '2px solid rgba(255,181,151,0.2)' }} />
        ) : (
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-geist font-extrabold text-2xl shrink-0"
            style={{ background: 'linear-gradient(135deg,#fc6d26,#ffb597)', color: '#360f00' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-geist font-bold text-xl text-white truncate">{user.name}</h3>
          <p className="font-mono text-sm mt-1 truncate" style={{ color: 'rgba(219,226,246,0.5)' }}>{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs"
              style={{ background: `${provider.color}15`, color: provider.color, border: `1px solid ${provider.color}30` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>{provider.icon}</span>
              {provider.label}
            </span>
            <span className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.3)' }}>Member since {joinDate}</span>
          </div>
        </div>
        <button onClick={logout}
          className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all hover:brightness-110 shrink-0"
          style={{ background: 'rgba(255,180,171,0.08)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' }}>
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-entrance" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Repositories', value: repos.length, color: '#c0c1ff', icon: 'folder_special' },
          { label: 'Analyses Run', value: analysisCount, color: '#ffb597', icon: 'query_stats' },
          { label: 'Provider', value: provider.label, color: provider.color, icon: provider.icon },
        ].map(s => (
          <div key={s.label} className="hyper-glass rounded-2xl p-5 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <p className="font-geist font-extrabold text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'rgba(219,226,246,0.35)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent repos */}
      {repos.length > 0 && (
        <div className="hyper-glass rounded-2xl p-6 animate-entrance" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#c0c1ff', fontVariationSettings: "'FILL' 1" }}>folder_special</span>
            <h3 className="font-geist font-bold text-base text-white">My Repositories</h3>
          </div>
          <div className="space-y-3">
            {repos.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(192,193,255,0.5)' }}>repository</span>
                <span className="font-geist text-sm font-medium text-white flex-1 truncate">{r.name}</span>
                <span className="font-mono text-xs truncate max-w-xs hidden md:block" style={{ color: 'rgba(219,226,246,0.3)' }}>{r.gitlab_url}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
