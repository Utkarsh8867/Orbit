from .base import ask_ai, build_repo_context

SYSTEM = """You are a cybersecurity expert specializing in software security analysis.
Given a feature request and its impact, identify security risks and recommend mitigations.
Return JSON with keys:
- risk_level: string (Low|Medium|High|Critical)
- risks: array of {title, category, description, severity}
  (categories: Authentication|Authorization|Data Exposure|Injection|Session|Cryptography|Other)
- mitigations: array of {risk_title, action, priority}
- compliance_notes: array of string (GDPR, OWASP, etc.)
"""

async def run(repo_structure: dict, feature_request: str, impact: dict) -> dict:
    context = build_repo_context(repo_structure)
    affected = impact.get("affected_services", [])
    apis = impact.get("affected_apis", [])
    prompt = (
        f"{context}\n\n"
        f"FEATURE REQUEST: {feature_request}\n"
        f"AFFECTED SERVICES: {affected}\n"
        f"AFFECTED APIS: {apis}\n\n"
        "Perform a thorough security analysis."
    )
    return await ask_ai(SYSTEM, prompt)
