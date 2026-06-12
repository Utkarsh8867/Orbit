const sections = [
  {
    icon: 'rocket_launch',
    color: '#ffb597',
    title: 'Getting Started',
    items: [
      { title: 'What is Orbit Architect?', content: 'Orbit Architect is an AI-powered software architecture assistant that analyzes your GitLab repositories and provides intelligent insights on architecture, security, impact analysis, and feature roadmaps. It uses Groq LLM under the hood to reason about your codebase.' },
      { title: 'Quick Start', content: '1. Add a GitLab repository URL in the Repositories page.\n2. Go to Analyses and run a Feature Analysis by entering a feature request.\n3. Explore Blueprint, Security Mesh, Impact, and Roadmap pages to view AI-generated insights.' },
      { title: 'Requirements', content: 'You need a valid GitLab repository URL (public or private with token), a Groq API key configured on the backend, and a GitLab personal access token with read_repository scope for private repos.' },
    ],
  },
  {
    icon: 'folder_special',
    color: '#c0c1ff',
    title: 'Repositories',
    items: [
      { title: 'Adding a Repository', content: 'Navigate to the Repositories page and paste your GitLab repository URL (e.g. https://gitlab.com/username/project). Orbit will fetch the repo metadata and store it for analysis.' },
      { title: 'Supported Repositories', content: 'Any public GitLab repository is supported. For private repositories, ensure the GITLAB_TOKEN environment variable is set on the backend with appropriate read access.' },
    ],
  },
  {
    icon: 'query_stats',
    color: '#00e475',
    title: 'Analyses',
    items: [
      { title: 'Running an Analysis', content: 'Select a repository, enter a feature request (e.g. "Add real-time notifications using WebSockets"), and click Run Analysis. The AI will analyze your codebase and generate a full architectural report.' },
      { title: 'Analysis Output', content: 'Each analysis produces: Architecture Blueprint (services, dependencies), Security Mesh (risks, mitigations, compliance), Impact Analysis (affected files, effort estimate), and a Feature Roadmap (phases, tasks, timeline).' },
      { title: 'Analysis Duration', content: 'Analyses typically take 15–45 seconds depending on repo size and Groq API response time. Results are stored in the database and can be revisited anytime.' },
    ],
  },
  {
    icon: 'account_tree',
    color: '#ffb597',
    title: 'Blueprint (Architecture)',
    items: [
      { title: 'Architecture Map', content: 'The Blueprint page renders an interactive node graph of your repository\'s services and their dependencies. Each hexagonal node represents a service with its tech stack.' },
      { title: 'Interacting with Nodes', content: 'Click any node to open a detail panel showing the service description, tech stack, and all connections. Use zoom controls or scroll to navigate the canvas.' },
    ],
  },
  {
    icon: 'shield_lock',
    color: '#ffb4ab',
    title: 'Security Mesh',
    items: [
      { title: 'Security Analysis', content: 'Orbit AI identifies security risks in your architecture categorized by severity (Low, Medium, High, Critical). Each risk includes a description, category, and recommended mitigation.' },
      { title: 'Creating GitLab Issues', content: 'Click "Create GitLab Issues" on the Security page to automatically push all identified security risks as issues to your GitLab repository. Requires GITLAB_TOKEN to be set.' },
      { title: 'Compliance Notes', content: 'The AI also surfaces compliance considerations (GDPR, SOC2, OWASP, etc.) based on the architecture patterns it detects in your codebase.' },
    ],
  },
  {
    icon: 'analytics',
    color: '#93c5fd',
    title: 'Impact Analysis',
    items: [
      { title: 'What is Impact Analysis?', content: 'Impact Analysis shows which files, modules, and services will be affected by implementing the requested feature. It estimates effort and highlights high-risk change areas.' },
      { title: 'Reading Impact Results', content: 'Each affected file is listed with its change type (modify/create/delete), estimated effort (Low/Medium/High), and the reason it is impacted by the feature request.' },
    ],
  },
  {
    icon: 'timeline',
    color: '#c0c1ff',
    title: 'Roadmap',
    items: [
      { title: 'Feature Roadmap', content: 'The Roadmap page breaks down the feature implementation into phases (Planning, Development, Testing, Deployment). Each phase contains specific tasks with time estimates and dependencies.' },
      { title: 'Exporting the Roadmap', content: 'You can copy individual task details from the roadmap to use in your project management tool (Jira, Linear, GitLab Issues, etc.).' },
    ],
  },
  {
    icon: 'api',
    color: '#00e475',
    title: 'API Reference',
    items: [
      { title: 'Base URL', content: 'The backend API is available at your configured VITE_API_URL. Interactive API docs (Swagger UI) are available at /docs and ReDoc at /redoc.' },
      { title: 'Key Endpoints', content: 'POST /repositories/ — Import a GitLab repo\nGET /repositories/ — List all repos\nPOST /analyses/ — Run a new analysis\nGET /analyses/{id} — Get analysis by ID\nGET /analyses/repository/{repo_id} — Get all analyses for a repo\nPOST /analyses/{id}/create-issues — Push issues to GitLab' },
      { title: 'Authentication', content: 'The API currently does not require authentication tokens from the frontend. Access control is managed via environment variables (GITLAB_TOKEN, GROQ_API_KEY) on the backend.' },
    ],
  },
  {
    icon: 'settings',
    color: '#ffb597',
    title: 'Configuration',
    items: [
      { title: 'Backend Environment Variables', content: 'GROQ_API_KEY — Your Groq API key (required)\nGITLAB_TOKEN — GitLab personal access token\nGITLAB_URL — GitLab instance URL (default: https://gitlab.com)\nDATABASE_URL — PostgreSQL connection string\nCORS_ORIGINS — Comma-separated list of allowed frontend origins' },
      { title: 'Frontend Environment Variables', content: 'VITE_API_URL — Full URL of the backend API (e.g. https://orbit-gzk9.onrender.com). If not set, defaults to /api for same-origin deployments.' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="px-8 py-10 max-w-5xl space-y-10">
      {/* Header */}
      <div className="animate-entrance">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(192,193,255,0.08)', border: '1px solid rgba(192,193,255,0.2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#c0c1ff' }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#c0c1ff' }}>Documentation</span>
        </div>
        <h2 className="font-geist font-extrabold tracking-tight text-white mb-1" style={{ fontSize: 36 }}>Orbit Architect Docs</h2>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Complete guide to using the AI-powered architecture assistant
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, si) => (
        <div key={si} className="animate-entrance" style={{ animationDelay: `${si * 0.05}s` }}>
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl" style={{ background: `${section.color}15`, border: `1px solid ${section.color}25` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: section.color, fontVariationSettings: "'FILL' 1" }}>{section.icon}</span>
            </div>
            <h3 className="font-geist font-bold text-lg text-white">{section.title}</h3>
          </div>

          {/* Items */}
          <div className="space-y-3 pl-1">
            {section.items.map((item, ii) => (
              <div key={ii} className="rounded-xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: section.color }} />
                  <p className="font-geist font-bold text-sm" style={{ color: '#dbe2f6' }}>{item.title}</p>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-line pl-3.5" style={{ color: 'rgba(219,226,246,0.55)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
