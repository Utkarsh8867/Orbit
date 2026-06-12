from .base import ask_ai

SYSTEM = """You are a technical project manager and planning expert.
Given a feature request and its full analysis, generate a detailed implementation roadmap.
Return JSON with keys:
- phases: array of {
    phase_number, name, description,
    tasks: array of {title, description, assignee_role, effort_hours}
  }
- total_effort_hours: number
- estimated_days: number
- recommended_team_size: number
- complexity: string (Low|Medium|High)
- gitlab_issues: array of {title, description, labels: array, phase}
"""

async def run(feature_request: str, architecture: dict, impact: dict, security: dict, testing: dict) -> dict:
    prompt = (
        f"FEATURE REQUEST: {feature_request}\n\n"
        f"ARCHITECTURE APPROACH: {architecture.get('feature_approach', '')}\n"
        f"AFFECTED SERVICES: {impact.get('affected_services', [])}\n"
        f"AFFECTED FILES COUNT: {impact.get('estimated_files_changed', 0)}\n"
        f"SECURITY RISK LEVEL: {security.get('risk_level', 'Unknown')}\n"
        f"SECURITY RISKS COUNT: {len(security.get('risks', []))}\n"
        f"TEST COUNT: {testing.get('estimated_test_count', 0)}\n\n"
        "Generate a complete phased implementation roadmap with GitLab issues."
    )
    return await ask_ai(SYSTEM, prompt)
