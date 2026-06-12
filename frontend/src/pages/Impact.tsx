import { useEffect, useState } from 'react'
import { listRepos, getRepoAnalyses } from '../api'
import type { Repository, Analysis } from '../types'

export default function ImpactPage() {
  const [repos, setRepos]       = useState<Repository[]>([])
  const [repoId, setRepoId]     = useState<number | ''>('')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selected, setSelected] = useState<Analysis | null>(null)

  useEffect(() => { listRepos().then(setRepos).catch(() => {}) }, [])
  useEffect(() => {
    if (!repoId) return
    getRepoAnalyses(Number(repoId)).then(a => { setAnalyses(a); setSelected(a[0] ?? null) }).catch(() => {})
  }, [repoId])

  const impact = selected?.impact

  return (
    <div className="px-8 py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="animate-entrance" style={{ animationDelay: '0.05s' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(192,193,255,0.08)', border: '1px solid rgba(192,193,255,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#c0c1ff' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#c0c1ff' }}>Impact Analysis</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>Change Impact</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Identify all affected services, APIs, files and database tables
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

      {!repoId && <EmptyPrompt icon="analytics" message="Select a repository to view impact analysis" />}
      {repoId && analyses.length === 0 && <EmptyPrompt icon="analytics" message="No analyses found. Run an analysis first from the Analyses page." />}

      {impact && (
        <div className="space-y-6 animate-entrance" style={{ animationDelay: '0.15s' }}>
          {/* Summary bar */}
          <div className="hyper-glass rounded-2xl p-5 flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(192,193,255,0.1)', border: '1px solid rgba(192,193,255,0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#c0c1ff', fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <div>
                <p className="font-geist font-bold text-white">{selected?.feature_request}</p>
                <p className="font-mono text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {impact.estimated_files_changed} files affected
                </p>
              </div>
            </div>
            <div className="flex gap-6 ml-auto flex-wrap">
              <MetaStat label="Services"   value={impact.affected_services.length}   color="#c0c1ff" />
              <MetaStat label="APIs"       value={impact.affected_apis.length}       color="#ffb597" />
              <MetaStat label="DB Tables"  value={impact.affected_db_tables.length}  color="#00e475" />
              <MetaStat label="Files"      value={impact.affected_files.length}      color="#ffb4ab" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Affected Services */}
            <SectionCard title="Affected Services" icon="hub" iconColor="#c0c1ff">
              <div className="space-y-2">
                {impact.affected_services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#c0c1ff', boxShadow: '0 0 6px #c0c1ff' }} />
                      <span className="font-mono text-sm text-white">{s.name}</span>
                    </div>
                    <span className="text-xs font-mono max-w-[160px] truncate text-right" style={{ color: 'rgba(219,226,246,0.4)' }}>{s.reason}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* File Changes — diff style */}
            <SectionCard title="File Changes" icon="history_edu" iconColor="#ffb597">
              <div className="space-y-1.5 font-mono text-xs">
                {impact.affected_files.map((f, i) => {
                  const isCreate = f.change_type === 'create'
                  const isDelete = f.change_type === 'delete'
                  const sym = isCreate ? '+' : isDelete ? '-' : '~'
                  const color = isCreate ? '#00e475' : isDelete ? '#ffb4ab' : '#ffb597'
                  const label = isCreate ? 'CREATED' : isDelete ? 'REMOVED' : 'MODIFIED'
                  return (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-r"
                      style={{ background: `${color}08`, borderLeft: `2px solid ${color}` }}>
                      <div className="flex items-center gap-2">
                        <span style={{ color }}>{sym}</span>
                        <span className="truncate max-w-[200px]" style={{ color: 'rgba(219,226,246,0.7)' }}>{f.path}</span>
                      </div>
                      <span className="font-bold text-xs ml-2 shrink-0" style={{ color }}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            {/* Affected APIs */}
            <SectionCard title="Affected APIs" icon="api" iconColor="#ffb597">
              <div className="space-y-2">
                {impact.affected_apis.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <MethodBadge method={a.method} />
                    <span className="font-mono text-xs truncate" style={{ color: 'rgba(219,226,246,0.7)' }}>{a.endpoint}</span>
                    <span className="ml-auto text-xs shrink-0" style={{ color: 'rgba(219,226,246,0.35)' }}>{a.change}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* DB Changes */}
            <SectionCard title="Database Changes" icon="database" iconColor="#00e475">
              <div className="space-y-3">
                {impact.affected_db_tables.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="font-mono font-bold text-sm mb-2" style={{ color: '#00e475' }}>{t.table}</div>
                    {t.changes.map((c, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs mt-1" style={{ color: 'rgba(219,226,246,0.55)' }}>
                        <span style={{ color: '#00e475' }}>+</span>{c}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Affected Modules */}
          {impact.affected_modules?.length > 0 && (
            <SectionCard title="Affected Modules" icon="folder_open" iconColor="#c0c1ff">
              <div className="flex flex-wrap gap-2">
                {impact.affected_modules.map((m, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl font-mono text-xs"
                    style={{ background: 'rgba(192,193,255,0.08)', color: '#c0c1ff', border: '1px solid rgba(192,193,255,0.18)' }}>
                    {m}
                  </span>
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
function MethodBadge({ method }: { method: string }) {
  const m: Record<string, string> = { GET: '#00e475', POST: '#c0c1ff', PUT: '#ffb597', DELETE: '#ffb4ab', PATCH: '#fc6d26' }
  const c = m[method?.toUpperCase()] ?? 'rgba(219,226,246,0.5)'
  return (
    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded shrink-0"
      style={{ background: `${c}12`, color: c, border: `1px solid ${c}30`, minWidth: 48, textAlign: 'center' }}>
      {method}
    </span>
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
