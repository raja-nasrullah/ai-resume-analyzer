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


# ---------- Rewrite Resume (full text → 100 score) ----------

async def rewrite_resume(resume_text: str, feedback: dict) -> str:
    """Rewrite the full resume text to address all weaknesses."""

    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY is missing in .env file")

    weaknesses = "\n".join(f"- {w}" for w in feedback.get("weaknesses", []))
    suggestions = "\n".join(f"- {s}" for s in feedback.get("suggestions", []))

    prompt = f"""
You are an expert resume writer. Rewrite the resume below to make it a perfect 10/10 resume.

STRICT FORMATTING RULES:
1. Line 1: Full name (uppercase)
2. Line 2: Contact info
3. Line 3: Links (LinkedIn, GitHub)
4. Blank line, then each section:
   - Section title on its own line in ALL CAPS (e.g., "SUMMARY")
   - Blank line after title
   - Bullets start with "- "
5. No markdown (no #, **, __)
6. No duplicated section titles

Content rules:
- Fix ALL weaknesses and apply ALL suggestions
- Add quantified achievements where possible
- Preserve the person's real experience

Weaknesses to fix:
{weaknesses}

Suggestions to apply:
{suggestions}

Original resume:
\"\"\"
{resume_text[:6000]}
\"\"\"

Return ONLY the improved resume text (plain text, no markdown, no code fences).
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


# ---------- Rewrite Paragraphs (for DOCX in-place editing) ----------

async def rewrite_paragraphs(paragraphs: list, feedback: dict) -> list:
    """
    Rewrite each paragraph of the resume individually.
    Returns a list of improved paragraphs, same length and order.
    """
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY is missing in .env file")

    # Build numbered list (only non-empty paragraphs)
    numbered = "\n".join(
        f"[{i}] {p}" for i, p in enumerate(paragraphs) if p.strip()
    )

    weaknesses = "\n".join(f"- {w}" for w in feedback.get("weaknesses", []))
    suggestions = "\n".join(f"- {s}" for s in feedback.get("suggestions", []))

    prompt = f"""
You are an expert resume writer. Below is a resume split into numbered paragraphs.

Your job: improve the text of EACH paragraph WITHOUT changing its role.

Rules:
- Return the SAME number of paragraphs, in the SAME order.
- Paragraph numbers must match exactly: [0], [1], [2], ...
- If a paragraph is a header/title (e.g., "SUMMARY", "EXPERIENCE", a person's name, contact info), return it unchanged.
- If a paragraph is a bullet point, improve it with strong verbs and quantified results.
- Keep each improved paragraph similar in LENGTH to the original. Do NOT dramatically expand short items.
- Do NOT invent companies, dates, or jobs that aren't in the original.

Weaknesses to fix:
{weaknesses}

Suggestions to apply:
{suggestions}

Return ONLY valid JSON in this exact format:
{{
  "paragraphs": [
    {{"id": 0, "text": "improved text for paragraph 0"}},
    {{"id": 1, "text": "improved text for paragraph 1"}}
  ]
}}

Original paragraphs:
{numbered}
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
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
            },
        )

    data = response.json()

    if "choices" not in data:
        raise Exception(f"AI error: {data}")

    try:
        result = json.loads(data["choices"][0]["message"]["content"])
    except Exception as e:
        raise Exception(f"AI returned invalid JSON: {e}")

    # Build output list matching original length
    improved_map = {p["id"]: p["text"] for p in result.get("paragraphs", [])}

    output = []
    for i, original in enumerate(paragraphs):
        if not original.strip():
            output.append(original)
        else:
            output.append(improved_map.get(i, original))
    return output