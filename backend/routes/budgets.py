from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from database import get_session
from models import Budget, BudgetCreate, BudgetRead, User, Expense
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/", response_model=list[BudgetRead])
def get_budgets(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Get all budgets for the user
    budgets = session.exec(
        select(Budget).where(Budget.user_id == current_user.id)
    ).all()
    
    # Calculate spent amount for each budget in the current month
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    budget_reads = []
    for budget in budgets:
        # Calculate total expenses for this category in current month
        spent = session.exec(
            select(func.sum(Expense.amount))
            .where(Expense.user_id == current_user.id)
            .where(Expense.category_id == budget.category_id)
            .where(Expense.date >= current_month_start)
            .where(Expense.type == "expense")
        ).one() or 0.0
        
        budget_read = BudgetRead.from_orm(budget)
        budget_read.spent = spent
        budget_reads.append(budget_read)
        
    return budget_reads

@router.post("/", response_model=BudgetRead)
def create_budget(
    budget: BudgetCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if budget already exists for this category
    existing_budget = session.exec(
        select(Budget)
        .where(Budget.user_id == current_user.id)
        .where(Budget.category_id == budget.category_id)
    ).first()
    
    if existing_budget:
        raise HTTPException(status_code=400, detail="Budget already exists for this category")

    db_budget = Budget.from_orm(budget, update={"user_id": current_user.id})
    session.add(db_budget)
    session.commit()
    session.refresh(db_budget)
    
    # Return with spent = 0 initially
    budget_read = BudgetRead.from_orm(db_budget)
    budget_read.spent = 0.0
    return budget_read

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    budget = session.get(Budget, budget_id)
    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    session.delete(budget)
    session.commit()
    return {"ok": True}
