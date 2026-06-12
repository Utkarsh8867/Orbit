from .base import ask_ai, build_repo_context

SYSTEM = """You are a QA architect. Generate a comprehensive testing strategy for a feature implementation.
Return JSON with keys:
- unit_tests: array of {name, description, file_to_test}
- integration_tests: array of {name, description, services_involved}
- e2e_tests: array of {name, description, user_flow}
- regression_tests: array of string
- test_data_requirements: array of string
- estimated_test_count: number
"""

async def run(feature_request: str, impact: dict) -> dict:
    affected_files = impact.get("affected_files", [])
    affected_services = impact.get("affected_services", [])
    prompt = (
        f"FEATURE REQUEST: {feature_request}\n"
        f"AFFECTED FILES: {affected_files}\n"
        f"AFFECTED SERVICES: {affected_services}\n\n"
        "Generate a complete testing strategy."
    )
    return await ask_ai(SYSTEM, prompt)
