import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import type { ReactNode } from 'react'
import ShaderBackground from './components/ShaderBackground'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Repositories from './pages/Repositories'
import Analyze from './pages/Analyze'
import Architecture from './pages/Architecture'
import Impact from './pages/Impact'
import Security from './pages/Security'
import Roadmap from './pages/Roadmap'
import Docs from './pages/Docs'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060e1c' }}>
      <div className="w-10 h-10 border-2 rounded-full animate-spin"
        style={{ borderColor: 'rgba(255,181,151,0.2)', borderTopColor: '#ffb597' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}


function AppShell() {
  return (
    <>
      <ShaderBackground />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60" style={{
        background: `radial-gradient(circle at 0% 0%, rgba(252,109,38,0.15) 0%, transparent 50%),
                     radial-gradient(circle at 100% 100%, rgba(49,49,192,0.15) 0%, transparent 50%),
                     radial-gradient(circle at 50% 50%, rgba(11,19,33,1) 0%, #060e1c 100%)`
      }} />
      <Sidebar />
      <Topbar />
      <main style={{ marginLeft: '18rem', paddingTop: '5rem', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route path="/"              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/repositories"  element={<ProtectedRoute><Repositories /></ProtectedRoute>} />
          <Route path="/analyze"       element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
          <Route path="/architecture"  element={<ProtectedRoute><Architecture /></ProtectedRoute>} />
          <Route path="/impact"        element={<ProtectedRoute><Impact /></ProtectedRoute>} />
          <Route path="/security"      element={<ProtectedRoute><Security /></ProtectedRoute>} />
          <Route path="/roadmap"       element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
          <Route path="/docs"          element={<ProtectedRoute><Docs /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"              element={<Login />} />
          <Route path="/auth/callback"      element={<AuthCallback />} />
          <Route path="/auth/signup"        element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password"  element={<ResetPassword />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
