import os
import json
import google.generativeai as genai
from app.config import settings

_api_key = settings.gemini_api_key
if _api_key:
    genai.configure(api_key=_api_key)

MODEL_NAME = "gemini-3.5-flash-lite"

# ── Prompt Templates ───────────────────────────────────────────────────────

RIGHTS_KNOWLEDGE_BASE = """
- Gig workers can typically flag an underpaid trip through the platform's in-app support/help section.
- A written complaint should include: date, platform, trip fare paid, expected fair-rate estimate, and a request for review or correction.
- Consistent underpayment patterns are worth documenting over multiple trips before escalating.
- This app gives general guidance only, not legal advice; workers should consult local labour resources for formal disputes.
"""

CHATBOT_SYSTEM_PROMPT = f"""You are GigShield's assistant for gig workers (delivery riders, cab drivers).
Answer in short, plain, simple language (avoid jargon). If a specific job's fairness data is provided,
reference its actual numbers. Ground any rights/complaint guidance ONLY in the facts below — do not invent
legal claims or specific laws. Always end advice about disputes with a one-line reminder that this is
general guidance, not legal advice.

Facts you can use:
{RIGHTS_KNOWLEDGE_BASE}
"""

WEEKLY_INSIGHT_SYSTEM_PROMPT = """You are GigShield's weekly insight generator. You will receive a JSON
summary of one worker's week (total earnings, hours, job count, flagged count, per-platform split,
day-vs-night earnings split). Write 2-3 short sentences in plain language that go beyond the raw numbers —
call out a specific pattern (e.g. which shift or platform drove any underpayment or earnings drop), not just
a restatement of totals. Be specific with percentages where the data supports it. No generic filler."""

COMPLAINT_DRAFT_SYSTEM_PROMPT = """You are drafting a short, polite, factual complaint message a gig worker
can send to a platform's support team about an underpaid trip. Use only the job facts provided (date,
platform, fare paid, expected fair-rate, distance, duration). Keep it under 120 words. Do not invent policy
names, laws, or platform-specific procedures not given to you."""

SAFETY_SCORE_SYSTEM_PROMPT = """You are a safety advisor for gig workers.
Given a location (area) and a time of day, return a JSON object with:
- "score": (int) A safety score from 1 (very dangerous) to 10 (very safe)
- "tip": (string) A 1-sentence safety tip for this specific area and time.
Do not wrap the JSON in markdown code blocks, just return raw JSON."""

SAVINGS_GOAL_SYSTEM_PROMPT = """You are a supportive financial assistant for gig workers.
Given the worker's weekly earnings target and their current earnings, provide a very short, encouraging 1-sentence tip. 
Keep it under 20 words. No emojis."""

# ── LLM Wrapper ────────────────────────────────────────────────────────────

def call_llm(system_prompt: str, user_content: str) -> str:
    if not _api_key:
        return "[LLM not configured — set GEMINI_API_KEY to enable this response]"
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=system_prompt
        )
        resp = model.generate_content(user_content)
        return resp.text
    except Exception as e:
        print(f"[llm_client] Error calling Gemini: {e}")
        return "[GigShield couldn't reach the AI service just now — showing the plain-facts version instead.]"

def extract_job_receipt(image_bytes: bytes, mime_type: str) -> dict:
    if not _api_key:
        raise Exception("LLM not configured (GEMINI_API_KEY missing)")
    try:
        # Use flash for fast, cheap multimodal processing
        model = genai.GenerativeModel(model_name=MODEL_NAME)
        
        prompt = """
        You are a highly accurate receipt data extractor for gig workers.
        Analyze this screenshot of a delivery or ride payout screen.
        Extract the following fields and return ONLY a valid JSON object matching this schema:
        - "fare_amount": (float) The total earnings/fare for the trip (extract the numbers only)
        - "distance_km": (float) The distance of the trip in kilometers (numbers only)
        - "duration_minutes": (int) The duration of the trip in minutes
        - "platform_guess": (string) Must be exactly "Swiggy", "Zomato", "Uber", or "Ola" based on the UI colors and text.
        - "raw_ocr_text": (string) A 1-sentence summary of what you found. DO NOT use any double quotes inside this string.
        """
        
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        resp = model.generate_content(
            [image_part, prompt],
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        raw_text = resp.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())
    except Exception as e:
        print(f"[llm_client] Error extracting receipt: {e}")
        raise e

def get_safety_score(area: str, time_str: str) -> dict:
    if not _api_key:
        return {"score": 5, "tip": "[LLM not configured. Stay safe and alert.]"}
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SAFETY_SCORE_SYSTEM_PROMPT
        )
        user_content = f"Area: {area}\nTime: {time_str}"
        resp = model.generate_content(user_content)
        raw_text = resp.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())
    except Exception as e:
        print(f"[llm_client] Error generating safety score: {e}")
        return {"score": 5, "tip": "[GigShield couldn't reach the AI service right now. Please stay alert.]"}

def get_goal_suggestion(target: float, current: float) -> str:
    if not _api_key:
        return "Keep pushing! You're making steady progress towards your weekly goal."
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SAVINGS_GOAL_SYSTEM_PROMPT
        )
        user_content = f"Target: {target}\nCurrent: {current}"
        resp = model.generate_content(user_content)
        return resp.text.strip()
    except Exception as e:
        print(f"[llm_client] Error generating goal suggestion: {e}")
        return "Stay focused! Every trip gets you closer to your target."
