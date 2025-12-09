from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.adapters.database.models import User
from backend.api.deps import get_db as get_session
from backend.api.deps import get_current_user
from backend.services.challenge_service import ChallengeService

router = APIRouter(prefix="/challenges", tags=["challenges"])

@router.post("/generate")
def generate_challenges(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Generate new challenges based on AI analysis."""
    service = ChallengeService(session)
    challenges = service.generate_challenges(current_user.id)
    return {"challenges": challenges}

@router.get("/")
def get_challenges(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all challenges (pending and active)."""
    service = ChallengeService(session)
    return service.get_challenges(current_user.id)

@router.post("/{challenge_id}/accept")
def accept_challenge(
    challenge_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Accept a pending challenge."""
    service = ChallengeService(session)
    success = service.accept_challenge(challenge_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return {"message": "Challenge accepted"}

@router.post("/check")
def check_progress(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Recalculate progress for active challenges."""
    service = ChallengeService(session)
    updates = service.check_progress(current_user.id)
    return {"updates": updates}
