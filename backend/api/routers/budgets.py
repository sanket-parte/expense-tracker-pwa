from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.api.deps import get_db as get_session
from backend.adapters.database.models import User
from backend.api.schemas.all import BudgetCreate, BudgetRead
from backend.api.deps import get_current_user
from backend.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/", response_model=list[BudgetRead])
def get_budgets(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = BudgetService(session)
    return service.get_budgets_with_spent(current_user.id)

@router.post("/", response_model=BudgetRead)
def create_budget(
    budget: BudgetCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = BudgetService(session)
    new_budget = service.create_budget(budget, current_user.id)
    
    if not new_budget:
        raise HTTPException(status_code=400, detail="Budget already exists for this category")

    # Return with spent = 0 initially (or calculate if we want to be safe, but usually 0 for new)
    budget_read = BudgetRead.from_orm(new_budget)
    budget_read.spent = 0.0
    return budget_read

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = BudgetService(session)
    success = service.delete_budget(budget_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"ok": True}

@router.post("/auto-suggest")
def suggest_budgets(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = BudgetService(session)
    return service.generate_suggestions(current_user.id)

