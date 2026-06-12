import { useEffect, useState } from 'react'
import { listRepos, getRepoAnalyses, createIssues } from '../api'
import type { Repository, Analysis, Security } from '../types'

export default function SecurityPage() {
  const [repos, setRepos]       = useState<Repository[]>([])
  const [repoId, setRepoId]     = useState<number | ''>('')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selected, setSelected] = useState<Analysis | null>(null)
  const [issueStatus, setIssueStatus] = useState('')

  useEffect(() => { listRepos().then(setRepos).catch(() => {}) }, [])
  useEffect(() => {
    if (!repoId) return
    getRepoAnalyses(Number(repoId)).then(a => {
      setAnalyses(a)
      setSelected(a[0] ?? null)
    }).catch(() => {})
  }, [repoId])

  const handleCreateIssues = async () => {
    if (!selected) return
    setIssueStatus('creating')
    try { await createIssues(selected.id, selected.repository_id); setIssueStatus('done') }
    catch { setIssueStatus('error') }
  }

  const sec = selected?.security

  return (
    <div className="px-8 py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="animate-entrance" style={{ animationDelay: '0.05s' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#ffb4ab' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#ffb4ab' }}>Security Analysis</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>Security Mesh</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          AI-powered threat detection & mitigation
        </p>
      </div>

      {/* Selectors */}
      <div className="flex gap-3 flex-wrap animate-entrance" style={{ animationDelay: '0.1s' }}>
        <Selector icon="folder_special" value={repoId} onChange={v => setRepoId(v)}
          placeholder="Select repository..." options={repos.map(r => ({ value: r.id, label: r.name }))} />
        {analyses.length > 0 && (
          <Selector icon="query_stats" value={selected?.id ?? ''} onChange={v => setSelected(analyses.find(a => a.id === v) ?? null)}
            placeholder="Select analysis..." options={analyses.map(a => ({ value: a.id, label: a.feature_request }))} />
        )}
      </div>

      {!repoId && <EmptyPrompt icon="shield_lock" message="Select a repository to view security analysis" />}
      {repoId && analyses.length === 0 && <EmptyPrompt icon="shield_lock" message="No analyses found. Run an analysis first from the Analyses page." />}
      {sec && (
        <div className="space-y-6 animate-entrance" style={{ animationDelay: '0.15s' }}>
          {/* Risk Overview */}
          <div className="hyper-glass rounded-2xl p-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#ffb4ab', fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Overall Risk Level</p>
                <RiskPill level={sec.risk_level} />
              </div>
            </div>
            <div className="flex gap-6 ml-auto flex-wrap">
              <MetaStat label="Risks" value={sec.risks.length} color="#ffb4ab" />
              <MetaStat label="Mitigations" value={sec.mitigations.length} color="#00e475" />
              <MetaStat label="Compliance" value={sec.compliance_notes.length} color="#c0c1ff" />
              <button onClick={handleCreateIssues} disabled={issueStatus === 'creating' || issueStatus === 'done'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: 'rgba(0,228,117,0.1)', color: '#00e475', border: '1px solid rgba(0,228,117,0.25)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {issueStatus === 'done' ? 'check_circle' : 'bug_report'}
                </span>
                {issueStatus === 'creating' ? 'Creating...' : issueStatus === 'done' ? 'Issues Created' : 'Create GitLab Issues'}
              </button>
            </div>
          </div>

          {/* Risks + Mitigations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Security Risks" icon="warning" iconColor="#ffb4ab">
              <div className="space-y-3">
                {sec.risks.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl space-y-2"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <SeverityDot severity={r.severity} />
                      <span className="font-geist font-bold text-sm text-white">{r.title}</span>
                      <SeverityBadge label={r.severity} />
                    </div>
                    <p className="text-xs leading-relaxed pl-5" style={{ color: 'rgba(219,226,246,0.55)' }}>{r.description}</p>
                    <span className="inline-block text-xs font-mono px-2 py-0.5 rounded ml-5"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(219,226,246,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {r.category}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Mitigations" icon="shield_check" iconColor="#00e475">
              <div className="space-y-3">
                {sec.mitigations.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-geist font-bold text-sm" style={{ color: '#00e475' }}>{m.risk_title}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
                        style={{ background: 'rgba(0,228,117,0.08)', color: '#00e475', border: '1px solid rgba(0,228,117,0.2)' }}>
                        {m.priority}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(219,226,246,0.55)' }}>{m.action}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Compliance */}
          {sec.compliance_notes.length > 0 && (
            <SectionCard title="Compliance Notes" icon="gavel" iconColor="#c0c1ff">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sec.compliance_notes.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 16, color: '#c0c1ff' }}>info</span>
                    <p className="text-sm" style={{ color: 'rgba(219,226,246,0.65)' }}>{n}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  )
}

function MetaStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="font-geist font-extrabold text-2xl" style={{ color }}>{value}</div>
      <div className="font-mono text-xs uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
    </div>
  )
}
function RiskPill({ level }: { level: string }) {
  const m: Record<string, string> = { Low: '#00e475', Medium: '#ffb597', High: '#ffb4ab', Critical: '#ff5050' }
  const c = m[level] ?? '#ffb597'
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-sm"
      style={{ background: `${c}15`, color: c, border: `1px solid ${c}30` }}>
      <span className="w-2 h-2 rounded-full" style={{ background: c }} />{level}
    </span>
  )
}
function SeverityDot({ severity }: { severity: string }) {
  const m: Record<string, string> = { Low: '#00e475', Medium: '#ffb597', High: '#ffb4ab', Critical: '#ff5050' }
  const c = m[severity] ?? '#888'
  return <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
}
function SeverityBadge({ label }: { label: string }) {
  const m: Record<string, string> = { Low: '#00e475', Medium: '#ffb597', High: '#ffb4ab', Critical: '#ff5050' }
  const c = m[label] ?? 'rgba(219,226,246,0.5)'
  return (
    <span className="ml-auto font-mono text-xs px-2 py-0.5 rounded"
      style={{ background: `${c}15`, color: c, border: `1px solid ${c}25` }}>{label}</span>
  )
}
function SectionCard({ title, icon, iconColor, children }: { title: string; icon: string; iconColor: string; children: React.ReactNode }) {
  return (
    <div className="hyper-glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: iconColor }}>{icon}</span>
        <h3 className="font-geist font-bold text-base text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}
function Selector({ icon, value, onChange, placeholder, options }: {
  icon: string; value: number | string; onChange: (v: any) => void
  placeholder: string; options: { value: any; label: string }[]
}) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ fontSize: 15, color: 'rgba(219,226,246,0.3)' }}>{icon}</span>
      <select value={value} onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
        className="rounded-xl pl-9 pr-4 py-2.5 font-mono text-xs outline-none appearance-none"
        style={{ background: 'rgba(20,28,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#dbe2f6', minWidth: 200 }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
function EmptyPrompt({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="hyper-glass rounded-2xl p-16 text-center animate-entrance">
      <span className="material-symbols-outlined block mb-4" style={{ fontSize: 48, color: 'rgba(255,181,151,0.2)', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>{message}</p>
    </div>
  )
}
