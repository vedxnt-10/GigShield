"""Complaints router — AI-generated complaint draft from a flagged job."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, ComplaintDraft, Platform
from app.schemas import ComplaintDraftRequest, ComplaintDraftOut
from app.services.llm_client import call_llm, COMPLAINT_DRAFT_SYSTEM_PROMPT
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("/draft", response_model=ComplaintDraftOut, status_code=201)
def draft_complaint(body: ComplaintDraftRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id

    job = db.query(Job).filter(Job.id == body.job_id, Job.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not job.fairness_result:
        raise HTTPException(status_code=400, detail="No fairness result for this job")

    fr = job.fairness_result
    platform = db.query(Platform).filter(Platform.id == job.platform_id).first()
    platform_name = platform.platform_name if platform else "the platform"

    user_content = (
        f"Job date: {job.start_time.strftime('%Y-%m-%d %H:%M')}\n"
        f"Platform: {platform_name}\n"
        f"Trip: {job.distance_km} km, {job.duration_minutes} min\n"
        f"Fare paid: Rs {fr.actual_pay}\n"
        f"Expected fair rate: Rs {fr.expected_pay}\n"
        f"Verdict: {fr.verdict}\n"
        f"Reason: {fr.reason_text}\n"
    )

    draft_text = call_llm(COMPLAINT_DRAFT_SYSTEM_PROMPT, user_content)
    if draft_text.startswith("[GigShield"):
        draft_text = (
            f"{draft_text}\n\n"
            f"Dear {platform_name} Support,\n\n"
            f"I am writing to request a review of my trip on {job.start_time.strftime('%Y-%m-%d %H:%M')}. "
            f"The distance was {job.distance_km} km and it took {job.duration_minutes} minutes. "
            f"I was paid Rs {fr.actual_pay}, but according to standard rates it should be closer to Rs {fr.expected_pay}. "
            f"Could you please review and adjust this fare?\n\n"
            f"Thank you."
        )

    draft = ComplaintDraft(
        user_id=user_id,
        job_id=job.id,
        draft_text=draft_text,
        status="draft",
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@router.get("/{complaint_id}", response_model=ComplaintDraftOut)
def get_complaint(complaint_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    draft = db.query(ComplaintDraft).filter(
        ComplaintDraft.id == complaint_id,
        ComplaintDraft.user_id == current_user.id,
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Complaint draft not found")
    return draft
