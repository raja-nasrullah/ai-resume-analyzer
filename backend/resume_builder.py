from io import BytesIO
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# ------------------------------
# Section header detection
# ------------------------------

SECTION_HEADERS = {
    "SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS",
    "PROJECTS", "CERTIFICATIONS", "AWARDS", "OBJECTIVE",
    "PROFILE", "WORK EXPERIENCE", "TECHNICAL SKILLS",
    "PROFESSIONAL EXPERIENCE", "CONTACT",
}


def is_header(line: str) -> bool:
    cleaned = line.replace(":", "").strip().upper()
    return (
        len(line) < 60
        and (
            cleaned in SECTION_HEADERS
            or (line.isupper() and len(line) < 40)
        )
    )


# ------------------------------
# DOCX builder
# ------------------------------

def build_docx(resume_text: str) -> BytesIO:
    """Generate a styled DOCX file from plain resume text."""

    doc = Document()

    # Page margins
    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)

    # Default font
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(10.5)

    lines = resume_text.split("\n")
    first_line = True

    for raw in lines:
        line = raw.strip()

        if not line:
            continue

        # Name (first non-empty line) → centered, large, bold
        if first_line:
            p = doc.add_paragraph()
            run = p.add_run(line)
            run.bold = True
            run.font.size = Pt(20)
            run.font.color.rgb = RGBColor(0x1E, 0x1B, 0x4B)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            first_line = False
            continue

        # Section header
        if is_header(line):
            p = doc.add_paragraph()
            run = p.add_run(line.replace(":", "").upper())
            run.bold = True
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)  # indigo
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)

            # Underline via border
            pPr = p._p.get_or_add_pPr()
            from docx.oxml.ns import qn
            from docx.oxml import OxmlElement
            pBdr = OxmlElement("w:pBdr")
            bottom = OxmlElement("w:bottom")
            bottom.set(qn("w:val"), "single")
            bottom.set(qn("w:sz"), "6")
            bottom.set(qn("w:color"), "4F46E5")
            bottom.set(qn("w:space"), "2")
            pBdr.append(bottom)
            pPr.append(pBdr)
            continue

        # Bullet
        if line.startswith(("- ", "• ", "* ")):
            p = doc.add_paragraph(line[2:], style="List Bullet")
            p.paragraph_format.space_after = Pt(2)
        else:
            p = doc.add_paragraph(line)
            p.paragraph_format.space_after = Pt(2)

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


# ------------------------------
# PDF builder
# ------------------------------

def build_pdf(resume_text: str) -> BytesIO:
    """Generate a styled PDF from plain resume text."""

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        title="Resume",
        author="AI Resume Analyzer",
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        "Name",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=HexColor("#1E1B4B"),
        alignment=TA_CENTER,
        spaceAfter=10,
    )

    header_style = ParagraphStyle(
        "Header",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=HexColor("#4F46E5"),
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        textColor=HexColor("#111111"),
        leading=14,
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        "Bullet",
        parent=body_style,
        leftIndent=14,
        bulletIndent=4,
    )

    story = []
    lines = resume_text.split("\n")
    first_line = True

    for raw in lines:
        line = raw.strip()
        if not line:
            continue

        # Escape XML special chars
        safe = (
            line.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )

        # First line = name
        if first_line:
            story.append(Paragraph(safe, name_style))
            first_line = False
            continue

        # Header
        if is_header(line):
            story.append(Paragraph(safe.replace(":", "").upper(), header_style))
            continue

        # Bullet
        if line.startswith(("- ", "• ", "* ")):
            story.append(Paragraph(f"• {safe[2:]}", bullet_style))
        else:
            story.append(Paragraph(safe, body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer

from docx import Document


def replace_paragraph_text_preserve_format(paragraph, new_text: str) -> None:
    """
    Replace a paragraph's text while keeping the first run's formatting.
    Deletes all other runs so the new text inherits the same style.
    """
    if not paragraph.runs:
        # No runs — add one
        paragraph.add_run(new_text)
        return

    # Keep the first run's formatting, replace its text
    first_run = paragraph.runs[0]
    first_run.text = new_text

    # Remove all other runs
    for run in paragraph.runs[1:]:
        run.text = ""


def apply_improvements_to_docx(
    original_docx_bytes: bytes,
    improved_paragraphs: list[str],
) -> BytesIO:
    """
    Open original DOCX, replace each paragraph's text with improved version.
    Preserves ALL formatting (fonts, colors, alignment, tables).
    """
    doc = Document(BytesIO(original_docx_bytes))

    # Collect all non-empty paragraphs in order (same order as extractor)
    original_paras = [p for p in doc.paragraphs]
    non_empty_original = [p for p in original_paras if p.text.strip()]

    # Match by index — extractor gives same order
    idx = 0
    for para in doc.paragraphs:
        if not para.text.strip():
            continue
        if idx < len(improved_paragraphs):
            new_text = improved_paragraphs[idx]
            if new_text and new_text != para.text:
                replace_paragraph_text_preserve_format(para, new_text)
        idx += 1

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer