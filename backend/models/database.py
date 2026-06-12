import json
from sqlalchemy import Column, Integer, String, Text, DateTime, TypeDecorator, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from config import settings

# SQLite needs check_same_thread=False, PostgreSQL does not need it
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,  # reconnect if connection dropped (important for Postgres)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# JSONText works for both SQLite (stores as TEXT) and PostgreSQL (stores as TEXT)
class JSONText(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return json.dumps(value) if value is not None else None

    def process_result_value(self, value, dialect):
        return json.loads(value) if value is not None else None


class Repository(Base):
    __tablename__ = "repositories"
    id = Column(Integer, primary_key=True, index=True)
    gitlab_url = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    structure = Column(JSONText, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, index=True)
    feature_request = Column(Text)
    architecture = Column(JSONText, nullable=True)
    impact = Column(JSONText, nullable=True)
    security = Column(JSONText, nullable=True)
    testing = Column(JSONText, nullable=True)
    roadmap = Column(JSONText, nullable=True)
    gitlab_issues = Column(JSONText, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)
