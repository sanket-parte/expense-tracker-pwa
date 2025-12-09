from datetime import timedelta
from typing import Optional
from fastapi import HTTPException
from sqlmodel import Session
from backend.adapters.database.repositories.user_repository import UserRepository
from backend.adapters.database.models import User
from backend.api.schemas.all import UserCreate, UserUpdate
from backend.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self, session: Session):
        self.repository = UserRepository(session)
        self.session = session

    def register_user(self, user_create: UserCreate) -> User:
        if self.repository.get_by_email(user_create.email):
             raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user_create.password)
        db_user = User(email=user_create.email, password_hash=hashed_password, full_name=user_create.full_name)
        return self.repository.create(db_user)

    def authenticate_user(self, email: str, password: str) -> dict:
        user = self.repository.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
             return None
        
        access_token_expires = timedelta(minutes=60*24) # 1 day
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    def update_user(self, user: User, user_update: UserUpdate) -> User:
        update_data = {}
        if user_update.full_name:
            update_data["full_name"] = user_update.full_name
        
        if user_update.password:
            update_data["password_hash"] = get_password_hash(user_update.password)
        
        return self.repository.update(user, update_data)
