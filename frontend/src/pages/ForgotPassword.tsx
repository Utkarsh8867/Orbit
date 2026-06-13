import { useState } from 'react'
import { Link } from 'react-router-dom'

const API = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Something went wrong')
      setSent(true)
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

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,181,151,0.1)', border: '1px solid rgba(255,181,151,0.25)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#ffb597', fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
            </div>
            <div className="text-center">
              <h1 className="font-geist font-extrabold text-2xl" style={{ color: '#ffb597' }}>Reset password</h1>
              <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>We'll send you a reset link</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(0,228,117,0.1)', border: '1px solid rgba(0,228,117,0.25)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#00e475', fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
              <p className="font-geist font-bold text-white">Check your inbox</p>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(219,226,246,0.5)' }}>
                If <span style={{ color: '#ffb597' }}>{email}</span> is registered, you'll receive a reset link shortly. Check your spam folder too.
              </p>
              <Link to="/login" className="block font-mono text-xs hover:opacity-80 transition-opacity mt-4"
                style={{ color: 'rgba(255,181,151,0.6)', textDecoration: 'none' }}>← Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(219,226,246,0.45)' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
              />
              {error && <p className="text-xs font-mono" style={{ color: '#ffb4ab' }}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-geist font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#fc6d26', color: 'white', boxShadow: '0 0 20px rgba(252,109,38,0.25)' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center">
                <Link to="/login" className="font-mono text-xs hover:opacity-80 transition-opacity"
                  style={{ color: 'rgba(255,181,151,0.6)', textDecoration: 'none' }}>← Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
