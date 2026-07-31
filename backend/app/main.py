"""GigShield FastAPI entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db, SessionLocal
from app.routers import auth, jobs, dashboard, chat, insights, complaints, goals

app = FastAPI(
    title="GigShield API",
    description="AI companion for gig workers — fair pay, safe routes, known rights.",
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(insights.router)
app.include_router(complaints.router)
app.include_router(goals.router)


# ── Startup ────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    print("[startup] Initialising database...")
    init_db()
    print("[startup] GigShield backend ready (Production Mode).")


@app.get("/")
def health():
    return {"status": "ok", "service": "GigShield API v2.0"}
