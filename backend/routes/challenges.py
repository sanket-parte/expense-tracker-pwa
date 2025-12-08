from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from models import User, Challenge, Expense
from database import get_session
from auth import get_current_user
from services import ai_service

router = APIRouter(prefix="/challenges", tags=["challenges"])

@router.post("/generate")
async def generate_challenges(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Generate new challenges based on AI analysis."""
    challenges = ai_service.generate_spending_challenges(session, current_user.id)
    return {"challenges": challenges}

@router.get("/")
async def get_challenges(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all challenges (pending and active)."""
    challenges = session.exec(
        select(Challenge)
        .where(Challenge.user_id == current_user.id)
        .order_by(Challenge.status, Challenge.end_date)
    ).all()
    return challenges

@router.post("/{challenge_id}/accept")
async def accept_challenge(
    challenge_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Accept a pending challenge."""
    challenge = session.get(Challenge, challenge_id)
    if not challenge or challenge.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    challenge.status = "active"
    challenge.start_date = datetime.now()
    session.add(challenge)
    session.commit()
    return {"message": "Challenge accepted"}

@router.post("/check")
async def check_progress(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Recalculate progress for active challenges."""
    active_challenges = session.exec(
        select(Challenge).where(
            Challenge.user_id == current_user.id, 
            Challenge.status == 'active'
        )
    ).all()
    
    updates = []
    
    for chall in active_challenges:
        # Calculate spend since start_date for this category
        expenses = session.exec(
            select(Expense).where(
                Expense.user_id == current_user.id,
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
                
        session.add(chall)
        updates.append({"id": chall.id, "current": current_spend, "status": chall.status})
        
    session.commit()
    return {"updates": updates}
