from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
import bcrypt
import secrets
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from models.database import get_db, User
from auth import create_access_token, get_current_user
from config import settings
from email_service import send_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Email Auth ───────────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class ForgotBody(BaseModel):
    email: EmailStr

class ResetBody(BaseModel):
    token: str
    password: str


@router.post("/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user = User(email=body.email, name=body.name, provider="email",
                provider_id=body.email, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_access_token(user.id)}


@router.post("/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.provider == "email").first()
    if not user or not user.password_hash:
        raise HTTPException(401, "Invalid email or password")
    if not bcrypt.checkpw(body.password.encode(), user.password_hash.encode()):
        raise HTTPException(401, "Invalid email or password")
    return {"token": create_access_token(user.id)}


@router.post("/forgot-password")
def forgot_password(body: ForgotBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.provider == "email").first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_exp = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
        send_reset_email(user.email, reset_url, user.name)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(body: ResetBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == body.token).first()
    if not user or not user.reset_token_exp or user.reset_token_exp < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired reset token")
    user.password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user.reset_token = None
    user.reset_token_exp = None
    db.commit()
    db.refresh(user)
    return {"token": create_access_token(user.id)}


# ── Google ────────────────────────────────────────────────────────────────────
@router.get("/google")
def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(400, "Google OAuth not configured")
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.BACKEND_URL}/auth/google/callback"
        "&response_type=code"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(url)


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
        "&scope=read:user%20user:email"
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
        "&scope=read_user"
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
