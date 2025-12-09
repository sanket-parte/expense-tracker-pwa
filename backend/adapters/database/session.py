from sqlmodel import create_engine, Session, SQLModel
from backend.core.config import settings

# Handle Postgres specific fix for SQLModel/SQLAlchemy if needed
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if settings.check_same_thread else {}

engine = create_engine(database_url, connect_args=connect_args)

def create_db_and_tables():
    # Import all models to ensure they are registered with SQLModel.metadata
    from backend.adapters.database import models
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
