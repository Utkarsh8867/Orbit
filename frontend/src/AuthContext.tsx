import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthUser {
  id: number
  name: string
  email: string
  avatar_url?: string
  provider: string
  created_at: string
}

interface AuthCtx {
  user: AuthUser | null
  token: string | null
  loading: boolean
  logout: () => void
  setToken: (t: string) => void
}

const Ctx = createContext<AuthCtx>({ user: null, token: null, loading: true, logout: () => {}, setToken: () => {} })

const API = import.meta.env.VITE_API_URL ?? '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('orbit_token'))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setUser)
      .catch(() => { localStorage.removeItem('orbit_token'); setTokenState(null) })
      .finally(() => setLoading(false))
  }, [token])

  const setToken = (t: string) => {
    localStorage.setItem('orbit_token', t)
    setTokenState(t)
  }

  const logout = () => {
    localStorage.removeItem('orbit_token')
    setTokenState(null)
    setUser(null)
  }

  return <Ctx.Provider value={{ user, token, loading, logout, setToken }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
