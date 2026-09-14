import PyPDF2
import docx
from io import BytesIO


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from a PDF or DOCX file."""
    name = filename.lower()

    if name.endswith(".pdf"):
        reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        text = "\n".join(
            page.extract_text() or "" for page in reader.pages
        )
        return text

    elif name.endswith(".docx"):
        doc = docx.Document(BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        return text

    else:
        raise ValueError("Only PDF and DOCX files are supported")