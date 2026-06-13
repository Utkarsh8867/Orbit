import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function AuthCallback() {
  const { setToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setToken(token)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, setToken])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060e1c' }}>
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto"
          style={{ borderColor: 'rgba(255,181,151,0.2)', borderTopColor: '#ffb597' }} />
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Authenticating...</p>
      </div>
    </div>
  )
}
