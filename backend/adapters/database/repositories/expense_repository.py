from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import Expense

class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, session: Session):
        super().__init__(session, Expense)

    def get_multi(
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
        query = select(Expense).where(Expense.user_id == user_id)
        
        if category_id:
            query = query.where(Expense.category_id == category_id)
        
        if search:
            query = query.where(Expense.title.ilike(f"%{search}%"))
            
        if start_date:
            query = query.where(Expense.date >= start_date)
            
        if end_date:
            query = query.where(Expense.date <= end_date)
            
        if min_amount is not None:
            query = query.where(Expense.amount >= min_amount)
            
        if max_amount is not None:
            query = query.where(Expense.amount <= max_amount)
            
        if type:
            query = query.where(Expense.type == type)

        query = query.offset(offset).limit(limit).order_by(Expense.date.desc())
        return self.session.exec(query).all()

    def get_total_spent(self, user_id: int, category_id: int, start_date: datetime, type: str = "expense") -> float:
        from sqlmodel import func
        statement = select(func.sum(Expense.amount))\
            .where(Expense.user_id == user_id)\
            .where(Expense.category_id == category_id)\
            .where(Expense.date >= start_date)\
            .where(Expense.type == type)
        
        result = self.session.exec(statement).one()
        return result or 0.0
