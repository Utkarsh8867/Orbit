const styles: Record<string, { bg: string; color: string; border: string }> = {
  Low:      { bg: 'rgba(0,228,117,0.1)',  color: '#00e475', border: 'rgba(0,228,117,0.25)' },
  Medium:   { bg: 'rgba(255,181,151,0.1)', color: '#ffb597', border: 'rgba(255,181,151,0.25)' },
  High:     { bg: 'rgba(255,180,171,0.15)', color: '#ffb4ab', border: 'rgba(255,180,171,0.3)' },
  Critical: { bg: 'rgba(255,80,80,0.15)', color: '#ff5050', border: 'rgba(255,80,80,0.3)' },
  create:   { bg: 'rgba(192,193,255,0.1)', color: '#c0c1ff', border: 'rgba(192,193,255,0.2)' },
  modify:   { bg: 'rgba(255,181,151,0.1)', color: '#ffb597', border: 'rgba(255,181,151,0.2)' },
  delete:   { bg: 'rgba(255,80,80,0.1)',  color: '#ff5050', border: 'rgba(255,80,80,0.2)' },
  GET:      { bg: 'rgba(0,228,117,0.1)',  color: '#00e475', border: 'rgba(0,228,117,0.2)' },
  POST:     { bg: 'rgba(192,193,255,0.1)', color: '#c0c1ff', border: 'rgba(192,193,255,0.2)' },
  PUT:      { bg: 'rgba(255,181,151,0.1)', color: '#ffb597', border: 'rgba(255,181,151,0.2)' },
  DELETE:   { bg: 'rgba(255,80,80,0.1)',  color: '#ff5050', border: 'rgba(255,80,80,0.2)' },
  PATCH:    { bg: 'rgba(252,109,38,0.1)', color: '#fc6d26', border: 'rgba(252,109,38,0.2)' },
}
const fallback = { bg: 'rgba(219,226,246,0.08)', color: 'rgba(219,226,246,0.6)', border: 'rgba(219,226,246,0.12)' }

export default function Badge({ label }: { label: string }) {
  const s = styles[label] ?? fallback
  return (
    <span className="text-xs px-2 py-0.5 rounded font-mono font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  )
}
