import json
from groq import AsyncGroq
from config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def ask_ai(system_prompt: str, user_prompt: str) -> dict:
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation."},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    content = response.choices[0].message.content
    # Strip markdown code fences if model wraps response
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())

def build_repo_context(repo_structure: dict) -> str:
    tree = repo_structure.get("tree", [])
    files = repo_structure.get("context_files", [])
    tree_str = "\n".join(f"  {i['type']}: {i['path']}" for i in tree[:150])
    file_str = "\n\n".join(f"=== {f['path']} ===\n{f['content']}" for f in files)
    return f"REPOSITORY FILE TREE:\n{tree_str}\n\nKEY FILES:\n{file_str}"
