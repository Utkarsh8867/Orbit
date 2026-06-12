from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import init_db
from routers import repositories, analyses
from routers.auth_router import router as auth_router
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create all DB tables
    init_db()
    yield
    # Shutdown: nothing needed


app = FastAPI(
    title="Orbit Architect AI",
    version="1.0.0",
    description="Repository-aware AI Software Architect",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(repositories.router)
app.include_router(analyses.router)


@app.get("/")
def root():
    return {"message": "Orbit Architect AI", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
