import os
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from openai import OpenAI

from models import Expense, UserSettings, AISuggestion, Category

def get_recent_expenses_text(session: Session, user_id: int, days: int = 365) -> str:
    """Fetches recent expenses and formats them as a text summary."""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    expenses = session.exec(
        select(Expense).where(Expense.user_id == user_id, Expense.date >= cutoff_date)
    ).all()
    
    if not expenses:
        return f"No expenses recorded in the last {days} days."

    # Group by category for better summary
    category_totals = {}
    total_spent = 0.0
    
    # Fetch categories to map IDs to names
    categories = session.exec(select(Category).where(Category.user_id == user_id)).all()
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

def generate_suggestion(session: Session, user_id: int) -> str:
    """Generates a spending suggestion using OpenAI based on user data."""
    
    # 1. Get User Settings for API Key
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    
    if not settings or not settings.openai_api_key:
        return "Please configure your OpenAI API Key in Settings to receive AI suggestions."
        
    api_key = settings.openai_api_key
    
    # 2. Get Expense Data
    expense_data = get_recent_expenses_text(session, user_id, days=365)
    
    # 3. Call OpenAI
    client = OpenAI(api_key=api_key)
    
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
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful financial analyst who provides specific, personalized advice based on actual data."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=450,
            temperature=0.7
        )
        
        suggestion_text = response.choices[0].message.content.strip()
        
        # 4. Save Suggestion
        new_suggestion = AISuggestion(
            user_id=user_id,
            content=suggestion_text
        )
        session.add(new_suggestion)
        session.commit()
        session.refresh(new_suggestion)
        
        return suggestion_text
        
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return f"Error generating suggestion: {str(e)}"

def parse_expense_natural_language(session: Session, user_id: int, text: str) -> Dict[str, Any]:
    """Parses natural language text into structured expense data."""
    
    # 1. Get User Settings
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    if not settings or not settings.openai_api_key:
        raise ValueError("OpenAI API Key not configured")
        
    api_key = settings.openai_api_key
    
    # 2. Get Categories for Context
    categories = session.exec(select(Category).where(Category.user_id == user_id)).all()
    category_list = ", ".join([f"{c.id}:{c.name}" for c in categories])
    
    # 3. Call OpenAI
    client = OpenAI(api_key=api_key)
    
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
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a precise data extraction assistant that outputs raw JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=200
        )
        
        content = response.choices[0].message.content.strip()
        # Clean up if markdown code blocks are used despite instructions
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        return json.loads(content.strip())
        
    except Exception as e:
        print(f"Error parsing expense: {e}")
        raise e


def detect_recurring_expenses(session: Session, user_id: int) -> List[Dict[str, Any]]:
    """Analyzes recent transactions to find recurring expenses."""
    from models import RecurringExpense
    
    # 1. Get recent expenses
    expenses = session.exec(
        select(Expense)
        .where(Expense.user_id == user_id)
        .order_by(Expense.date.desc())
        .limit(100)
    ).all()
    
    if len(expenses) < 5:
        return []

    # 2. Get existing recurring to exclude
    existing = session.exec(select(RecurringExpense).where(RecurringExpense.user_id == user_id)).all()
    existing_text = ", ".join([f"{r.title} ({r.amount})" for r in existing])

    # 3. Format context
    expense_list_text = "\n".join([f"- {e.date}: {e.title} ({e.amount})" for e in expenses])
    
    # 4. Call OpenAI
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    if not settings or not settings.openai_api_key:
        return []
        
    client = OpenAI(api_key=settings.openai_api_key)
    
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
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=300
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print(f"Error detecting recurring: {e}")
        return []

def generate_budget_forecast(session: Session, user_id: int) -> List[Dict[str, Any]]:
    """Forecasting logic to predict budget overspending with caching."""
    from models import Budget, AISuggestion
    import calendar
    
    # 1. Get Budgets
    budgets = session.exec(select(Budget).where(Budget.user_id == user_id)).all()
    if not budgets:
        return []
        
    forecasts = []
    
    today = datetime.now()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    day_of_month = today.day
    
    remaining_days = days_in_month - day_of_month
    
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    client = OpenAI(api_key=settings.openai_api_key) if (settings and settings.openai_api_key) else None

    # Pre-fetch recent suggestions for cache check (last 24 hours)
    cutoff = datetime.utcnow() - timedelta(hours=24)
    recent_suggestions = session.exec(
        select(AISuggestion)
        .where(
            AISuggestion.user_id == user_id, 
            AISuggestion.created_at >= cutoff,
            AISuggestion.content.like("BUDGET_ALERT:%")
        )
    ).all()
    
    # Create a map for easy lookup: category_id -> advice
    cache_map = {}
    for s in recent_suggestions:
        parts = s.content.split(":", 2)
        if len(parts) == 3:
            cat_id = int(parts[1])
            advice = parts[2]
            cache_map[cat_id] = advice

    for budget in budgets:
        # Calculate spent for this month/period
        start_date = datetime(today.year, today.month, 1)
        spent = session.exec(
            select(Expense)
            .where(
                Expense.category_id == budget.category_id,
                Expense.date >= start_date,
                Expense.user_id == user_id
            )
        ).all()
        spent_amount = sum(e.amount for e in spent)
        
        # Linear Projection
        daily_avg = spent_amount / day_of_month if day_of_month > 0 else 0
        projected_total = daily_avg * days_in_month
        
        # Only care if projected to exceed budget by > 5% AND not already exceeded
        is_at_risk = projected_total > (budget.amount * 1.05)
        
        if is_at_risk:
            # Check cache first
            if budget.category_id in cache_map:
                advice = cache_map[budget.category_id]
            else:
                advice = "You are spending too fast."
                if client:
                    try:
                        prompt = f"""
                        The user has a budget of {budget.amount} for category '{budget.category.name}'.
                        Currently it is day {day_of_month} of {days_in_month}.
                        They have already spent {spent_amount}.
                        Projected spend: {projected_total:.0f}.
                        
                        Give a 1-sentence, encouraging specific tip to help them get back on track.
                        """
                        response = client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[{"role": "user", "content": prompt}],
                            max_tokens=60,
                            temperature=0.7
                        )
                        advice = response.choices[0].message.content.strip()
                        
                        # Cache the advice
                        new_cache = AISuggestion(
                            user_id=user_id,
                            content=f"BUDGET_ALERT:{budget.category_id}:{advice}"
                        )
                        session.add(new_cache)
                        session.commit()
                        
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
