"""
seed_data.py — Seeds the database with demo data on startup.

Inserts:
  - 1 demo user
  - 2 platforms (delivery + ride)
  - 6 fair-rate benchmark rows (exact values from spec)
  - 1 trusted contact
  - 5–6 realistic jobs spread across the current week, one clear night-shift underpayment
"""

import datetime
import uuid

from sqlalchemy.orm import Session
from app.models import (
    User, Platform, Job, FairRateBenchmark, FairnessResult,
    TrustedContact, PlatformType, CityTier, JobSource, Verdict
)
from app.services.fairness_engine import run_fairness_check


DEMO_USER_ID = "demo-user-001"
DEMO_PHONE = "+919999999999"

SEED_BENCHMARKS = [
    # (platform_type, city_tier, base_fare, rate_per_km, rate_per_min, night_multiplier)
    ("delivery", "1", 25, 12, 1.5, 1.15),
    ("delivery", "2", 20, 10, 1.2, 1.15),
    ("delivery", "3", 18,  8, 1.0, 1.10),
    ("ride",     "1", 40, 15, 2.0, 1.20),
    ("ride",     "2", 35, 13, 1.8, 1.20),
    ("ride",     "3", 30, 11, 1.5, 1.15),
]


def _now():
    return datetime.datetime.utcnow()


def _this_week_day(offset_days: int, hour: int, minute: int = 0):
    """Return a datetime that is `offset_days` ago at the given hour (UTC)."""
    today = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return today - datetime.timedelta(days=offset_days) + datetime.timedelta(hours=hour, minutes=minute)


def seed(db: Session):
    # ── 1. Benchmarks ──────────────────────────────────────────────────────
    existing_benchmarks = db.query(FairRateBenchmark).count()
    if existing_benchmarks == 0:
        for pt, ct, base, rpkm, rpmin, nm in SEED_BENCHMARKS:
            db.add(FairRateBenchmark(
                id=str(uuid.uuid4()),
                platform_type=PlatformType(pt),
                city_tier=CityTier(ct),
                base_fare=base,
                rate_per_km=rpkm,
                rate_per_min=rpmin,
                night_multiplier=nm,
                source="seed",
            ))
        db.commit()

    # ── 2. Demo user ───────────────────────────────────────────────────────
    user = db.query(User).filter(User.id == DEMO_USER_ID).first()
    if not user:
        user = User(
            id=DEMO_USER_ID,
            phone_number=DEMO_PHONE,
            display_name="Ravi Kumar",
            preferred_language="en",
            city_tier=CityTier.tier2,
            voice_mode_enabled=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # ── 3. Platforms ───────────────────────────────────────────────────────
    existing_platforms = db.query(Platform).filter(Platform.user_id == DEMO_USER_ID).count()
    if existing_platforms == 0:
        platform_delivery = Platform(
            id="platform-delivery-001",
            user_id=DEMO_USER_ID,
            platform_name="SwiggyZomato",
            platform_type=PlatformType.delivery,
        )
        platform_ride = Platform(
            id="platform-ride-001",
            user_id=DEMO_USER_ID,
            platform_name="OlaUber",
            platform_type=PlatformType.ride,
        )
        db.add_all([platform_delivery, platform_ride])
        db.commit()

    # ── 4. Trusted contact ─────────────────────────────────────────────────
    existing_contacts = db.query(TrustedContact).filter(TrustedContact.user_id == DEMO_USER_ID).count()
    if existing_contacts == 0:
        db.add(TrustedContact(
            id=str(uuid.uuid4()),
            user_id=DEMO_USER_ID,
            name="Priya (Sister)",
            phone_number="+919888888888",
        ))
        db.commit()

    # ── 5. Demo jobs ───────────────────────────────────────────────────────
    existing_jobs = db.query(Job).filter(Job.user_id == DEMO_USER_ID).count()
    if existing_jobs > 0:
        return  # Already seeded

    # Get benchmark rows
    bench_delivery_t2 = db.query(FairRateBenchmark).filter_by(
        platform_type=PlatformType.delivery, city_tier=CityTier.tier2
    ).first()
    bench_ride_t2 = db.query(FairRateBenchmark).filter_by(
        platform_type=PlatformType.ride, city_tier=CityTier.tier2
    ).first()

    demo_jobs_raw = [
        # (platform_id, fare, distance_km, start_hour, duration_min, area, days_ago)
        # Day job – fair delivery
        ("platform-delivery-001", 95.0,  5.2, 14, 28, "Koramangala",  6),
        # Day job – borderline delivery
        ("platform-delivery-001", 70.0,  4.1, 11, 22, "Indiranagar",  5),
        # Day job – fair ride
        ("platform-ride-001",    130.0,  7.8, 10, 35, "HSR Layout",   4),
        # Night job – CLEAR UNDERPAYMENT (36%) — the demo moment
        ("platform-delivery-001", 62.0,  4.8, 23, 22, "Whitefield",   3),
        # Day job – fair delivery
        ("platform-delivery-001", 88.0,  4.5, 15, 25, "JP Nagar",     2),
        # Day job – fair ride
        ("platform-ride-001",    155.0,  9.2, 17, 42, "Electronic City", 1),
    ]

    created_jobs = []
    for (plat_id, fare, dist, s_hour, dur_min, area, days_ago) in demo_jobs_raw:
        start_t = _this_week_day(days_ago, s_hour)
        end_t   = start_t + datetime.timedelta(minutes=dur_min)
        bench_id = bench_delivery_t2.id if plat_id == "platform-delivery-001" else bench_ride_t2.id

        job = Job(
            id=str(uuid.uuid4()),
            user_id=DEMO_USER_ID,
            platform_id=plat_id,
            source=JobSource.manual,
            fare_amount=fare,
            distance_km=dist,
            start_time=start_t,
            end_time=end_t,
            duration_minutes=dur_min,
            area_tag=area,
        )
        db.add(job)
        db.flush()

        # Run fairness check immediately
        benchmark = db.query(FairRateBenchmark).filter_by(id=bench_id).first()
        result_data = run_fairness_check(job, benchmark)
        fairness = FairnessResult(
            id=str(uuid.uuid4()),
            job_id=job.id,
            benchmark_id=bench_id,
            expected_pay=result_data["expected_pay"],
            actual_pay=result_data["actual_pay"],
            verdict=Verdict(result_data["verdict"]),
            reason_text=result_data["reason_text"],
        )
        db.add(fairness)
        created_jobs.append(job)

    db.commit()
    print(f"[seed] Seeded {len(created_jobs)} demo jobs for user '{DEMO_USER_ID}'")
