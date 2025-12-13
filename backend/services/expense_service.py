from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from backend.adapters.database.repositories.expense_repository import ExpenseRepository
import logging
from backend.adapters.database.models import Expense, User
from backend.api.schemas.all import ExpenseCreate, ExpenseUpdate
from backend.adapters.ai.service import AIService

logger = logging.getLogger(__name__)

class ExpenseService:
    def __init__(self, session: Session):
        self.repository = ExpenseRepository(session)
        self.session = session

    def create_expense(self, expense_create: ExpenseCreate, user_id: int) -> Optional[Expense]:
        if expense_create.amount <= 0:
            logger.warning(f"Attempt to create expense with non-positive amount: {expense_create.amount}")
            return None
        
        db_expense = Expense(**expense_create.model_dump(), user_id=user_id)
        return self.repository.create(db_expense)

    def get_expenses(
        self,
        user_id: int,
        offset: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        type: Optional[str] = None
    ) -> List[Expense]:
        return self.repository.get_multi(
            user_id=user_id,
            offset=offset,
            limit=limit,
            category_id=category_id,
            search=search,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            type=type
        )

    def get_expense(self, expense_id: int, user_id: int) -> Optional[Expense]:
        expense = self.repository.get(expense_id)
        if not expense or expense.user_id != user_id:
            return None
        return expense

    def update_expense(self, expense_id: int, expense_update: ExpenseUpdate, user_id: int) -> Optional[Expense]:
        db_expense = self.get_expense(expense_id, user_id)
        if not db_expense:
            return None
        
        update_data = expense_update.model_dump(exclude_unset=True)
        return self.repository.update(db_expense, update_data)

    def delete_expense(self, expense_id: int, user_id: int) -> bool:
        db_expense = self.get_expense(expense_id, user_id)
        if not db_expense:
            return False
        
        self.repository.delete(db_expense)
        return True

    def auto_categorize(self, user_id: int) -> int:
        ai_service = AIService(self.session, user_id)
        return ai_service.auto_categorize_expenses()
