"""Audit, stage, evaluate and publish the Air India FAQ corpus in Supabase."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import sys
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from dotenv import dotenv_values

from faq_extraction import MAX_SOURCE_BYTES, chunk_sections, clean, extract_html, extract_pdf, fetch_source, require_official_url


ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge" / "air-india-faq"
VECTOR_DIMENSIONS = 1536
SNAPSHOT_SCHEMA = 1
FAQ_MIN_QUESTIONS = {"booking": 8, "checkin": 8, "baggage": 10, "health": 8, "cargo-booking": 8}


def sources():
    manifest = json.loads((KNOWLEDGE / "corpus.json").read_text(encoding="utf-8"))
    # Cargo is a directory of links. Its articles are listed explicitly in additional-sources.json.
    originals = [source for source in manifest["documents"] if source["id"] != "cargo"]
    documents = [{**item, "sourceCategory": item["id"]} for item in originals]
    seen_urls = {item["sourceUrl"] for item in originals}
    for source in originals:
        for detail in source.get("details", []):
            url = detail.get("sourceUrl")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            suffix = re.sub(r"[^a-z0-9]+", "-", detail["section"].lower()).strip("-")[:45]
            documents.append({
                "id": f"{source['id']}-{suffix}",
                "title": f"{source['title']} / {detail['section']}",
                "sourceUrl": url,
                "sourceType": source["sourceType"],
                "sourceCategory": source["id"],
            })
    documents.extend(json.loads((KNOWLEDGE / "additional-sources.json").read_text(encoding="utf-8")))
    seen_ids = set()
    for source in documents:
        require_official_url(source["sourceUrl"])
        if source["id"] in seen_ids or not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,79}", source["id"]):
            raise ValueError(f"invalid or duplicate source id: {source['id']}")
        seen_ids.add(source["id"])
    return documents, manifest["language"]


def json_hash(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


def assess(source: dict, record: dict):
    chunks = record["chunks"]
    if not chunks or any(not chunk["content"].strip() or len(chunk["content"]) > 2400 for chunk in chunks):
        raise ValueError("missing or invalid text chunks")
    corpus = clean(" ".join(f"{chunk['section_title']} {chunk['content']}" for chunk in chunks)).casefold()
    if len(corpus) < 160:
        raise ValueError("extracted article is too short")
    missing = [term for term in source.get("requiredTerms", []) if clean(term).casefold() not in corpus]
    if missing:
        raise ValueError(f"missing expected content: {', '.join(missing)}")
    if record["questions"] < max(source.get("minQuestions", 0), FAQ_MIN_QUESTIONS.get(source["id"], 0)):
        raise ValueError(f"only {record['questions']} complete FAQ questions extracted")
    pages = {chunk["page_number"] for chunk in chunks}
    if source.get("format") == "pdf":
        if None in pages or len(pages) < source.get("minPages", 1):
            raise ValueError("not enough PDF pages contain usable text")
    elif pages != {None}:
        raise ValueError("unexpected page references in HTML source")


def extract_source(source: dict, source_files: Path | None = None) -> dict:
    is_pdf = source.get("format") == "pdf"
    local_file = source_files / (source["id"] + (".pdf" if is_pdf else ".html")) if source_files else None
    if local_file is not None and local_file.is_file():
        with local_file.open("rb") as stream:
            raw = stream.read(MAX_SOURCE_BYTES + 1)
        if len(raw) > MAX_SOURCE_BYTES:
            raise ValueError("local source is too large")
        mime, final_url = "application/pdf" if is_pdf else "text/html", source["sourceUrl"]
        fetched_at = datetime.fromtimestamp(local_file.stat().st_mtime, timezone.utc)
        origin = "local-copy"
    else:
        raw, mime, final_url = download_with_retry(source["sourceUrl"])
        fetched_at = datetime.now(timezone.utc)
        origin = "download"
    if fetched_at < datetime.now(timezone.utc) - timedelta(days=90):
        raise ValueError("source copy is stale")
    if is_pdf:
        if not raw.startswith(b"%PDF-"):
            raise ValueError("the PDF source did not return a PDF")
        sections = extract_pdf(raw, source["title"], set(source.get("skipPages", [])))
    else:
        if mime not in {"text/html", "application/xhtml+xml"}:
            raise ValueError(f"expected HTML, received {mime}")
        sections = extract_html(raw, source["title"])
    record = {
        "id": source["id"],
        "url": final_url,
        "fetched_at": fetched_at.isoformat(),
        "origin": origin,
        "questions": sum(section.question for section in sections),
        "chunks": chunk_sections(sections),
    }
    assess(source, record)
    record["content_hash"] = json_hash(record["chunks"])
    return record


def download_with_retry(url: str):
    for attempt in range(3):
        try:
            return fetch_source(url)
        except HTTPError as error:
            if attempt == 2 or error.code not in {408, 429, 500, 502, 503, 504}:
                raise
        except (TimeoutError, URLError, ConnectionError):
            if attempt == 2:
                raise
        time.sleep(attempt + 1)


def scan(documents: list[dict], source_files: Path | None = None) -> tuple[list[dict], list[dict]]:
    def audit(source):
        try:
            record = extract_source(source, source_files)
            return record, {
                "id": source["id"], "url": record["url"], "status": "extracted",
                "questions": record["questions"], "chunks": len(record["chunks"]), "origin": record["origin"],
                "pages": sorted({c["page_number"] for c in record["chunks"] if c["page_number"] is not None}),
                "content_hash": record["content_hash"],
            }
        except (HTTPError, URLError, TimeoutError, ValueError, OSError) as error:
            return None, {"id": source["id"], "url": source["sourceUrl"], "status": "failed", "reason": str(error)}
        except Exception as error:
            return None, {"id": source["id"], "url": source["sourceUrl"], "status": "failed", "reason": type(error).__name__}

    records, report = [], []
    with ThreadPoolExecutor(max_workers=5) as pool:
        for record, row in pool.map(audit, documents):
            report.append(row)
            if record:
                records.append(record)
            suffix = f"{row['chunks']} chunks, {row['questions']} questions" if record else row["reason"]
            print(f"{row['status']}: {row['id']} - {suffix}", flush=True)
    return records, report


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_snapshot(path: Path, documents: list[dict]) -> list[dict]:
    snapshot = json.loads(path.read_text(encoding="utf-8"))
    if snapshot["schema"] != SNAPSHOT_SCHEMA or snapshot["manifest_hash"] != json_hash(documents):
        raise ValueError("snapshot does not match the current source manifest")
    records = snapshot["documents"]
    if [item["id"] for item in records] != [item["id"] for item in documents]:
        raise ValueError("snapshot is missing sources or has duplicates")
    freshness_limit = datetime.now(timezone.utc) - timedelta(days=90)
    for source, record in zip(documents, records):
        require_official_url(record["url"])
        if datetime.fromisoformat(record["fetched_at"]) < freshness_limit:
            raise ValueError(f"snapshot source is stale: {source['id']}")
        if json_hash(record["chunks"]) != record["content_hash"]:
            raise ValueError(f"snapshot checksum does not match: {source['id']}")
        assess(source, record)
    return records


def request_json(url: str, headers: dict, payload=None):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload is not None else None
    req = Request(url, data=data, headers={**headers, "Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=45) as response:
            content = response.read()
            return json.loads(content) if content else None
    except HTTPError as error:
        try:
            code = json.loads(error.read(8192)).get("code")
        except (ValueError, AttributeError):
            code = None
        raise RuntimeError(f"HTTP {error.code} from {urlsplit(url).hostname}" + (f" ({code})" if code else "")) from None
    except (URLError, TimeoutError, OSError):
        raise RuntimeError(f"could not reach {urlsplit(url).hostname}") from None


def embed(texts: list[str], key: str, model: str) -> list[list[float]]:
    vectors = []
    for start in range(0, len(texts), 32):
        batch = texts[start:start + 32]
        payload = request_json("https://api.openai.com/v1/embeddings", {"Authorization": f"Bearer {key}"}, {
            "model": model, "input": batch, "dimensions": VECTOR_DIMENSIONS, "encoding_format": "float",
        })
        rows = sorted(payload["data"], key=lambda row: row["index"])
        if [row["index"] for row in rows] != list(range(len(batch))):
            raise ValueError("embedding response is missing items")
        for row in rows:
            vector = row["embedding"]
            if len(vector) != VECTOR_DIMENSIONS or not all(math.isfinite(value) for value in vector) or not any(vector):
                raise ValueError("embedding response contains an invalid vector")
            vectors.append(vector)
    return vectors


def as_vector(vector: list[float]) -> str:
    return "[" + ",".join(format(value, ".8g") for value in vector) + "]"


class Supabase:
    def __init__(self, settings: dict):
        url = settings.get("SUPABASE_URL") or settings.get("NEXT_PUBLIC_SUPABASE_URL")
        key = settings.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError("set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        self.url = url.rstrip("/") + "/rest/v1/"
        self.headers = {"apikey": key, "Prefer": "return=minimal"}
        if key.count(".") == 2:
            self.headers["Authorization"] = f"Bearer {key}"

    def post(self, path: str, payload):
        return request_json(self.url + path, self.headers, payload)

    def require_schema(self):
        request_json(self.url + "faq_corpus_versions?select=embedding_model,expected_chunks&limit=0", self.headers)


def stage(db: Supabase, documents: list[dict], language: str, records: list[dict], key: str, model: str):
    db.require_schema()
    texts = [f"{source['title']}\n{chunk['section_title']}\n{chunk['content']}"
             for source, record in zip(documents, records) for chunk in record["chunks"]]
    vectors = iter(embed(texts, key, model))
    version = str(uuid.uuid4())
    db.post("faq_corpus_versions", {
        "id": version, "expected_documents": len(records), "expected_chunks": len(texts),
        "embedding_model": model,
    })
    print(f"Staging corpus {version}", flush=True)
    for source, record in zip(documents, records):
        db.post("faq_documents", {
            "version_id": version, "id": source["id"], "title": source["title"],
            "source_url": source["sourceUrl"], "source_category": source["sourceCategory"],
            "source_type": source["sourceType"], "language": language,
            "fetched_at": record["fetched_at"], "content_hash": record["content_hash"],
        })
        rows = [{
            **chunk, "version_id": version, "document_id": source["id"], "chunk_index": index,
            "embedding": as_vector(next(vectors)),
        } for index, chunk in enumerate(record["chunks"])]
        for start in range(0, len(rows), 40):
            db.post("faq_chunks", rows[start:start + 40])
    print(f"Staged {len(records)} sources and {len(texts)} chunks. Evaluate and publish version {version} separately.")


def evaluate(db: Supabase, version: str, key: str, model: str) -> int:
    cases = json.loads((KNOWLEDGE / "retrieval-eval.json").read_text(encoding="utf-8"))
    vectors = embed([case["question"] for case in cases], key, model)
    passed = 0
    for case, vector in zip(cases, vectors):
        rows = db.post("rpc/match_faq_evidence", {
            "p_query": case["question"], "p_query_embedding": as_vector(vector),
            "p_embedding_model": model, "p_match_count": 6, "p_version_id": version,
        })
        hit = any(
            row["document_id"] in case["documents"]
            and all(term.casefold() in f"{row['section_title']} {row['content']}".casefold() for term in case["terms"])
            and (not case.get("pdf") or row["page_number"] is not None)
            for row in rows
        )
        passed += hit
        print(f"{'PASS' if hit else 'MISS'} {case['id']}: {', '.join(row['document_id'] for row in rows)}")
    print(f"{passed}/{len(cases)} queries retrieved expected evidence.")
    return 0 if passed == len(cases) else 2


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--dry-run", action="store_true", help="download and audit without embeddings or database writes")
    modes.add_argument("--from-snapshot", type=Path, help="stage exactly the extracted snapshot after review")
    modes.add_argument("--evaluate-version", type=uuid.UUID, help="check retrieval against the staged version")
    modes.add_argument("--publish-version", type=uuid.UUID, help="activate a complete staged version")
    parser.add_argument("--snapshot", type=Path, default=ROOT / ".faq-rag" / "snapshot.json")
    parser.add_argument("--report", type=Path, default=ROOT / ".faq-rag" / "coverage.json")
    parser.add_argument("--source-files", type=Path, help="use local copies named by manifest id, with .html or .pdf")
    args = parser.parse_args()
    if args.source_files and (not args.dry_run or not args.source_files.is_dir()):
        parser.error("--source-files requires --dry-run and an existing directory")

    if args.dry_run:
        documents, _ = sources()
        records, report = scan(documents, args.source_files)
        complete = len(records) == len(documents)
        write_json(args.report, {"expected": len(documents), "extracted": len(records), "complete": complete, "sources": report})
        print(f"Coverage: {len(records)}/{len(documents)}. Report: {args.report}")
        if not complete:
            print("Incomplete extraction. No snapshot generated.", file=sys.stderr)
            return 2
        write_json(args.snapshot, {"schema": SNAPSHOT_SCHEMA, "manifest_hash": json_hash(documents), "documents": records})
        print(f"Snapshot ready for review: {args.snapshot}")
        return 0

    settings = {**dotenv_values(ROOT / ".env.local"), **os.environ}
    db = Supabase(settings)
    key = settings.get("FAQ_EMBEDDING_API_KEY") or settings.get("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("set FAQ_EMBEDDING_API_KEY (or OPENAI_API_KEY)")
    model = settings.get("FAQ_EMBEDDING_MODEL") or "text-embedding-3-small"
    if args.publish_version:
        if evaluate(db, str(args.publish_version), key, model):
            print("Publication blocked because retrieval checks failed.", file=sys.stderr)
            return 2
        db.post("rpc/publish_faq_corpus_version", {"p_version_id": str(args.publish_version)})
        print(f"Published {args.publish_version}")
        return 0
    if args.evaluate_version:
        return evaluate(db, str(args.evaluate_version), key, model)
    documents, language = sources()
    stage(db, documents, language, load_snapshot(args.from_snapshot, documents), key, model)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"FAQ ingestion failed: {error}", file=sys.stderr)
        raise SystemExit(1)
