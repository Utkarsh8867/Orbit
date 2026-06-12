export default function Topbar() {
  return (
    <header className="fixed top-0 right-0 z-40 flex justify-between items-center h-20 px-8"
      style={{
        width: 'calc(100% - 18rem)',
        background: 'rgba(6,14,28,0.5)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>

      {/* Search */}
      <div className="relative w-96 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
          style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>search</span>
        <input
          className="w-full rounded-xl py-2.5 pl-12 pr-4 font-mono text-xs outline-none transition-all"
          placeholder="EXECUTE SEARCH COMMAND..."
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#dbe2f6',
          }}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Version badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#00e475' }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: '#00e475' }}>Live: v4.2.0-stable</span>
          </div>
          <span className="font-mono mt-0.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>CPU LOAD: 12.4%</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-lg transition-all hover:border-[rgba(255,181,151,0.3)]"
          style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)' }}>notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#fc6d26', border: '2px solid #060e1c' }} />
        </button>

        {/* Settings */}
        <button className="p-2.5 rounded-lg transition-all hover:border-[rgba(255,181,151,0.3)]"
          style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>tune</span>
        </button>
      </div>
    </header>
  )
}
