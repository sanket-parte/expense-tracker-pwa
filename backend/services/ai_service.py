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

def generate_budget_suggestions(session: Session, user_id: int) -> List[Dict[str, Any]]:
    """Analyzes spending history to suggest realistic budgets."""
    from models import Category
    import calendar
    
    # 1. 90-day Spending Analysis
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    expenses = session.exec(
        select(Expense)
        .where(
            Expense.user_id == user_id, 
            Expense.date >= start_date,
            Expense.date <= end_date
        )
    ).all()
    
    if not expenses:
        return []

    # Map Category ID -> List of amounts
    # usage: cat_expenses[1] = [100, 50, 200...]
    cat_expenses = {}
    for e in expenses:
        if e.category_id not in cat_expenses:
            cat_expenses[e.category_id] = []
        cat_expenses[e.category_id].append(e.amount)

    # 2. Calculate Averages (Python side)
    # We want "Monthly Average". 90 days approx 3 months.
    summaries = []
    categories = session.exec(select(Category).where(Category.user_id == user_id)).all()
    cat_map = {c.id: c.name for c in categories}
    
    for cat_id, amounts in cat_expenses.items():
        total_spent = sum(amounts)
        avg_monthly = total_spent / 3.0 # Rough 3-month average
        cat_name = cat_map.get(cat_id, f"Category {cat_id}")
        
        summaries.append({
            "category_id": cat_id,
            "category_name": cat_name,
            "avg_monthly": round(avg_monthly, 2),
            "max_single": max(amounts) if amounts else 0
        })

    # 3. Consult LLM for "Smart Smoothing"
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    
    # helper to inject names back
    def attach_names(items):
        for item in items:
            item["category_name"] = cat_map.get(item["category_id"], "Unknown")
        return items

    if not settings or not settings.openai_api_key:
        # Fallback: Just return raw averages if no API key
        results = [{
            "category_id": s["category_id"],
            "amount": int(s["avg_monthly"]),
            "reason": "Based on 3-month average."
        } for s in summaries]
        return attach_names(results)

    client = OpenAI(api_key=settings.openai_api_key)
    
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
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, # Low temp for consistency
            max_tokens=500
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        suggestions = json.loads(content.strip())
        return attach_names(suggestions)
        
    except Exception as e:
        print(f"Error generating budget suggestions: {e}")
        # Fallback to local math
        results = [{
            "category_id": s["category_id"],
            "amount": int(s["avg_monthly"] * 1.1), # +10%
            "reason": "Fallback: 3-month average + 10%"
        } for s in summaries]
        return attach_names(results)

def auto_categorize_expenses(session: Session, user_id: int) -> int:
    """Finds uncategorized expenses and uses AI to assign them to existing categories."""
    from models import Category
    
    # 1. Find uncategorized expenses
    # Check for both NULL category_id OR category_id that links to "Uncategorized" if you have one.
    # For now, we assume standard "Uncategorized" might be NULL or we look for ID 0 if used.
    # Best practice: Look for NULL first.
    expenses = session.exec(
        select(Expense)
        .where(Expense.user_id == user_id, Expense.category_id == None)
        .limit(20) # Process in chunks to avoid timeouts
    ).all()
    
    if not expenses:
        return 0
        
    # 2. Get available categories
    categories = session.exec(select(Category).where(Category.user_id == user_id)).all()
    if not categories:
        return 0
        
    cat_map = {c.id: c.name for c in categories}
    cat_list_str = ", ".join([f"{c.id}:{c.name}" for c in categories])
    
    # 3. Prepare Batch Prompt
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
    
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    if not settings or not settings.openai_api_key:
        return 0
        
    client = OpenAI(api_key=settings.openai_api_key)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=500
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        data = json.loads(content.strip())
        mappings = data.get("mappings", [])
        
        count = 0
        for m in mappings:
            # Update DB
            exp_id = m.get("id")
            cat_id = m.get("category_id")
            if exp_id and cat_id and cat_id in cat_map:
                expense = session.get(Expense, exp_id)
                if expense and expense.user_id == user_id:
                    expense.category_id = cat_id
                    session.add(expense)
                    count += 1
        
        session.commit()
        return count
        
    except Exception as e:
        print(f"Error auto-categorizing: {e}")
        return 0

def process_natural_language_query(session: Session, user_id: int, query_text: str) -> Dict[str, Any]:
    """
    Translates natural language questions into structured database queries.
    Strategy: Text -> SQLModel parameters (NOT raw SQL) to be safe.
    """
    from models import Category
    from sqlalchemy import func
    
    # 1. Get Categories for context
    categories = session.exec(select(Category).where(Category.user_id == user_id)).all()
    cat_list_str = ", ".join([c.name for c in categories])
    
    current_date = datetime.now().strftime("%Y-%m-%d")

    # 2. Schema Prompt (Context-Free)
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
    
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    if not settings or not settings.openai_api_key:
        return {"error": "API Key missing"}
        
    client = OpenAI(api_key=settings.openai_api_key)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a precise query generator that outputs raw JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=200
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        params = json.loads(content.strip())
        filters = params.get("filters", {})
        op = params.get("operation")
        
        # 3. Execute Query Safely (Using SQLModel/SQLAlchemy)
        query = select(Expense).where(Expense.user_id == user_id)
        
        # Apply filters
        if filters.get("category_name"):
            # Find ID
            cat = session.exec(select(Category).where(Category.user_id == user_id, Category.name.ilike(filters["category_name"]))).first()
            if cat:
                query = query.where(Expense.category_id == cat.id)
                
        if filters.get("start_date"):
            query = query.where(Expense.date >= datetime.strptime(filters["start_date"], "%Y-%m-%d"))
            
        if filters.get("end_date"):
            # inclusive end date? usually we do < next_day, but let's assume end_of_day or just simple date
            # Let's treat it as <= end_date 23:59:59 if needed, or simple date comparison
            query = query.where(Expense.date <= datetime.strptime(filters["end_date"], "%Y-%m-%d"))
            
        if filters.get("merchant_name"):
            query = query.where(Expense.title.ilike(f"%{filters['merchant_name']}%"))

        # 4. Compute Result
        result_value = 0
        
        if op == "total_spend":
            # Sum
            expenses = session.exec(query).all()
            result_value = sum(e.amount for e in expenses)
            formatted_result = f"₹{result_value:.2f}"
            
        elif op == "count_transactions":
            expenses = session.exec(query).all()
            result_value = len(expenses)
            formatted_result = str(result_value)
            
        elif op == "average_spend":
            expenses = session.exec(query).all()
            if expenses:
                result_value = sum(e.amount for e in expenses) / len(expenses)
            formatted_result = f"₹{result_value:.2f}"
        else:
            return {"answer": "I didn't understand the operation."}

        # 5. Format Answer
        template = params.get("human_readable_answer_template", "The answer is {value}.")
        final_answer = template.replace("{value}", formatted_result)
        
        return {"answer": final_answer, "debug_query": params}

    except Exception as e:
        print(f"Error processing NL query: {e}")
        return {"answer": "Sorry, I couldn't process that question."}


def generate_spending_challenges(session: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Generates 3 personalized spending challenges for the next 7 days.
    Look for categories with high spend recently.
    """
    from models import Category, Challenge
    
    # 1. Analyze last 30 days
    cutoff = datetime.utcnow() - timedelta(days=30)
    expenses = session.exec(select(Expense).where(Expense.user_id == user_id, Expense.date >= cutoff)).all()
    
    if not expenses:
        return []
        
    categories = session.exec(select(Category).where(Category.user_id == user_id)).all()
    cat_map = {c.id: c.name for c in categories}
    
    # Summarize by category
    cat_totals = {}
    for e in expenses:
        cat_totals[e.category_id] = cat_totals.get(e.category_id, 0.0) + e.amount
        
    # Top 3 categories
    sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    
    context_data = []
    for cat_id, total in sorted_cats:
        name = cat_map.get(cat_id, "Unknown")
        avg_weekly = total / 4.0
        context_data.append(f"- {name}: spent {total} last 30 days (~{avg_weekly:.0f}/week)")
        
    context_str = "\n".join(context_data)
    
    # 2. Call OpenAI
    settings = session.exec(select(UserSettings).where(UserSettings.user_id == user_id)).first()
    if not settings or not settings.openai_api_key:
        return []
        
    client = OpenAI(api_key=settings.openai_api_key)
    
    prompt = f"""
    Act as a gamification expert for finance.
    Based on the user's recent heavy spending, generate 3 specific "Spend-Less Challenges" for the UPCOMING WEEK.
    
    User's Heavy Spending (Last 30 days):
    {context_str}
    
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
    - Category Name must match one from the list exactly (or be close enough to map).
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=400
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        suggestions = json.loads(content.strip())
        
        # 3. Create Pending Challenges
        today = datetime.now()
        next_week = today + timedelta(days=7)
        
        created_challenges = []
        name_to_id = {c.name.lower(): c.id for c in categories}
        
        for s in suggestions:
            # Try to map category
            cat_name = s.get("category_name", "").lower()
            cat_id = name_to_id.get(cat_name)
            
            # If AI hallucinated a category we don't have, find closest or skip
            # specific mapping logic is simple here: exact match insensitive
            if cat_id:
                # Check duplicates (pending)
                existing = session.exec(select(Challenge).where(
                    Challenge.user_id == user_id, 
                    Challenge.status == 'pending', 
                    Challenge.category_id == cat_id
                )).first()
                if existing:
                    continue

                new_chall = Challenge(
                    user_id=user_id,
                    title=s['title'],
                    description=s['description'],
                    category_id=cat_id,
                    target_amount=float(s['target_amount']),
                    current_amount=0.0,
                    start_date=today,
                    end_date=next_week,
                    status="pending"
                )
                session.add(new_chall)
                created_challenges.append(s)
                
        session.commit()
        return created_challenges

    except Exception as e:
        print(f"Error generating challenges: {e}")
        return []



