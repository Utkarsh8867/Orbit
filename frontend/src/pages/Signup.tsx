import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const API = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export default function SignupPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Registration failed')
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
              <h1 className="font-geist font-extrabold text-2xl" style={{ color: '#ffb597' }}>Create account</h1>
              <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Join Orbit Architect</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
            />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password (min 8 characters)" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
            />
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm password" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${confirm && confirm !== password ? '#ffb4ab' : 'rgba(255,255,255,0.1)'}`, color: '#dbe2f6' }}
            />
            {error && <p className="text-xs font-mono" style={{ color: '#ffb4ab' }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-geist font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: '#fc6d26', color: 'white', boxShadow: '0 0 20px rgba(252,109,38,0.25)' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ffb597', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
