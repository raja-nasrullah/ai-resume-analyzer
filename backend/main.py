from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from extractor import extract_text
from ai_service import analyze_resume, rewrite_resume
from resume_builder import build_docx

app = FastAPI(title="AI Resume Analyzer")

# CORS — allow frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class ImproveRequest(BaseModel):
    resume_text: str
    feedback: dict


class DownloadRequest(BaseModel):
    improved_text: str


# ---------- Routes ----------

@app.get("/")
def root():
    return {"status": "API is running"}


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """Analyze an uploaded resume and return score + feedback."""

    # 1. Validate file type
    name = file.filename.lower()
    if not (name.endswith(".pdf") or name.endswith(".docx")):
        raise HTTPException(400, "Only PDF or DOCX files are allowed")

    # 2. Read file
    content = await file.read()

    # 3. Extract text
    try:
        text = extract_text(content, file.filename)
    except Exception as e:
        raise HTTPException(400, f"Failed to read file: {e}")

    # 4. Validate text length
    if len(text.strip()) < 100:
        raise HTTPException(400, "Resume text is too short or unreadable")

    # 5. Analyze with AI
    try:
        result = await analyze_resume(text)
    except Exception as e:
        raise HTTPException(500, f"AI analysis failed: {e}")

    # 6. Include original text so frontend can request improvement later
    result["resume_text"] = text[:10000]
    return result


@app.post("/api/improve")
async def improve_resume(req: ImproveRequest):
    """Rewrite the resume to address feedback and reach a 100 score."""
    if not req.resume_text.strip():
        raise HTTPException(400, "Resume text is empty")

    try:
        improved_text = await rewrite_resume(req.resume_text, req.feedback)
        return {"improved_text": improved_text}
    except Exception as e:
        raise HTTPException(500, f"Resume improvement failed: {e}")


@app.post("/api/download")
async def download_resume(req: DownloadRequest):
    """Convert improved resume text to a downloadable DOCX file."""
    if not req.improved_text.strip():
        raise HTTPException(400, "No resume text provided")

    try:
        buffer = build_docx(req.improved_text)
    except Exception as e:
        raise HTTPException(500, f"Failed to build DOCX: {e}")

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=improved_resume.docx"
        },
    )