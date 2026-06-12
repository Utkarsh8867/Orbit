from agents import architect_agent, impact_agent, security_agent, testing_agent, planning_agent
import asyncio

async def run_full_analysis(repo_structure: dict, feature_request: str) -> dict:
    # Agent 1: Architecture (runs first, others depend on it)
    architecture = await architect_agent.run(repo_structure, feature_request)

    # Agents 2 & 3 can run in parallel after architecture
    impact, security_pre = await asyncio.gather(
        impact_agent.run(repo_structure, feature_request, architecture),
        security_agent.run(repo_structure, feature_request, {"affected_services": [], "affected_apis": []}),
    )

    # Re-run security with actual impact data (fast since it's AI)
    security, testing = await asyncio.gather(
        security_agent.run(repo_structure, feature_request, impact),
        testing_agent.run(feature_request, impact),
    )

    # Planning agent needs everything
    roadmap = await planning_agent.run(feature_request, architecture, impact, security, testing)

    return {
        "architecture": architecture,
        "impact": impact,
        "security": security,
        "testing": testing,
        "roadmap": roadmap,
    }
