import { useEffect, useRef, useState } from 'react'
import { listRepos, getRepoAnalyses } from '../api'
import type { Repository, Analysis } from '../types'

const NODE_COLORS = ['#ffb597', '#c0c1ff', '#00e475', '#fc6d26', '#93c5fd', '#fda4af']
const NODE_ICONS  = ['hub', 'lock', 'database', 'monitoring', 'api', 'schema', 'layers', 'terminal']

function buildLayout(services: { name: string; tech_stack?: string }[]) {
  const cx = 600, cy = 380, r = 240
  return services.map((s, i) => {
    const angle = (i / services.length) * 2 * Math.PI - Math.PI / 2
    return {
      id: s.name,
      label: s.name.toUpperCase().replace(/[\s-]/g, '_').slice(0, 12),
      sub: s.tech_stack ?? '',
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      color: NODE_COLORS[i % NODE_COLORS.length],
      icon: NODE_ICONS[i % NODE_ICONS.length],
      size: i === 0 ? 130 : 110,
    }
  })
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ArchitecturePage() {
  const [repos, setRepos]       = useState<Repository[]>([])
  const [repoId, setRepoId]     = useState<number | ''>('')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selected, setSelected] = useState<Analysis | null>(null)
  const [zoom, setZoom]         = useState(1)
  const [pan, setPan]           = useState({ x: 0, y: 0 })
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [time, setTime] = useState(new Date())
  useEffect(() => { listRepos().then(setRepos).catch(() => {}) }, [])
  useEffect(() => {
    if (repoId) getRepoAnalyses(Number(repoId))
      .then(a => { setAnalyses(a); setSelected(a[0] ?? null) })
      .catch(() => {})
  }, [repoId])
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const arch = selected?.architecture
  const nodes = arch ? buildLayout(arch.services) : []
  const deps  = arch?.dependencies ?? []

  const activeNodeData = nodes.find(n => n.id === activeNode)

  return (
    <div className="relative" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#050810' }}>
      <style>{`
        @keyframes dash-flow { to { stroke-dashoffset: -1000; } }
        @keyframes hex-pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .flow-line { stroke-dasharray: 6; animation: dash-flow 30s linear infinite; filter: drop-shadow(0 0 4px rgba(255,181,151,0.3)); }
        .hex-node { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
        .hex-node:hover .hex-bg { filter: brightness(1.4); }
        .hex-node.active .hex-bg { filter: brightness(1.6); }
        .hud-text { font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 10px rgba(255,255,255,0.15); }
        .canvas-ctrl-btn { transition: all 0.2s; }
        .canvas-ctrl-btn:hover { background: rgba(255,181,151,0.15) !important; color: #ffb597; box-shadow: 0 0 15px rgba(255,181,151,0.3); }
      `}</style>

      {/* ── Mesh background ─────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                          radial-gradient(at 50% 0%, hsla(225,39%,30%,0.2) 0, transparent 50%),
                          radial-gradient(at 100% 0%, hsla(339,49%,30%,0.1) 0, transparent 50%)`
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,181,151,0.12) 0%, transparent 70%)'
      }} />

      {/* ── HUD: top-left ────────────── */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none hud-text space-y-1"
        style={{ fontSize: 10, color: 'rgba(219,226,246,0.35)' }}>
        <p>&gt; SYSTEM_STATUS: STABLE</p>
        <p>&gt; LATENCY: 24MS</p>
        <p>&gt; TIME: {time.toTimeString().slice(0,8)}</p>
        <div className="flex gap-2 items-center mt-1">
          <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full animate-pulse rounded-full" style={{ width: '66%', background: '#ffb597' }} />
          </div>
          <span>MEM_LOAD</span>
        </div>
      </div>

      {/* ── HUD: top-right ───────────── */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none hud-text text-right space-y-1"
        style={{ fontSize: 10, color: 'rgba(219,226,246,0.35)' }}>
        <p>NODE_COUNT: {nodes.length.toString().padStart(2,'0')}</p>
        <p>CONNECTIONS: {deps.length.toString().padStart(2,'0')}</p>
        <p style={{ color: '#00e475' }}>ENCRYPTED_FLOW: ACTIVE</p>
      </div>

      {/* ── HUD: bottom-left ─────────── */}
      <div className="absolute bottom-20 left-4 z-30 pointer-events-none hud-text flex gap-4"
        style={{ fontSize: 10, color: 'rgba(219,226,246,0.4)' }}>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 8 }}>
          <p style={{ color: 'rgba(255,181,151,0.6)' }}>NODE_COUNT</p>
          <p style={{ fontSize: 18 }}>{nodes.length.toString().padStart(2,'0')}</p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 8 }}>
          <p style={{ color: 'rgba(192,193,255,0.6)' }}>CONNS</p>
          <p style={{ fontSize: 18 }}>{deps.length.toString().padStart(2,'0')}</p>
        </div>
      </div>

      {/* ── HUD: bottom-center ───────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none hud-text"
        style={{ fontSize: 10, color: 'rgba(219,226,246,0.3)' }}>
        ORBIT_ARCHITECT // v2.4.0-BETA
      </div>

      {/* ── Topbar controls ──────────── */}
      <div className="absolute top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-6"
        style={{ background: 'rgba(5,8,16,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-4">
          {/* Repo selector */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ fontSize: 15, color: 'rgba(219,226,246,0.35)' }}>folder_special</span>
            <select value={repoId} onChange={e => setRepoId(Number(e.target.value))}
              className="rounded-full pl-9 pr-4 py-1.5 text-xs font-mono outline-none appearance-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6', minWidth: 180 }}>
              <option value="">Select repository...</option>
              {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {analyses.length > 0 && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 15, color: 'rgba(219,226,246,0.35)' }}>query_stats</span>
              <select value={selected?.id ?? ''}
                onChange={e => setSelected(analyses.find(a => a.id === Number(e.target.value)) ?? null)}
                className="rounded-full pl-9 pr-4 py-1.5 text-xs font-mono outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6', minWidth: 220 }}>
                {analyses.map(a => <option key={a.id} value={a.id}>{a.feature_request}</option>)}
              </select>
            </div>
          )}
          {/* Search */}
          <div className="flex items-center rounded-full px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: 220 }}>
            <span className="material-symbols-outlined mr-2" style={{ fontSize: 15, color: 'rgba(219,226,246,0.4)' }}>search</span>
            <input className="bg-transparent outline-none text-xs font-mono w-full"
              placeholder="Search entity..." style={{ color: '#dbe2f6' }} />
          </div>
        </div>
        <button className="px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all hover:scale-105"
          style={{ background: 'rgba(255,181,151,0.1)', color: '#ffb597', border: '1px solid rgba(255,181,151,0.3)', boxShadow: '0 0 20px rgba(255,181,151,0.08)' }}>
          EXPORT SNAPSHOT
        </button>
      </div>

      {/* ── Main Canvas ──────────────── */}
      <div className="absolute inset-0 top-14" style={{ overflow: 'hidden' }}>
        <div style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, transformOrigin: 'center', width: '100%', height: '100%', transition: 'transform 0.2s ease' }}>

          {arch ? (
            <LiveMap nodes={nodes} deps={deps} activeNode={activeNode} setActiveNode={setActiveNode} />
          ) : (
            <EmptyState repoId={repoId} />
          )}
        </div>
      </div>

      {/* ── Canvas Controls ──────────── */}
      <div className="absolute bottom-5 left-5 z-40 flex gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { icon: 'add',                  title: 'Zoom In',    fn: () => setZoom(z => Math.min(z + 0.15, 2.5)) },
          { icon: 'remove',               title: 'Zoom Out',   fn: () => setZoom(z => Math.max(z - 0.15, 0.4)) },
          { icon: 'filter_center_focus',  title: 'Reset',      fn: () => { setZoom(1); setPan({ x: 0, y: 0 }) } },
          { icon: 'layers',               title: 'Layers',     fn: () => {} },
        ].map(b => (
          <button key={b.icon} title={b.title} onClick={b.fn}
            className="canvas-ctrl-btn p-2 rounded-lg"
            style={{ color: 'rgba(219,226,246,0.6)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{b.icon}</span>
          </button>
        ))}
        <div style={{ width: 1, alignSelf: 'center', height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />
        <span className="self-center font-mono px-2" style={{ fontSize: 10, color: 'rgba(219,226,246,0.35)' }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* ── Minimap ──────────────────── */}
      <Minimap nodes={nodes} activeNode={activeNode} />

      {/* ── Node detail panel ────────── */}
      {activeNodeData && arch && (
        <NodePanel node={activeNodeData} arch={arch} onClose={() => setActiveNode(null)} />
      )}

      {/* ── Floating Query button ─────── */}
      <button className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all hover:scale-105 group"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}>
        <span className="material-symbols-outlined" style={{ color: '#ffb597', fontSize: 18 }}>psychology</span>
        Query Oracle
      </button>
    </div>
  )
}

// ─── Live Map ─────────────────────────────────────────────────────────────────
function LiveMap({ nodes, deps, activeNode, setActiveNode }: {
  nodes: ReturnType<typeof buildLayout>
  deps: { from: string; to: string; type: string }[]
  activeNode: string | null
  setActiveNode: (id: string | null) => void
}) {
  const W = 1200, H = 800
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <svg ref={undefined} viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ position: 'absolute', inset: 0 }}>

      {/* ── Connection lines ── */}
      {deps.map((d, i) => {
        const a = nodeMap[d.from], b = nodeMap[d.to]
        if (!a || !b) return null
        const strokeColor = i % 3 === 0 ? 'rgba(192,193,255,0.3)' : i % 3 === 1 ? 'rgba(255,181,151,0.35)' : 'rgba(0,228,117,0.25)'
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 60
        return (
          <g key={i}>
            <path className="flow-line" fill="none" stroke={strokeColor} strokeWidth="1"
              d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`} />
            {/* Animated particle */}
            <circle r="2.5" fill={strokeColor.replace('0.3)', '1)').replace('0.35)', '1)').replace('0.25)', '1)')}
              style={{ filter: `drop-shadow(0 0 6px ${strokeColor})` }}>
              <animateMotion dur={`${2.5 + i * 0.7}s`} repeatCount="indefinite"
                path={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`} />
            </circle>
            {/* Label */}
            <text x={mx} y={my - 6} textAnchor="middle" fill="rgba(219,226,246,0.25)"
              style={{ fontSize: 8, fontFamily: 'JetBrains Mono' }}>{d.type}</text>
          </g>
        )
      })}

      {/* ── Hexagon nodes ── */}
      {nodes.map(node => (
        <HexNode key={node.id} node={node} isActive={activeNode === node.id}
          onClick={() => setActiveNode(activeNode === node.id ? null : node.id)} />
      ))}
    </svg>
  )
}

// ─── Hexagon Node ─────────────────────────────────────────────────────────────
function HexNode({ node, isActive, onClick }: {
  node: ReturnType<typeof buildLayout>[0]
  isActive: boolean
  onClick: () => void
}) {
  const s = node.size
  // Hex polygon points centered at 0,0
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * Math.PI / 180
    return `${(s / 2) * Math.cos(a)},${(s / 2) * Math.sin(a)}`
  }).join(' ')

  return (
    <g transform={`translate(${node.x},${node.y})`}
      className={`hex-node${isActive ? ' active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}>

      {/* Outer glow ring when active */}
      {isActive && (
        <polygon points={pts}
          fill="none" stroke={node.color} strokeWidth="2" opacity="0.5"
          transform={`scale(1.18)`}
          style={{ filter: `drop-shadow(0 0 12px ${node.color})` }} />
      )}

      {/* Hex background */}
      <polygon className="hex-bg" points={pts}
        fill={isActive ? 'rgba(21,30,47,0.85)' : 'rgba(21,30,47,0.55)'}
        stroke={isActive ? node.color : 'rgba(255,255,255,0.1)'}
        strokeWidth={isActive ? '1.5' : '1'}
        style={{ transition: 'all 0.3s', filter: isActive ? `drop-shadow(0 0 20px ${node.color}40)` : 'none' }}
      />
      {/* Glass sheen */}
      <polygon points={pts} fill="url(#hex-sheen)" opacity="0.06" />

      {/* Icon (using text as Material Symbol) */}
      <text textAnchor="middle" dominantBaseline="middle" y={-s * 0.15}
        style={{
          fontFamily: 'Material Symbols Outlined',
          fontSize: s * 0.22,
          fill: node.color,
          fontVariationSettings: "'FILL' 1",
          filter: `drop-shadow(0 0 8px ${node.color}80)`,
        }}>
        {node.icon}
      </text>

      {/* Label */}
      <text textAnchor="middle" dominantBaseline="middle" y={s * 0.12}
        style={{ fontFamily: 'Geist, sans-serif', fontSize: s * 0.1, fill: '#dbe2f6', fontWeight: 700, letterSpacing: 1 }}>
        {node.label}
      </text>

      {/* Sub label */}
      {node.sub && (
        <text textAnchor="middle" dominantBaseline="middle" y={s * 0.25}
          style={{ fontFamily: 'JetBrains Mono', fontSize: s * 0.075, fill: 'rgba(219,226,246,0.4)' }}>
          {node.sub.slice(0, 14)}
        </text>
      )}

      {/* Live dot */}
      <circle cx={0} cy={s * 0.35} r="3" fill="#00e475"
        style={{ filter: 'drop-shadow(0 0 4px #00e475)' }}>
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* SVG gradient defs (only once, placed inside each node for simplicity) */}
      <defs>
        <linearGradient id="hex-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </g>
  )
}

// ─── Node Detail Panel ────────────────────────────────────────────────────────
function NodePanel({ node, arch, onClose }: {
  node: ReturnType<typeof buildLayout>[0]
  arch: NonNullable<Analysis['architecture']>
  onClose: () => void
}) {
  const svc = arch.services.find(s => s.name === node.id)
  const deps = arch.dependencies.filter(d => d.from === node.id || d.to === node.id)

  return (
    <div className="absolute top-16 right-4 z-50 w-72 rounded-xl p-5 animate-entrance"
      style={{ background: 'rgba(21,30,47,0.85)', backdropFilter: 'blur(30px)', border: `1px solid ${node.color}40` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: node.color, fontVariationSettings: "'FILL' 1" }}>{node.icon}</span>
          <span className="font-geist font-bold text-sm" style={{ color: '#dbe2f6' }}>{node.label}</span>
        </div>
        <button onClick={onClose} className="transition-opacity hover:opacity-70"
          style={{ color: 'rgba(219,226,246,0.5)', fontSize: 18 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>

      {svc && (
        <>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(219,226,246,0.65)' }}>
            {svc.description}
          </p>
          {svc.tech_stack && (
            <div className="mb-3">
              <span className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ background: `${node.color}15`, color: node.color, border: `1px solid ${node.color}30` }}>
                {svc.tech_stack}
              </span>
            </div>
          )}
        </>
      )}

      {deps.length > 0 && (
        <div>
          <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(219,226,246,0.35)' }}>
            Connections ({deps.length})
          </p>
          <div className="space-y-1.5">
            {deps.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: node.color }}>
                  {d.from === node.id ? 'arrow_forward' : 'arrow_back'}
                </span>
                <span className="font-mono truncate" style={{ color: 'rgba(219,226,246,0.7)' }}>
                  {d.from === node.id ? d.to : d.from}
                </span>
                <span className="ml-auto text-xs font-mono" style={{ color: 'rgba(219,226,246,0.35)' }}>{d.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="font-mono font-bold text-sm" style={{ color: node.color }}>1.2K</div>
          <div className="text-xs font-mono" style={{ color: 'rgba(219,226,246,0.35)', fontSize: 9 }}>OPS/S</div>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="font-mono font-bold text-sm" style={{ color: '#00e475' }}>99.9%</div>
          <div className="text-xs font-mono" style={{ color: 'rgba(219,226,246,0.35)', fontSize: 9 }}>UPTIME</div>
        </div>
      </div>
    </div>
  )
}

// ─── Minimap ──────────────────────────────────────────────────────────────────
function Minimap({ nodes, activeNode }: { nodes: ReturnType<typeof buildLayout>; activeNode: string | null }) {
  const W = 1200, H = 800
  return (
    <div className="absolute bottom-5 right-5 z-40 rounded-xl overflow-hidden"
      style={{ width: 176, height: 112, background: 'rgba(21,30,47,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-mono" style={{ fontSize: 9, color: 'rgba(219,226,246,0.35)' }}>MINIMAP_RADAR</span>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e475', boxShadow: '0 0 5px #00e475' }}>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: 'block' }}>
        {/* Lines */}
        {nodes.length > 1 && nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length]
          return <line key={i} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        })}
        {/* Node dots */}
        {nodes.map(n => (
          <circle key={n.id} cx={n.x} cy={n.y} r={activeNode === n.id ? 18 : 12}
            fill={n.color} opacity={activeNode === n.id ? 0.9 : 0.45}
            style={{ filter: activeNode === n.id ? `drop-shadow(0 0 8px ${n.color})` : 'none' }}
          />
        ))}
        {/* Viewport indicator */}
        <rect x="50" y="30" width={W - 100} height={H - 60} rx="4"
          fill="none" stroke="rgba(255,181,151,0.4)" strokeWidth="6" />
      </svg>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ repoId }: { repoId: number | '' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <span className="material-symbols-outlined block mb-4" style={{ fontSize: 64, color: 'rgba(255,181,151,0.2)', fontVariationSettings: "'FILL' 1" }}>
          account_tree
        </span>
        <p className="font-geist font-bold text-lg mb-2" style={{ color: 'rgba(219,226,246,0.6)' }}>
          {repoId ? 'No analyses found' : 'Select a repository'}
        </p>
        <p className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.3)' }}>
          {repoId ? 'Run a feature analysis first to generate the architecture map' : 'Choose a repository from the selector above to load its architecture'}
        </p>
      </div>
    </div>
  )
}
