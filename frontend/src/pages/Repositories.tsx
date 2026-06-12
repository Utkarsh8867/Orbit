import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { importRepo, listRepos, getRepoAnalyses } from '../api'
import type { Repository } from '../types'

// Circular health score SVG — matches the design's SVG ring
function HealthRing({ score }: { score: number }) {
  const r = 20
  const circ = 2 * Math.PI * r         // 125.6
  const offset = circ * (1 - score / 100)
  const color = score >= 85 ? '#00e475' : score >= 65 ? '#ffb597' : '#ffb4ab'
  return (
    <div className="relative" style={{ width: 48, height: 48 }}>
      <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="24" cy="24" r={r} fill="transparent" stroke="rgba(6,14,28,0.8)" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="transparent"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold"
        style={{ fontSize: 10, color }}>
        {score}
      </span>
    </div>
  )
}

// Repo icon colors cycling
const ICON_STYLES = [
  { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  color: '#c0c1ff', icon: 'terminal'   },
  { bg: 'rgba(252,109,38,0.12)', border: 'rgba(252,109,38,0.25)',  color: '#ffb597', icon: 'dataset'    },
  { bg: 'rgba(0,228,117,0.1)',   border: 'rgba(0,228,117,0.25)',   color: '#00e475', icon: 'schema'     },
  { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  color: '#93c5fd', icon: 'layers'     },
  { bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)',  color: '#d8b4fe', icon: 'hub'        },
  { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',   color: '#fda4af', icon: 'api'        },
]

function getHealth(analyses: number): number {
  if (analyses === 0) return 72
  return Math.min(98, 60 + analyses * 8)
}

function getStatus(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 90) return { label: 'Healthy', color: '#00e475', bg: 'rgba(0,228,117,0.08)', border: 'rgba(0,228,117,0.2)' }
  if (score >= 75) return { label: 'Active',  color: '#00e475', bg: 'rgba(0,228,117,0.08)', border: 'rgba(0,228,117,0.2)' }
  if (score >= 60) return { label: 'Issues',  color: '#ffb4ab', bg: 'rgba(255,180,171,0.08)', border: 'rgba(255,180,171,0.2)' }
  return { label: 'Legacy', color: '#a88a7f', bg: 'rgba(168,138,127,0.08)', border: 'rgba(168,138,127,0.2)' }
}

function getLang(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('py') || n.includes('python')) return 'Python'
  if (n.includes('go'))                         return 'Go'
  if (n.includes('java') && !n.includes('script')) return 'Java'
  if (n.includes('ts') || n.includes('node') || n.includes('front')) return 'TypeScript'
  return 'TypeScript'
}

export default function Repositories() {
  const [repos, setRepos]         = useState<Repository[]>([])
  const [url, setUrl]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importingName, setImportingName]   = useState('')
  const [error, setError]         = useState('')
  const [analysisCounts, setAnalysisCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    listRepos().then(async (rs: Repository[]) => {
      setRepos(rs)
      const counts: Record<number, number> = {}
      await Promise.all(rs.map(async r => {
        try { const a = await getRepoAnalyses(r.id); counts[r.id] = a.length }
        catch { counts[r.id] = 0 }
      }))
      setAnalysisCounts(counts)
    }).catch(() => {})
  }, [])

  const handleImport = async () => {
    if (!url.trim()) return
    setLoading(true); setError('')
    const name = url.trim().split('/').pop() ?? 'repository'
    setImportingName(name)

    // Animate progress
    setImportProgress(0)
    const interval = setInterval(() => {
      setImportProgress(p => Math.min(p + Math.random() * 18, 90))
    }, 400)

    try {
      const repo = await importRepo(url.trim())
      clearInterval(interval)
      setImportProgress(100)
      await new Promise(r => setTimeout(r, 500))
      setRepos(prev => [repo, ...prev.filter(r => r.id !== repo.id)])
      setUrl(''); setImportProgress(0); setImportingName('')
    } catch (e: any) {
      clearInterval(interval)
      setImportProgress(0); setImportingName('')
      setError(e.response?.data?.detail ?? 'Failed to import repository')
    } finally { setLoading(false) }
  }

  return (
    <div className="pt-8 px-16 pb-16 max-w-7xl mx-auto">
      <style>{`
        @keyframes scan { 0% { left: -35%; } 100% { left: 110%; } }
        .scanning-line {
          position: absolute; height: 100%; width: 30%;
          background: linear-gradient(90deg, transparent, rgba(255,181,151,0.25), transparent);
          animation: scan 1.8s infinite linear;
        }
        .repo-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .repo-card:hover { background: rgba(34,42,57,0.7) !important; transform: translateY(-2px); box-shadow: 0 0 24px rgba(252,109,38,0.08); }
      `}</style>

      {/* ── Hero / Importer ─────────────────────────────────────── */}
      <section className="mb-10">
        <div className="rounded-xl p-8 relative overflow-hidden group animate-entrance"
          style={{ background: 'rgba(24,32,46,0.5)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Ghost icon top-right */}
          <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined" style={{ fontSize: 120, fontVariationSettings: "'FILL' 1" }}>cloud_download</span>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: '#fc6d26' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>get_app</span>
              </div>
              <h2 className="font-geist font-bold text-2xl" style={{ color: '#dbe2f6' }}>AI Repository Importer</h2>
            </div>

            <p className="text-base mb-8 max-w-2xl" style={{ color: 'rgba(219,226,246,0.7)', lineHeight: 1.7 }}>
              Instantly index your codebase. Orbit Architect will scan your architecture, detect microservices, and map dependency flows automatically.
            </p>

            {/* Input row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#ffb597' }}>
                  GitLab Repository URL
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ fontSize: 20, color: '#fc6d26' }}>link</span>
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleImport()}
                    placeholder="https://gitlab.com/orbit-org/core-engine"
                    className="w-full rounded-lg py-3.5 pl-12 pr-4 font-mono text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(6,14,28,0.7)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#dbe2f6',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
              </div>
              <button onClick={handleImport} disabled={loading || !url.trim()}
                className="flex items-center gap-2 px-7 py-3.5 rounded-lg font-geist font-bold text-sm transition-all disabled:opacity-40"
                style={{
                  background: '#fc6d26', color: '#360f00',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(252,109,38,0.25)',
                  transform: 'scale(1)',
                }}
                onMouseEnter={e => !loading && ((e.target as HTMLElement).style.boxShadow = '0 0 40px rgba(252,109,38,0.45)')}
                onMouseLeave={e => !loading && ((e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(252,109,38,0.25)')}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
                {loading ? 'Importing...' : 'Import Repository'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg"
                style={{ background: 'rgba(255,180,171,0.08)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                {error}
              </div>
            )}

            {/* Progress bar */}
            {loading && importProgress > 0 && (
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18, color: '#ffb597' }}>sync</span>
                    <span className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.7)' }}>
                      Analyzing: {importingName}
                    </span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: '#ffb597' }}>
                    {Math.round(importProgress)}% Complete
                  </span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden relative"
                  style={{ background: 'rgba(6,14,28,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${importProgress}%`,
                      background: '#fc6d26',
                      boxShadow: '0 0 15px rgba(252,109,38,0.5)',
                    }} />
                  <div className="scanning-line" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Grid header ────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-5 px-1">
        <div>
          <h3 className="font-geist font-bold text-xl" style={{ color: '#dbe2f6' }}>Managed Repositories</h3>
          <span className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.45)' }}>
            {repos.length} Total {repos.length === 1 ? 'Repository' : 'Repositories'} Indexed
          </span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg transition-colors hover:text-orange-400"
            style={{ background: 'rgba(34,42,57,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(219,226,246,0.6)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
          </button>
          <button className="p-2 rounded-lg transition-colors hover:text-orange-400"
            style={{ background: 'rgba(34,42,57,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(219,226,246,0.6)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
          </button>
        </div>
      </div>

      {/* ── Repository Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {repos.map((repo, i) => {
          const style    = ICON_STYLES[i % ICON_STYLES.length]
          const health   = getHealth(analysisCounts[repo.id] ?? 0)
          const status   = getStatus(health)
          const lang     = getLang(repo.name)
          const analyses = analysisCounts[repo.id] ?? 0
          const relTime  = getRelativeTime(repo.created_at)

          return (
            <Link key={repo.id} to={`/analyze?repo=${repo.id}`}
              className="repo-card block rounded-xl p-5 cursor-pointer animate-entrance"
              style={{
                background: 'rgba(34,42,57,0.45)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                animationDelay: `${i * 0.06}s`,
                textDecoration: 'none',
              }}>
              {/* Top row */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: style.color, fontVariationSettings: "'FILL' 1" }}>
                    {style.icon}
                  </span>
                </div>
                <HealthRing score={health} />
              </div>

              {/* Name */}
              <h4 className="font-geist font-bold text-base mb-2 truncate transition-colors group-hover:text-orange-300"
                style={{ color: '#dbe2f6' }}>
                {repo.name}
              </h4>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-xs font-mono"
                  style={{ background: 'rgba(192,193,255,0.1)', color: '#c0c1ff', border: '1px solid rgba(192,193,255,0.2)' }}>
                  {lang}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                  style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                  {status.label}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'rgba(219,226,246,0.35)' }}>
                    Analyses
                  </span>
                  <span className="font-geist font-bold text-sm" style={{ color: '#dbe2f6' }}>
                    {analyses} Run
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'rgba(219,226,246,0.35)' }}>
                    Imported
                  </span>
                  <span className="font-geist font-bold text-sm" style={{ color: '#dbe2f6' }}>
                    {relTime}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}

        {/* Add new placeholder card */}
        <Link to="/repositories"
          className="repo-card flex flex-col items-center justify-center rounded-xl p-5 cursor-pointer animate-entrance group"
          style={{
            minHeight: 220,
            background: 'transparent',
            border: '2px dashed rgba(255,255,255,0.1)',
            animationDelay: `${repos.length * 0.06}s`,
            textDecoration: 'none',
          }}
          onClick={e => { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="gitlab"]')?.focus() }}>
          <span className="material-symbols-outlined mb-3 transition-colors"
            style={{ fontSize: 48, color: 'rgba(219,226,246,0.2)' }}>add_circle</span>
          <p className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.35)' }}>New Repo Source</p>
        </Link>
      </div>
    </div>
  )
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
