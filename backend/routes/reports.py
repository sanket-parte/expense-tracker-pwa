from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from models import User, MonthlyReport
from database import get_session
from auth import get_current_user
from services import ai_service
import json

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/generate")
async def generate_report(
    month: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Generate or regenerate audit report for a month (YYYY-MM)."""
    report = ai_service.generate_monthly_audit(session, current_user.id, month)
    if not report:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    # Parse analysis string back to JSON for response
    resp = report.model_dump()
    try:
        resp['analysis'] = json.loads(report.analysis)
    except:
        resp['analysis'] = {}
        
    return resp

@router.get("/")
async def get_reports(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all past reports."""
    reports = session.exec(
        select(MonthlyReport)
        .where(MonthlyReport.user_id == current_user.id)
        .order_by(MonthlyReport.month.desc())
    ).all()
    
    # Process for frontend
    results = []
    for r in reports:
        d = r.model_dump()
        try:
            d['analysis'] = json.loads(r.analysis)
        except:
            d['analysis'] = {}
        results.append(d)
        
    return results

@router.get("/latest")
async def get_latest_report(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get the most recent report."""
    report = session.exec(
        select(MonthlyReport)
        .where(MonthlyReport.user_id == current_user.id)
        .order_by(MonthlyReport.month.desc())
    ).first()
    
    if not report:
        return None
        
    d = report.model_dump()
    try:
        d['analysis'] = json.loads(report.analysis)
    except:
        d['analysis'] = {}
    return d

@router.get("/{month}")
async def get_report_by_month(
    month: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get report for a specific month (YYYY-MM)."""
    report = session.exec(
        select(MonthlyReport)
        .where(
            MonthlyReport.user_id == current_user.id,
            MonthlyReport.month == month
        )
    ).first()
    
    if not report:
        return None
        
    d = report.model_dump()
    try:
        d['analysis'] = json.loads(report.analysis)
    except:
        d['analysis'] = {}
    return d
