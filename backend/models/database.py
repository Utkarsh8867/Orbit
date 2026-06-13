import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, TypeDecorator, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# PostgreSQL needs pool settings; SQLite needs check_same_thread
if is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,      # detect stale connections
        pool_recycle=300,        # recycle connections every 5 min
        pool_size=5,
        max_overflow=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class JSONText(TypeDecorator):
    """Stores JSON as TEXT — works on both SQLite and PostgreSQL."""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return json.dumps(value) if value is not None else None

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return None


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    provider = Column(String, nullable=False)          # google | github | gitlab | email
    provider_id = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)      # only for email provider
    reset_token = Column(String, nullable=True)
    reset_token_exp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Repository(Base):
    __tablename__ = "repositories"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    gitlab_url = Column(String, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    structure = Column(JSONText, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
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
    # Drop and recreate all tables to apply schema changes
    # Safe on fresh deployments; existing data will be lost
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
