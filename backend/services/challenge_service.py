from datetime import datetime
from typing import List, Dict, Any
from sqlmodel import Session, select
from backend.adapters.database.repositories.challenge_repository import ChallengeRepository
from backend.adapters.database.models import Challenge, Expense
from backend.adapters.ai.service import AIService

class ChallengeService:
    def __init__(self, session: Session):
        self.repository = ChallengeRepository(session)
        self.session = session

    def generate_challenges(self, user_id: int) -> List[Dict[str, Any]]:
        ai_service = AIService(self.session, user_id)
        return ai_service.generate_spending_challenges()

    def get_challenges(self, user_id: int) -> List[Challenge]:
        return self.repository.get_all_for_user(user_id)

    def accept_challenge(self, challenge_id: int, user_id: int) -> bool:
        challenge = self.repository.get(challenge_id)
        if not challenge or challenge.user_id != user_id:
            return False
            
        challenge.status = "active"
        challenge.start_date = datetime.now()
        self.repository.update(challenge, {})
        return True

    def check_progress(self, user_id: int) -> List[Dict[str, Any]]:
        active_challenges = self.repository.get_active(user_id)
        updates = []
        
        for chall in active_challenges:
            # Calculate spend since start_date for this category
            # (Note: Could use ExpenseRepository aggregation here if injected)
            expenses = self.session.exec(
                select(Expense).where(
                    Expense.user_id == user_id,
                    Expense.category_id == chall.category_id,
                    Expense.date >= chall.start_date
                )
            ).all()
            
            current_spend = sum(e.amount for e in expenses)
            chall.current_amount = current_spend
            
            # Check pass/fail if expired
            if datetime.utcnow() > chall.end_date:
                if current_spend <= chall.target_amount:
                    chall.status = "completed"
                else:
                    chall.status = "failed"
                    
            self.repository.update(chall, {})
            updates.append({"id": chall.id, "current": current_spend, "status": chall.status})
            
        return updates
