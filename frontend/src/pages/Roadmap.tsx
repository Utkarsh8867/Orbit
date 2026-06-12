import { useEffect, useState } from 'react'
import { listRepos, getRepoAnalyses, createIssues } from '../api'
import type { Repository, Analysis } from '../types'

export default function RoadmapPage() {
  const [repos, setRepos]       = useState<Repository[]>([])
  const [repoId, setRepoId]     = useState<number | ''>('')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selected, setSelected] = useState<Analysis | null>(null)
  const [issueStatus, setIssueStatus] = useState('')

  useEffect(() => { listRepos().then(setRepos).catch(() => {}) }, [])
  useEffect(() => {
    if (!repoId) return
    getRepoAnalyses(Number(repoId)).then(a => { setAnalyses(a); setSelected(a[0] ?? null) }).catch(() => {})
  }, [repoId])

  const handleCreateIssues = async () => {
    if (!selected) return
    setIssueStatus('creating')
    try { await createIssues(selected.id, selected.repository_id); setIssueStatus('done') }
    catch { setIssueStatus('error') }
  }

  const roadmap = selected?.roadmap
  const PHASE_COLORS = ['#ffb597', '#c0c1ff', '#00e475', '#ffb4ab', '#93c5fd']

  return (
    <div className="px-8 py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="animate-entrance" style={{ animationDelay: '0.05s' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(0,228,117,0.08)', border: '1px solid rgba(0,228,117,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#00e475' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#00e475' }}>Implementation Roadmap</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>Roadmap</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          AI-generated phased implementation plan with effort estimates
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

      {!repoId && <EmptyPrompt icon="timeline" message="Select a repository to view the roadmap" />}
      {repoId && analyses.length === 0 && <EmptyPrompt icon="timeline" message="No analyses found. Run an analysis first from the Analyses page." />}

      {roadmap && (
        <div className="space-y-6 animate-entrance" style={{ animationDelay: '0.15s' }}>
          {/* Summary Stats */}
          <div className="hyper-glass rounded-2xl p-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(0,228,117,0.1)', border: '1px solid rgba(0,228,117,0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#00e475', fontVariationSettings: "'FILL' 1" }}>timeline</span>
              </div>
              <div>
                <p className="font-geist font-bold text-white">{selected?.feature_request}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ComplexityBadge level={roadmap.complexity} />
                </div>
              </div>
            </div>
            <div className="flex gap-6 ml-auto flex-wrap items-center">
              <MetaStat label="Total Hours"  value={`${roadmap.total_effort_hours}h`} color="#ffb597" />
              <MetaStat label="Days"         value={`${roadmap.estimated_days}d`}     color="#c0c1ff" />
              <MetaStat label="Team Size"    value={`${roadmap.recommended_team_size} devs`} color="#00e475" />
              <MetaStat label="Phases"       value={`${roadmap.phases.length}`}       color="#ffb4ab" />
              <button onClick={handleCreateIssues} disabled={issueStatus === 'creating' || issueStatus === 'done'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: 'rgba(0,228,117,0.1)', color: '#00e475', border: '1px solid rgba(0,228,117,0.25)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {issueStatus === 'done' ? 'check_circle' : 'bug_report'}
                </span>
                {issueStatus === 'creating' ? 'Creating...' : issueStatus === 'done' ? 'Issues Created' : 'Create GitLab Issues'}
              </button>
            </div>
          </div>

          {/* Phase Timeline */}
          <div className="space-y-4">
            {roadmap.phases.map((phase, pi) => {
              const color = PHASE_COLORS[pi % PHASE_COLORS.length]
              const phaseHours = phase.tasks.reduce((s, t) => s + t.effort_hours, 0)
              return (
                <div key={phase.phase_number} className="hyper-glass rounded-2xl p-6">
                  {/* Phase header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      {phase.phase_number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-geist font-bold text-lg text-white">{phase.name}</h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                          {phaseHours}h
                        </span>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(219,226,246,0.5)' }}>{phase.description}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 w-full rounded-full mb-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, (phaseHours / roadmap.total_effort_hours) * 100 * roadmap.phases.length)}%`,
                      background: color,
                      boxShadow: `0 0 8px ${color}60`,
                    }} />
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {phase.tasks.map((task, ti) => (
                      <div key={ti} className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 16, color: `${color}80` }}>check_circle</span>
                        <div className="flex-1">
                          <div className="font-geist font-bold text-sm text-white">{task.title}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.45)' }}>{task.description}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-sm" style={{ color }}>{task.effort_hours}h</div>
                          <div className="font-mono text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.3)' }}>{task.assignee_role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* GitLab Issues preview */}
          {roadmap.gitlab_issues?.length > 0 && (
            <div className="hyper-glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fc6d26' }}>bug_report</span>
                  <h3 className="font-geist font-bold text-base text-white">GitLab Issues to Create</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(252,109,38,0.1)', color: '#fc6d26', border: '1px solid rgba(252,109,38,0.25)' }}>
                    {roadmap.gitlab_issues.length} issues
                  </span>
                </div>
                <button onClick={handleCreateIssues} disabled={issueStatus === 'creating' || issueStatus === 'done'}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: '#fc6d26', color: '#360f00' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                  {issueStatus === 'done' ? 'Created!' : 'Create All Issues'}
                </button>
              </div>
              <div className="space-y-2">
                {roadmap.gitlab_issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 16, color: 'rgba(252,109,38,0.6)' }}>task_alt</span>
                    <div className="flex-1">
                      <div className="font-geist font-bold text-sm text-white">{issue.title}</div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(219,226,246,0.45)' }}>{issue.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 shrink-0">
                      {issue.labels?.slice(0, 2).map((l, j) => (
                        <span key={j} className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(255,181,151,0.08)', color: '#ffb597', border: '1px solid rgba(255,181,151,0.15)' }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetaStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="font-geist font-extrabold text-xl" style={{ color }}>{value}</div>
      <div className="font-mono text-xs uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
    </div>
  )
}
function ComplexityBadge({ level }: { level: string }) {
  const m: Record<string, string> = { Low: '#00e475', Medium: '#ffb597', High: '#ffb4ab' }
  const c = m[level] ?? '#ffb597'
  return (
    <span className="font-mono text-xs px-2 py-0.5 rounded font-bold"
      style={{ background: `${c}15`, color: c, border: `1px solid ${c}30` }}>{level} Complexity</span>
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
