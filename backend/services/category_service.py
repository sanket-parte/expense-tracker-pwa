from typing import List, Optional
from sqlmodel import Session
from backend.adapters.database.repositories.category_repository import CategoryRepository
from backend.adapters.database.models import Category
from backend.api.schemas.all import CategoryCreate
import logging

logger = logging.getLogger(__name__)

class CategoryService:
    def __init__(self, session: Session):
        self.repository = CategoryRepository(session)

    def create_category(self, category_create: CategoryCreate, user_id: int) -> Optional[Category]:
        # Check uniqueness for this user
        if self.repository.get_by_name(category_create.name, user_id):
            logger.info(f"Category creation skipped: '{category_create.name}' already exists for user {user_id}")
            return None
        
        db_category = Category.from_orm(category_create)
        db_category.user_id = user_id
        return self.repository.create(db_category)

    def get_categories(self, user_id: int) -> List[Category]:
        return self.repository.get_all_by_user(user_id)

    def get_category(self, category_id: int) -> Optional[Category]:
        return self.repository.get(category_id)

    def delete_category(self, category_id: int, user_id: int) -> bool:
        category = self.repository.get(category_id)
        if not category or category.user_id != user_id:
            return False
        
        self.repository.delete(category)
        return True
