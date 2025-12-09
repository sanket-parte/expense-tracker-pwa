from typing import List, Optional
from datetime import datetime, timedelta
from sqlmodel import Session
from backend.adapters.database.repositories.recurring_repository import RecurringExpenseRepository
from backend.adapters.database.models import RecurringExpense
from backend.api.schemas.all import RecurringExpenseCreate, ExpenseCreate
from backend.services.expense_service import ExpenseService

class RecurringExpenseService:
    def __init__(self, session: Session):
        self.repository = RecurringExpenseRepository(session)
        self.expense_service = ExpenseService(session)
        self.session = session

    def create_recurring_expense(self, recurring_create: RecurringExpenseCreate, user_id: int) -> RecurringExpense:
        db_recurring = RecurringExpense.from_orm(recurring_create, update={"user_id": user_id})
        return self.repository.create(db_recurring)

    def get_recurring_expenses(self, user_id: int) -> List[RecurringExpense]:
        return self.repository.get_for_user(user_id)

    def delete_recurring_expense(self, recurring_id: int, user_id: int) -> bool:
        recurring = self.repository.get(recurring_id)
        if not recurring or recurring.user_id != user_id:
            return False
        
        self.repository.delete(recurring)
        return True

    def process_due_expenses(self, user_id: int) -> int:
        now = datetime.utcnow()
        due_expenses = self.repository.get_due_expenses(user_id, now)
        
        generated_count = 0
        for recurring in due_expenses:
            # Create actual expense via ExpenseService for consistency
            expense_create = ExpenseCreate(
                title=f"{recurring.title} (Recurring)",
                amount=recurring.amount,
                category_id=recurring.category_id,
                type="expense",
                date=recurring.next_due_date
            )
            # Delegate to ExpenseService to handle creation logic
            self.expense_service.create_expense(expense_create, user_id)
            
            # Update next_due_date
            recurring.last_generated = now
            if recurring.frequency == "monthly":
                recurring.next_due_date = recurring.next_due_date + timedelta(days=30)
            elif recurring.frequency == "weekly":
                recurring.next_due_date = recurring.next_due_date + timedelta(weeks=1)
            
            self.repository.update(recurring, {}) # Just saving the changes
            generated_count += 1
            
        return generated_count
