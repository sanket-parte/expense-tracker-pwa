from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from database import get_session
from models import Expense, ExpenseCreate, ExpenseRead, ExpenseUpdate, User
from auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/", response_model=ExpenseRead)
def create_expense(
    *,
    session: Session = Depends(get_session),
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user)
):
    db_expense = Expense(**expense.model_dump(), user_id=current_user.id)
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    return db_expense

@router.get("/", response_model=List[ExpenseRead])
def read_expenses(
    *,
    session: Session = Depends(get_session),
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
    query = select(Expense).where(Expense.user_id == current_user.id)
    
    if category_id:
        query = query.where(Expense.category_id == category_id)
    
    if search:
        query = query.where(Expense.title.ilike(f"%{search}%"))
        
    if start_date:
        query = query.where(Expense.date >= start_date)
        
    if end_date:
        query = query.where(Expense.date <= end_date)
        
    if min_amount is not None:
        query = query.where(Expense.amount >= min_amount)
        
    if max_amount is not None:
        query = query.where(Expense.amount <= max_amount)
        
    if type:
        query = query.where(Expense.type == type)

    query = query.offset(offset).limit(limit).order_by(Expense.date.desc())
    expenses = session.exec(query).all()
    return expenses

@router.get("/{expense_id}", response_model=ExpenseRead)
def read_expense(
    *, 
    session: Session = Depends(get_session), 
    expense_id: int,
    current_user: User = Depends(get_current_user)
):
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.patch("/{expense_id}", response_model=ExpenseRead)
def update_expense(
    *, 
    session: Session = Depends(get_session), 
    expense_id: int, 
    expense: ExpenseUpdate,
    current_user: User = Depends(get_current_user)
):
    db_expense = session.get(Expense, expense_id)
    if not db_expense or db_expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense_data = expense.model_dump(exclude_unset=True)
    for key, value in expense_data.items():
        setattr(db_expense, key, value)
        
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    return db_expense

@router.delete("/{expense_id}")
def delete_expense(
    *, 
    session: Session = Depends(get_session), 
    expense_id: int,
    current_user: User = Depends(get_current_user)
):
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    session.delete(expense)
    session.commit()
    return {"ok": True}

@router.post("/auto-categorize")
def auto_categorize(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from services.ai_service import auto_categorize_expenses
    count = auto_categorize_expenses(session, current_user.id)
    return {"processed_count": count}

