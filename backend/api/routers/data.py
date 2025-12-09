from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session
import csv
import io

from backend.api.deps import get_db as get_session
from backend.adapters.database.models import User
from backend.api.deps import get_current_user
from backend.services.import_service import ImportService

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
    service = ImportService(session)
    return service.process_import(content, current_user.id)

@router.get("/export")
def export_expenses(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = ImportService(session)
    expenses = service.get_all_expenses(current_user.id)
    
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
    service = ImportService(session)
    expenses = service.get_all_expenses(current_user.id)
    
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
    service = ImportService(session)
    try:
        service.clear_user_data(current_user.id)
        return {"message": "All data cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

