import httpx
from urllib.parse import urlparse, quote
from fastapi import HTTPException
from config import settings

HEADERS = {"PRIVATE-TOKEN": settings.GITLAB_TOKEN}

def _project_id(repo_url: str) -> str:
    """Extract namespace/project path from a GitLab URL and URL-encode it."""
    parsed = urlparse(repo_url.rstrip("/"))
    configured = urlparse(settings.GITLAB_URL.rstrip("/"))

    if parsed.netloc != configured.netloc:
        raise HTTPException(
            status_code=400,
            detail=f"URL must be a {settings.GITLAB_URL} repository. Got: {repo_url}"
        )

    # path is like /namespace/project or /namespace/group/project
    path = parsed.path.lstrip("/")
    if not path or "/" not in path:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid GitLab repository URL. Expected format: {settings.GITLAB_URL}/namespace/project"
        )

    return quote(path, safe="")

async def fetch_repo_tree(repo_url: str) -> dict:
    """Fetch full repository file tree via GitLab API."""
    pid = _project_id(repo_url)
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{settings.GITLAB_URL}/api/v4/projects/{pid}/repository/tree",
            headers=HEADERS,
            params={"recursive": True, "per_page": 100},
        )
        r.raise_for_status()
        tree = r.json()

    # Fetch key files for context
    context_files = []
    priority = ["README.md", "README.rst", "docker-compose.yml", "package.json", "requirements.txt", "pom.xml"]
    for item in tree:
        if item["type"] == "blob" and item["name"] in priority:
            content = await fetch_file_content(repo_url, item["path"])
            if content:
                context_files.append({"path": item["path"], "content": content[:3000]})

    return {"tree": tree, "context_files": context_files}

async def fetch_file_content(repo_url: str, file_path: str) -> str | None:
    pid = _project_id(repo_url)
    encoded_path = quote(file_path, safe="")
    async with httpx.AsyncClient() as client:
        for ref in ["main", "master", "develop"]:
            r = await client.get(
                f"{settings.GITLAB_URL}/api/v4/projects/{pid}/repository/files/{encoded_path}/raw",
                headers=HEADERS,
                params={"ref": ref},
            )
            if r.status_code == 200:
                return r.text
    return None

async def create_gitlab_issue(repo_url: str, title: str, description: str, labels: list[str] = None) -> dict:
    pid = _project_id(repo_url)
    payload = {"title": title, "description": description}
    if labels:
        payload["labels"] = ",".join(labels)
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{settings.GITLAB_URL}/api/v4/projects/{pid}/issues",
            headers=HEADERS,
            json=payload,
        )
        r.raise_for_status()
        return r.json()
