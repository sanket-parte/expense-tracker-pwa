from typing import List
from datetime import datetime
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import RecurringExpense

class RecurringExpenseRepository(BaseRepository[RecurringExpense]):
    def __init__(self, session: Session):
        super().__init__(session, RecurringExpense)

    def get_for_user(self, user_id: int) -> List[RecurringExpense]:
        return self.session.exec(
            select(RecurringExpense).where(RecurringExpense.user_id == user_id)
        ).all()

    def get_due_expenses(self, user_id: int, current_date: datetime) -> List[RecurringExpense]:
        return self.session.exec(
            select(RecurringExpense)
            .where(RecurringExpense.user_id == user_id)
            .where(RecurringExpense.is_active == True)
            .where(RecurringExpense.next_due_date <= current_date)
        ).all()
