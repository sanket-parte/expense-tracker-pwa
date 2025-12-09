from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel
from backend.adapters.database.models import User, UserSettings, AISuggestion
from backend.api.deps import get_db as get_session
from backend.api.deps import get_current_user
from backend.adapters.ai import service as ai_service

router = APIRouter(prefix="/ai", tags=["ai"])

class SettingsUpdate(BaseModel):
    openai_api_key: str
    ai_provider: str = "openai"

class SuggestionResponse(BaseModel):
    id: int
    content: str
    created_at: str

class ParseRequest(BaseModel):
    text: str

@router.post("/parse")
async def parse_expense(
    request: ParseRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Parse natural language text into expense details."""
    try:
        service = ai_service.AIService(session, current_user.id)
        parsed_data = service.parse_expense_natural_language(request.text)
        return {"parsed": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recurring/detect")
async def detect_recurring(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Detect potential recurring expenses."""
    service = ai_service.AIService(session, current_user.id)
    suggestions = service.detect_recurring_expenses()
    return {"suggestions": suggestions}

@router.get("/budgets/forecast")
async def get_budget_forecast(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get AI forecasts for budgets at risk."""
    service = ai_service.AIService(session, current_user.id)
    forecasts = service.generate_budget_forecast()
    return {"forecasts": forecasts}

@router.post("/settings")
async def save_settings(
    settings_data: SettingsUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Save or update API key settings for the user."""
    user_settings = session.exec(select(UserSettings).where(UserSettings.user_id == current_user.id)).first()
    
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
    
    user_settings.openai_api_key = settings_data.openai_api_key
    user_settings.ai_provider = settings_data.ai_provider
    
    session.add(user_settings)
    session.commit()
    session.refresh(user_settings)
    return {"message": "Settings saved successfully"}

@router.get("/settings")
async def get_settings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get current user settings (masked key)."""
    user_settings = session.exec(select(UserSettings).where(UserSettings.user_id == current_user.id)).first()
    if not user_settings:
        return {"openai_api_key": None, "ai_provider": "openai"}
        
    masked_key = None
    if user_settings.openai_api_key:
        masked_key = user_settings.openai_api_key[:4] + "..." + user_settings.openai_api_key[-4:]
        
    return {
        "openai_api_key": masked_key,
        "is_set": bool(user_settings.openai_api_key),
        "ai_provider": user_settings.ai_provider
    }

@router.post("/generate")
async def generate_suggestion(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Trigger generation of a new suggestion."""
    service = ai_service.AIService(session, current_user.id)
    suggestion_text = service.generate_financial_advice()
    return {"suggestion": suggestion_text}

@router.get("/suggestion")
async def get_latest_suggestion(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get the most recent suggestion without regenerating."""
    suggestion = session.exec(
        select(AISuggestion)
        .where(
            AISuggestion.user_id == current_user.id,
            AISuggestion.content.not_like("BUDGET_ALERT:%")
        )
        .order_by(AISuggestion.created_at.desc())
    ).first()
    
    if not suggestion:
        return {"suggestion": None}
        
    return {"suggestion": {
        "id": suggestion.id,
        "content": suggestion.content,
        "created_at": suggestion.created_at.isoformat()
    }}

from fastapi import UploadFile, File

@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Scan a receipt image and extract expense details."""
    try:
        contents = await file.read()
        service = ai_service.AIService(session, current_user.id)
        # Pass content type (e.g. image/jpeg)
        extracted_data = service.extract_receipt_data(contents, media_type=file.content_type or "image/jpeg")
        return {"parsed": extracted_data}
    except Exception as e:
        print(f"Receipt scan error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
