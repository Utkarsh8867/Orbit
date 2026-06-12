from .base import ask_ai, build_repo_context

SYSTEM = """You are an expert at software impact analysis. Given a repository and a feature request, identify all affected components.
Return JSON with keys:
- affected_services: array of {name, reason}
- affected_files: array of {path, change_type, reason} (change_type: modify|create|delete)
- affected_apis: array of {endpoint, method, change, reason}
- affected_db_tables: array of {table, changes: array of string}
- affected_modules: array of string
- estimated_files_changed: number
"""

async def run(repo_structure: dict, feature_request: str, architecture: dict) -> dict:
    context = build_repo_context(repo_structure)
    arch_summary = architecture.get("summary", "")
    prompt = f"{context}\n\nARCHITECTURE: {arch_summary}\n\nFEATURE REQUEST: {feature_request}\n\nIdentify all impacted components."
    return await ask_ai(SYSTEM, prompt)
