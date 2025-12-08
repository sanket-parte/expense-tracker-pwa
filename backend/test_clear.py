import sys
import os
from sqlmodel import Session, select, delete
from database import engine
from models import User, Expense, Budget, RecurringExpense, AISuggestion, Category

def test_clear():
    with Session(engine) as session:
        # Get a user (e.g. ID 1)
        user_id = 1
        print(f"Testing clear for user {user_id}")
        
        try:
            # Delete dependent data first
            print("Deleting Expenses...")
            session.exec(delete(Expense).where(Expense.user_id == user_id))
            
            print("Deleting Budgets...")
            session.exec(delete(Budget).where(Budget.user_id == user_id))
            
            print("Deleting Recurring...")
            session.exec(delete(RecurringExpense).where(RecurringExpense.user_id == user_id))
            
            print("Deleting AI...")
            session.exec(delete(AISuggestion).where(AISuggestion.user_id == user_id))
            
            print("Deleting Categories...")
            session.exec(delete(Category).where(Category.user_id == user_id))
            
            print("Committing...")
            session.commit()
            print("Success!")
            
        except Exception as e:
            print(f"FAILED: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_clear()
