import { useState } from 'react'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL ?? '')
  const [gitlabUrl, setGitlabUrl] = useState('https://gitlab.com')
  const [theme, setTheme] = useState<'dark' | 'darker'>('darker')
  const [accentColor, setAccentColor] = useState('#ffb597')
  const [emailNotifs, setEmailNotifs] = useState(false)
  const [analysisNotifs, setAnalysisNotifs] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [autoAnalyze, setAutoAnalyze] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="px-8 py-10 max-w-3xl space-y-8">
      {/* Header */}
      <div className="animate-entrance">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(192,193,255,0.08)', border: '1px solid rgba(192,193,255,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#c0c1ff' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#c0c1ff' }}>Settings</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>System Configuration</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Customize your Orbit Architect experience
        </p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon="palette" iconColor="#ffb597">
        <Field label="Theme">
          <div className="flex gap-2">
            {(['dark', 'darker'] as const).map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all"
                style={theme === t
                  ? { background: 'rgba(255,181,151,0.12)', color: '#ffb597', border: '1px solid rgba(255,181,151,0.3)' }
                  : { background: 'rgba(255,255,255,0.03)', color: 'rgba(219,226,246,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Accent Color">
          <div className="flex items-center gap-3">
            {['#ffb597', '#c0c1ff', '#00e475', '#93c5fd', '#fc6d26'].map(c => (
              <button key={c} onClick={() => setAccentColor(c)}
                className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                style={{ background: c, border: accentColor === c ? `2px solid white` : '2px solid transparent', boxShadow: accentColor === c ? `0 0 12px ${c}80` : 'none' }} />
            ))}
            <span className="font-mono text-xs ml-2" style={{ color: 'rgba(219,226,246,0.4)' }}>{accentColor}</span>
          </div>
        </Field>
      </Section>

      {/* API Configuration */}
      <Section title="API Configuration" icon="api" iconColor="#00e475">
        <Field label="Backend API URL" hint="The base URL of your Orbit Architect backend">
          <input value={apiUrl} onChange={e => setApiUrl(e.target.value)}
            placeholder="https://orbit-gzk9.onrender.com"
            className="w-full rounded-xl px-4 py-2.5 font-mono text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }} />
        </Field>
        <Field label="GitLab Instance URL" hint="Default: https://gitlab.com — change for self-hosted instances">
          <input value={gitlabUrl} onChange={e => setGitlabUrl(e.target.value)}
            placeholder="https://gitlab.com"
            className="w-full rounded-xl px-4 py-2.5 font-mono text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }} />
        </Field>
        <div className="p-3 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(0,228,117,0.05)', border: '1px solid rgba(0,228,117,0.15)' }}>
          <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 16, color: '#00e475' }}>info</span>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(219,226,246,0.5)' }}>
            API keys (GROQ_API_KEY, GITLAB_TOKEN) are configured as environment variables on the backend. They are never exposed to the frontend.
          </p>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon="notifications" iconColor="#c0c1ff">
        <Toggle label="Analysis Complete Alerts" hint="Notify when an AI analysis finishes" value={analysisNotifs} onChange={setAnalysisNotifs} color="#c0c1ff" />
        <Toggle label="Security Risk Alerts" hint="Notify when high/critical security risks are detected" value={securityAlerts} onChange={setSecurityAlerts} color="#ffb4ab" />
        <Toggle label="Email Notifications" hint="Send alerts to your registered email address" value={emailNotifs} onChange={setEmailNotifs} color="#c0c1ff" />
        <Toggle label="Auto-Analyze on Import" hint="Automatically run a default analysis when a repo is imported" value={autoAnalyze} onChange={setAutoAnalyze} color="#ffb597" />
      </Section>

      {/* Account */}
      <Section title="Account" icon="manage_accounts" iconColor="#ffb597">
        <div className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-geist font-bold"
            style={{ background: 'linear-gradient(135deg,#fc6d26,#ffb597)', color: '#360f00', fontSize: 16 }}>OA</div>
          <div>
            <p className="font-geist font-bold text-sm text-white">Architect</p>
            <p className="font-mono text-xs uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>L7 Architect · Free Plan</p>
          </div>
        </div>
        <Field label="Display Name">
          <input defaultValue="Architect"
            className="w-full rounded-xl px-4 py-2.5 font-mono text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#dbe2f6' }} />
        </Field>
      </Section>

      {/* About */}
      <Section title="About" icon="info" iconColor="rgba(219,226,246,0.4)">
        {[
          ['Application', 'Orbit Architect AI'],
          ['Version', 'v4.2.0-stable'],
          ['Backend', 'FastAPI + SQLAlchemy + Groq'],
          ['Frontend', 'React + Vite + TailwindCSS'],
          ['License', 'MIT'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.35)' }}>{k}</span>
            <span className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.65)' }}>{v}</span>
          </div>
        ))}
      </Section>

      {/* Save */}
      <div className="flex justify-end animate-entrance">
        <button onClick={save}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all hover:brightness-110"
          style={{ background: saved ? 'rgba(0,228,117,0.12)' : 'rgba(255,181,151,0.1)', color: saved ? '#00e475' : '#ffb597', border: `1px solid ${saved ? 'rgba(0,228,117,0.3)' : 'rgba(255,181,151,0.3)'}` }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{saved ? 'check_circle' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, iconColor, children }: { title: string; icon: string; iconColor: string; children: React.ReactNode }) {
  return (
    <div className="animate-entrance hyper-glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h3 className="font-geist font-bold text-base text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(219,226,246,0.5)' }}>{label}</p>
        {hint && <p className="font-mono text-xs" style={{ color: 'rgba(219,226,246,0.3)', fontSize: 10 }}>{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, hint, value, onChange, color }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-geist text-sm font-medium" style={{ color: '#dbe2f6' }}>{label}</p>
        <p className="font-mono text-xs mt-0.5" style={{ color: 'rgba(219,226,246,0.35)', fontSize: 10 }}>{hint}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all shrink-0"
        style={{ background: value ? `${color}30` : 'rgba(255,255,255,0.06)', border: `1px solid ${value ? color + '50' : 'rgba(255,255,255,0.1)'}` }}>
        <span className="absolute top-0.5 transition-all w-5 h-5 rounded-full"
          style={{ left: value ? 'calc(100% - 22px)' : '2px', background: value ? color : 'rgba(219,226,246,0.3)', boxShadow: value ? `0 0 8px ${color}80` : 'none' }} />
      </button>
    </div>
  )
}
