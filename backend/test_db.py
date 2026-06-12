from models.database import init_db, SessionLocal, Repository, Analysis

print("Testing PostgreSQL connection...")
try:
    init_db()
    print("[OK] Tables created/verified")
    db = SessionLocal()
    repos = db.query(Repository).count()
    analyses = db.query(Analysis).count()
    db.close()
    print("[OK] DB connected - Repositories: %d, Analyses: %d" % (repos, analyses))
except Exception as e:
    print("[FAIL] DB Error: %s" % e)
    exit(1)

print("\nTesting imports...")
try:
    from main import app
    print("[OK] FastAPI app")
    from orchestrator import run_full_analysis
    print("[OK] Orchestrator")
    from gitlab_orbit import fetch_repo_tree
    print("[OK] GitLab Orbit")
    from agents import architect_agent, impact_agent, security_agent, testing_agent, planning_agent
    print("[OK] All 5 agents")
except Exception as e:
    print("[FAIL] Import Error: %s" % e)
    exit(1)

print("\nTesting routes...")
routes = [r.path for r in app.routes]
for expected in ["/repositories/", "/analyses/", "/health", "/"]:
    found = any(expected in r for r in routes)
    print("[OK] %s" % expected if found else "[FAIL] MISSING: %s" % expected)

print("\nAll checks passed. Backend is ready.")
