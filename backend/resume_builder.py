from io import BytesIO
from docx import Document
from docx.shared import Pt, RGBColor


def build_docx(resume_text: str) -> BytesIO:
    """Convert plain-text resume to a formatted DOCX file."""

    doc = Document()

    # Set default font
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    lines = resume_text.split("\n")

    section_headers = {
        "SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS",
        "PROJECTS", "CERTIFICATIONS", "AWARDS", "OBJECTIVE",
        "PROFILE", "WORK EXPERIENCE", "TECHNICAL SKILLS",
    }

    for raw_line in lines:
        line = raw_line.strip()

        # Blank line → spacing
        if not line:
            doc.add_paragraph()
            continue

        # Detect section headers
        cleaned = line.replace(":", "").strip().upper()
        is_header = (
            len(line) < 60
            and (
                cleaned in section_headers
                or (line.isupper() and len(line) < 40)
                or line.endswith(":")
            )
        )

        if is_header:
            p = doc.add_paragraph()
            run = p.add_run(cleaned)
            run.bold = True
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(0x1E, 0x1B, 0x4B)  # dark indigo
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
        elif line.startswith(("- ", "• ", "* ")):
            # Bullet point
            doc.add_paragraph(line[2:], style="List Bullet")
        else:
            doc.add_paragraph(line)

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer