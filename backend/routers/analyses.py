from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, Repository, Analysis, User
from orchestrator import run_full_analysis
from gitlab_orbit import create_gitlab_issue
from auth import get_current_user

router = APIRouter(prefix="/analyses", tags=["analyses"])


class AnalysisRequest(BaseModel):
    repository_id: int
    feature_request: str


class IssueCreateRequest(BaseModel):
    analysis_id: int
    repository_id: int


@router.post("/")
async def create_analysis(body: AnalysisRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = db.query(Repository).filter(Repository.id == body.repository_id, Repository.user_id == user.id).first()
    if not repo:
        raise HTTPException(404, "Repository not found")

    if not repo.structure:
        raise HTTPException(400, "Repository has no structure data. Re-import the repository.")

    try:
        results = await run_full_analysis(repo.structure, body.feature_request)
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")

    analysis = Analysis(
        repository_id=body.repository_id,
        user_id=user.id,
        feature_request=body.feature_request,
        architecture=results.get("architecture"),
        impact=results.get("impact"),
        security=results.get("security"),
        testing=results.get("testing"),
        roadmap=results.get("roadmap"),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/repository/{repo_id}")
def get_analyses_for_repo(repo_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Analysis).filter(Analysis.repository_id == repo_id, Analysis.user_id == user.id).order_by(Analysis.id.desc()).all()


@router.get("/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == user.id).first()
    if not a:
        raise HTTPException(404, "Analysis not found")
    return a


@router.post("/{analysis_id}/create-issues")
async def create_issues(analysis_id: int, body: IssueCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == user.id).first()
    repo = db.query(Repository).filter(Repository.id == body.repository_id, Repository.user_id == user.id).first()
    if not analysis or not repo:
        raise HTTPException(404, "Not found")

    issues_to_create = []
    if analysis.roadmap and isinstance(analysis.roadmap, dict):
        issues_to_create = analysis.roadmap.get("gitlab_issues", [])

    created = []
    for issue in issues_to_create:
        try:
            result = await create_gitlab_issue(
                repo.gitlab_url,
                issue["title"],
                issue.get("description", ""),
                issue.get("labels", []),
            )
            created.append({
                "title": issue["title"],
                "url": result.get("web_url"),
                "id": result.get("iid"),
            })
        except Exception as e:
            created.append({"title": issue["title"], "error": str(e)})

    analysis.gitlab_issues = created
    db.commit()
    return {"created": created}
