import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRepos, getRepoAnalyses } from '../api'
import type { Repository } from '../types'

const REPO_ICONS  = ['api', 'credit_card', 'database', 'hub', 'layers', 'terminal']
const REPO_HEALTH = [92, 78, 85, 95, 70, 88]
const REPO_LANGS  = [
  { label: 'Java_Runtime', color: '#c0c1ff' },
  { label: 'Golang_v1.2', color: '#ffb597' },
  { label: 'TypeScript',  color: '#00e475' },
  { label: 'Python_3.12', color: '#c0c1ff' },
  { label: 'Rust_v1.7',   color: '#ffb4ab' },
  { label: 'Node_v20',    color: '#00e475' },
]

function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const cx = r.width / 2, cy = r.height / 2
      el.style.transform = `perspective(1200px) rotateX(${(y - cy) / 15}deg) rotateY(${(cx - x) / 15}deg) scale(1.01)`
      el.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(255,181,151,0.08), transparent 80%)`
    }
    const onLeave = () => {
      el.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)'
      el.style.backgroundImage = 'none'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [ref])
}

export default function Dashboard() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [analysisCounts, setAnalysisCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    listRepos().then(async (rs: Repository[]) => {
      setRepos(rs)
      const counts: Record<number, number> = {}
      await Promise.all(rs.map(async r => {
        try { counts[r.id] = (await getRepoAnalyses(r.id)).length }
        catch { counts[r.id] = 0 }
      }))
      setAnalysisCounts(counts)
    }).catch(() => {})
  }, [])

  const totalAnalyses = Object.values(analysisCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="px-8 py-10 space-y-16 max-w-7xl">
      <style>{`
        .hyper-glass {
          background: rgba(20,28,42,0.4);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.02);
          transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
        }
        .hyper-glass:hover {
          background: rgba(28,38,56,0.6);
          border-color: rgba(255,181,151,0.3);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 10px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(252,109,38,0.1);
        }
        .light-leak { position: relative; overflow: hidden; }
        .light-leak::after {
          content: '';
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at center, rgba(252,109,38,0.1) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.6s ease; pointer-events: none;
        }
        .light-leak:hover::after { opacity: 1; }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .scanline-card { position: relative; overflow: hidden; }
        .scanline-card::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(252,109,38,0.04), transparent);
          height: 20%; width: 100%;
          animation: scanline 8s linear infinite; pointer-events: none;
        }
        @keyframes float { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-6px) rotate(1deg); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* ── Hero ───────────────────────────── */}
      <section className="animate-entrance" style={{ animationDelay: '0.05s' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
          style={{ background: 'rgba(255,181,151,0.08)', border: '1px solid rgba(255,181,151,0.2)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ffb597' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#ffb597' }}>System Status: Optimal</span>
        </div>

        <h2 className="font-geist font-extrabold mb-4 max-w-4xl tracking-tight leading-tight"
          style={{ fontSize: 52, color: '#fff' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>Welcome,</span> Architect.<br />
          Analyze. Refactor.{' '}
          <span style={{ background: 'linear-gradient(90deg, #ffb597, #fc6d26)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Scale.
          </span>
        </h2>

        <p className="text-lg max-w-2xl" style={{ color: 'rgba(168,138,127,1)', lineHeight: 1.7 }}>
          Orbit AI has indexed{' '}
          <span className="font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: '#fff', background: 'rgba(255,255,255,0.06)' }}>
            {repos.length} REPOSITORIES
          </span>{' '}
          and run{' '}
          <span className="underline" style={{ textDecorationColor: 'rgba(252,109,38,0.5)', textUnderlineOffset: 4 }}>
            {totalAnalyses} deep analyses
          </span>{' '}
          across your infrastructure.
        </p>
      </section>

      {/* ── Stats Grid ─────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-entrance" style={{ animationDelay: '0.15s' }}>
        <StatCard icon="folder" iconColor="#ffb597" badge="+02_NW" label="Repositories_Mapped" value={repos.length} />
        <StatCard icon="analytics" iconColor="#c0c1ff" badge="99.8%_ACC" label="Deep_Analyses_Run" value={totalAnalyses} />
        <StatCard icon="terminal" iconColor="#ffb4ab" badge="-12%_MOM" label="Issues_Resolved" value={totalAnalyses * 4} />
        <StatCard icon="energy_savings_leaf" iconColor="#00e475" badge="~$84k_USD" label="Hours_Automated" value={`${(totalAnalyses * 15).toLocaleString()}`} highlight />
      </section>

      {/* ── Repo Grid ──────────────────────── */}
      <section className="animate-entrance" style={{ animationDelay: '0.25s' }}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-geist font-bold tracking-tight text-white mb-1" style={{ fontSize: 28 }}>Node Infrastructure</h3>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
              Active Services Monitoring [{repos.length} Online]
            </p>
          </div>
          <Link to="/repositories"
            className="font-mono uppercase tracking-widest flex items-center gap-2 group transition-colors hover:text-white"
            style={{ fontSize: 11, color: '#ffb597', textDecoration: 'none' }}>
            Access_Registry
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        {repos.length === 0 ? (
          <EmptyRepos />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {repos.map((r, i) => (
              <RepoCard key={r.id} repo={r} analyses={analysisCounts[r.id] ?? 0} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Bottom Asymmetric Row ───────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-entrance" style={{ animationDelay: '0.35s' }}>
        {/* Drift chart */}
        <DriftChart className="lg:col-span-3" />
        {/* AI Insight */}
        <AIInsight className="lg:col-span-2" />
      </section>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconColor, badge, label, value, highlight }: {
  icon: string; iconColor: string; badge: string; label: string; value: number | string; highlight?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return (
    <div ref={ref} className="hyper-glass light-leak p-8 rounded-2xl cursor-crosshair"
      style={highlight ? { borderColor: 'rgba(255,181,151,0.25)', boxShadow: '0 0 40px -10px rgba(252,109,38,0.1)' } : {}}>
      <div className="flex justify-between items-start mb-8">
        <div className="p-3 rounded-xl" style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}33` }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div className="font-mono px-2 py-0.5 rounded" style={{ fontSize: 11, color: iconColor, background: `${iconColor}18`, border: `1px solid ${iconColor}33` }}>
          {badge}
        </div>
      </div>
      <div className="font-geist font-extrabold tracking-tighter mb-2" style={{ fontSize: 56, lineHeight: 1, color: '#fff' }}>{value}</div>
      <div className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{label}</div>
    </div>
  )
}

// ─── Repo Card ────────────────────────────────────────────────────────────────
function RepoCard({ repo, analyses, index }: { repo: Repository; analyses: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  const icon   = REPO_ICONS[index % REPO_ICONS.length]
  const health = REPO_HEALTH[index % REPO_HEALTH.length]
  const lang   = REPO_LANGS[index % REPO_LANGS.length]
  const isWarn = health < 85
  const isHighlight = index === 1

  return (
    <Link to={`/analyze?repo=${repo.id}`} style={{ textDecoration: 'none' }}>
      <div ref={ref}
        className="hyper-glass p-6 rounded-2xl flex flex-col group relative overflow-hidden"
        style={isHighlight
          ? { borderColor: 'rgba(255,181,151,0.25)', background: 'rgba(255,181,151,0.015)' }
          : { borderColor: 'rgba(255,255,255,0.05)' }}>

        {/* Blur blob */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 pointer-events-none"
          style={{ background: isHighlight ? 'rgba(252,109,38,0.12)' : 'rgba(0,228,117,0.05)', filter: 'blur(40px)' }} />

        {/* Top row */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: isHighlight ? 'rgba(252,109,38,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isHighlight ? 'rgba(252,109,38,0.25)' : 'rgba(255,255,255,0.1)'}`,
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: isHighlight ? '#ffb597' : 'rgba(255,255,255,0.5)' }}>{icon}</span>
            </div>
            <div>
              <h4 className="font-geist font-bold text-lg transition-colors group-hover:text-[#ffb597]" style={{ color: '#fff' }}>
                {repo.name}
              </h4>
              <span className="font-mono" style={{ fontSize: 10, color: isHighlight ? 'rgba(255,181,151,0.5)' : 'rgba(255,255,255,0.3)' }}>
                {isHighlight ? 'STAGING-BETA' : 'PROD-v2.x.0'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-xl" style={{ color: isWarn ? '#ffb597' : '#00e475' }}>{health}%</div>
            <div className="font-mono uppercase" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>Health_IDX</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-2 py-0.5 rounded font-mono uppercase" style={{ fontSize: 9, background: `${lang.color}18`, border: `1px solid ${lang.color}30`, color: lang.color }}>
            {lang.label}
          </span>
          <span className="px-2 py-0.5 rounded font-mono uppercase" style={{ fontSize: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
            {analyses > 0 ? `${analyses}_Analyses` : 'No_Analyses'}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {isWarn ? (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: '#ffb4ab' }} />
              <span className="font-mono uppercase font-bold" style={{ fontSize: 10, color: '#ffb4ab' }}>
                Drift_Detected
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2" style={{ color: 'rgba(0,228,117,0.5)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified_user</span>
              <span className="font-mono uppercase" style={{ fontSize: 10 }}>Secure_Node</span>
            </div>
          )}
          <span className="font-mono uppercase" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
            Sync: {getRelTime(repo.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Drift Chart ──────────────────────────────────────────────────────────────
function DriftChart({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  const bars = [40, 60, 35, 85, 55, 70, 45]
  const days = ['M_DAY', 'T_DAY', 'W_DAY', 'T_DAY_CURR', 'F_DAY', 'S_DAY', 'S_DAY']
  const peak = bars.indexOf(Math.max(...bars))

  return (
    <div ref={ref} className={`hyper-glass scanline-card p-8 rounded-2xl ${className ?? ''}`}>
      <div className="flex justify-between items-center mb-10">
        <h4 className="font-geist font-bold tracking-tight text-white" style={{ fontSize: 22 }}>System Drift Visualizer</h4>
        <div className="flex gap-4">
          <span className="font-mono uppercase" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>FREQ: 15min</span>
          <span className="font-mono uppercase" style={{ fontSize: 10, color: '#ffb597' }}>TYPE: LINEAR_REGR</span>
        </div>
      </div>

      <div className="flex items-end gap-3 h-56 pb-6" style={{ borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 relative group" style={{ height: `${h}%` }}>
            {i === peak && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded font-mono whitespace-nowrap"
                style={{ fontSize: 9, background: '#ffb597', color: '#060e1c', fontWeight: 700 }}>
                PEAK_ALERT
              </div>
            )}
            <div className="w-full h-full rounded-t-lg transition-all"
              style={{
                background: i === peak ? 'rgba(252,109,38,0.45)' : 'rgba(255,255,255,0.05)',
                borderTop: i === peak ? '2px solid #fc6d26' : 'none',
              }} />
            {i !== peak && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ fontSize: 9, background: '#0b1321', color: '#ffb597', border: '1px solid rgba(255,181,151,0.3)' }}>
                VAL_{(h * 124).toFixed(0)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        {days.map((d, i) => (
          <span key={i} className="flex-1 text-center font-mono uppercase" style={{ fontSize: 9, color: i === peak ? '#ffb597' : 'rgba(255,255,255,0.18)', letterSpacing: '0.2em' }}>
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── AI Insight ───────────────────────────────────────────────────────────────
function AIInsight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return (
    <div ref={ref}
      className={`hyper-glass p-8 rounded-2xl flex flex-col ${className ?? ''}`}
      style={{ borderColor: 'rgba(255,181,151,0.2)', background: 'linear-gradient(135deg, rgba(255,181,151,0.015), transparent)' }}>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,181,151,0.15)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb597', fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <h4 className="font-geist font-bold tracking-tight text-white" style={{ fontSize: 20 }}>AI Neural Insight</h4>
      </div>

      <div className="font-mono text-sm leading-relaxed mb-auto py-3 px-4 rounded-r-lg italic flex-1"
        style={{ color: 'rgba(168,138,127,1)', borderLeft: '2px solid rgba(255,181,151,0.3)', background: 'rgba(255,255,255,0.03)' }}>
        "Orbit AI identified circular dependencies between{' '}
        <span className="font-bold" style={{ color: '#fff' }}>StripeConnector</span> and{' '}
        <span style={{ color: '#ffb597' }}>AuditLog</span>. Refactoring to Event Bus architecture could optimize latency by{' '}
        <span className="font-bold" style={{ color: '#00e475' }}>-45ms/req</span>."
      </div>

      <Link to="/analyze"
        className="w-full mt-8 py-5 rounded-xl font-geist font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-[0.98]"
        style={{
          background: '#ffb597',
          color: '#060e1c',
          boxShadow: '0 0 0 rgba(255,181,151,0)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(255,181,151,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(255,181,151,0)')}>
        Execute_Refactor_Protocol
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>bolt</span>
      </Link>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyRepos() {
  return (
    <div className="hyper-glass rounded-2xl p-16 text-center">
      <span className="material-symbols-outlined mb-4 block animate-float" style={{ fontSize: 56, color: 'rgba(252,109,38,0.3)', fontVariationSettings: "'FILL' 1" }}>folder_open</span>
      <p className="font-geist font-bold text-xl mb-2 text-white">No repositories indexed</p>
      <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Import a GitLab repository to begin
      </p>
      <Link to="/repositories"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-widest transition-all hover:brightness-110"
        style={{ background: 'rgba(252,109,38,0.12)', color: '#ffb597', border: '1px solid rgba(252,109,38,0.3)', textDecoration: 'none' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
        Import_Repository
      </Link>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRelTime(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'NOW'
  if (m < 60) return `${m}m_AGO`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h_AGO`
  return `${Math.floor(h / 24)}d_AGO`
}
