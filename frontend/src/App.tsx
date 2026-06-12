import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ShaderBackground from './components/ShaderBackground'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Repositories from './pages/Repositories'
import Analyze from './pages/Analyze'
import Architecture from './pages/Architecture'
import Impact from './pages/Impact'
import Security from './pages/Security'
import Roadmap from './pages/Roadmap'

export default function App() {
  return (
    <BrowserRouter>
      <ShaderBackground />
      {/* Mesh gradient overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60" style={{
        background: `radial-gradient(circle at 0% 0%, rgba(252,109,38,0.15) 0%, transparent 50%),
                     radial-gradient(circle at 100% 100%, rgba(49,49,192,0.15) 0%, transparent 50%),
                     radial-gradient(circle at 50% 50%, rgba(11,19,33,1) 0%, #060e1c 100%)`
      }} />
      <Sidebar />
      <Topbar />
      <main style={{ marginLeft: '18rem', paddingTop: '5rem', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/analyze"      element={<Analyze />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/impact"       element={<Impact />} />
          <Route path="/security"     element={<Security />} />
          <Route path="/roadmap"      element={<Roadmap />} />
        </Routes>
      </main>

      {/* Floating AI Widget */}
      <div className="fixed z-50 hidden lg:block" style={{ bottom: 40, right: 40 }}>
        <button className="group relative flex items-center gap-4 px-6 py-3 rounded-2xl transition-all"
          style={{
            background: 'rgba(6,14,28,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,181,151,0.35)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        >
          <div className="relative">
            <div className="absolute inset-0 blur-md opacity-20 group-hover:opacity-50 transition-opacity rounded-full" style={{ background: '#ffb597' }} />
            <span className="material-symbols-outlined transition-transform group-hover:rotate-12" style={{ fontSize: 28, color: '#ffb597' }}>psychology</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-mono uppercase tracking-tighter" style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>AI_COMMAND_PROMPT</span>
            <span className="font-geist font-bold uppercase tracking-widest text-white" style={{ fontSize: 11 }}>Ask Architect</span>
          </div>
          <div className="ml-4 w-5 h-5 rounded flex items-center justify-center font-mono"
            style={{ background: 'rgba(255,181,151,0.1)', border: '1px solid rgba(255,181,151,0.2)', color: '#ffb597', fontSize: 10 }}>/</div>
        </button>
      </div>
    </BrowserRouter>
  )
}
