import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const API = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

type Step = 'email' | 'otp' | 'password'

export default function ForgotPasswordPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
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
      if (!res.ok) throw new Error(data.detail ?? 'Failed to send OTP')
      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const otpValue = otp.join('')
    if (otpValue.length < 6) { setError('Enter the complete 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Invalid OTP')
      setResetToken(data.reset_token)
      setStep('password')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
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

  // ── OTP input handler ───────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  const steps = ['Email', 'Verify OTP', 'New Password']

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
              style={{ background: 'rgba(255,181,151,0.1)', border: '1px solid rgba(255,181,151,0.25)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#ffb597', fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
            </div>
            <div className="text-center">
              <h1 className="font-geist font-extrabold text-2xl" style={{ color: '#ffb597' }}>Reset Password</h1>
              <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {step === 'email' ? 'Enter your email' : step === 'otp' ? 'Check your inbox' : 'Set new password'}
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const stepKeys: Step[] = ['email', 'otp', 'password']
              const done = stepKeys.indexOf(step) > i
              const active = stepKeys.indexOf(step) === i
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all"
                      style={{
                        background: done ? 'rgba(0,228,117,0.15)' : active ? 'rgba(255,181,151,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${done ? 'rgba(0,228,117,0.4)' : active ? 'rgba(255,181,151,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: done ? '#00e475' : active ? '#ffb597' : 'rgba(255,255,255,0.3)',
                      }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="font-mono text-xs" style={{ color: active ? '#ffb597' : 'rgba(255,255,255,0.25)' }}>{s}</span>
                  </div>
                  {i < 2 && <div className="w-6 h-px shrink-0" style={{ background: done ? 'rgba(0,228,117,0.3)' : 'rgba(255,255,255,0.08)' }} />}
                </div>
              )
            })}
          </div>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-3">
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(219,226,246,0.45)' }}>
                Enter your registered email and we'll send a 6-digit OTP to reset your password.
              </p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
              />
              {error && <p className="text-xs font-mono" style={{ color: '#ffb4ab' }}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-geist font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#fc6d26', color: 'white', boxShadow: '0 0 20px rgba(252,109,38,0.25)' }}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <p className="font-mono text-xs leading-relaxed text-center" style={{ color: 'rgba(219,226,246,0.45)' }}>
                We sent a 6-digit OTP to <span style={{ color: '#ffb597' }}>{email}</span>.<br />
                It expires in 10 minutes.
              </p>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 rounded-xl text-center font-mono text-xl font-bold outline-none transition-all"
                    style={{
                      background: digit ? 'rgba(255,181,151,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${digit ? 'rgba(255,181,151,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: '#ffb597',
                    }}
                  />
                ))}
              </div>

              {error && <p className="text-xs font-mono text-center" style={{ color: '#ffb4ab' }}>{error}</p>}

              <button type="submit" disabled={loading || otp.join('').length < 6}
                className="w-full py-3 rounded-xl font-geist font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#fc6d26', color: 'white', boxShadow: '0 0 20px rgba(252,109,38,0.25)' }}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button type="button" onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }}
                className="w-full font-mono text-xs hover:opacity-80 transition-opacity"
                style={{ color: 'rgba(255,181,151,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Change email or resend OTP
              </button>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(219,226,246,0.45)' }}>
                OTP verified! Choose a new strong password.
              </p>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="New password (min 8 characters)" required
                className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }}
              />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
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
          )}

          <p className="text-center">
            <Link to="/login" className="font-mono text-xs hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(255,181,151,0.5)', textDecoration: 'none' }}>← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
