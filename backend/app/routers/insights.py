"""Insights router — weekly AI insight (cached in WeeklySummary)."""
import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, WeeklySummary, FairnessResult, Platform, Verdict
from app.schemas import WeeklyInsightResponse
from app.services.llm_client import call_llm, WEEKLY_INSIGHT_SYSTEM_PROMPT
from app.dependencies import get_current_user

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/weekly", response_model=WeeklyInsightResponse)
def get_weekly_insight(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id
    today = datetime.datetime.utcnow()
    week_start = today - datetime.timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    # Check cache
    cached = db.query(WeeklySummary).filter(
        WeeklySummary.user_id == user_id,
        WeeklySummary.week_start == week_start,
    ).first()

    if cached and cached.insight_text:
        return WeeklyInsightResponse(
            week_start=cached.week_start,
            total_earnings=cached.total_earnings,
            total_hours=cached.total_hours,
            flagged_count=cached.flagged_count,
            insight_text=cached.insight_text,
        )

    # Aggregate jobs from last 7 days
    jobs = (
        db.query(Job)
        .filter(Job.user_id == user_id)
        .filter(Job.start_time >= week_start - datetime.timedelta(days=7))
        .all()
    )

    total_earnings = sum(j.fare_amount for j in jobs)
    total_hours = round(sum(j.duration_minutes for j in jobs) / 60.0, 1)
    flagged = [j for j in jobs if j.fairness_result and j.fairness_result.verdict in [Verdict.underpaid, Verdict.borderline]]

    # Night vs day split
    night_earnings = sum(j.fare_amount for j in jobs if j.start_time.hour >= 22 or j.start_time.hour < 6)
    day_earnings = total_earnings - night_earnings

    summary_json = json.dumps({
        "total_earnings": total_earnings,
        "total_hours": total_hours,
        "job_count": len(jobs),
        "flagged_count": len(flagged),
        "night_earnings": night_earnings,
        "day_earnings": day_earnings,
    })

    insight = call_llm(WEEKLY_INSIGHT_SYSTEM_PROMPT, summary_json)

    # Cache it
    summary = WeeklySummary(
        user_id=user_id,
        week_start=week_start,
        total_earnings=total_earnings,
        total_hours=total_hours,
        flagged_count=len(flagged),
        insight_text=insight,
    )
    db.add(summary)
    db.commit()

    return WeeklyInsightResponse(
        week_start=week_start,
        total_earnings=total_earnings,
        total_hours=total_hours,
        flagged_count=len(flagged),
        insight_text=insight,
    )
