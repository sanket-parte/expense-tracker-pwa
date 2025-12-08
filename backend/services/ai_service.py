import os
from datetime import datetime, timedelta
from typing import List, Optional
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
