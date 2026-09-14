from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_text
from ai_service import analyze_resume

app = FastAPI(title="AI Resume Analyzer")

# Allow frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten later in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "API is running"}


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
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

    # 5. Send to AI
    try:
        result = await analyze_resume(text)
    except Exception as e:
        raise HTTPException(500, f"AI analysis failed: {e}")

    # 6. Return result
    return result