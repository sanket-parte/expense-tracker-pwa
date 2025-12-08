from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
import csv
import io
from datetime import datetime

from database import get_session
from models import Expense, User, Category, Budget, RecurringExpense, AISuggestion, UserSettings
from auth import get_current_user
from sqlmodel import or_, delete

router = APIRouter(prefix="/data", tags=["data"])

@router.post("/import")
async def import_expenses(
    file: UploadFile = File(...), 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")
    
    content = await file.read()
    try:
        decoded = content.decode('utf-8')
    except UnicodeDecodeError:
        decoded = content.decode('latin-1')
        
    # Read CSV into list first to process categories
    csv_reader = csv.DictReader(io.StringIO(decoded))
    rows = list(csv_reader)
    
    # 1. Identify unique categories in import
    import_categories = {row.get('category', 'Uncategorized').strip() for row in rows}
    if '' in import_categories:
        import_categories.remove('')
    if 'Uncategorized' not in import_categories: # Ensure Uncategorized exists if needed
        import_categories.add('Uncategorized')

    # 2. Get existing categories for this user
    existing_cats_query = select(Category).where(
         or_(Category.user_id == None, Category.user_id == current_user.id)
    )
    existing_categories = session.exec(existing_cats_query).all()
    
    # Map name -> id
    category_map = {cat.name.lower(): cat.id for cat in existing_categories}
    
    # 3. Create missing categories
    new_categories_count = 0
    for cat_name in import_categories:
        clean_name = cat_name.strip()
        if clean_name.lower() not in category_map:
            new_cat = Category(
                name=clean_name, 
                user_id=current_user.id, 
                color="#64748b" # Default color
            )
            session.add(new_cat)
            session.flush() # Flush to get ID
            session.refresh(new_cat)
            category_map[clean_name.lower()] = new_cat.id
            new_categories_count += 1
            
    try:
        session.commit()
    except Exception as e:
        print(f"Error creating categories: {e}")
        session.rollback()
        # Re-fetch map if commit failed? Or just error out. 
        # For simplicity, if category creation fails, we might fail hard or partial imports.
        # Let's assume commit succeeded for now or we will error later on FK.

    # 4. Create Expenses
    count = 0
    for row in rows:
        try:
            date_str = row.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
            
            # Helper to parse amount safely
            amount_str = row.get('amount', '0').replace(',', '')
            try:
                 amount = float(amount_str)
            except ValueError:
                 amount = 0.0

            cat_name = row.get('category', 'Uncategorized').strip()
            cat_id = category_map.get(cat_name.lower())
            
            # Fallback to Uncategorized if for some reason not found (shouldn't happen due to step 3)
            if not cat_id:
                 # Find ID of "Uncategorized" or take any
                 cat_id = list(category_map.values())[0] if category_map else None

            # Check if category_id is valid
            if not cat_id:
                print("No category ID found, skipping row")
                continue

            expense = Expense(
                title=row.get('title', 'Untitled'),
                amount=amount,
                category_id=cat_id,
                type=row.get('type', 'expense'),
                date=datetime.strptime(date_str, '%Y-%m-%d'),
                user_id=current_user.id
            )
            session.add(expense)
            count += 1
        except Exception as e:
            print(f"Skipping row due to error: {e}")
            continue
            
    session.commit()
    return {"message": f"Successfully imported {count} expenses and created {new_categories_count} new categories."}

@router.get("/export")
def export_expenses(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    expenses = session.exec(
        select(Expense)
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.date.desc())
    ).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['id', 'title', 'amount', 'category', 'type', 'date', 'created_at'])
    
    for expense in expenses:
        category_name = expense.category.name if expense.category else "Uncategorized"
        writer.writerow([
            expense.id,
            expense.title,
            expense.amount,
            category_name,
            expense.type,
            expense.date.strftime('%Y-%m-%d'),
            expense.created_at.isoformat()
        ])
        
    output.seek(0)
    
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=expenses.csv"
    return response

@router.get("/export/json")
def export_data_json(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    expenses = session.exec(
        select(Expense)
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.date.desc())
    ).all()
    
    # Manually serialize to avoid circular deps or lazy loading issues if just returning objects
    data = []
    for expense in expenses:
        data.append({
            "id": expense.id,
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category.name if expense.category else "Uncategorized",
            "type": expense.type,
            "date": expense.date.isoformat(),
            "created_at": expense.created_at.isoformat()
        })
        
    return data

@router.delete("/clear")
def clear_data(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Clear all data for the current user."""
    
    print(f"Clearing data for user {current_user.id}")
    try:
        # Delete dependent data first
        session.exec(delete(Expense).where(Expense.user_id == current_user.id))
        session.exec(delete(Budget).where(Budget.user_id == current_user.id))
        session.exec(delete(RecurringExpense).where(RecurringExpense.user_id == current_user.id))
        session.exec(delete(AISuggestion).where(AISuggestion.user_id == current_user.id))
        session.exec(delete(UserSettings).where(UserSettings.user_id == current_user.id))
        
        # Delete custom categories
        session.exec(delete(Category).where(Category.user_id == current_user.id))
        
        session.commit()
        print("Data cleared successfully")
        return {"message": "All data cleared successfully"}
    except Exception as e:
        print(f"Error clearing data: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
