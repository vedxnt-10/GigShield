"""Chat router — Gemini-powered chatbot with optional job context."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, ChatMessage
from app.schemas import ChatRequest, ChatResponse
from app.services.llm_client import call_llm, CHATBOT_SYSTEM_PROMPT
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id

    # Build context string if a job_id is provided
    job_context = ""
    if body.job_id:
        job = db.query(Job).filter(Job.id == body.job_id).first()
        if job:
            platform_name = job.platform.platform_name if job.platform else "Unknown"
            job_context = (
                f"\n\nContext — Worker's job:\n"
                f"  Platform: {platform_name}\n"
                f"  Fare paid: Rs {job.fare_amount}\n"
                f"  Distance: {job.distance_km} km, Duration: {job.duration_minutes} min\n"
            )
            if job.fairness_result:
                fr = job.fairness_result
                job_context += (
                    f"  Expected fair rate: Rs {fr.expected_pay}\n"
                    f"  Verdict: {fr.verdict}\n"
                    f"  Reason: {fr.reason_text}\n"
                )
            else:
                job_context += "  Note: No fairness benchmark found for this trip.\n"

    user_message = body.message + job_context

    # Save user message
    db.add(ChatMessage(user_id=user_id, job_id=body.job_id, role="user", content=body.message))
    db.commit()

    # Call Gemini
    reply = call_llm(CHATBOT_SYSTEM_PROMPT, user_message)

    # Save assistant reply
    db.add(ChatMessage(user_id=user_id, job_id=body.job_id, role="assistant", content=reply))
    db.commit()

    return ChatResponse(reply=reply, job_id=body.job_id)
