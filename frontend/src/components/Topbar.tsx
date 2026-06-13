import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useState } from 'react'

export default function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

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
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>search</span>
        <input
          className="w-full rounded-xl py-2.5 pl-12 pr-4 font-mono text-xs outline-none"
          placeholder="EXECUTE SEARCH COMMAND..."
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#dbe2f6' }}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Version badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#00e475' }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: '#00e475' }}>Live: v4.2.0-stable</span>
          </div>
          <span className="font-mono mt-0.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>CPU LOAD: 12.4%</span>
        </div>

        {/* Notifications */}
        <button onClick={() => navigate('/notifications')} className="relative p-2.5 rounded-lg transition-all hover:border-[rgba(255,181,151,0.3)]"
          style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)' }}>notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#fc6d26', border: '2px solid #060e1c' }} />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all hover:border-[rgba(255,181,151,0.3)]"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-7 h-7 rounded-lg object-cover" />
              : <div className="w-7 h-7 rounded-lg flex items-center justify-center font-geist font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg,#fc6d26,#ffb597)', color: '#360f00' }}>
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
            }
            <span className="font-geist font-semibold text-sm" style={{ color: '#dbe2f6' }}>
              {user?.name?.split(' ')[0] ?? 'User'}
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>expand_more</span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(21,30,47,0.95)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

                {/* User info */}
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {user?.avatar_url
                    ? <img src={user.avatar_url} className="w-10 h-10 rounded-xl object-cover" />
                    : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-geist font-bold"
                        style={{ background: 'linear-gradient(135deg,#fc6d26,#ffb597)', color: '#360f00' }}>
                        {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-geist font-bold text-sm truncate" style={{ color: '#dbe2f6' }}>{user?.name}</p>
                    <p className="font-mono text-xs truncate" style={{ color: 'rgba(219,226,246,0.4)' }}>{user?.email}</p>
                  </div>
                </div>

                {/* Provider badge */}
                <div className="flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'rgba(219,226,246,0.4)' }}>verified_user</span>
                  <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'rgba(219,226,246,0.4)' }}>
                    via {user?.provider}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  <button onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:brightness-125 text-left"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#dbe2f6' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ffb597' }}>person</span>
                    <span className="font-geist text-sm">View Profile</span>
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:brightness-125 text-left"
                    style={{ background: 'rgba(255,180,171,0.05)', color: '#ffb4ab' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                    <span className="font-geist text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
