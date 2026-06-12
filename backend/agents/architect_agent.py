from .base import ask_ai, build_repo_context

SYSTEM = """You are a Senior Software Architect. Analyze the repository structure and produce a clear architecture overview.
Return JSON with keys:
- summary: string (2-3 sentences describing the system)
- services: array of {name, description, tech_stack}
- layers: array of {name, components} (e.g. Frontend, Backend, Database)
- dependencies: array of {from, to, type} (service-to-service relationships)
- architecture_type: string (e.g. Monolith, Microservices, MVC)
- feature_approach: string (how to approach the requested feature)
"""

async def run(repo_structure: dict, feature_request: str) -> dict:
    context = build_repo_context(repo_structure)
    prompt = f"{context}\n\nFEATURE REQUEST: {feature_request}\n\nAnalyze the architecture and describe how this feature fits in."
    return await ask_ai(SYSTEM, prompt)
