from typing import List
from sqlmodel import Session, select
from backend.adapters.database.repositories.base import BaseRepository
from backend.adapters.database.models import Challenge

class ChallengeRepository(BaseRepository[Challenge]):
    def __init__(self, session: Session):
        super().__init__(session, Challenge)

    def get_active(self, user_id: int) -> List[Challenge]:
        return self.session.exec(
            select(Challenge).where(
                Challenge.user_id == user_id, 
                Challenge.status == 'active'
            )
        ).all()

    def get_all_for_user(self, user_id: int) -> List[Challenge]:
        return self.session.exec(
            select(Challenge)
            .where(Challenge.user_id == user_id)
            .order_by(Challenge.status, Challenge.end_date)
        ).all()
