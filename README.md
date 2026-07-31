# GigShield

Submission for the **Synaptrix** Hackathon.

## Problem Statement Chosen

**Domain:** GigShield  
**Problem Statement:** Gig Economy & Informal Sector Tech - AI Companion for Fair Wages & Worker Safety.

## Team

**Team Name:** Prompt & Pray

## Our Solution

GigShield is a comprehensive empowerment platform for gig economy workers. We built a mobile-first web application that allows drivers and delivery partners to instantly verify if they are being paid fairly by comparing their trip receipts against community and regional baselines. Beyond just fairness checking, GigShield acts as a real-time rights advisor, safety monitor, and financial coach, actively protecting workers from exploitation and burnout.

## AI Component

- **What AI is used:** Google Gemini 3.5 Flash and Flash-Lite via the Google AI Studio API.
- **What it does in your app:** 
  1. **AI Receipt OCR:** Extracts structured data (distance, fare, duration, platform) from screenshots of trip receipts.
  2. **Weekly Insights:** Analyzes a worker's weekly aggregate data to provide tactical advice on improving earnings.
  3. **Rights Advisor Chatbot:** A localized assistant attached to every trip that answers questions about the specific trip's fairness and platform policies.
  4. **Automated Complaint Drafter:** Automatically drafts a professional, factual complaint letter based on flagged underpayments.
  5. **AI Route Safety Score:** Evaluates the time of day and area of a trip to assign a safety score and provide personalized safety tips.
  6. **Savings Goal Coach:** Generates dynamic, encouraging micro-tips based on how close the worker is to hitting their weekly earnings target.
- **Why we chose this approach:** Gemini's multimodal capabilities allowed us to seamlessly process both image-based receipt data and complex natural language queries within a single API. Its speed and low latency were critical for providing real-time safety scores and on-demand legal advice to workers while on the road.

## Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Framer Motion, Lucide React
- **Backend:** Python, FastAPI, SQLAlchemy
- **AI/ML:** Google Gemini (3.5 Flash / Flash-Lite)
- **Database/Storage:** SQLite
- **Other tools/APIs:** HTML5 Geolocation API (for the SOS feature)

## Features Implemented

**Core Requirements:**
- Let the worker log each job (fare, distance, time) manually, or scan a screenshot of their delivery/ride app using OCR to auto-extract the earnings data.
- A simple fairness-check model that flags a job as "possible underpayment" by comparing the actual payout against an expected fair-rate benchmark for that distance/time.
- An AI chatbot (LLM API) that explains, in simple language, things like "is this fare fair?", "what are my rights?", or "how do I raise a complaint?"
- A dashboard summarizing weekly earnings, flagged underpayments, and total hours worked.
- Multi-platform earnings aggregator - let the worker log jobs from more than one gig app and see all their earnings unified in a single dashboard.
- An AI-generated weekly insight summary that goes beyond raw numbers - e.g., "You earned 12% less this week, and most of the underpayment happened during night shifts."

**Bonus Features Attempted:**
- AI-generated route safety score based on time of day and area
- AI-generated complaint draft that the worker can copy-paste/send
- Fatigue/burnout detector that flags unusually long consecutive working hours
- An "I feel unsafe" trigger that prepares a location-sharing alert message
- A savings goal tracker where the worker sets a target, and the AI adjusts suggestions based on real earned income

## How to Run This Project

```bash
# 1. Clone the repo
git clone https://github.com/vedxnt-10/GigShield.git
cd GigShield

# 2. Run the Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# --> Add your GEMINI_API_KEY to the .env file!
uvicorn app.main:app --reload

# 3. Run the Frontend (in a new terminal tab)
cd frontend
npm install
npm run dev
```

## Screenshots

*(Add 2-3 screenshots of your project in action here)*
