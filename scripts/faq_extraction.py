"""Extract source sections and page-level evidence from approved HTML and PDFs."""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from io import BytesIO
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from bs4 import BeautifulSoup, Tag
from pypdf import PdfReader


OFFICIAL_HOSTS = {"airindia.com", "www.airindia.com", "cargo.airindia.com", "dmlib.airindia.com"}
HEADINGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
CHROME = "header, footer, nav, aside, form, script, style, noscript, svg, [role=navigation], [role=dialog], .breadcrumb, .cmp-breadcrumb"
MAX_SOURCE_BYTES = 24 * 1024 * 1024
MAX_CHUNK_CHARS = 2400
FAQ_ITEMS = "details, .cmp-accordion__item, [data-cmp-hook-accordion='item']"
BLOCKS = "h1, h2, h3, h4, h5, h6, [role=heading], p, li, dt, dd, blockquote, table"


@dataclass(frozen=True)
class Section:
    title: str
    text: str
    page_number: int | None = None
    question: bool = False


def clean(value: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", value).replace("\u00ad", "").split())


def require_official_url(url: str) -> None:
    parts = urlsplit(url)
    if parts.scheme != "https" or parts.hostname not in OFFICIAL_HOSTS or parts.username or parts.password:
        raise ValueError("source must be an approved Air India HTTPS URL")


class OfficialRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        require_official_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch_source(url: str) -> tuple[bytes, str, str]:
    require_official_url(url)
    request = Request(url, headers={
        "User-Agent": "VeyraFAQIndexer/1.1",
        "Accept": "text/html, application/pdf;q=0.9",
    })
    with build_opener(OfficialRedirectHandler()).open(request, timeout=12) as response:
        require_official_url(response.url)
        data = response.read(MAX_SOURCE_BYTES + 1)
        if len(data) > MAX_SOURCE_BYTES:
            raise ValueError("source is too large")
        return data, response.headers.get_content_type(), response.url


def table_lines(table: Tag) -> list[str]:
    headers: list[str] = []
    lines: list[str] = []
    for row in table.find_all("tr"):
        cells = row.find_all(["td", "th"], recursive=False)
        if not cells:
            continue
        values = [clean(cell.get_text(" ", strip=True)) for cell in cells]
        if row.find_parent("thead") or all(cell.name == "th" for cell in cells):
            headers = values
        elif len(headers) == len(values):
            lines.append(" | ".join(f"{label}: {value}" if label else value for label, value in zip(headers, values) if value))
        else:
            lines.append(" | ".join(value for value in values if value))
    return lines


def answer_text(node: Tag) -> str:
    # Replace each table with labeled rows before collecting the answer text.
    for table in node.find_all("table"):
        table.replace_with("\n".join(table_lines(table)))
    for block in node.select("p, li, dt, dd"):
        block.append("\n")
    return "\n".join(clean(line) for line in node.get_text(" ").splitlines() if clean(line))


def jsonld_faqs(soup: BeautifulSoup) -> list[Section]:
    def visit(item):
        if isinstance(item, list):
            for entry in item:
                yield from visit(entry)
        elif isinstance(item, dict):
            types = item.get("@type", [])
            if types == "FAQPage" or isinstance(types, list) and "FAQPage" in types:
                entities = item.get("mainEntity", [])
                for question in entities if isinstance(entities, list) else [entities]:
                    if not isinstance(question, dict):
                        continue
                    title, answer = question.get("name"), question.get("acceptedAnswer")
                    text = answer.get("text") if isinstance(answer, dict) else None
                    if isinstance(title, str) and isinstance(text, str):
                        root = BeautifulSoup(text, "html.parser")
                        yield Section(clean(title), answer_text(root), question=True)
            if "@graph" in item:
                yield from visit(item["@graph"])

    result = []
    for script in soup.select("script[type='application/ld+json']"):
        try:
            result.extend(visit(json.loads(script.get_text())))
        except (json.JSONDecodeError, TypeError):
            continue
    return result


def extract_html(data: bytes, title: str) -> list[Section]:
    soup = BeautifulSoup(data, "html.parser")
    structured = jsonld_faqs(soup)
    root = soup.select_one("main, [role=main], #main-content") or soup.body
    if root is None or not root.find(["h1", "h2", "h3"]):
        raise ValueError("article heading was not found")
    for node in reversed(root.select(CHROME)):
        node.decompose()

    sections: list[Section] = []
    for item in reversed(root.select(FAQ_ITEMS)):
        question = item.select_one("summary, [data-cmp-hook-accordion='button'], .cmp-accordion__button")
        if question is None:
            continue
        label = clean(question.get_text(" ", strip=True))
        if not label.endswith(("?", "？")) and question.name != "summary":
            continue  # A topic accordion may contain multiple FAQ headings and answers.
        question.decompose()
        body = answer_text(item)
        if body:
            sections.append(Section(label, body, question=True))
            item.decompose()

    heading = title
    paragraphs: list[str] = []
    started = root.name != "body"

    def flush():
        if paragraphs:
            sections.append(Section(heading, "\n".join(paragraphs), question=heading.endswith(("?", "？"))))
            paragraphs.clear()

    for node in root.select(BLOCKS):
        if node.find_parent("table"):
            continue
        if node.name in HEADINGS or node.get("role") == "heading":
            if node.name == "h1":
                started = True
            if started:
                flush()
                heading = clean(node.get_text(" ", strip=True)) or heading
        elif started:
            if node.find_parent(["li", "dd", "blockquote"]) and node.name != "table":
                continue
            text = "\n".join(table_lines(node)) if node.name == "table" else clean(node.get_text(" ", strip=True))
            if text and text not in paragraphs:
                paragraphs.append(text)
    flush()

    # AEM pages can expose the same FAQ in both DOM and JSON-LD. Prefer the DOM answer.
    seen = set()
    unique = []
    for section in [*sections, *structured]:
        key = clean(section.title if section.question else f"{section.title} {section.text}").casefold()
        if section.text and key not in seen:
            unique.append(section)
            seen.add(key)
    return unique


PDF_HEADING = re.compile(r"^(Article\s+\d+\s*[-–—]\s*.+|\d+\.\d+\s+[A-Z][A-Z /,&-]{5,})$", re.I)
PDF_FOOTER = re.compile(r"^(?:page\s+\d+\s+of\s+\d+|air india limited\s*[-–—]\s*conditions of carriage)$", re.I)


def extract_pdf(data: bytes, title: str, skip_pages: set[int]) -> list[Section]:
    reader = PdfReader(BytesIO(data))
    if reader.is_encrypted:
        raise ValueError("PDF is encrypted")
    sections: list[Section] = []
    heading = title
    for number, page in enumerate(reader.pages, 1):
        if number in skip_pages:
            continue
        rows = [clean(line) for line in (page.extract_text(extraction_mode="layout") or "").splitlines()]
        rows = [row for row in rows if row and not PDF_FOOTER.fullmatch(row)]
        if len(" ".join(rows)) < 60:
            raise ValueError(f"PDF page {number} has no usable text layer")
        paragraphs: list[str] = []
        for row in rows:
            if PDF_HEADING.fullmatch(row):
                if paragraphs:
                    sections.append(Section(heading, "\n".join(paragraphs), number))
                    paragraphs.clear()
                heading = row
            else:
                paragraphs.append(row)
        if paragraphs:
            sections.append(Section(heading, "\n".join(paragraphs), number))
    return sections


def chunk_sections(sections: list[Section]) -> list[dict]:
    chunks = []
    for section in sections:
        text = section.text.strip()
        while text:
            cut = min(len(text), MAX_CHUNK_CHARS)
            if cut < len(text):
                split = max(text.rfind("\n", 0, cut), text.rfind(". ", 0, cut) + 1)
                if split < cut // 2:
                    split = text.rfind(" ", 0, cut)
                if split >= cut // 2:
                    cut = split
            chunks.append({
                "section_title": section.title[:300],
                "content": text[:cut].strip(),
                "page_number": section.page_number,
            })
            text = text[cut:].strip()
    return chunks
