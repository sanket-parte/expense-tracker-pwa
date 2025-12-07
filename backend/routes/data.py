from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
import csv
import io
from datetime import datetime

from database import get_session
from models import Expense, User, Category
from auth import get_current_user
from sqlmodel import or_

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
    
    # 2. Get existing categories (User + Default)
    existing_cats_query = select(Category.name).where(
         or_(Category.user_id == None, Category.user_id == current_user.id)
    )
    existing_category_names = set(session.exec(existing_cats_query).all())
    
    # 3. Create missing categories
    new_categories_count = 0
    for cat_name in import_categories:
        if cat_name and cat_name not in existing_category_names:
            new_cat = Category(
                name=cat_name, 
                user_id=current_user.id, 
                color="#64748b" # Default color
            )
            session.add(new_cat)
            existing_category_names.add(cat_name) # Add to set to avoid dups if dup in csv (set handles it)
            new_categories_count += 1
            
    # Commit categories first so they exist if needed (though not strictly required for foreign keys since we use string for now)
    try:
        session.commit()
    except Exception as e:
        print(f"Error creating categories: {e}")
        session.rollback()

    # 4. Create Expenses
    count = 0
    for row in rows:
        try:
            date_str = row.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
            expense = Expense(
                title=row.get('title', 'Untitled'),
                amount=float(row.get('amount', 0)),
                category=row.get('category', 'Uncategorized').strip(),
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
        writer.writerow([
            expense.id,
            expense.title,
            expense.amount,
            expense.category,
            expense.type,
            expense.date.strftime('%Y-%m-%d'),
            expense.created_at.isoformat()
        ])
        
    output.seek(0)
    
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=expenses.csv"
    return response
