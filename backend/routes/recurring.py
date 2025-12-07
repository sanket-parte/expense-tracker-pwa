from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import RecurringExpense, RecurringExpenseCreate, RecurringExpenseRead, User, Expense, Category
from auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/recurring", tags=["recurring"])

@router.get("/", response_model=list[RecurringExpenseRead])
def get_recurring_expenses(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    expenses = session.exec(
        select(RecurringExpense).where(RecurringExpense.user_id == current_user.id)
    ).all()
    return expenses

@router.post("/", response_model=RecurringExpenseRead)
def create_recurring_expense(
    recurring: RecurringExpenseCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_recurring = RecurringExpense.from_orm(recurring, update={"user_id": current_user.id})
    session.add(db_recurring)
    session.commit()
    session.refresh(db_recurring)
    return db_recurring

@router.delete("/{id}")
def delete_recurring_expense(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    recurring = session.get(RecurringExpense, id)
    if not recurring or recurring.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
        
    session.delete(recurring)
    session.commit()
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
    now = datetime.utcnow()
    
    # Get active recurring expenses for user that are due (next_due_date <= now)
    due_expenses = session.exec(
        select(RecurringExpense)
        .where(RecurringExpense.user_id == current_user.id)
        .where(RecurringExpense.is_active == True)
        .where(RecurringExpense.next_due_date <= now)
    ).all()
    
    generated_count = 0
    
    for recurring in due_expenses:
        # Create the actual expense
        new_expense = Expense(
            title=f"{recurring.title} (Recurring)",
            amount=recurring.amount,
            category_id=recurring.category_id,
            user_id=current_user.id,
            type="expense",
            date=recurring.next_due_date # Use the due date as the expense date
        )
        session.add(new_expense)
        
        # Update next_due_date
        recurring.last_generated = now
        
        if recurring.frequency == "monthly":
            # Add approx 30 days or handle month logic (simplification: 30 days for now)
            # Better: same day next month
            # For simplicity in this MVP, we'll just adding 30 days
            recurring.next_due_date = recurring.next_due_date + timedelta(days=30)
        elif recurring.frequency == "weekly":
            recurring.next_due_date = recurring.next_due_date + timedelta(weeks=1)
        
        session.add(recurring)
        generated_count += 1
        
    session.commit()
    
    return {"generated": generated_count}
