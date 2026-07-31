"""Pydantic request/response schemas."""
from __future__ import annotations
import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Auth ───────────────────────────────────────────────────────────────────

class OTPRequest(BaseModel):
    phone_number: str


class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str


class TokenResponse(BaseModel):
    access_token: str
    user_id: str
    display_name: Optional[str] = None


# ── Job ───────────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    platform_id: str
    source: str = "manual"
    fare_amount: float
    distance_km: float
    start_time: datetime.datetime
    end_time: datetime.datetime
    duration_minutes: int
    area_tag: Optional[str] = None


class FairnessResultOut(BaseModel):
    id: str
    job_id: str
    benchmark_id: str
    expected_pay: float
    actual_pay: float
    verdict: str
    reason_text: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class JobOut(BaseModel):
    id: str
    user_id: str
    platform_id: str
    source: str
    fare_amount: float
    distance_km: float
    start_time: datetime.datetime
    end_time: datetime.datetime
    duration_minutes: int
    area_tag: Optional[str]
    created_at: datetime.datetime
    fairness_result: Optional[FairnessResultOut] = None

    class Config:
        from_attributes = True


class JobScanResponse(BaseModel):
    fare_amount: Optional[float] = None
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    platform_guess: Optional[str] = None
    confidence: float = 0.0
    raw_ocr_text: str = ""


# ── Dashboard ─────────────────────────────────────────────────────────────

class PlatformSplit(BaseModel):
    platform_id: str
    platform_name: str
    platform_type: str
    total_earnings: float
    total_jobs: int
    flagged_count: int


class DashboardWeekly(BaseModel):
    week_start: datetime.datetime
    week_end: datetime.datetime
    total_earnings: float
    total_hours: float
    total_jobs: int
    flagged_count: int
    platform_split: List[PlatformSplit]
    recent_jobs: List[JobOut]
    is_fatigued: bool = False
    fatigue_message: Optional[str] = None


# ── Chat ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    job_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    job_id: Optional[str] = None


# ── Insights ──────────────────────────────────────────────────────────────

class WeeklyInsightResponse(BaseModel):
    week_start: datetime.datetime
    total_earnings: float
    total_hours: float
    flagged_count: int
    insight_text: str


# ── Complaints ────────────────────────────────────────────────────────────

class ComplaintDraftRequest(BaseModel):
    job_id: str


class ComplaintDraftOut(BaseModel):
    id: str
    job_id: str
    draft_text: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ── Platform ──────────────────────────────────────────────────────────────

class PlatformCreate(BaseModel):
    platform_name: str
    platform_type: str


class PlatformOut(BaseModel):
    id: str
    platform_name: str
    platform_type: str

    class Config:
        from_attributes = True
