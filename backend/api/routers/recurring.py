from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.api.deps import get_db as get_session
from backend.adapters.database.models import User
from backend.api.schemas.all import RecurringExpenseCreate, RecurringExpenseRead
from backend.api.deps import get_current_user
from backend.services.recurring_service import RecurringExpenseService

router = APIRouter(prefix="/recurring", tags=["recurring"])

@router.get("/", response_model=list[RecurringExpenseRead])
def get_recurring_expenses(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = RecurringExpenseService(session)
    return service.get_recurring_expenses(current_user.id)

@router.post("/", response_model=RecurringExpenseRead)
def create_recurring_expense(
    recurring: RecurringExpenseCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = RecurringExpenseService(session)
    return service.create_recurring_expense(recurring, current_user.id)

@router.delete("/{id}")
def delete_recurring_expense(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = RecurringExpenseService(session)
    success = service.delete_recurring_expense(id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    return {"ok": True}

@router.post("/process")
def process_recurring_expenses(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Checks for due recurring expenses and generates actual Expense entries.
    Should be called on app startup or dashboard load.
    """
    service = RecurringExpenseService(session)
    count = service.process_due_expenses(current_user.id)
    return {"generated": count}
