import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const links = [
  { to: '/',               icon: 'dashboard',      label: 'Command Center' },
  { to: '/repositories',   icon: 'folder_special',  label: 'Repositories'   },
  { to: '/analyze',        icon: 'query_stats',    label: 'Analyses'       },
  { to: '/architecture',   icon: 'account_tree',   label: 'Blueprint'      },
  { to: '/impact',         icon: 'analytics',      label: 'Impact'         },
  { to: '/security',       icon: 'shield_lock',    label: 'Security Mesh'  },
  { to: '/roadmap',        icon: 'timeline',       label: 'Roadmap'        },
  { to: '/docs',           icon: 'menu_book',      label: 'Docs'           },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }
  return (
    <aside className="h-screen w-72 fixed left-0 top-0 z-50 flex flex-col py-10 px-6"
      style={{
        background: 'rgba(6,14,28,0.5)',
        backdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04), inset 10px 0 30px -10px rgba(252,109,38,0.03)',
      }}>

      {/* Logo */}
      <div className="mb-12 flex items-center gap-4 px-2">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-float"
          style={{ background: '#fc6d26', boxShadow: '0 0 20px rgba(252,109,38,0.35)' }}>
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: 26 }}>orbit</span>
        </div>
        <div>
          <h1 className="font-geist font-extrabold text-2xl leading-none tracking-tight" style={{ color: '#ffb597' }}>Orbit</h1>
          <p className="font-mono uppercase tracking-widest mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Architect v4.0</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {links.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive ? 'font-semibold' : 'font-medium hover:text-white'
              }`
            }
            style={({ isActive }) => isActive
              ? { color: '#ffb597', background: 'rgba(255,181,151,0.08)', border: '1px solid rgba(255,181,151,0.12)' }
              : { color: 'rgba(219,226,246,0.4)', border: '1px solid transparent' }
            }
          >
            <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ fontSize: 20 }}>{icon}</span>
            <span className="font-geist text-sm tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="mt-auto pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <NavLink to="/profile"
          className="p-3 rounded-xl flex items-center gap-3 cursor-pointer group transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
          {user?.avatar_url
            ? <img src={user.avatar_url} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            : <div className="w-10 h-10 rounded-lg flex items-center justify-center font-geist font-bold text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg,#fc6d26,#ffb597)', color: '#360f00' }}>
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
          }
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-geist font-bold truncate transition-colors group-hover:text-[#ffb597]" style={{ color: '#dbe2f6' }}>
              {user?.name ?? 'User'}
            </p>
            <p className="font-mono uppercase truncate" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
              {user?.email ?? ''}
            </p>
          </div>
          <button onClick={e => { e.preventDefault(); handleLogout() }}
            className="p-1 rounded-lg transition-all hover:text-[#ffb4ab]" title="Sign out"
            style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </button>
        </NavLink>
      </div>
    </aside>
  )
}
