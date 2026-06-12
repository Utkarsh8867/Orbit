import json
from groq import AsyncGroq
from config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)


async def ask_ai(system_prompt: str, user_prompt: str) -> dict:
    # Truncate prompt to avoid token limit errors on large repos
    if len(user_prompt) > 12000:
        user_prompt = user_prompt[:12000] + "\n\n[TRUNCATED FOR LENGTH]"

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": system_prompt + "\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.",
            },
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=4096,
    )
    content = response.choices[0].message.content.strip()

    # Strip markdown code fences if model wraps response
    if content.startswith("```"):
        lines = content.split("\n")
        # remove first and last fence lines
        lines = [l for l in lines if not l.strip().startswith("```")]
        content = "\n".join(lines).strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Try to extract JSON object from the response
        start = content.find("{")
        end = content.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(content[start:end])
            except json.JSONDecodeError:
                pass
        # Return empty structure so analysis doesn't crash
        return {}


def build_repo_context(repo_structure: dict) -> str:
    tree = repo_structure.get("tree", []) if repo_structure else []
    files = repo_structure.get("context_files", []) if repo_structure else []
    tree_str = "\n".join(f"  {i['type']}: {i['path']}" for i in tree[:150])
    file_str = "\n\n".join(f"=== {f['path']} ===\n{f['content']}" for f in files)
    return f"REPOSITORY FILE TREE:\n{tree_str}\n\nKEY FILES:\n{file_str}"
