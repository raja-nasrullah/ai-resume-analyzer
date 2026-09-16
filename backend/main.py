from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from resume_builder import build_docx, build_pdf
from extractor import extract_text
from ai_service import analyze_resume, rewrite_resume
from resume_builder import build_docx
from ai_service import analyze_resume, rewrite_resume, rewrite_paragraphs
from resume_builder import build_docx, build_pdf, apply_improvements_to_docx
from fastapi import Form
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
@app.post("/api/download-pdf")
async def download_pdf(req: DownloadRequest):
    """Convert improved resume text to a downloadable PDF file."""
    if not req.improved_text.strip():
        raise HTTPException(400, "No resume text provided")

    try:
        buffer = build_pdf(req.improved_text)
    except Exception as e:
        raise HTTPException(500, f"Failed to build PDF: {e}")

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=improved_resume.pdf"
        },
    )
@app.post("/api/improve-with-file")
async def improve_with_file(
    file: UploadFile = File(...),
    feedback: str = Form(...),
):
    """
    Rewrite the resume paragraph-by-paragraph.
    If the original is DOCX → returns upgraded DOCX with same design.
    If the original is PDF → returns improved text (frontend can build PDF).
    """
    import json as _json

    name = file.filename.lower()
    content = await file.read()

    try:
        feedback_data = _json.loads(feedback)
    except Exception:
        raise HTTPException(400, "Invalid feedback format")

    # Extract paragraphs from the original
    try:
        if name.endswith(".docx"):
            # Get paragraphs from DOCX (preserve order)
            from docx import Document
            from io import BytesIO
            doc = Document(BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs]
        elif name.endswith(".pdf"):
            # PDFs: extract as one blob — AI handles it differently
            text = extract_text(content, file.filename)
            paragraphs = text.split("\n")
        else:
            raise HTTPException(400, "Only PDF or DOCX allowed")
    except Exception as e:
        raise HTTPException(400, f"Failed to read file: {e}")

    # Get AI-improved paragraphs
    try:
        improved = await rewrite_paragraphs(paragraphs, feedback_data)
    except Exception as e:
        raise HTTPException(500, f"AI failed: {e}")

    # Build response
    result = {
        "improved_text": "\n".join(improved),
        "file_type": "docx" if name.endswith(".docx") else "pdf",
    }

    return result


@app.post("/api/download-improved-original")
async def download_improved_original(
    file: UploadFile = File(...),
    improved_text: str = Form(...),
):
    """
    If original file is DOCX → returns DOCX with original design + new text.
    Otherwise returns 400 (frontend should use /api/download-pdf instead).
    """
    name = file.filename.lower()

    if not name.endswith(".docx"):
        raise HTTPException(400, "In-place editing only supports DOCX files")

    content = await file.read()
    improved_paragraphs = improved_text.split("\n")

    try:
        buffer = apply_improvements_to_docx(content, improved_paragraphs)
    except Exception as e:
        raise HTTPException(500, f"Failed to apply improvements: {e}")

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=improved_resume.docx"
        },
    )