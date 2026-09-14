import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def analyze_resume(resume_text: str) -> dict:
    """Send resume text to Groq AI and return structured JSON."""

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
                "model": "openai/gpt-oss-120b",
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