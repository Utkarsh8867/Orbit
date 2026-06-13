import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const API = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export default function ResetPasswordPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const token = new URLSearchParams(window.location.search).get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!token) { setError('Invalid reset link'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Reset failed')
      setToken(data.token)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060e1c' }}>
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined block" style={{ fontSize: 48, color: '#ffb4ab', fontVariationSettings: "'FILL' 1" }}>error</span>
        <p className="font-geist font-bold text-white">Invalid reset link</p>
        <Link to="/auth/forgot-password" style={{ color: '#ffb597', fontFamily: 'monospace', fontSize: 12 }}>Request a new one</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060e1c' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(circle at 30% 20%, rgba(252,109,38,0.08) 0%, transparent 50%),
                     radial-gradient(circle at 70% 80%, rgba(192,193,255,0.06) 0%, transparent 50%)`
      }} />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl p-8 space-y-6"
          style={{ background: 'rgba(21,30,47,0.75)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,228,117,0.08)', border: '1px solid rgba(0,228,117,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#00e475', fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <div className="text-center">
              <h1 className="font-geist font-extrabold text-2xl" style={{ color: '#ffb597' }}>Set new password</h1>
              <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Choose a strong password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="New password (min 8 characters)" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
            />
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password" required
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${confirm && confirm !== password ? '#ffb4ab' : 'rgba(255,255,255,0.1)'}`, color: '#dbe2f6' }}
            />
            {error && <p className="text-xs font-mono" style={{ color: '#ffb4ab' }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-geist font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: '#fc6d26', color: 'white', boxShadow: '0 0 20px rgba(252,109,38,0.25)' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
