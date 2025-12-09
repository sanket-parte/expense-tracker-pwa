from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from backend.adapters.database.repositories.budget_repository import BudgetRepository
from backend.adapters.database.repositories.expense_repository import ExpenseRepository
from backend.adapters.database.models import Budget
from backend.api.schemas.all import BudgetCreate, BudgetRead

class BudgetService:
    def __init__(self, session: Session):
        self.budget_repository = BudgetRepository(session)
        self.expense_repository = ExpenseRepository(session)
        self.session = session

    def create_budget(self, budget_create: BudgetCreate, user_id: int) -> Optional[Budget]:
        # Check if budget already exists
        if self.budget_repository.get_by_category(user_id, budget_create.category_id):
            return None

        db_budget = Budget.from_orm(budget_create, update={"user_id": user_id})
        return self.budget_repository.create(db_budget)

    def get_budgets_with_spent(self, user_id: int) -> List[BudgetRead]:
        budgets = self.budget_repository.get_for_user(user_id)
        
        current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        budget_reads = []
        for budget in budgets:
            spent = self.expense_repository.get_total_spent(
                user_id=user_id,
                category_id=budget.category_id,
                start_date=current_month_start
            )
            
            budget_read = BudgetRead.from_orm(budget)
            budget_read.spent = spent
            budget_reads.append(budget_read)
            
        return budget_reads

    def delete_budget(self, budget_id: int, user_id: int) -> bool:
        budget = self.budget_repository.get(budget_id)
        if not budget or budget.user_id != user_id:
            return False
        
        self.budget_repository.delete(budget)
        return True
        
    def generate_suggestions(self, user_id: int):
        from backend.adapters.ai.service import AIService
        ai_service = AIService(self.session, user_id)
        return ai_service.generate_budget_suggestions()
