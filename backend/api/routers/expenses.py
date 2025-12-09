from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime

from backend.adapters.database.models import User
from backend.api.schemas.all import ExpenseCreate, ExpenseRead, ExpenseUpdate
from backend.api.deps import get_current_user, get_db
from backend.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/", response_model=ExpenseRead)
def create_expense(
    *,
    session: Session = Depends(get_db),
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(session)
    return service.create_expense(expense, current_user.id)

@router.get("/", response_model=List[ExpenseRead])
def read_expenses(
    *,
    session: Session = Depends(get_db),
    offset: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(session)
    return service.get_expenses(
        user_id=current_user.id,
        offset=offset,
        limit=limit,
        category_id=category_id,
        search=search,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        type=type
    )

@router.get("/{expense_id}", response_model=ExpenseRead)
def read_expense(
    *, 
    session: Session = Depends(get_db), 
    expense_id: int,
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(session)
    expense = service.get_expense(expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.patch("/{expense_id}", response_model=ExpenseRead)
def update_expense(
    *, 
    session: Session = Depends(get_db), 
    expense_id: int, 
    expense: ExpenseUpdate,
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(session)
    updated_expense = service.update_expense(expense_id, expense, current_user.id)
    if not updated_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated_expense

@router.delete("/{expense_id}")
def delete_expense(
    *, 
    session: Session = Depends(get_db), 
    expense_id: int,
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(session)
    success = service.delete_expense(expense_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"ok": True}

@router.post("/auto-categorize")
def auto_categorize(
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(session)
    count = service.auto_categorize(current_user.id)
    return {"processed_count": count}

