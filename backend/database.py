import os
from sqlmodel import SQLModel, create_engine, Session, select
from dotenv import load_dotenv

load_dotenv()

# SQLite fallback for local development
sqlite_file_name = "expenses.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# Check for DATABASE_URL environment variable (set by hosting provider)
database_url = os.environ.get("DATABASE_URL", sqlite_url)

# Handle Postgres specific fix for SQLModel/SQLAlchemy (postgres:// -> postgresql://)
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in database_url else {}

engine = create_engine(database_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
