import uuid
import datetime
import enum

from sqlalchemy import (
    Column, String, Float, Integer, DateTime,
    ForeignKey, Enum, Boolean, Text
)
from sqlalchemy.orm import relationship
from app.database import Base


def uid():
    return str(uuid.uuid4())


# ── Enums ──────────────────────────────────────────────────────────────────

class PlatformType(str, enum.Enum):
    delivery = "delivery"
    ride = "ride"
    other = "other"


class CityTier(str, enum.Enum):
    tier1 = "1"
    tier2 = "2"
    tier3 = "3"


class JobSource(str, enum.Enum):
    manual = "manual"
    ocr = "ocr"


class Verdict(str, enum.Enum):
    fair = "fair"
    borderline = "borderline"
    underpaid = "underpaid"


# ── ORM Models ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=uid)
    phone_number = Column(String(15), unique=True, nullable=False)
    display_name = Column(String(80))
    preferred_language = Column(String(10), default="en")
    city_tier = Column(Enum(CityTier), default=CityTier.tier2)
    voice_mode_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    jobs = relationship("Job", back_populates="user")
    platforms = relationship("Platform", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
    complaint_drafts = relationship("ComplaintDraft", back_populates="user")
    trusted_contacts = relationship("TrustedContact", back_populates="user")
    safety_alerts = relationship("SafetyAlert", back_populates="user")
    weekly_summaries = relationship("WeeklySummary", back_populates="user")


class Platform(Base):
    __tablename__ = "platforms"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    platform_name = Column(String(60))
    platform_type = Column(Enum(PlatformType))

    user = relationship("User", back_populates="platforms")
    jobs = relationship("Job", back_populates="platform")


class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    platform_id = Column(String, ForeignKey("platforms.id"))
    source = Column(Enum(JobSource))
    fare_amount = Column(Float)
    distance_km = Column(Float)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    area_tag = Column(String(80))
    raw_ocr_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="jobs")
    platform = relationship("Platform", back_populates="jobs")
    fairness_result = relationship("FairnessResult", uselist=False, back_populates="job")
    chat_messages = relationship("ChatMessage", back_populates="job")
    complaint_drafts = relationship("ComplaintDraft", back_populates="job")


class FairRateBenchmark(Base):
    __tablename__ = "fair_rate_benchmarks"
    id = Column(String, primary_key=True, default=uid)
    platform_type = Column(Enum(PlatformType))
    city_tier = Column(Enum(CityTier))
    base_fare = Column(Float)
    rate_per_km = Column(Float)
    rate_per_min = Column(Float)
    night_multiplier = Column(Float, default=1.15)
    source = Column(String, default="seed")  # "seed" | "community"

    fairness_results = relationship("FairnessResult", back_populates="benchmark")


class FairnessResult(Base):
    __tablename__ = "fairness_results"
    id = Column(String, primary_key=True, default=uid)
    job_id = Column(String, ForeignKey("jobs.id"), unique=True)
    benchmark_id = Column(String, ForeignKey("fair_rate_benchmarks.id"))
    expected_pay = Column(Float)
    actual_pay = Column(Float)
    verdict = Column(Enum(Verdict))
    reason_text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("Job", back_populates="fairness_result")
    benchmark = relationship("FairRateBenchmark", back_populates="fairness_results")


class WeeklySummary(Base):
    __tablename__ = "weekly_summaries"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    week_start = Column(DateTime)
    total_earnings = Column(Float)
    total_hours = Column(Float)
    flagged_count = Column(Integer)
    insight_text = Column(Text)

    user = relationship("User", back_populates="weekly_summaries")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    job_id = Column(String, ForeignKey("jobs.id"), nullable=True)
    role = Column(String)  # "user" | "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
    job = relationship("Job", back_populates="chat_messages")


class ComplaintDraft(Base):
    __tablename__ = "complaint_drafts"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    job_id = Column(String, ForeignKey("jobs.id"))
    draft_text = Column(Text)
    status = Column(String, default="draft")  # "draft" | "sent"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="complaint_drafts")
    job = relationship("Job", back_populates="complaint_drafts")


class TrustedContact(Base):
    __tablename__ = "trusted_contacts"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String(80))
    phone_number = Column(String(15))

    user = relationship("User", back_populates="trusted_contacts")


class SafetyAlert(Base):
    __tablename__ = "safety_alerts"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    contact_id = Column(String, ForeignKey("trusted_contacts.id"))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    message_text = Column(Text)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="safety_alerts")


class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    id = Column(String, primary_key=True, default=uid)
    user_id = Column(String, ForeignKey("users.id"))
    target_amount = Column(Float)
    target_date = Column(DateTime)
    current_progress = Column(Float, default=0)
    suggestion_text = Column(Text, nullable=True)


class CommunityBenchmarkSubmission(Base):
    __tablename__ = "community_benchmark_submissions"
    id = Column(String, primary_key=True, default=uid)
    platform_type = Column(Enum(PlatformType))
    city_tier = Column(Enum(CityTier))
    fare_amount = Column(Float)
    distance_km = Column(Float)
    duration_minutes = Column(Integer)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
