from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select, func, desc
from backend.adapters.database.models import Expense, Category

class AnalyticsService:
    def __init__(self, session: Session):
        self.session = session

    def get_dashboard_stats(self, user_id: int) -> Dict[str, Any]:
        # Total Balance (Expenses)
        total_expense = self.session.exec(
            select(func.sum(Expense.amount))
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
        ).one() or 0
        
        total_income = 0 # Simplified for now
        balance = total_income - total_expense
        
        # Category Breakdown
        category_stats = self.session.exec(
            select(Category.name, func.sum(Expense.amount))
            .join(Category)
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
            .group_by(Category.name)
        ).all()
        
        formatted_categories = [{"name": cat_name, "value": amt} for cat_name, amt in category_stats]

        # Daily Trend (Last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        daily_stats = self.session.exec(
            select(func.date(Expense.date), func.sum(Expense.amount))
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
            .where(Expense.date >= thirty_days_ago)
            .group_by(func.date(Expense.date))
            .order_by(func.date(Expense.date))
        ).all()
        
        formatted_daily = [{"date": day, "amount": amt} for day, amt in daily_stats]
        
        # Recent Transactions (Last 5)
        recent_expenses = self.session.exec(
            select(Expense)
            .where(Expense.user_id == user_id)
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

    def predict_category(self, user_id: int, title: str) -> Optional[int]:
        if not title or len(title) < 2:
            return None

        # Find most frequent category for this merchant/title (SQL based)
        query = (
            select(Expense.category_id, func.count(Expense.id).label("count"))
            .where(Expense.user_id == user_id)
            .where(Expense.title.ilike(f"%{title}%")) 
            .group_by(Expense.category_id)
            .order_by(desc("count"))
            .limit(1)
        )
        result = self.session.exec(query).first()
        
        if result:
            return result[0]
            
        # Fallback to AI if no history?
        # For now, let's keep it consistent with what it was (SQL only) as per previous refactor.
        # But wait, original ai/service.py had parse_expense_natural_language which did categorization.
        # This predict_category seems to be for the UI 'autofill' feature which is separate.
        return None
