import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User, SavingsGoal, Job
from app.dependencies import get_current_user
from app.services.llm_client import get_goal_suggestion

router = APIRouter(prefix="/goals", tags=["goals"])

class GoalRequest(BaseModel):
    target_amount: float

class GoalResponse(BaseModel):
    target_amount: float
    current_progress: float
    suggestion_text: str

def _get_current_weekly_earnings(user_id: str, db: Session) -> float:
    today = datetime.datetime.utcnow()
    week_start = today - datetime.timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    jobs = db.query(Job).filter(Job.user_id == user_id, Job.start_time >= week_start).all()
    return sum(j.fare_amount for j in jobs)

@router.get("", response_model=GoalResponse)
def get_goal(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="No goal set")
    
    current = _get_current_weekly_earnings(current_user.id, db)
    return GoalResponse(
        target_amount=goal.target_amount,
        current_progress=current,
        suggestion_text=goal.suggestion_text or ""
    )

@router.post("", response_model=GoalResponse)
def set_goal(req: GoalRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current = _get_current_weekly_earnings(current_user.id, db)
    suggestion = get_goal_suggestion(req.target_amount, current)

    goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).first()
    if not goal:
        goal = SavingsGoal(user_id=current_user.id)
        db.add(goal)
    
    goal.target_amount = req.target_amount
    goal.current_progress = current
    goal.suggestion_text = suggestion
    db.commit()

    return GoalResponse(
        target_amount=goal.target_amount,
        current_progress=current,
        suggestion_text=suggestion
    )
