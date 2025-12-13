from sqlmodel import Session, delete
from backend.adapters.database.session import engine
from backend.adapters.database.models import (
    User, Category, Expense, Budget, RecurringExpense, 
    UserSettings, AISuggestion, Challenge, MonthlyReport
)

def clear_db():
    print("WARNING: This will delete ALL data from the database.")
    confirm = input("Are you sure? (y/n): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    with Session(engine) as session:
        print("Deleting dependent tables...")
        session.exec(delete(Expense))
        session.exec(delete(Budget))
        session.exec(delete(RecurringExpense))
        session.exec(delete(AISuggestion))
        session.exec(delete(Challenge))
        session.exec(delete(MonthlyReport))
        session.exec(delete(UserSettings))
        
        # Determine if we should keep default categories or delete all
        # For a full clear, we delete all categories. 
        # init_db.py can restore defaults.
        print("Deleting categories...")
        session.exec(delete(Category))
        
        print("Deleting users...")
        session.exec(delete(User))
        
        session.commit()
        print("Database cleared successfully.")

if __name__ == "__main__":
    try:
        # Running inside docker, we might want to skip input prompt or handle it via flag
        # But for safety, let's assume if run non-interactively it might fail on input
        # Adding a force check
        import sys
        if len(sys.argv) > 1 and sys.argv[1] == "--force":
            # Monkey patch input
            input = lambda _: 'y'
            
        clear_db()
    except Exception as e:
        print(f"Error clearing database: {e}")
