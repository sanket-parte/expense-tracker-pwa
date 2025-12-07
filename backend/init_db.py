from sqlmodel import Session, select
from database import create_db_and_tables, engine
from models import Category

def init_categories():
    with Session(engine) as session:
        existing = session.exec(select(Category)).first()
        if not existing:
            defaults = [
                Category(name="Food", color="#f97316"),       # Orange
                Category(name="Transport", color="#3b82f6"),  # Blue
                Category(name="Utilities", color="#eab308"),  # Yellow
                Category(name="Entertainment", color="#ec4899"), # Pink
                Category(name="Health", color="#22c55e"),     # Green
                Category(name="Other", color="#64748b"),      # Slate
            ]
            session.add_all(defaults)
            session.commit()
            print("Initialized default master categories.")

if __name__ == "__main__":
    create_db_and_tables()
    init_categories()
    print("Database initialization completed.")
