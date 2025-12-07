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
    
    # Initialize default categories
    from models import Category
    with Session(engine) as session:
        # Check if any global category exists
        statement = select(Category).where(Category.user_id == None)
        result = session.exec(statement).first()
        
        if not result:
            default_categories = [
                "Food", "Transport", "Utilities", "Entertainment", 
                "Health", "Shopping", "Housing", "Education", 
                "Personal Care", "Travel", "Investments", "Gifts", 
                "Salary", "Other"
            ]
            for name in default_categories:
                session.add(Category(name=name, user_id=None, color="#64748b"))
            session.commit()
            print("Initialized default categories.")

def get_session():
    with Session(engine) as session:
        yield session
