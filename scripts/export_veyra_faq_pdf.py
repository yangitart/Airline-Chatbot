from __future__ import annotations

import json
import os
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "features" / "faqs" / "data"
OUTPUT_DIR = ROOT / "output" / "pdf"
FONT_CANDIDATES = [
    Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "arial.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]
FONT_BOLD_CANDIDATES = [
    Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "arialbd.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]


def register_fonts() -> tuple[str, str]:
    regular = next((path for path in FONT_CANDIDATES if path.is_file()), None)
    bold = next((path for path in FONT_BOLD_CANDIDATES if path.is_file()), None)
    if regular and bold:
        pdfmetrics.registerFont(TTFont("VeyraSans", str(regular)))
        pdfmetrics.registerFont(TTFont("VeyraSans-Bold", str(bold)))
        return "VeyraSans", "VeyraSans-Bold"
    return "Helvetica", "Helvetica-Bold"


def draw_page(canvas, document, language: str) -> None:
    canvas.saveState()
    page_width, page_height = A4
    canvas.setFillColor(colors.HexColor("#123c39"))
    canvas.rect(0, page_height - 17 * mm, page_width, 17 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("VeyraSans-Bold" if "VeyraSans-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold", 9)
    canvas.drawString(18 * mm, page_height - 10.5 * mm, "VEYRA  /  TRAVEL GUIDANCE")
    canvas.setFillColor(colors.HexColor("#6c746f"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 11 * mm, f"Original Veyra FAQ catalog · {language.upper()}")
    canvas.drawRightString(page_width - 18 * mm, 11 * mm, str(document.page))
    canvas.restoreState()


def catalog_counts(catalog: dict) -> tuple[int, int]:
    categories = len(catalog)
    pairs = sum(len(section["entries"]) for article in catalog.values() for section in article["sections"])
    return categories, pairs


def build_pdf(language: str, title: str, catalog_file: str, body_font: str, bold_font: str) -> None:
    catalog = json.loads((DATA_DIR / catalog_file).read_text(encoding="utf-8"))
    if not isinstance(catalog, dict) or not catalog:
        raise ValueError(f"FAQ catalog is empty: {catalog_file}")

    categories, pairs = catalog_counts(catalog)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="VeyraTitle", parent=styles["Title"], fontName=bold_font, fontSize=28,
        leading=34, alignment=TA_LEFT, textColor=colors.HexColor("#123c39"), spaceAfter=8 * mm,
    ))
    styles.add(ParagraphStyle(
        name="VeyraIntro", parent=styles["BodyText"], fontName=body_font, fontSize=10,
        leading=15, textColor=colors.HexColor("#5b655f"), spaceAfter=6 * mm,
    ))
    styles.add(ParagraphStyle(
        name="Category", parent=styles["Heading1"], fontName=bold_font, fontSize=18,
        leading=23, textColor=colors.HexColor("#123c39"), spaceBefore=5 * mm, spaceAfter=2 * mm,
        keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="Section", parent=styles["Heading2"], fontName=bold_font, fontSize=11,
        leading=15, textColor=colors.HexColor("#a27c42"), spaceBefore=4 * mm, spaceAfter=2 * mm,
        keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="Question", parent=styles["BodyText"], fontName=bold_font, fontSize=10,
        leading=14, textColor=colors.HexColor("#183a37"), spaceBefore=3 * mm, spaceAfter=1.5 * mm,
        keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="Answer", parent=styles["BodyText"], fontName=body_font, fontSize=9.5,
        leading=14, textColor=colors.HexColor("#3f4944"), leftIndent=3 * mm,
        borderColor=colors.HexColor("#dcc794"), borderWidth=0, borderLeftWidth=1.5,
        borderPadding=5, spaceAfter=2 * mm,
    ))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT_DIR / f"veyra-faq-{language}.pdf"
    doc = SimpleDocTemplate(
        str(destination), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=25 * mm, bottomMargin=19 * mm, title=title, author="Veyra",
        subject="Original authored Veyra frequently asked questions",
    )
    story = [
        Spacer(1, 15 * mm),
        Paragraph(escape(title), styles["VeyraTitle"]),
        Paragraph(
            escape(f"A readable review copy of the original Veyra FAQ catalog. "
                   f"It contains {categories} topics and {pairs} question-and-answer pairs. "
                   "The structured JSON catalog remains the canonical source used by the application and RAG index."),
            styles["VeyraIntro"],
        ),
        Spacer(1, 3 * mm),
    ]

    for category_index, (category_id, article) in enumerate(catalog.items()):
        if category_index:
            story.append(Spacer(1, 3 * mm))
        story.append(Paragraph(escape(article["title"]), styles["Category"]))
        story.append(Paragraph(escape(article["overview"]), styles["VeyraIntro"]))
        for section in article["sections"]:
            story.append(Paragraph(escape(section["title"]), styles["Section"]))
            for entry in section["entries"]:
                story.append(Paragraph(escape(entry["question"]), styles["Question"]))
                story.append(Paragraph(escape(entry["answer"]).replace("\n", "<br/>"), styles["Answer"]))

    doc.build(
        story,
        onFirstPage=lambda canvas, document: draw_page(canvas, document, language),
        onLaterPages=lambda canvas, document: draw_page(canvas, document, language),
    )
    print(f"Created {destination.relative_to(ROOT)} ({categories} categories, {pairs} Q&A)")


def main() -> None:
    body_font, bold_font = register_fonts()
    build_pdf("en", "Veyra frequently asked questions", "veyra-faq.en.json", body_font, bold_font)
    build_pdf("es", "Preguntas frecuentes de Veyra", "veyra-faq.es.json", body_font, bold_font)


if __name__ == "__main__":
    main()
