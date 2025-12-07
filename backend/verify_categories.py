from sqlmodel import Session, select, delete
from database import engine
from models import Category

def check_categories():
    with Session(engine) as session:
        categories = session.exec(select(Category)).all()
        print(f"Found {len(categories)} categories.")
        for cat in categories:
            print(f"- {cat.name}")

def clear_categories():
    with Session(engine) as session:
        session.exec(delete(Category))
        session.commit()
        print("Cleared all categories.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        clear_categories()
    else:
        check_categories()
