from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List

from backend.api.deps import get_db as get_session
from backend.adapters.database.models import User
from backend.api.schemas.all import CategoryCreate, CategoryRead
from backend.api.deps import get_current_user
from backend.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategoryRead)
def create_category(
    *, 
    session: Session = Depends(get_session), 
    category: CategoryCreate,
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(session)
    new_category = service.create_category(category, user_id=current_user.id)
    
    if not new_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    return new_category

@router.get("/", response_model=List[CategoryRead])
def read_categories(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(session)
    return service.get_categories(user_id=current_user.id)

@router.delete("/{category_id}")
def delete_category(
    *, 
    session: Session = Depends(get_session), 
    category_id: int,
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(session)
    success = service.delete_category(category_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"ok": True}
