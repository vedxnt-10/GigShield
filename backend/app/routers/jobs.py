"""Jobs router — CRUD + fairness check trigger."""
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, FairnessResult, FairRateBenchmark, Platform, Verdict, PlatformType, CityTier, JobSource, WeeklySummary
from app.schemas import JobCreate, JobOut, JobScanResponse
from app.services.fairness_engine import run_fairness_check
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/jobs", tags=["jobs"])

# Real OCR powered by Gemini
from app.services.llm_client import extract_job_receipt, get_safety_score

def _invalidate_weekly_insight(user_id: str, db: Session):
    """Clear the cached weekly insight so it regenerates with the new job data."""
    today = datetime.datetime.utcnow()
    week_start = today - datetime.timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    db.query(WeeklySummary).filter(
        WeeklySummary.user_id == user_id,
        WeeklySummary.week_start >= week_start
    ).delete()
    db.commit()


def _auto_fairness_check(job: Job, db: Session):
    """Run fairness engine automatically after job creation."""
    platform = db.query(Platform).filter(Platform.id == job.platform_id).first()
    if not platform:
        return

    user = job.user
    city_tier = user.city_tier if user else CityTier.tier2

    benchmark = db.query(FairRateBenchmark).filter_by(
        platform_type=platform.platform_type,
        city_tier=city_tier,
    ).first()

    if not benchmark:
        return

    result_data = run_fairness_check(job, benchmark)
    fairness = FairnessResult(
        job_id=job.id,
        benchmark_id=benchmark.id,
        expected_pay=result_data["expected_pay"],
        actual_pay=result_data["actual_pay"],
        verdict=Verdict(result_data["verdict"]),
        reason_text=result_data["reason_text"],
    )
    db.add(fairness)
    db.commit()
    db.refresh(fairness)
    return fairness


@router.post("", response_model=JobOut, status_code=201)
def create_job(body: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    job = Job(
        user_id=user_id,
        platform_id=body.platform_id,
        source=JobSource(body.source),
        fare_amount=body.fare_amount,
        distance_km=body.distance_km,
        start_time=body.start_time,
        end_time=body.end_time,
        duration_minutes=body.duration_minutes,
        area_tag=body.area_tag,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Auto-run fairness check
    _auto_fairness_check(job, db)
    _invalidate_weekly_insight(user_id, db)
    db.refresh(job)
    return job


@router.post("/scan", response_model=JobScanResponse)
async def scan_job(file: UploadFile = File(...)):
    """
    Real OCR scan using Gemini Multimodal capabilities.
    Extracts fare, distance, duration, and platform automatically.
    """
    try:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        # Pass to our Gemini extractor
        data = extract_job_receipt(image_bytes, mime_type)
        data["confidence"] = 0.95 # Gemini is highly confident
        
        return JobScanResponse(**data)
    except Exception as e:
        print(f"[scan_job] OCR failed: {e}")
        # Return a safe fallback if Gemini fails, so the user isn't stuck
        return JobScanResponse(
            fare_amount=0.0,
            distance_km=0.0,
            duration_minutes=0,
            platform_guess="Swiggy",
            confidence=0.0,
            raw_ocr_text=f"Failed to read image: {e}"
        )


@router.get("", response_model=List[JobOut])
def list_jobs(
    platform_id: Optional[str] = None,
    verdict: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    q = db.query(Job).filter(Job.user_id == user_id)
    if platform_id:
        q = q.filter(Job.platform_id == platform_id)
    if verdict:
        q = q.join(FairnessResult).filter(FairnessResult.verdict == verdict)
    jobs = q.order_by(Job.created_at.desc()).all()
    return jobs


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    _invalidate_weekly_insight(current_user.id, db)
    return None

@router.post("/{job_id}/fairness-check")
def rerun_fairness_check(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Delete existing result if any
    existing = db.query(FairnessResult).filter(FairnessResult.job_id == job_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    fairness = _auto_fairness_check(job, db)
    if not fairness:
        raise HTTPException(status_code=400, detail="No benchmark found for this job's platform/city tier")

    return {
        "job_id": job.id,
        "verdict": fairness.verdict,
        "expected_pay": fairness.expected_pay,
        "actual_pay": fairness.actual_pay,
        "reason_text": fairness.reason_text,
    }

@router.get("/{job_id}/safety")
def get_job_safety(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    area = job.area_tag or "Unknown Area"
    time_str = job.start_time.strftime('%I:%M %p') if job.start_time else "Unknown Time"
    
    safety_data = get_safety_score(area, time_str)
    return safety_data
