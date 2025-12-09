from fastapi import APIRouter, Depends
from sqlmodel import Session
from backend.api.deps import get_db as get_session
from backend.adapters.database.models import User
from backend.api.deps import get_current_user
from backend.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(session)
    return service.get_dashboard_stats(current_user.id)

@router.get("/predict-category")
def predict_category(
    title: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(session)
    category_id = service.predict_category(current_user.id, title)
    return {"category_id": category_id}

@router.get("/monthly-report")
def get_monthly_report(
    month: str, # Format YYYY-MM
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # This logic is also available in ReportService, but seems to be used here too.
    # We can delegate to ReportService for consistency if preferred, or keep in AnalyticsService.
    # Given the implementation, ReportService has this logic. Let's use ReportService here to be DRY.
    from backend.services.report_service import ReportService
    service = ReportService(session)
    return service.get_monthly_stats_report(current_user.id, month)

@router.post("/ask")
def ask_ai(
    query: dict, # expect {"q": "Show me food spend"}
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from backend.services.report_service import ReportService
    service = ReportService(session)
    
    q_text = query.get("q")
    if not q_text:
        return {"answer": "Please provide a question."}
    
    return service.process_ai_query(current_user.id, q_text)

