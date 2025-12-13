
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from backend.adapters.database.repositories.budget_repository import BudgetRepository
from backend.adapters.database.repositories.expense_repository import ExpenseRepository
from backend.adapters.database.models import Budget
from backend.api.schemas.all import BudgetCreate, BudgetRead
import logging

logger = logging.getLogger(__name__)

class BudgetService:
    def __init__(self, session: Session):
        self.budget_repository = BudgetRepository(session)
        self.expense_repository = ExpenseRepository(session)
        self.session = session

    def upsert_budget(self, budget_create: BudgetCreate, user_id: int) -> Budget:
        existing = self.budget_repository.get_by_category(user_id, budget_create.category_id)
        if existing:
            logger.info(f"Updating budget for category {budget_create.category_id} (User {user_id})")
            # Assuming budget_repository has an update method that takes the existing model and a dict/schema for updates
            # The original snippet used model_dump(exclude_unset=True) which is for Pydantic v2.
            # If Budget.from_orm is used, it implies SQLModel/Pydantic v1 or a compatible setup.
            # For simplicity, let's assume the repository update method can handle a BudgetCreate object or a dict.
            # If `update` expects a Budget object, we'd need to create one from budget_create and existing.
            # For now, let's assume it can take the fields directly.
            # A more robust update would be:
            # for field, value in budget_create.dict(exclude_unset=True).items():
            #     setattr(existing, field, value)
            # return self.budget_repository.update(existing)
            
            # Based on the provided snippet's intent, let's try to match the update logic.
            # The snippet used `budget_create.model_dump(exclude_unset=True)` which is Pydantic v2.
            # If `BudgetCreate` is Pydantic v1, it would be `budget_create.dict(exclude_unset=True)`.
            # Assuming `BudgetRepository.update` can take an existing model and a dictionary of updates.
            update_data = budget_create.dict(exclude_unset=True) # Using .dict() for Pydantic v1/SQLModel compatibility
            return self.budget_repository.update(existing, update_data)
        
        logger.info(f"Creating new budget for category {budget_create.category_id} (User {user_id})")
        db_budget = Budget.from_orm(budget_create)
        db_budget.user_id = user_id
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
