import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const API = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

const providers = [
  {
    key: 'google', label: 'Google',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>),
    color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
  },
  {
    key: 'github', label: 'GitHub',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>),
    color: '#dbe2f6', bg: 'rgba(219,226,246,0.05)', border: 'rgba(219,226,246,0.1)',
  },
  {
    key: 'gitlab', label: 'GitLab',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="#fc6d26"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/></svg>),
    color: '#fc6d26', bg: 'rgba(252,109,38,0.05)', border: 'rgba(252,109,38,0.18)',
  },
]

export default function LoginPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Login failed')
      setToken(data.token)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060e1c' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(circle at 30% 20%, rgba(252,109,38,0.08) 0%, transparent 50%),
                     radial-gradient(circle at 70% 80%, rgba(192,193,255,0.06) 0%, transparent 50%)`
      }} />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl p-8 space-y-6"
          style={{ background: 'rgba(21,30,47,0.75)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#fc6d26', boxShadow: '0 0 30px rgba(252,109,38,0.35)' }}>
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: 30 }}>orbit</span>
            </div>
            <div className="text-center">
              <h1 className="font-geist font-extrabold text-2xl" style={{ color: '#ffb597' }}>Welcome back</h1>
              <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Sign in to Orbit Architect</p>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
            />
            {error && <p className="text-xs font-mono" style={{ color: '#ffb4ab' }}>{error}</p>}
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="font-mono text-xs hover:opacity-80 transition-opacity"
                style={{ color: 'rgba(255,181,151,0.6)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-geist font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: '#fc6d26', color: 'white', boxShadow: '0 0 20px rgba(252,109,38,0.25)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>OR CONTINUE WITH</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-3 gap-2">
            {providers.map(p => (
              <a key={p.key} href={`${API}/auth/${p.key}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs transition-all hover:brightness-125"
                style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color, textDecoration: 'none' }}>
                {p.icon}
                {p.label}
              </a>
            ))}
          </div>

          {/* Signup link */}
          <p className="text-center font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Don't have an account?{' '}
            <Link to="/auth/signup" style={{ color: '#ffb597', textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
