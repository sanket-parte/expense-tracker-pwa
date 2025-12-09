from typing import Optional, List, Dict, Any
from datetime import datetime
import json
from sqlmodel import Session, select, func, desc
from backend.adapters.database.models import MonthlyReport, Expense, Category
from backend.adapters.ai.service import AIService

class ReportService:
    def __init__(self, session: Session):
        self.session = session

    def generate_report(self, user_id: int, month: Optional[str] = None) -> Optional[Dict[str, Any]]:
        ai_service = AIService(self.session, user_id)
        report = ai_service.generate_monthly_audit(month)
        if not report:
            return None
        return self._format_report_response(report)

    def get_all_reports(self, user_id: int) -> List[Dict[str, Any]]:
        reports = self.session.exec(
            select(MonthlyReport)
            .where(MonthlyReport.user_id == user_id)
            .order_by(MonthlyReport.month.desc())
        ).all()
        return [self._format_report_response(r) for r in reports]

    def get_latest_report(self, user_id: int) -> Optional[Dict[str, Any]]:
        report = self.session.exec(
            select(MonthlyReport)
            .where(MonthlyReport.user_id == user_id)
            .order_by(MonthlyReport.month.desc())
        ).first()
        if not report:
            return None
        return self._format_report_response(report)

    def get_report_by_month(self, user_id: int, month: str) -> Optional[Dict[str, Any]]:
        report = self.session.exec(
            select(MonthlyReport)
            .where(
                MonthlyReport.user_id == user_id,
                MonthlyReport.month == month
            )
        ).first()
        if not report:
            return None
        return self._format_report_response(report)

    def _format_report_response(self, report: MonthlyReport) -> Dict[str, Any]:
        resp = report.model_dump()
        try:
            resp['analysis'] = json.loads(report.analysis)
        except:
            resp['analysis'] = {}
        return resp

    def get_monthly_stats_report(self, user_id: int, month: str) -> Dict[str, Any]:
        try:
            start_date = datetime.strptime(month, "%Y-%m")
            if start_date.month == 12:
                end_date = datetime(start_date.year + 1, 1, 1)
            else:
                end_date = datetime(start_date.year, start_date.month + 1, 1)
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM")

        # 1. Total Expense
        total_expense = self.session.exec(
            select(func.sum(Expense.amount))
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
            .where(Expense.date >= start_date)
            .where(Expense.date < end_date)
        ).one() or 0

        # 2. Daily Stats
        daily_stats = self.session.exec(
            select(func.date(Expense.date), func.sum(Expense.amount))
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
            .where(Expense.date >= start_date)
            .where(Expense.date < end_date)
            .group_by(func.date(Expense.date))
            .order_by(func.date(Expense.date))
        ).all()
        
        formatted_daily = [{"date": day, "amount": amt} for day, amt in daily_stats]

        # 3. Average Daily
        now = datetime.utcnow()
        if start_date.year == now.year and start_date.month == now.month:
            days_passed = max(1, now.day)
        else:
            days_passed = (end_date - start_date).days
            
        avg_daily = total_expense / days_passed if days_passed > 0 else 0

        # 4. Top Categories
        category_stats = self.session.exec(
            select(Category.name, Category.color, func.sum(Expense.amount))
            .join(Category)
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
            .where(Expense.date >= start_date)
            .where(Expense.date < end_date)
            .group_by(Category.name, Category.color)
            .order_by(desc(func.sum(Expense.amount)))
        ).all()

        formatted_categories = [
            {"name": cat_name, "color": color, "value": amt} 
            for cat_name, color, amt in category_stats
        ]
        
        # 5. Top Expense
        top_expense = self.session.exec(
            select(Expense)
            .where(Expense.type == "expense")
            .where(Expense.user_id == user_id)
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

    def process_ai_query(self, user_id: int, query_text: str) -> Dict[str, Any]:
         ai_service = AIService(self.session, user_id)
         return ai_service.process_natural_language_query(query_text)
