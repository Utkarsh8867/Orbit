import { useState } from 'react'

type NType = 'success' | 'warning' | 'info' | 'error'

interface Notification {
  id: number
  type: NType
  title: string
  message: string
  time: string
  read: boolean
}

const INIT: Notification[] = [
  { id: 1, type: 'success', title: 'Analysis Complete', message: 'Feature analysis for "Add WebSocket notifications" finished successfully.', time: '2 min ago', read: false },
  { id: 2, type: 'success', title: 'GitLab Issues Created', message: '5 security issues were pushed to your GitLab repository.', time: '15 min ago', read: false },
  { id: 3, type: 'warning', title: 'High Security Risk Detected', message: 'Critical SQL injection vulnerability found in the authentication module.', time: '1 hr ago', read: false },
  { id: 4, type: 'info', title: 'Repository Imported', message: 'orbit-architect-ai repository was successfully imported and indexed.', time: '3 hr ago', read: true },
  { id: 5, type: 'info', title: 'Analysis Started', message: 'Running impact analysis for "Migrate to microservices architecture".', time: '5 hr ago', read: true },
  { id: 6, type: 'error', title: 'Analysis Failed', message: 'Could not connect to GitLab API. Check your GITLAB_TOKEN configuration.', time: '1 day ago', read: true },
  { id: 7, type: 'success', title: 'Roadmap Generated', message: 'A 4-phase roadmap with 18 tasks was generated for your feature request.', time: '1 day ago', read: true },
  { id: 8, type: 'info', title: 'Backend Deployment', message: 'Orbit Architect backend is live on Render. API is healthy.', time: '2 days ago', read: true },
]

const META: Record<NType, { color: string; bg: string; icon: string }> = {
  success: { color: '#00e475', bg: 'rgba(0,228,117,0.08)', icon: 'check_circle' },
  warning: { color: '#ffb597', bg: 'rgba(255,181,151,0.08)', icon: 'warning' },
  info:    { color: '#c0c1ff', bg: 'rgba(192,193,255,0.08)', icon: 'info' },
  error:   { color: '#ffb4ab', bg: 'rgba(255,180,171,0.08)', icon: 'error' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INIT)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const visible = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })))
  const clearAll = () => setNotifications([])
  const markRead = (id: number) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  const dismiss = (id: number) => setNotifications(ns => ns.filter(n => n.id !== id))

  return (
    <div className="px-8 py-10 max-w-3xl space-y-8">
      {/* Header */}
      <div className="animate-entrance">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(255,181,151,0.08)', border: '1px solid rgba(255,181,151,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#ffb597' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#ffb597' }}>Notifications</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>Notification Center</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          System alerts & activity feed
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 animate-entrance" style={{ animationDelay: '0.05s' }}>
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all"
              style={filter === f
                ? { background: 'rgba(255,181,151,0.12)', color: '#ffb597', border: '1px solid rgba(255,181,151,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', color: 'rgba(219,226,246,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="px-3 py-1.5 rounded-xl font-mono text-xs transition-all hover:brightness-110"
              style={{ background: 'rgba(192,193,255,0.08)', color: '#c0c1ff', border: '1px solid rgba(192,193,255,0.2)' }}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="px-3 py-1.5 rounded-xl font-mono text-xs transition-all hover:brightness-110"
              style={{ background: 'rgba(255,180,171,0.08)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 animate-entrance" style={{ animationDelay: '0.1s' }}>
        {visible.length === 0 && (
          <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="material-symbols-outlined block mb-3" style={{ fontSize: 48, color: 'rgba(255,181,151,0.2)', fontVariationSettings: "'FILL' 1" }}>notifications_off</span>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>No notifications</p>
          </div>
        )}
        {visible.map(n => {
          const m = META[n.type]
          return (
            <div key={n.id} className="relative rounded-xl p-4 flex items-start gap-4 transition-all"
              style={{
                background: n.read ? 'rgba(255,255,255,0.02)' : m.bg,
                border: `1px solid ${n.read ? 'rgba(255,255,255,0.05)' : m.color + '25'}`,
              }}>
              {/* Unread dot */}
              {!n.read && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
              )}

              {/* Icon */}
              <div className="p-2 rounded-lg shrink-0 mt-0.5" style={{ background: m.bg, border: `1px solid ${m.color}20` }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: m.color, fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-geist font-bold text-sm mb-0.5" style={{ color: n.read ? 'rgba(219,226,246,0.6)' : '#dbe2f6' }}>{n.title}</p>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(219,226,246,0.45)' }}>{n.message}</p>
                <span className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.25)' }}>{n.time}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} title="Mark as read"
                    className="p-1.5 rounded-lg transition-all hover:brightness-125"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(219,226,246,0.4)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>done</span>
                  </button>
                )}
                <button onClick={() => dismiss(n.id)} title="Dismiss"
                  className="p-1.5 rounded-lg transition-all hover:brightness-125"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(219,226,246,0.4)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
