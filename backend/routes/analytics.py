from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, desc
from datetime import datetime, timedelta
from database import get_session
from models import Expense, User, Category
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
    
    # total_income = session.exec(
    #     select(func.sum(Expense.amount))
    #     .where(Expense.type == "income")
    #     .where(Expense.user_id == current_user.id)
    # ).one() or 0
    total_income = 0
    
    balance = total_income - total_expense
    
    # Category Breakdown
    category_stats = session.exec(
        select(Category.name, func.sum(Expense.amount))
        .join(Category)
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .group_by(Category.name)
    ).all()
    
    formatted_categories = [{"name": cat_name, "value": amt} for cat_name, amt in category_stats]

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

@router.get("/predict-category")
def predict_category(
    title: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not title or len(title) < 2:
        return {"category_id": None}

    # Find most frequent category for this merchant/title
    query = (
        select(Expense.category_id, func.count(Expense.id).label("count"))
        .where(Expense.user_id == current_user.id)
        .where(Expense.title.ilike(f"%{title}%")) 
        .group_by(Expense.category_id)
        .order_by(desc("count"))
        .limit(1)
    )
    result = session.exec(query).first()
    
    if result:
        return {"category_id": result[0]}
    
    return {"category_id": None}

@router.get("/monthly-report")
def get_monthly_report(
    month: str, # Format YYYY-MM
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        start_date = datetime.strptime(month, "%Y-%m")
        # Calculate end date (start of next month)
        if start_date.month == 12:
            end_date = datetime(start_date.year + 1, 1, 1)
        else:
            end_date = datetime(start_date.year, start_date.month + 1, 1)
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM"}

    # 1. Total Expense for Month
    total_expense = session.exec(
        select(func.sum(Expense.amount))
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .where(Expense.date >= start_date)
        .where(Expense.date < end_date)
    ).one() or 0

    # 2. Daily Stats (for Chart)
    daily_stats = session.exec(
        select(func.date(Expense.date), func.sum(Expense.amount))
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .where(Expense.date >= start_date)
        .where(Expense.date < end_date)
        .group_by(func.date(Expense.date))
        .order_by(func.date(Expense.date))
    ).all()
    
    formatted_daily = [{"date": day, "amount": amt} for day, amt in daily_stats]

    # 3. Average Daily Spend
    # If looking at current month, divide by today's day number. If past month, divide by total days in month.
    now = datetime.utcnow()
    if start_date.year == now.year and start_date.month == now.month:
        days_passed = max(1, now.day)
    else:
        days_passed = (end_date - start_date).days
        
    avg_daily = total_expense / days_passed if days_passed > 0 else 0

    # 4. Top Categories (Pie Chart/List)
    category_stats = session.exec(
        select(Category.name, Category.color, func.sum(Expense.amount))
        .join(Category)
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .where(Expense.date >= start_date)
        .where(Expense.date < end_date)
        .group_by(Category.name, Category.color)
        .order_by(desc(func.sum(Expense.amount)))
    ).all()

    formatted_categories = [
        {"name": cat_name, "color": color, "value": amt} 
        for cat_name, color, amt in category_stats
    ]
    
    # 5. Top Spending (Single largest expense)
    top_expense = session.exec(
        select(Expense)
        .where(Expense.type == "expense")
        .where(Expense.user_id == current_user.id)
        .where(Expense.date >= start_date)
        .where(Expense.date < end_date)
        .order_by(Expense.amount.desc())
        .limit(1)
    ).first()

    return {
        "total_expense": total_expense,
        "avg_daily": avg_daily,
        "days_considered": days_passed,
        "daily_trend": formatted_daily,
        "category_breakdown": formatted_categories,
        "top_expense": top_expense
    }
