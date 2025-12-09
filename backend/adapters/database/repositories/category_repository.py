from typing import Optional, List
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import Category

class CategoryRepository(BaseRepository[Category]):
    def __init__(self, session: Session):
        super().__init__(session, Category)

    def get_by_name(self, name: str) -> Optional[Category]:
        return self.session.exec(
            select(Category).where(Category.name == name)
        ).first()
