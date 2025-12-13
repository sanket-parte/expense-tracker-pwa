
from datetime import timedelta
from typing import Any
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from backend.adapters.database.models import User
from backend.api.deps import get_current_user, get_db
from backend.api.schemas.all import UserRead, UserCreate, UserUpdate, Token
from backend.api.schemas.all import UserRead, UserCreate, UserUpdate, Token
from backend.services.auth_service import AuthService
from backend.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_db)):
    if not settings.ENABLE_REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is currently disabled."
        )
    logger.info(f"Attempting to register user with email: {user.email}")
    service = AuthService(session)
    try:
        new_user = service.register_user(user)
        logger.info(f"User registered successfully: {new_user.email}")
        return new_user
    except HTTPException as e:
        logger.warning(f"Registration failed for email {user.email}: {e.detail}")
        raise

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_db)):
    service = AuthService(session)
    logger.info(f"Login attempt for user: {form_data.username}")
    token_data = service.authenticate_user(form_data.username, form_data.password)
    if not token_data:
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info(f"User logged in successfully: {form_data.username}")
    return token_data

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching current user details for user ID: {current_user.id}")
    return current_user

@router.put("/me", response_model=UserRead)
def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_db)):
    service = AuthService(session)
    return service.update_user(current_user, user_update)

@router.get("/config")
def get_auth_config():
    return {"enable_registration": settings.ENABLE_REGISTRATION}
