from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Optional
from backend.adapters.database.models import User
from backend.api.deps import get_db as get_session
from backend.api.deps import get_current_user
from backend.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/generate")
def generate_report(
    month: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Generate or regenerate audit report for a month (YYYY-MM)."""
    service = ReportService(session)
    report = service.generate_report(current_user.id, month)
    if not report:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    return report

@router.get("/")
def get_reports(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all past reports."""
    service = ReportService(session)
    return service.get_all_reports(current_user.id)

@router.get("/latest")
def get_latest_report(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get the most recent report."""
    service = ReportService(session)
    return service.get_latest_report(current_user.id)

@router.get("/{month}")
def get_report_by_month(
    month: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get report for a specific month (YYYY-MM)."""
    service = ReportService(session)
    return service.get_report_by_month(current_user.id, month)
