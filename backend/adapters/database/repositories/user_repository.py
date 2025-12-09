from typing import Optional
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import User

class UserRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        super().__init__(session, User)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.exec(
            select(User).where(User.email == email)
        ).first()
