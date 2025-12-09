from typing import List, Optional
from sqlmodel import Session
from backend.adapters.database.repositories.category_repository import CategoryRepository
from backend.adapters.database.models import Category
from backend.api.schemas.all import CategoryCreate

class CategoryService:
    def __init__(self, session: Session):
        self.repository = CategoryRepository(session)

    def create_category(self, category_create: CategoryCreate) -> Optional[Category]:
        # Check uniqueness
        if self.repository.get_by_name(category_create.name):
            return None
        
        db_category = Category.from_orm(category_create)
        return self.repository.create(db_category)

    def get_categories(self) -> List[Category]:
        return self.repository.get_all()

    def get_category(self, category_id: int) -> Optional[Category]:
        return self.repository.get(category_id)

    def delete_category(self, category_id: int) -> bool:
        category = self.repository.get(category_id)
        if not category:
            return False
        
        self.repository.delete(category)
        return True
