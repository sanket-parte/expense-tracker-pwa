from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from backend.adapters.database.models import User
from backend.api.deps import get_current_user, get_db
from backend.api.schemas.all import UserRead, UserCreate, UserUpdate, Token
from backend.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_db)):
    service = AuthService(session)
    return service.register_user(user)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_db)):
    service = AuthService(session)
    token = service.authenticate_user(form_data.username, form_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserRead)
def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_db)):
    service = AuthService(session)
    return service.update_user(current_user, user_update)
