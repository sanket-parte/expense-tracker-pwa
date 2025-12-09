import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from sqlalchemy import func

from backend.adapters.database.models import Expense, UserSettings, AISuggestion, Category, RecurringExpense, Budget, Challenge, MonthlyReport
from backend.adapters.ai.llm_provider import LiteLLMProvider, LLMProvider

class AIService:
    def __init__(self, session: Session, user_id: int):
        self.session = session
        self.user_id = user_id
        self.provider = self._get_provider(user_id)

    def _get_provider(self, user_id: int) -> Optional[LLMProvider]:
        settings = self.session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
        if not settings or not settings.openai_api_key:
            return None
        return LiteLLMProvider(api_key=settings.openai_api_key)

    def _get_recent_expenses_text(self, days: int = 365) -> str:
        """Fetches recent expenses and formats them as a text summary."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        expenses = self.session.exec(
            select(Expense).where(Expense.user_id == self.user_id, Expense.date >= cutoff_date)
        ).all()
        
        if not expenses:
            return f"No expenses recorded in the last {days} days."

        category_totals = {}
        total_spent = 0.0
        
        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        cat_map = {c.id: c.name for c in categories}
        
        expense_details = []
        
        for expense in expenses:
            cat_name = cat_map.get(expense.category_id, "Unknown")
            category_totals[cat_name] = category_totals.get(cat_name, 0.0) + expense.amount
            total_spent += expense.amount
            expense_details.append(f"- {expense.date.strftime('%Y-%m-%d')}: {expense.title} ({cat_name}) - ₹{expense.amount:.2f}")

        summary = f"Total Spent in last {days} days: ₹{total_spent:.2f}\n\n"
        summary += "Spending by Category:\n"
        for cat, amount in category_totals.items():
            percentage = (amount / total_spent * 100) if total_spent > 0 else 0
            summary += f"- {cat}: ₹{amount:.2f} ({percentage:.1f}%)\n"
            
        summary += "\nRecent Transactions (Last 50):\n" + "\n".join(expense_details[:50])
        
        return summary

    def generate_financial_advice(self) -> str:
        if not self.provider:
            return "Please configure your OpenAI API Key in Settings to receive AI suggestions."
            
        expense_data = self._get_recent_expenses_text(days=365)
        
        prompt = f"""
        You are a highly perceptive, data-driven financial advisor. 
        Analyze the user's recent expense data below to uncover specific spending patterns, anomalies, or opportunities for savings.
        The currency is Indian Rupees (₹).

        User's Expense Data (Last 365 Days):
        {expense_data}

        Your Task:
        Provide 3 distinct, high-impact observations or recommendations. 
        - **Be Specific**: Cite specific categories, amounts, or transaction names from the data. Do not give generic advice like "save more" without tying it to the data.
        - **Be Actionable**: Suggest a concrete step they can take right now.
        - **Tone**: Professional, encouraging, and direct.
        
        Format the output as a clean list. Use **bold** for key points.
        """
        
        try:
            suggestion_text = self.provider.generate_text(prompt, system_prompt="You are a helpful financial analyst who provides specific, personalized advice based on actual data.")
            
            new_suggestion = AISuggestion(
                user_id=self.user_id,
                content=suggestion_text
            )
            self.session.add(new_suggestion)
            self.session.commit()
            
            return suggestion_text
        except Exception as e:
            print(f"Error generating advice: {e}")
            return f"Error generating suggestion: {str(e)}"

    def parse_expense_natural_language(self, text: str) -> Dict[str, Any]:
        if not self.provider:
             raise ValueError("OpenAI API Key not configured")

        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        category_list = ", ".join([f"{c.id}:{c.name}" for c in categories])
        current_date = datetime.now().strftime("%Y-%m-%d")

        prompt = f"""
        You are an intelligent expense parser. Extract transaction details from the user's input.
        
        Context:
        - Current Date: {current_date}
        - User's Categories (ID:Name): {category_list}
        
        User Input: "{text}"
        
        Instructions:
        1. Extract 'title', 'amount', 'date' (YYYY-MM-DD), and 'category_id'.
        2. Map the input to the most appropriate category ID from the list provided. If no close match, set category_id to null.
        3. If date is implicit (e.g. "yesterday"), calculate it relative to Current Date.
        4. If no title is given, infer a short one.
        5. Return JSON ONLY. No markdown formatting.
        
        Output Format:
        {{
            "title": "string",
            "amount": float,
            "date": "YYYY-MM-DD",
            "category_id": int or null
        }}
        """
        
        return self.provider.generate_json(prompt, system_prompt="You are a precise data extraction assistant that outputs raw JSON.")

    def detect_recurring_expenses(self) -> List[Dict[str, Any]]:
        expenses = self.session.exec(
            select(Expense)
            .where(Expense.user_id == self.user_id)
            .order_by(Expense.date.desc())
            .limit(100)
        ).all()
        
        if len(expenses) < 5 or not self.provider:
            return []

        existing = self.session.exec(select(RecurringExpense).where(RecurringExpense.user_id == self.user_id)).all()
        existing_text = ", ".join([f"{r.title} ({r.amount})" for r in existing])
        expense_list_text = "\n".join([f"- {e.date}: {e.title} ({e.amount})" for e in expenses])

        prompt = f"""
        Analyze the transaction history below to identify POTENTIAL recurring subscriptions or bills that are NOT yet tracked.
        
        Transaction History (Last 90 days):
        {expense_list_text}
        
        Already Tracked (Ignore these): {existing_text}
        
        Criteria for selection:
        - Same or similar title (e.g. "Netflix", "Spotify", "Rent").
        - Same or very similar amount.
        - Occurs somewhat regularly (weekly, monthly).
        
        Output JSON list of objects with:
        - title: Simplified name (e.g. "Netflix" instead of "Netflix.com*123")
        - amount: The recurring amount
        - frequency: "monthly" or "weekly"
        - confidence: 0.0 to 1.0 (how sure are you?)
        - reason: Short explanation (e.g. "Payment of 649 detected on 5th of each month")
        
        Return JSON ONLY.
        """
        try:
            return self.provider.generate_json(prompt)
        except Exception as e:
            print(f"Error detecting recurring: {e}")
            return []

    def generate_budget_forecast(self) -> List[Dict[str, Any]]:
        import calendar
        budgets = self.session.exec(select(Budget).where(Budget.user_id == self.user_id)).all()
        if not budgets:
            return []
            
        forecasts = []
        today = datetime.now()
        days_in_month = calendar.monthrange(today.year, today.month)[1]
        day_of_month = today.day
        remaining_days = days_in_month - day_of_month
        
        cutoff = datetime.utcnow() - timedelta(hours=24)
        recent_suggestions = self.session.exec(
            select(AISuggestion)
            .where(
                AISuggestion.user_id == self.user_id, 
                AISuggestion.created_at >= cutoff,
                AISuggestion.content.like("BUDGET_ALERT:%")
            )
        ).all()
        
        cache_map = {}
        for s in recent_suggestions:
            parts = s.content.split(":", 2)
            if len(parts) == 3:
                cache_map[int(parts[1])] = parts[2]

        for budget in budgets:
            start_date = datetime(today.year, today.month, 1)
            spent = self.session.exec(
                select(Expense)
                .where(
                    Expense.category_id == budget.category_id,
                    Expense.date >= start_date,
                    Expense.user_id == self.user_id
                )
            ).all()
            spent_amount = sum(e.amount for e in spent)
            
            daily_avg = spent_amount / day_of_month if day_of_month > 0 else 0
            projected_total = daily_avg * days_in_month
            is_at_risk = projected_total > (budget.amount * 1.05)
            
            advice = ""
            if is_at_risk:
                if budget.category_id in cache_map:
                    advice = cache_map[budget.category_id]
                else:
                    advice = "You are spending too fast."
                    if self.provider:
                        try:
                            prompt = f"""
                            The user has a budget of {budget.amount} for category '{budget.category.name}'.
                            Currently it is day {day_of_month} of {days_in_month}.
                            They have already spent {spent_amount}.
                            Projected spend: {projected_total:.0f}.
                            
                            Give a 1-sentence, encouraging specific tip to help them get back on track.
                            """
                            advice = self.provider.generate_text(prompt, max_tokens=60)
                            
                            new_cache = AISuggestion(
                                user_id=self.user_id,
                                content=f"BUDGET_ALERT:{budget.category_id}:{advice}"
                            )
                            self.session.add(new_cache)
                            self.session.commit()
                        except Exception as e:
                            print(f"Error generating forecast advice: {e}")
            
            forecasts.append({
                "category": budget.category.name,
                "budget": budget.amount,
                "spent": spent_amount,
                "projected": projected_total,
                "days_remaining": remaining_days,
                "status": "at_risk" if spent_amount < budget.amount else "exceeded",
                "advice": advice
            })
        return forecasts

    def generate_budget_suggestions(self) -> List[Dict[str, Any]]:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        
        expenses = self.session.exec(
            select(Expense)
            .where(
                Expense.user_id == self.user_id, 
                Expense.date >= start_date,
                Expense.date <= end_date
            )
        ).all()
        
        if not expenses:
            return []

        cat_expenses = {}
        for e in expenses:
            if e.category_id not in cat_expenses:
                cat_expenses[e.category_id] = []
            cat_expenses[e.category_id].append(e.amount)

        summaries = []
        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        cat_map = {c.id: c.name for c in categories}
        
        for cat_id, amounts in cat_expenses.items():
            total_spent = sum(amounts)
            avg_monthly = total_spent / 3.0
            cat_name = cat_map.get(cat_id, f"Category {cat_id}")
            
            summaries.append({
                "category_id": cat_id,
                "category_name": cat_name,
                "avg_monthly": round(avg_monthly, 2),
                "max_single": max(amounts) if amounts else 0
            })

        def attach_names(items):
            for item in items:
                item["category_name"] = cat_map.get(item["category_id"], "Unknown")
            return items

        if not self.provider:
            results = [{
                "category_id": s["category_id"],
                "amount": int(s["avg_monthly"]),
                "reason": "Based on 3-month average."
            } for s in summaries]
            return attach_names(results)

        prompt = f"""
        Act as a pragmatic budget advisor.
        I have calculated the raw 3-month average spending for standard categories.
        Your goal: Propose a REALISTIC monthly budget for each category.
        
        Rules:
        - Round up to the nearest 100 or 500 for clean numbers.
        - Add a small buffer (5-10%) to the average so the budget isn't too tight.
        - If the average is very low (< 100), maybe ignore it or suggest 0? Use judgment.
        
        Data:
        {json.dumps(summaries, indent=2)}
        
        Output JSON list:
        [
            {{
                "category_id": 123,
                "amount": 5000,
                "reason": "Average is 4800, rounded up for safety."
            }}
        ]
        """

        try:
            suggestions = self.provider.generate_json(prompt, temperature=0.3)
            return attach_names(suggestions)
        except Exception as e:
            print(f"Error generating budget suggestions: {e}")
            results = [{
                "category_id": s["category_id"],
                "amount": int(s["avg_monthly"] * 1.1),
                "reason": "Fallback: 3-month average + 10%"
            } for s in summaries]
            return attach_names(results)

    def auto_categorize_expenses(self) -> int:
        expenses = self.session.exec(
            select(Expense)
            .where(Expense.user_id == self.user_id, Expense.category_id == None)
            .limit(20)
        ).all()
        
        if not expenses or not self.provider:
            return 0
            
        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        if not categories:
            return 0
            
        cat_map = {c.id: c.name for c in categories}
        cat_list_str = ", ".join([f"{c.id}:{c.name}" for c in categories])
        items_to_categorize = [{"id": e.id, "title": e.title, "amount": e.amount} for e in expenses]
        
        prompt = f"""
        You are an intelligent transaction classifier.
        
        Categories available (ID:Name):
        {cat_list_str}
        
        Transactions to categorize:
        {json.dumps(items_to_categorize, indent=2)}
        
        Task:
        Return a JSON object analyzing each transaction.
        Format:
        {{
          "mappings": [
             {{ "id": <transaction_id>, "category_id": <id_from_list_above> }}
          ]
        }}
        
        Rules:
        - Match based on merchant name (e.g. "Uber" -> Transport).
        - If unsure, do NOT include it in the mapping (leave it alone).
        - Return JSON ONLY.
        """
        
        try:
            data = self.provider.generate_json(prompt, temperature=0.0)
            mappings = data.get("mappings", [])
            
            count = 0
            for m in mappings:
                exp_id = m.get("id")
                cat_id = m.get("category_id")
                if exp_id and cat_id and cat_id in cat_map:
                    expense = self.session.get(Expense, exp_id)
                    if expense and expense.user_id == self.user_id:
                        expense.category_id = cat_id
                        self.session.add(expense)
                        count += 1
            
            self.session.commit()
            return count
        except Exception as e:
            print(f"Error auto-categorizing: {e}")
            return 0

    def process_natural_language_query(self, query_text: str) -> Dict[str, Any]:
        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        cat_list_str = ", ".join([c.name for c in categories])
        current_date = datetime.now().strftime("%Y-%m-%d")

        prompt = f"""
        You are a data analyst helper. Translate the user's question into a structured JSON query object.
        
        Context:
        - Current Date: {current_date}
        - User's Categories: [{cat_list_str}]
        
        User Question: "{query_text}"
        
        Supported Operations (you must choose one):
        - "total_spend": Sum of expenses.
        - "count_transactions": Number of transactions.
        - "average_spend": Average amount per transaction.
        
        Output JSON Format:
        {{
            "operation": "total_spend" | "count_transactions" | "average_spend",
            "filters": {{
                "category_name": "Food" or null,
                "start_date": "YYYY-MM-DD" or null,
                "end_date": "YYYY-MM-DD" or null,
                "merchant_name": "Uber" or null (partial match)
            }},
            "human_readable_answer_template": "You spent {{value}} on Food in November."
        }}
        
        Rules:
        - If date is "last month", calculate start/end dates relative to {current_date}.
        - Return JSON ONLY.
        """
        
        if not self.provider:
            return {"error": "API Key missing"}

        try:
            params = self.provider.generate_json(prompt, system_prompt="You are a precise query generator that outputs raw JSON.")
            filters = params.get("filters", {})
            op = params.get("operation")
            
            query = select(Expense).where(Expense.user_id == self.user_id)
            
            if filters.get("category_name"):
                cat = self.session.exec(select(Category).where(Category.user_id == self.user_id, Category.name.ilike(filters["category_name"]))).first()
                if cat:
                    query = query.where(Expense.category_id == cat.id)
            if filters.get("start_date"):
                query = query.where(Expense.date >= datetime.strptime(filters["start_date"], "%Y-%m-%d"))
            if filters.get("end_date"):
                query = query.where(Expense.date <= datetime.strptime(filters["end_date"], "%Y-%m-%d"))
            if filters.get("merchant_name"):
                query = query.where(Expense.title.ilike(f"%{filters['merchant_name']}%"))

            result_value = 0
            if op == "total_spend":
                expenses = self.session.exec(query).all()
                result_value = sum(e.amount for e in expenses)
                formatted_result = f"₹{result_value:.2f}"
            elif op == "count_transactions":
                expenses = self.session.exec(query).all()
                result_value = len(expenses)
                formatted_result = str(result_value)
            elif op == "average_spend":
                expenses = self.session.exec(query).all()
                if expenses:
                    result_value = sum(e.amount for e in expenses) / len(expenses)
                formatted_result = f"₹{result_value:.2f}"
            else:
                return {"answer": "I didn't understand the operation."}

            template = params.get("human_readable_answer_template", "The answer is {value}.")
            final_answer = template.replace("{value}", formatted_result)
            return {"answer": final_answer, "debug_query": params}

        except Exception as e:
            print(f"Error processing NL query: {e}")
            return {"answer": "Sorry, I couldn't process that question."}

    def generate_spending_challenges(self) -> List[Dict[str, Any]]:
        today_debug = datetime.now()
        cutoff = datetime.utcnow() - timedelta(days=30)
        expenses = self.session.exec(select(Expense).where(Expense.user_id == self.user_id, Expense.date >= cutoff)).all()
        
        if not expenses:
            existing = self.session.exec(select(Challenge).where(
                Challenge.user_id == self.user_id, 
                Challenge.title == "First Step"
            )).first()
            
            if existing:
                return []

            today = datetime.now()
            next_week = today + timedelta(days=7)
            starter = Challenge(
                user_id=self.user_id,
                title="First Step",
                description="Track your first 3 expenses this week.",
                category_id=None,
                target_amount=10000,
                current_amount=0.0,
                start_date=today,
                end_date=next_week,
                status="pending"
            )
            self.session.add(starter)
            self.session.commit()
            return [{"title": "First Step", "description": "Track your spending to unlock insights."}]
            
        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        cat_map = {c.id: c.name for c in categories}
        cat_totals = {}
        for e in expenses:
            cat_totals[e.category_id] = cat_totals.get(e.category_id, 0.0) + e.amount
            
        sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:5]
        context_data = []
        for cat_id, total in sorted_cats:
            name = cat_map.get(cat_id, "Unknown")
            avg_weekly = total / 4.0
            context_data.append(f"- {name}: spent {total} last 30 days (~{avg_weekly:.0f}/week)")
        context_str = "\n".join(context_data)
        
        if not self.provider:
            return []
            
        available_cats = ", ".join([c.name for c in categories])
        prompt = f"""
        Act as a gamification expert for finance.
        Based on the user's recent heavy spending, generate 3 specific "Spend-Less Challenges" for the UPCOMING WEEK.
        
        User's Heavy Spending (Last 30 days):
        {context_str}
        
        Available Category List: [{available_cats}]
        
        Goal:
        Encourage them to reduce spending in these categories by setting a reachable but tight limit for the next 7 days.
        If the weekly average is X, set the target to roughly 70-80% of X.
        
        Output JSON list:
        [
            {{
                "title": "Coffee Detox",
                "description": "Limit Coffee spending to 500 this week.",
                "category_name": "Coffee",
                "target_amount": 500
            }}
        ]
        
        Rules:
        - Return JSON ONLY.
        - Title should be catchy.
        - Category Name MUST be exactly one from the "Available Category List" provided above.
        - If a spending behavior doesn't fit a specific category (e.g. "Dining Out" but you only have "Uncategorized"), use "Uncategorized".
        """
        
        try:
            suggestions = self.provider.generate_json(prompt, temperature=0.7)
            today = datetime.now()
            next_week = today + timedelta(days=7)
            created_challenges = []
            name_to_id = {c.name.lower(): c.id for c in categories}
            
            for s in suggestions:
                cat_name = s.get("category_name", "").lower()
                cat_id = name_to_id.get(cat_name)
                if not cat_id:
                    for name, cid in name_to_id.items():
                        if name in cat_name or cat_name in name:
                            cat_id = cid
                            break
                if not cat_id and "general" in cat_name:
                     cat_id = None
                if cat_id is None:
                    uncategorized = next((c for c in categories if c.name.lower() == "uncategorized"), None)
                    if uncategorized:
                        cat_id = uncategorized.id

                if cat_id is not None:
                    existing = self.session.exec(select(Challenge).where(
                        Challenge.user_id == self.user_id, 
                        Challenge.status == 'pending', 
                        Challenge.category_id == cat_id
                    )).first()
                    if existing:
                        continue

                    new_chall = Challenge(
                        user_id=self.user_id,
                        title=s['title'],
                        description=s['description'],
                        category_id=cat_id,
                        target_amount=float(s['target_amount']),
                        current_amount=0.0,
                        start_date=today,
                        end_date=next_week,
                        status="pending"
                    )
                    self.session.add(new_chall)
                    created_challenges.append(s)
            
            self.session.commit()
            return created_challenges
        except Exception as e:
            print(f"Error generating challenges: {e}")
            return []

    def generate_monthly_audit(self, month_str: str = None) -> Optional[MonthlyReport]:
        if not month_str:
            today = datetime.now()
            first_day_this_month = today.replace(day=1)
            last_month_end = first_day_this_month - timedelta(days=1)
            month_str = last_month_end.strftime("%Y-%m")
            
        start_date = datetime.strptime(month_str, "%Y-%m")
        if start_date.month == 12:
            end_date = start_date.replace(year=start_date.year + 1, month=1)
        else:
            end_date = start_date.replace(month=start_date.month + 1)
            
        prev_month_start = start_date - timedelta(days=1)
        prev_month_start = prev_month_start.replace(day=1)
        
        current_expenses = self.session.exec(select(Expense).where(
            Expense.user_id == self.user_id, 
            Expense.date >= start_date, 
            Expense.date < end_date,
            Expense.type == 'expense'
        )).all()
        
        prev_expenses = self.session.exec(select(Expense).where(
            Expense.user_id == self.user_id, 
            Expense.date >= prev_month_start, 
            Expense.date < start_date,
            Expense.type == 'expense'
        )).all()
        
        current_income_txn = self.session.exec(select(Expense).where(
            Expense.user_id == self.user_id, 
            Expense.date >= start_date, 
            Expense.date < end_date,
            Expense.type == 'income'
        )).all()
        
        total_spent = sum(e.amount for e in current_expenses)
        prev_spent = sum(e.amount for e in prev_expenses)
        total_income = sum(e.amount for e in current_income_txn)
        
        savings_rate = 0.0
        if total_income > 0:
            savings_rate = ((total_income - total_spent) / total_income) * 100
            
        categories = self.session.exec(select(Category).where(Category.user_id == self.user_id)).all()
        cat_map = {c.id: c.name for c in categories}
        cat_totals = {}
        for e in current_expenses:
            cat_totals[e.category_id] = cat_totals.get(e.category_id, 0) + e.amount
        top_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:5]
        cat_summary = "\n".join([f"- {cat_map.get(cid, 'Unknown')}: {amt}" for cid, amt in top_cats])
        
        change_pct = 0.0
        if prev_spent > 0:
            change_pct = ((total_spent - prev_spent) / prev_spent) * 100
        
        if not self.provider:
            return None

        prompt = f"""
        Act as a brutal but helpful Personal CFO. Audit the user's finances for {month_str}.
        
        Data:
        - Total Spent: {total_spent} (Diff vs last month: {change_pct:.1f}%)
        - Total Income: {total_income}
        - Top Spending:
        {cat_summary}
        
        Task:
        Provide a JSON report with:
        1. "grade": A/B/C/D/F based on savings rate and spending control.
        2. "leakage": Identify 1 potential waste of money based on top categories (infer if unsure, e.g. "Dining Out is high").
        3. "inflation_check": Comment on if spending went up meaningfully.
        4. "action_item": One specific thing to do next month.
        
        Output JSON ONLY:
        {{
            "grade": "B",
            "leakage": "You spent 5000 on Coffee, which is 10% of your income.",
            "inflation_check": "Spending is flat month-over-month.",
            "action_item": "Set a hard limit on Dining Out."
        }}
        """
        
        try:
            analysis_json = json.dumps(self.provider.generate_json(prompt, temperature=0.5))
            
            existing = self.session.exec(select(MonthlyReport).where(
                MonthlyReport.user_id == self.user_id,
                MonthlyReport.month == month_str
            )).first()
            
            if existing:
                existing.total_spent = total_spent
                existing.total_income = total_income
                existing.savings_rate = savings_rate
                existing.analysis = analysis_json
                self.session.add(existing)
                report = existing
            else:
                report = MonthlyReport(
                    user_id=self.user_id,
                    month=month_str,
                    total_spent=total_spent,
                    total_income=total_income,
                    savings_rate=savings_rate,
                    analysis=analysis_json
                )
                self.session.add(report)
                
            self.session.commit()
            return report

        except Exception as e:
            print(f"Error generating audit: {e}")
            return None
