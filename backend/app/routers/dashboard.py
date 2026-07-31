"""Dashboard router — weekly summary aggregation."""
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, FairnessResult, Platform, Verdict
from app.schemas import DashboardWeekly, PlatformSplit, JobOut, DailyEarning
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/weekly", response_model=DashboardWeekly)
def get_weekly_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id

    # Current week: Mon 00:00 to Sun 23:59
    today = datetime.datetime.utcnow()
    week_start = today - datetime.timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + datetime.timedelta(days=6, hours=23, minutes=59, seconds=59)

    # All jobs this week
    jobs = (
        db.query(Job)
        .filter(Job.user_id == user_id)
        .filter(Job.start_time >= week_start - datetime.timedelta(days=7))  # last 7 days
        .order_by(Job.start_time.desc())
        .all()
    )

    total_earnings = sum(j.fare_amount for j in jobs)
    total_hours = sum(j.duration_minutes for j in jobs) / 60.0
    flagged_count = sum(
        1 for j in jobs
        if j.fairness_result and j.fairness_result.verdict in [Verdict.underpaid, Verdict.borderline]
    )
    
    fairness_score = 100
    if len(jobs) > 0:
        fairness_score = int(((len(jobs) - flagged_count) / len(jobs)) * 100)

    # Calculate daily earnings (Mon-Sun)
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_map = {d: {"amount": 0, "underpaid": False} for d in day_names}
    
    for j in jobs:
        day_str = j.start_time.strftime("%a")
        if day_str in daily_map:
            daily_map[day_str]["amount"] += j.fare_amount
            if j.fairness_result and j.fairness_result.verdict in [Verdict.underpaid, Verdict.borderline]:
                daily_map[day_str]["underpaid"] = True

    daily_earnings = [
        DailyEarning(day=d, amount=daily_map[d]["amount"], underpaid=daily_map[d]["underpaid"])
        for d in day_names
    ]

    # Per-platform split
    platforms = db.query(Platform).filter(Platform.user_id == user_id).all()
    platform_split = []
    for p in platforms:
        p_jobs = [j for j in jobs if j.platform_id == p.id]
        p_flagged = sum(
            1 for j in p_jobs
            if j.fairness_result and j.fairness_result.verdict in [Verdict.underpaid, Verdict.borderline]
        )
        platform_split.append(PlatformSplit(
            platform_id=p.id,
            platform_name=p.platform_name,
            platform_type=p.platform_type.value,
            total_earnings=sum(j.fare_amount for j in p_jobs),
            total_jobs=len(p_jobs),
            flagged_count=p_flagged,
        ))

    recent_start = today - datetime.timedelta(hours=24)
    recent_jobs = [j for j in jobs if j.start_time and j.start_time >= recent_start]
    recent_hours = sum(j.duration_minutes for j in recent_jobs) / 60.0
    
    is_fatigued = recent_hours > 10
    fatigue_message = "Fatigue Warning: You've logged over 10 hours of trips in the last 24 hours. Please take a break to stay safe on the road." if is_fatigued else None

    return DashboardWeekly(
        week_start=week_start,
        week_end=week_end,
        total_earnings=round(total_earnings, 2),
        total_hours=round(total_hours, 1),
        total_jobs=len(jobs),
        flagged_count=flagged_count,
        platform_split=platform_split,
        recent_jobs=jobs[:5],
        is_fatigued=is_fatigued,
        fatigue_message=fatigue_message,
        daily_earnings=daily_earnings,
        fairness_score=fairness_score,
    )
