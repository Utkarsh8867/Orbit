from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, Repository
from gitlab_orbit import fetch_repo_tree
from auth import get_current_user
from models.database import User

router = APIRouter(prefix="/repositories", tags=["repositories"])

class RepoImport(BaseModel):
    gitlab_url: str

@router.post("/")
async def import_repository(body: RepoImport, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.query(Repository).filter(
        Repository.gitlab_url == body.gitlab_url,
        Repository.user_id == user.id
    ).first()
    if existing:
        return existing

    try:
        structure = await fetch_repo_tree(body.gitlab_url)
    except Exception as e:
        raise HTTPException(400, f"Failed to fetch repository: {e}")

    name = body.gitlab_url.rstrip("/").split("/")[-1]
    repo = Repository(gitlab_url=body.gitlab_url, name=name, structure=structure, user_id=user.id)
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo

@router.get("/")
def list_repositories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Repository).filter(Repository.user_id == user.id).all()

@router.get("/{repo_id}")
def get_repository(repo_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = db.query(Repository).filter(Repository.id == repo_id, Repository.user_id == user.id).first()
    if not repo:
        raise HTTPException(404, "Repository not found")
    return repo
