import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listRepos, runAnalysis, getRepoAnalyses, createIssues } from '../api'
import type { Repository, Analysis, Impact, Security, Testing, Roadmap } from '../types'

type Tab = 'impact' | 'security' | 'testing' | 'roadmap'

const TABS: { id: Tab; label: string }[] = [
  { id: 'impact',   label: 'Impact'   },
  { id: 'security', label: 'Security' },
  { id: 'testing',  label: 'Testing'  },
  { id: 'roadmap',  label: 'Roadmap'  },
]

// ─── Orbit Loading Animation ─────────────────────────────────────────────────
function OrbitLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div style={{ width: 80, height: 80, position: 'relative' }}>
        {[
          { size: 80, duration: '4s', direction: 'normal'  },
          { size: 56, duration: '3s', direction: 'reverse' },
          { size: 32, duration: '5s', direction: 'normal'  },
        ].map((ring, i) => (
          <div key={i} style={{
            position: 'absolute',
            width:  ring.size,
            height: ring.size,
            top:  (80 - ring.size) / 2,
            left: (80 - ring.size) / 2,
            border: '2px solid rgba(255,181,151,0.2)',
            borderRadius: '50%',
            animation: `orbit-spin ${ring.duration} linear infinite`,
            animationDirection: ring.direction as any,
          }}>
            <div style={{
              position: 'absolute',
              width: 8, height: 8,
              background: '#ffb597',
              borderRadius: '50%',
              top: -4, left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 10px #ffb597',
            }} />
          </div>
        ))}
      </div>
      <p className="mt-6 font-mono text-sm uppercase tracking-widest animate-pulse" style={{ color: '#ffb597' }}>
        AI Thinking...
      </p>
      <p className="mt-2 text-xs" style={{ color: 'rgba(219,226,246,0.4)' }}>
        5 agents analyzing your repository
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Analyze() {
  const [params] = useSearchParams()
  const [repos, setRepos]         = useState<Repository[]>([])
  const [repoId, setRepoId]       = useState<number | ''>(params.get('repo') ? Number(params.get('repo')) : '')
  const [feature, setFeature]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [analysis, setAnalysis]   = useState<Analysis | null>(null)
  const [history, setHistory]     = useState<Analysis[]>([])
  const [issueStatus, setIssueStatus] = useState('')

  useEffect(() => { listRepos().then(setRepos).catch(() => {}) }, [])
  useEffect(() => {
    if (repoId) getRepoAnalyses(Number(repoId)).then(setHistory).catch(() => {})
  }, [repoId])

  const handleAnalyze = async () => {
    if (!repoId || !feature.trim()) return
    setLoading(true); setAnalysis(null)
    try {
      const result = await runAnalysis(Number(repoId), feature.trim())
      setAnalysis(result)
      setHistory(prev => [result, ...prev])
    } finally { setLoading(false) }
  }

  const handleCreateIssues = async () => {
    if (!analysis) return
    setIssueStatus('creating')
    try {
      await createIssues(analysis.id, analysis.repository_id)
      setIssueStatus('done')
    } catch { setIssueStatus('error') }
  }

  return (
    <div className="px-6 py-8">
      <style>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glow-gradient {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        .run-btn {
          background: #fc6d26;
          background-size: 200% 200%;
          animation: glow-gradient 3s ease infinite;
          box-shadow: 0 0 30px rgba(252,109,38,0.25);
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .run-btn:hover:not(:disabled) { transform: scale(1.04); filter: brightness(1.1); }
        .run-btn:active:not(:disabled) { transform: scale(0.97); }
        .run-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .tab-underline { transition: left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1); }
        .result-reveal { animation: resultReveal 0.5s ease-out forwards; }
        @keyframes resultReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Input Section ─────────────────────────────── */}
      <section className="max-w-4xl mx-auto mb-8">
        <div className="glass-card rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined" style={{ color: '#ffb597', fontSize: 24, fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h1 className="font-geist font-bold text-xl" style={{ color: '#ffb597' }}>Intelligent Analysis</h1>
          </div>

          {/* Repo selector row */}
          <div className="mb-4">
            <label className="text-xs font-mono uppercase tracking-wider mb-2 block" style={{ color: 'rgba(219,226,246,0.4)' }}>
              Repository
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 16, color: 'rgba(219,226,246,0.35)' }}>folder_special</span>
              <select value={repoId} onChange={e => setRepoId(Number(e.target.value))}
                className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none appearance-none"
                style={{ background: 'rgba(6,14,28,0.5)', border: '1px solid rgba(255,255,255,0.07)', color: '#dbe2f6' }}>
                <option value="">Select a repository...</option>
                {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            rows={4}
            value={feature}
            onChange={e => setFeature(e.target.value)}
            placeholder="Describe a feature... (Example: 'Add Google OAuth Login to the authentication microservice')"
            className="w-full rounded-xl p-4 text-sm font-mono outline-none resize-none transition-all"
            style={{
              background: 'rgba(6,14,28,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#dbe2f6',
              lineHeight: 1.7,
            }}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAnalyze() }}
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-mono" style={{ color: 'rgba(219,226,246,0.3)' }}>Ctrl+Enter to run</span>
            <button
              className="run-btn flex items-center gap-2 px-6 py-2.5 rounded-full font-mono font-bold text-sm"
              style={{ color: '#360f00' }}
              disabled={loading || !repoId || !feature.trim()}
              onClick={handleAnalyze}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
              Run Analysis
            </button>
          </div>
        </div>
      </section>

      {/* ── Loading ───────────────────────────────────── */}
      {loading && <OrbitLoader />}

      {/* ── Result View ───────────────────────────────── */}
      {!loading && analysis && (
        <section className="max-w-6xl mx-auto space-y-6 result-reveal">
          <SummaryCard analysis={analysis} onCreateIssues={handleCreateIssues} issueStatus={issueStatus} />
          <TabbedResults analysis={analysis} />
        </section>
      )}

      {/* ── History ───────────────────────────────────── */}
      {!loading && history.length > 0 && (
        <section className="max-w-6xl mx-auto mt-8">
          <h3 className="font-geist font-bold mb-3 text-sm uppercase tracking-wider font-mono"
            style={{ color: 'rgba(219,226,246,0.45)' }}>Previous Analyses</h3>
          <div className="space-y-2">
            {history.map(a => (
              <div key={a.id} onClick={() => setAnalysis(a)}
                className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all"
                style={{ borderColor: analysis?.id === a.id ? 'rgba(252,109,38,0.4)' : undefined }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fc6d26' }}>query_stats</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#dbe2f6' }}>{a.feature_request}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.35)' }}>{new Date(a.created_at).toLocaleString()}</div>
                </div>
                {a.security && <RiskPill level={a.security.risk_level} />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ analysis, onCreateIssues, issueStatus }:
  { analysis: Analysis; onCreateIssues: () => void; issueStatus: string }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(255,181,151,0.1)' }}>
          <span className="material-symbols-outlined" style={{ color: '#ffb597', fontSize: 22 }}>architecture</span>
        </div>
        <div>
          <h2 className="font-geist font-bold text-base" style={{ color: '#dbe2f6' }}>
            Feature: {analysis.feature_request}
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider mt-0.5" style={{ color: 'rgba(219,226,246,0.4)' }}>
            Analysis ID: ORB-{analysis.id.toString().padStart(4, '0')}-X
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Risk */}
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'rgba(219,226,246,0.4)' }}>RISK</p>
          {analysis.security && <RiskPill level={analysis.security.risk_level} />}
        </div>
        {/* Complexity */}
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'rgba(219,226,246,0.4)' }}>COMPLEXITY</p>
          <p className="font-geist font-bold text-lg" style={{ color: '#dbe2f6' }}>
            {analysis.roadmap?.complexity ?? '—'}
          </p>
        </div>
        {/* Effort */}
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'rgba(219,226,246,0.4)' }}>EFFORT</p>
          <p className="font-geist font-bold text-lg" style={{ color: '#dbe2f6' }}>
            {analysis.roadmap?.estimated_days ?? '—'}<span className="text-xs opacity-40">days</span>
          </p>
        </div>
        {/* Team */}
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'rgba(219,226,246,0.4)' }}>TEAM</p>
          <p className="font-geist font-bold text-lg" style={{ color: '#dbe2f6' }}>
            {analysis.roadmap?.recommended_team_size ?? '—'}<span className="text-xs opacity-40">devs</span>
          </p>
        </div>
        {/* Create issues */}
        <button onClick={onCreateIssues} disabled={issueStatus === 'creating' || issueStatus === 'done'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold transition-all hover:brightness-110 disabled:opacity-60"
          style={{ background: 'rgba(0,228,117,0.12)', color: '#00e475', border: '1px solid rgba(0,228,117,0.3)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {issueStatus === 'done' ? 'check_circle' : 'bug_report'}
          </span>
          {issueStatus === 'creating' ? 'Creating...' : issueStatus === 'done' ? 'Issues Created' : 'Create GitLab Issues'}
        </button>
      </div>
    </div>
  )
}

// ─── Tabbed Results ───────────────────────────────────────────────────────────
function TabbedResults({ analysis }: { analysis: Analysis }) {
  const [tab, setTab] = useState<Tab>('impact')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 80 })

  useEffect(() => {
    const idx = TABS.findIndex(t => t.id === tab)
    const el = tabRefs.current[idx]
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [tab])

  // also set on mount
  useEffect(() => {
    const el = tabRefs.current[0]
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [])

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1">
          {TABS.map((t, i) => (
            <button key={t.id}
              ref={el => { tabRefs.current[i] = el }}
              onClick={() => setTab(t.id)}
              className="px-5 py-3 font-mono text-sm font-bold transition-colors relative z-10"
              style={{ color: tab === t.id ? '#ffb597' : 'rgba(219,226,246,0.45)' }}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Sliding underline indicator */}
        <div className="tab-underline absolute bottom-0 h-0.5 rounded-full" style={{
          background: '#ffb597',
          left: indicator.left,
          width: indicator.width,
        }} />
      </div>

      {/* Tab content */}
      <div key={tab} className="result-reveal">
        {tab === 'impact'   && analysis.impact   && <ImpactTab   impact={analysis.impact} />}
        {tab === 'security' && analysis.security  && <SecurityTab security={analysis.security} />}
        {tab === 'testing'  && analysis.testing   && <TestingTab  testing={analysis.testing} />}
        {tab === 'roadmap'  && analysis.roadmap   && <RoadmapTab  roadmap={analysis.roadmap} />}
      </div>
    </div>
  )
}

// ─── Impact Tab ───────────────────────────────────────────────────────────────
function ImpactTab({ impact }: { impact: Impact }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Affected Services */}
      <div className="glass-card rounded-xl p-5">
        <SectionHeader icon="hub" iconColor="#c0c1ff" title="Affected Services" />
        <ul className="space-y-2 mt-4">
          {impact.affected_services.map((s, i) => (
            <li key={i} className="flex items-center justify-between p-3 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: '#c0c1ff', boxShadow: '0 0 8px #c0c1ff' }} />
                <span className="font-mono text-sm" style={{ color: '#dbe2f6' }}>{s.name}</span>
              </div>
              <span className="text-xs" style={{ color: 'rgba(219,226,246,0.35)' }}>{s.reason.split(' ').slice(0,2).join(' ')}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* File Changes — diff style */}
      <div className="glass-card rounded-xl p-5 relative overflow-hidden">
        <SectionHeader icon="history_edu" iconColor="#ffb597" title="File Changes" />
        <div className="space-y-1.5 mt-4 font-mono text-xs">
          {impact.affected_files.map((f, i) => {
            const isCreate = f.change_type === 'create'
            const isDelete = f.change_type === 'delete'
            const symbol   = isCreate ? '+' : isDelete ? '-' : '~'
            const color    = isCreate ? '#00e475' : isDelete ? '#ffb4ab' : '#ffb597'
            const bg       = isCreate ? 'rgba(0,228,117,0.05)' : isDelete ? 'rgba(255,180,171,0.05)' : 'rgba(255,181,151,0.05)'
            const label    = isCreate ? 'CREATED' : isDelete ? 'REMOVED' : 'MODIFIED'
            return (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-r"
                style={{ background: bg, borderLeft: `2px solid ${color}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ color }}>{symbol}</span>
                  <span className="truncate max-w-[220px]" style={{ color: 'rgba(219,226,246,0.75)' }}>{f.path}</span>
                </div>
                <span className="text-[10px] font-bold ml-2 shrink-0" style={{ color }}>{label}</span>
              </div>
            )
          })}
        </div>
        {/* fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none rounded-b-xl"
          style={{ background: 'linear-gradient(to top, rgba(11,19,33,0.8), transparent)' }} />
      </div>

      {/* Affected APIs */}
      <div className="glass-card rounded-xl p-5">
        <SectionHeader icon="api" iconColor="#c0c1ff" title="Affected APIs" />
        <div className="space-y-2 mt-4">
          {impact.affected_apis.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <MethodBadge method={a.method} />
              <span className="font-mono text-xs truncate" style={{ color: 'rgba(219,226,246,0.7)' }}>{a.endpoint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DB Changes */}
      <div className="glass-card rounded-xl p-5">
        <SectionHeader icon="database" iconColor="#c0c1ff" title="Database Changes" />
        <div className="space-y-3 mt-4">
          {impact.affected_db_tables.map((t, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="font-mono text-sm font-bold mb-1" style={{ color: '#c0c1ff' }}>{t.table}</div>
              {t.changes.map((c, j) => (
                <div key={j} className="text-xs flex items-center gap-1.5 mt-1" style={{ color: 'rgba(219,226,246,0.55)' }}>
                  <span style={{ color: '#00e475' }}>+</span>{c}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ security }: { security: Security }) {
  return (
    <div className="space-y-5">
      <div className="glass-card rounded-xl p-4 flex items-center gap-4">
        <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fc6d26', fontVariationSettings: "'FILL' 1" }}>security</span>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(219,226,246,0.4)' }}>Overall Risk Level</p>
          <div className="mt-1"><RiskPill level={security.risk_level} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon="warning" iconColor="#ffb4ab" title="Security Risks" />
          <div className="space-y-3 mt-4">
            {security.risks.map((r, i) => (
              <div key={i} className="p-3 rounded-lg space-y-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <SeverityDot severity={r.severity} />
                  <span className="text-sm font-bold" style={{ color: '#dbe2f6' }}>{r.title}</span>
                  <SeverityLabel label={r.severity} />
                </div>
                <p className="text-xs pl-4" style={{ color: 'rgba(219,226,246,0.5)' }}>{r.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon="shield" iconColor="#00e475" title="Mitigations" />
          <div className="space-y-3 mt-4">
            {security.mitigations.map((m, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="text-sm font-bold mb-1" style={{ color: '#00e475' }}>{m.risk_title}</div>
                <p className="text-xs" style={{ color: 'rgba(219,226,246,0.5)' }}>{m.action}</p>
                <span className="text-xs font-mono mt-1 inline-block px-2 py-0.5 rounded"
                  style={{ background: 'rgba(0,228,117,0.08)', color: '#00e475', border: '1px solid rgba(0,228,117,0.15)' }}>
                  {m.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {security.compliance_notes.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon="gavel" iconColor="#c0c1ff" title="Compliance Notes" />
          <ul className="mt-4 space-y-1.5">
            {security.compliance_notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(219,226,246,0.65)' }}>
                <span style={{ color: '#c0c1ff', marginTop: 2 }}>•</span>{n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Testing Tab ──────────────────────────────────────────────────────────────
function TestingTab({ testing }: { testing: Testing }) {
  const groups = [
    { title: `Unit Tests (${testing.unit_tests.length})`,        icon: 'science',                  items: testing.unit_tests,        color: '#c0c1ff' },
    { title: `Integration Tests (${testing.integration_tests.length})`, icon: 'integration_instructions', items: testing.integration_tests, color: '#ffb597' },
    { title: `E2E Tests (${testing.e2e_tests.length})`,          icon: 'travel_explore',           items: testing.e2e_tests,         color: '#00e475' },
  ]
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {groups.map(g => (
          <div key={g.title} className="glass-card rounded-xl p-5">
            <SectionHeader icon={g.icon} iconColor={g.color} title={g.title} />
            <div className="space-y-2 mt-4">
              {g.items.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-sm font-bold" style={{ color: g.color }}>{t.name}</div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.5)' }}>{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl p-5">
        <SectionHeader icon="replay" iconColor="#ffb4ab" title="Regression Tests" />
        <ul className="mt-4 grid grid-cols-2 gap-1.5">
          {testing.regression_tests.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(219,226,246,0.6)' }}>
              <span style={{ color: '#ffb4ab' }}>•</span>{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Roadmap Tab ──────────────────────────────────────────────────────────────
function RoadmapTab({ roadmap }: { roadmap: Roadmap }) {
  const totalHours = roadmap.total_effort_hours
  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="glass-card rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="font-geist font-bold text-xl" style={{ color: '#ffb597' }}>{totalHours}h</div>
          <div className="text-xs font-mono uppercase mt-0.5" style={{ color: 'rgba(219,226,246,0.4)' }}>Total Effort</div>
        </div>
        <div>
          <div className="font-geist font-bold text-xl" style={{ color: '#c0c1ff' }}>{roadmap.estimated_days} days</div>
          <div className="text-xs font-mono uppercase mt-0.5" style={{ color: 'rgba(219,226,246,0.4)' }}>Timeline</div>
        </div>
        <div>
          <div className="font-geist font-bold text-xl" style={{ color: '#00e475' }}>{roadmap.recommended_team_size}</div>
          <div className="text-xs font-mono uppercase mt-0.5" style={{ color: 'rgba(219,226,246,0.4)' }}>Developers</div>
        </div>
      </div>

      {/* Phases */}
      {roadmap.phases.map(phase => (
        <div key={phase.phase_number} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs px-3 py-1 rounded-full font-mono font-bold"
              style={{ background: 'rgba(252,109,38,0.15)', color: '#fc6d26', border: '1px solid rgba(252,109,38,0.3)' }}>
              Phase {phase.phase_number}
            </span>
            <span className="font-geist font-bold" style={{ color: '#dbe2f6' }}>{phase.name}</span>
            <span className="text-xs ml-auto" style={{ color: 'rgba(219,226,246,0.4)' }}>{phase.description}</span>
          </div>
          <div className="space-y-2">
            {phase.tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 16, color: 'rgba(252,109,38,0.6)' }}>check_circle</span>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: '#dbe2f6' }}>{task.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.45)' }}>{task.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm" style={{ color: '#ffb597' }}>{task.effort_hours}h</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.35)' }}>{task.assignee_role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ icon, iconColor, title }: { icon: string; iconColor: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: iconColor }}>{icon}</span>
      <h3 className="font-geist font-bold text-sm" style={{ color: '#dbe2f6' }}>{title}</h3>
    </div>
  )
}

function RiskPill({ level }: { level: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    Low:      { bg: 'rgba(0,228,117,0.1)',   color: '#00e475', dot: '#00e475' },
    Medium:   { bg: 'rgba(255,181,151,0.1)', color: '#ffb597', dot: '#ffb597' },
    High:     { bg: 'rgba(255,180,171,0.15)', color: '#ffb4ab', dot: '#ffb4ab' },
    Critical: { bg: 'rgba(255,80,80,0.15)',  color: '#ff5050', dot: '#ff5050' },
  }
  const s = map[level] ?? map['Medium']
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {level}
    </span>
  )
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = { Low: '#00e475', Medium: '#ffb597', High: '#ffb4ab', Critical: '#ff5050' }
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[severity] ?? '#888', boxShadow: `0 0 6px ${colors[severity] ?? '#888'}` }} />
}

function SeverityLabel({ label }: { label: string }) {
  const colors: Record<string, string> = { Low: '#00e475', Medium: '#ffb597', High: '#ffb4ab', Critical: '#ff5050' }
  const c = colors[label] ?? 'rgba(219,226,246,0.5)'
  return (
    <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded"
      style={{ background: `${c}15`, color: c, border: `1px solid ${c}30` }}>{label}</span>
  )
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = { GET: '#00e475', POST: '#c0c1ff', PUT: '#ffb597', DELETE: '#ffb4ab', PATCH: '#fc6d26' }
  const c = colors[method?.toUpperCase()] ?? 'rgba(219,226,246,0.5)'
  return (
    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0"
      style={{ background: `${c}12`, color: c, border: `1px solid ${c}30`, minWidth: 48, textAlign: 'center' }}>
      {method}
    </span>
  )
}
