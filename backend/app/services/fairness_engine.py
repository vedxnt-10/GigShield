# services/fairness_engine.py — Pure function, no external calls (exact spec)
from datetime import datetime

NIGHT_START_HOUR = 22
NIGHT_END_HOUR = 6
UNDERPAY_THRESHOLD = 0.85   # actual < 85% of expected -> underpaid
BORDERLINE_THRESHOLD = 0.95  # actual < 95% of expected -> borderline


def is_night(start_time: datetime) -> bool:
    h = start_time.hour
    return h >= NIGHT_START_HOUR or h < NIGHT_END_HOUR


def compute_expected_pay(
    benchmark, distance_km: float, duration_minutes: float, start_time: datetime
) -> float:
    distance_component = benchmark.rate_per_km * distance_km
    time_component = benchmark.rate_per_min * duration_minutes
    subtotal = max(benchmark.base_fare, distance_component) + time_component
    if is_night(start_time):
        subtotal *= benchmark.night_multiplier
    return round(subtotal, 2)


def get_verdict(actual_pay: float, expected_pay: float) -> str:
    if expected_pay <= 0:
        return "fair"
    ratio = actual_pay / expected_pay
    if ratio < UNDERPAY_THRESHOLD:
        return "underpaid"
    if ratio < BORDERLINE_THRESHOLD:
        return "borderline"
    return "fair"


def build_reason_text(
    verdict: str,
    actual_pay: float,
    expected_pay: float,
    distance_km: float,
    duration_minutes: float,
    is_night_job: bool,
) -> str:
    diff_pct = round((1 - actual_pay / expected_pay) * 100, 1) if expected_pay else 0
    shift = "night" if is_night_job else "day"
    if verdict == "underpaid":
        return (
            f"For a {distance_km} km / {duration_minutes} min {shift} trip, the fair-rate floor "
            f"is about Rs {expected_pay}. You were paid Rs {actual_pay} — roughly {diff_pct}% "
            f"below benchmark."
        )
    if verdict == "borderline":
        return (
            f"This {shift} trip paid Rs {actual_pay} against an expected Rs {expected_pay} — "
            f"close to fair but a little under benchmark."
        )
    return (
        f"This {shift} trip paid Rs {actual_pay}, at or above the Rs {expected_pay} benchmark. Fair."
    )


def run_fairness_check(job, benchmark) -> dict:
    """
    job: Job ORM row.
    benchmark: FairRateBenchmark ORM row.
    Returns dict for FairnessResult creation.
    """
    night_job = is_night(job.start_time)
    expected = compute_expected_pay(
        benchmark, job.distance_km, job.duration_minutes, job.start_time
    )
    verdict = get_verdict(job.fare_amount, expected)
    reason = build_reason_text(
        verdict, job.fare_amount, expected,
        job.distance_km, job.duration_minutes, night_job
    )
    return {
        "expected_pay": expected,
        "actual_pay": job.fare_amount,
        "verdict": verdict,
        "reason_text": reason,
    }
