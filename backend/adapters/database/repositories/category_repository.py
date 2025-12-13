from typing import Optional, List
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import Category

class CategoryRepository(BaseRepository[Category]):
    def __init__(self, session: Session):
        super().__init__(session, Category)

    def get_by_name(self, name: str, user_id: int) -> Optional[Category]:
        return self.session.exec(
            select(Category).where(Category.name == name, Category.user_id == user_id)
        ).first()

    def get_all_by_user(self, user_id: int) -> List[Category]:
        return self.session.exec(
            select(Category).where(Category.user_id == user_id)
        ).all()
