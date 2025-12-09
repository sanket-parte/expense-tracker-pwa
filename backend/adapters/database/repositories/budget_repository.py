from typing import Optional, List
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import Budget

class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, session: Session):
        super().__init__(session, Budget)

    def get_by_category(self, user_id: int, category_id: int) -> Optional[Budget]:
        return self.session.exec(
            select(Budget)
            .where(Budget.user_id == user_id)
            .where(Budget.category_id == category_id)
        ).first()

    def get_for_user(self, user_id: int) -> List[Budget]:
        return self.session.exec(
            select(Budget).where(Budget.user_id == user_id)
        ).all()
