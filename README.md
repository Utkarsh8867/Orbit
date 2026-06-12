# Orbit Architect AI

> Understand. Plan. Build.

An AI-powered Software Architecture Agent that understands your GitLab repository and predicts the full impact of any feature request before a single line of code is written.

## Architecture

```
GitLab Repo → GitLab Orbit API → Multi-Agent System → Dashboard UI
                                        │
                    ┌───────────────────┼───────────────────────┐
                    │                   │                       │
             Architect Agent    Impact Agent            Security Agent
                                        │                       │
                                Testing Agent          Planning Agent
```

## Quick Start

### 1. Configure Environment
```bash
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL, OPENAI_API_KEY, GITLAB_TOKEN
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

### 3. Or run locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Multi-Agent System

| Agent | Responsibility | Output |
|-------|---------------|--------|
| Architect Agent | Understand repo structure & services | Architecture diagram + approach |
| Impact Agent | Identify affected services, files, APIs, DB | Impact report |
| Security Agent | Detect auth/authz risks | Security report + mitigations |
| Testing Agent | Generate test strategy | Unit/Integration/E2E plan |
| Planning Agent | Generate roadmap, estimate effort | Phased plan + GitLab issues |

## Demo Flow

1. Import a GitLab repository URL
2. Enter a feature request: `"Add Google OAuth Login"`
3. Click **Run Analysis**
4. View: Architecture → Impact → Security → Testing → Roadmap
5. Click **Create GitLab Issues** to auto-create tasks

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Flow
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4o
- **Integration:** GitLab REST API (Orbit)
