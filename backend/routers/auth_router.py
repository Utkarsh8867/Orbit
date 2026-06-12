from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
from models.database import get_db, User
from auth import create_access_token, get_current_user
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Google ────────────────────────────────────────────────────────────────────
@router.get("/google")
def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(400, "Google OAuth not configured")
    params = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.BACKEND_URL}/auth/google/callback"
        "&response_type=code"
        "&scope=openid email profile"
    )
    return RedirectResponse(params)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": f"{settings.BACKEND_URL}/auth/google/callback",
            "grant_type": "authorization_code",
        })
        token_res.raise_for_status()
        access_token = token_res.json()["access_token"]

        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_res.raise_for_status()
        data = user_res.json()

    user = _upsert_user(db, provider="google", provider_id=data["id"],
                        email=data["email"], name=data["name"], avatar=data.get("picture"))
    jwt = create_access_token(user.id)
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={jwt}")


# ── GitHub ────────────────────────────────────────────────────────────────────
@router.get("/github")
def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(400, "GitHub OAuth not configured")
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.BACKEND_URL}/auth/github/callback"
        "&scope=read:user user:email"
    )


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            data={"client_id": settings.GITHUB_CLIENT_ID,
                  "client_secret": settings.GITHUB_CLIENT_SECRET,
                  "code": code,
                  "redirect_uri": f"{settings.BACKEND_URL}/auth/github/callback"},
            headers={"Accept": "application/json"},
        )
        token_res.raise_for_status()
        access_token = token_res.json()["access_token"]

        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
        )
        user_res.raise_for_status()
        data = user_res.json()

        email = data.get("email")
        if not email:
            emails_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            )
            emails = emails_res.json()
            primary = next((e for e in emails if e.get("primary")), None)
            email = primary["email"] if primary else f"{data['login']}@github.local"

    user = _upsert_user(db, provider="github", provider_id=str(data["id"]),
                        email=email, name=data.get("name") or data["login"], avatar=data.get("avatar_url"))
    jwt = create_access_token(user.id)
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={jwt}")


# ── GitLab ────────────────────────────────────────────────────────────────────
@router.get("/gitlab")
def gitlab_login():
    if not settings.GITLAB_CLIENT_ID:
        raise HTTPException(400, "GitLab OAuth not configured")
    return RedirectResponse(
        f"{settings.GITLAB_URL}/oauth/authorize"
        f"?client_id={settings.GITLAB_CLIENT_ID}"
        f"&redirect_uri={settings.BACKEND_URL}/auth/gitlab/callback"
        "&response_type=code"
        "&scope=read_user+profile+email"
    )


@router.get("/gitlab/callback")
async def gitlab_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(f"{settings.GITLAB_URL}/oauth/token", data={
            "client_id": settings.GITLAB_CLIENT_ID,
            "client_secret": settings.GITLAB_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": f"{settings.BACKEND_URL}/auth/gitlab/callback",
        })
        token_res.raise_for_status()
        access_token = token_res.json()["access_token"]

        user_res = await client.get(
            f"{settings.GITLAB_URL}/api/v4/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_res.raise_for_status()
        data = user_res.json()

    user = _upsert_user(db, provider="gitlab", provider_id=str(data["id"]),
                        email=data["email"], name=data["name"], avatar=data.get("avatar_url"))
    jwt = create_access_token(user.id)
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={jwt}")


# ── Me ────────────────────────────────────────────────────────────────────────
@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "provider": user.provider,
        "created_at": user.created_at,
    }


# ── Helper ────────────────────────────────────────────────────────────────────
def _upsert_user(db: Session, provider: str, provider_id: str,
                 email: str, name: str, avatar: str | None) -> User:
    user = db.query(User).filter(User.provider == provider, User.provider_id == provider_id).first()
    if not user:
        # check if email already exists from another provider
        user = db.query(User).filter(User.email == email).first()
    if user:
        user.name = name
        user.avatar_url = avatar
        db.commit()
        db.refresh(user)
        return user
    user = User(email=email, name=name, avatar_url=avatar, provider=provider, provider_id=provider_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
