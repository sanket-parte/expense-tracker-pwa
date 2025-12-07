from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_
from typing import List

from database import get_session
from models import Category, CategoryCreate, CategoryRead, User
from auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategoryRead)
def create_category(
    *, 
    session: Session = Depends(get_session), 
    category: CategoryCreate,
    current_user: User = Depends(get_current_user)
):
    # Check uniqueness for this user
    existing = session.exec(
        select(Category).where(
            Category.name == category.name,
            Category.user_id == current_user.id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    db_category = Category.from_orm(category)
    db_category.user_id = current_user.id
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@router.get("/", response_model=List[CategoryRead])
def read_categories(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Get defaults (user_id is None) and user's categories
    statement = select(Category).where(
        or_(Category.user_id == None, Category.user_id == current_user.id)
    )
    categories = session.exec(statement).all()
    return categories

@router.delete("/{category_id}")
def delete_category(
    *, 
    session: Session = Depends(get_session), 
    category_id: int,
    current_user: User = Depends(get_current_user)
):
    category = session.get(Category, category_id)
    # Only allow deleting user's own categories
    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Category not found or cannot be deleted")
    
    session.delete(category)
    session.commit()
    return {"ok": True}
