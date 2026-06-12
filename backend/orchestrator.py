from agents import architect_agent, impact_agent, security_agent, testing_agent, planning_agent
import asyncio


async def run_full_analysis(repo_structure: dict, feature_request: str) -> dict:
    # Agent 1: Architecture — runs first, all others depend on it
    architecture = await architect_agent.run(repo_structure, feature_request)

    # Agents 2, 3 run in parallel using real architecture context
    impact, security = await asyncio.gather(
        impact_agent.run(repo_structure, feature_request, architecture),
        security_agent.run(repo_structure, feature_request, architecture),
    )

    # Agent 4: Testing uses impact data
    testing = await testing_agent.run(feature_request, impact)

    # Agent 5: Planning needs everything
    roadmap = await planning_agent.run(feature_request, architecture, impact, security, testing)

    return {
        "architecture": architecture,
        "impact": impact,
        "security": security,
        "testing": testing,
        "roadmap": roadmap,
    }
