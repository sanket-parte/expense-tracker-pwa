from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from database import get_session
from models import Expense, User
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Total Balance (Expenses)
    total_expense = session.exec(
        select(func.sum(Expense.amount))
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
    ).one() or 0
    
    total_income = session.exec(
        select(func.sum(Expense.amount))
        .where(Expense.type == "income")
        .where(Expense.user_id == current_user.id)
    ).one() or 0
    
    balance = total_income - total_expense
    
    # Category Breakdown
    category_stats = session.exec(
        select(Expense.category, func.sum(Expense.amount))
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .group_by(Expense.category)
    ).all()
    
    formatted_categories = [{"name": cat, "value": amt} for cat, amt in category_stats]

    # Daily Trend (Last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_stats = session.exec(
        select(func.date(Expense.date), func.sum(Expense.amount))
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .where(Expense.date >= thirty_days_ago)
        .group_by(func.date(Expense.date))
        .order_by(func.date(Expense.date))
    ).all()
    
    formatted_daily = [{"date": day, "amount": amt} for day, amt in daily_stats]
    
    # Recent Transactions (Last 5)
    recent_expenses = session.exec(
        select(Expense)
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.date.desc())
        .limit(5)
    ).all()

    return {
        "total_expense": total_expense,
        "total_income": total_income,
        "balance": balance,
        "category_breakdown": formatted_categories,
        "daily_trend": formatted_daily,
        "recent_transactions": recent_expenses
    }
