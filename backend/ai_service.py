import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"


# ---------- Analyze Resume ----------

async def analyze_resume(resume_text: str) -> dict:
    """Send resume text to Groq AI and return structured JSON feedback."""

    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY is missing in .env file")

    prompt = f"""
You are an expert resume reviewer. Analyze the resume below and return ONLY valid JSON in this exact format:

{{
  "score": <integer from 0 to 100>,
  "strengths": ["point 1", "point 2", "point 3"],
  "weaknesses": ["point 1", "point 2", "point 3"],
  "suggestions": ["point 1", "point 2", "point 3"]
}}

Rules:
- Score based on clarity, impact, structure, and skills.
- Each list must have 3 to 5 items.
- No extra text, no markdown, ONLY JSON.

Resume:
\"\"\"
{resume_text[:6000]}
\"\"\"
"""

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
            },
        )

    data = response.json()

    if "choices" not in data:
        raise Exception(f"AI error: {data}")

    content = data["choices"][0]["message"]["content"]
    return json.loads(content)


# ---------- Rewrite Resume (for 100 score) ----------

async def rewrite_resume(resume_text: str, feedback: dict) -> str:
    """Rewrite the resume to address all weaknesses and reach a 100 score."""

    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY is missing in .env file")

    weaknesses = "\n".join(f"- {w}" for w in feedback.get("weaknesses", []))
    suggestions = "\n".join(f"- {s}" for s in feedback.get("suggestions", []))

    prompt = f"""
You are an expert resume writer. Rewrite the resume below to make it a perfect 10/10 resume.

Goals:
- Fix ALL the weaknesses listed
- Apply ALL the suggestions
- Add quantified achievements (numbers, percentages) where possible
- Use strong action verbs
- Keep it ATS-friendly (simple formatting, no tables/columns)
- Keep it to 1 page worth of content
- Preserve the person's real experience — do NOT invent jobs or companies
- Use clean sections: SUMMARY, EXPERIENCE, SKILLS, EDUCATION

Weaknesses to fix:
{weaknesses}

Suggestions to apply:
{suggestions}

Original resume:
\"\"\"
{resume_text[:6000]}
\"\"\"

Return ONLY the improved resume text (plain text, no markdown, no explanations, no code fences).
"""

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
            },
        )

    data = response.json()

    if "choices" not in data:
        raise Exception(f"AI error: {data}")

    return data["choices"][0]["message"]["content"].strip()