"""
KB Local Folder Extractor
--------------------------
Reads ALL files from a local folder (recursively), extracts text, infers
product / category / tags, and writes documents.json for the KB website.

Usage:
    python extract.py                        # prompts for folder
    python extract.py "C:\\path\\to\\folder"  # pass folder directly

No internet connection required. No credentials needed.
"""

import io
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

OUTPUT_DIR  = Path(__file__).parent.parent / "knowledge-base-app" / "public" / "data"
OUTPUT_FILE = OUTPUT_DIR / "documents.json"
META_FILE   = OUTPUT_DIR / "kb-meta.json"

EXTRACTABLE = {".docx", ".doc", ".pdf", ".pptx", ".ppt", ".xlsx", ".xls", ".txt", ".md", ".csv"}
MEDIA_TYPES = {".mp4", ".mkv", ".avi", ".mov", ".mp3", ".wav", ".m4v", ".wmv", ".webm", ".m4a"}
SKIP_DIRS   = {"__pycache__", ".git", "node_modules", ".DS_Store", "venv", ".venv", "dist"}
MAX_FILE_MB = 100  # skip files larger than this

# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def extract_docx(path: Path) -> str:
    from docx import Document
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_pdf(path: Path) -> str:
    import pdfplumber
    parts = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
    return "\n".join(parts)


def extract_pptx(path: Path) -> str:
    from pptx import Presentation
    prs = Presentation(str(path))
    parts = []
    for i, slide in enumerate(prs.slides, 1):
        texts = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    t = "".join(r.text for r in para.runs).strip()
                    if t:
                        texts.append(t)
        if texts:
            parts.append(f"[Slide {i}]\n" + "\n".join(texts))
    return "\n\n".join(parts)


def extract_xlsx(path: Path) -> str:
    import openpyxl
    wb = openpyxl.load_workbook(str(path), read_only=True, data_only=True)
    parts = []
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        rows = []
        for row in ws.iter_rows(values_only=True):
            row_str = "\t".join(str(c) if c is not None else "" for c in row)
            if row_str.strip():
                rows.append(row_str)
        if rows:
            parts.append(f"[Sheet: {sheet_name}]\n" + "\n".join(rows[:500]))
    return "\n\n".join(parts)


def extract_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")[:50_000]


def extract(path: Path) -> str:
    ext = path.suffix.lower()
    try:
        if ext in (".docx", ".doc"):  return extract_docx(path)
        if ext == ".pdf":             return extract_pdf(path)
        if ext in (".pptx", ".ppt"): return extract_pptx(path)
        if ext in (".xlsx", ".xls"): return extract_xlsx(path)
        if ext in (".txt", ".md", ".csv"): return extract_text_file(path)
    except Exception as e:
        return f"[Extraction error: {e}]"
    return ""

# ---------------------------------------------------------------------------
# Inference: product, category, tags
# ---------------------------------------------------------------------------

PRODUCT_RULES = [
    ("circular-plan",     r"circular|retpack|ret[\s_-]?pack|capex.*pack"),
    ("demand-cockpit",    r"demand[\s_-]?cockpit|demand[\s_-]?planning[\s_-]?cockpit"),
    ("material-planning", r"material[\s_-]?planning|e2e[\s_-]?material|\bmrp\b|on[\s_-]?time[\s_-]?suggest"),
    ("o9-adoption",       r"o9[\s_-]?adoption|touchless[\s_-]?plan|user[\s_-]?adoption"),
    ("core-design",       r"core[\s_-]?design|core[\s_-]?process|as[\s_-]?is|process[\s_-]?map"),
    ("o2d",               r"o2d|order[\s_-]?to[\s_-]?deliver|order[\s_-]?management|\bsto\b|\bstr\b"),
]

CATEGORY_RULES = [
    (r"\.(mp4|mkv|avi|mov|webm|m4v)$",    "Recordings"),
    (r"\.pptx?$",                           "Presentations"),
    (r"brd|business[\s_-]?requirement",     "BRD"),
    (r"sow|statement[\s_-]?of[\s_-]?work", "SOW"),
    (r"meeting|minutes|\bmom\b",            "Meeting Notes"),
    (r"report|dashboard",                   "Reports"),
    (r"training|onboarding|guide|tutorial", "Training"),
    (r"architecture|design|diagram",        "Architecture"),
    (r"\.xlsx?$",                           "Spreadsheets"),
    (r"\.pdf$",                             "Documents"),
    (r"\.docx?$",                           "Documents"),
]

TAG_KEYWORDS = {
    "ai":             ["artificial intelligence", "machine learning", "llm", "copilot", " ai "],
    "sustainability": ["sustain", "esg", "environment", "retpack", "circular"],
    "gcc":            ["gcc", "global capability", "command centre"],
    "data":           ["data", "analytics", "dashboard", "kpi", "metric"],
    "process":        ["process", "workflow", "sop", "procedure"],
    "finance":        ["budget", "cost", "finance", "revenue", "capex"],
    "planning":       ["planning", "forecast", "demand", "supply", "mrp"],
    "o9":             ["o9", "one planning", "oneplanning"],
}

def infer_product(name: str, rel_path: str, snippet: str = "") -> str | None:
    combined = f"{rel_path}/{name} {snippet[:300]}".lower()
    for pid, pattern in PRODUCT_RULES:
        if re.search(pattern, combined, re.IGNORECASE):
            return pid
    return None

def infer_category(name: str, rel_path: str) -> str:
    combined = f"{rel_path}/{name}".lower()
    for pattern, cat in CATEGORY_RULES:
        if re.search(pattern, combined, re.IGNORECASE):
            return cat
    return "General"

def infer_tags(name: str, rel_path: str, snippet: str = "") -> list[str]:
    text = f"{rel_path}/{name} {snippet[:400]}".lower()
    return sorted(tag for tag, kws in TAG_KEYWORDS.items() if any(k in text for k in kws))

def file_icon(ext: str) -> str:
    return {
        ".pdf": "📄", ".docx": "📝", ".doc": "📝", ".pptx": "📊", ".ppt": "📊",
        ".xlsx": "📈", ".xls": "📈", ".mp4": "🎥", ".mkv": "🎥", ".avi": "🎥",
        ".mov": "🎥", ".mp3": "🎵", ".wav": "🎵", ".m4a": "🎵",
        ".txt": "📃", ".md": "📃", ".csv": "📋",
    }.get(ext.lower(), "📁")

def fmt_size(b: int) -> str:
    for u in ("B", "KB", "MB", "GB"):
        if b < 1024: return f"{b:.1f} {u}"
        b /= 1024
    return f"{b:.1f} TB"

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def collect_files(root: Path) -> list[Path]:
    """Recursively collect all files, skipping hidden/system dirs."""
    files = []
    for item in sorted(root.rglob("*")):
        if item.is_file():
            # Skip if any parent dir is in SKIP_DIRS or starts with .
            if any(p.name in SKIP_DIRS or p.name.startswith(".") for p in item.parents):
                continue
            if item.name.startswith("~$"):  # Office temp files
                continue
            files.append(item)
    return files


def run(folder_path: str):
    root = Path(folder_path).resolve()
    if not root.exists():
        print(f"[ERROR] Folder not found: {root}", flush=True)
        sys.exit(1)
    if not root.is_dir():
        print(f"[ERROR] Not a folder: {root}", flush=True)
        sys.exit(1)

    print(f"\n[SCAN]  Reading from: {root}", flush=True)
    all_files = collect_files(root)
    print(f"        Found {len(all_files)} files total", flush=True)

    documents = []
    skipped   = 0

    for idx, path in enumerate(all_files, 1):
        ext      = path.suffix.lower()
        rel_path = str(path.relative_to(root).parent).replace("\\", "/")
        size     = path.stat().st_size
        is_media = ext in MEDIA_TYPES
        modified = datetime.fromtimestamp(path.stat().st_mtime).isoformat() + "Z"

        # Size check
        if size > MAX_FILE_MB * 1024 * 1024 and not is_media:
            print(f"  [{idx}/{len(all_files)}] SKIP (>{MAX_FILE_MB}MB) {path.name}", flush=True)
            skipped += 1
            continue

        # Skip non-extractable, non-media files
        if ext not in EXTRACTABLE and not is_media:
            skipped += 1
            continue

        print(f"  [{idx}/{len(all_files)}] {path.name}", end="  ", flush=True)

        content = ""
        if not is_media and ext in EXTRACTABLE:
            content = extract(path)
            print(f"[{len(content):,} chars]", flush=True)
        else:
            print("[media]", flush=True)

        snippet = " ".join(content.split()[:80])

        documents.append({
            "id":         f"local-{idx:05d}",
            "name":       path.name,
            "extension":  ext,
            "icon":       file_icon(ext),
            "size":       size,
            "sizeLabel":  fmt_size(size),
            "folderPath": rel_path or "Root",
            "category":   infer_category(path.name, rel_path),
            "productId":  infer_product(path.name, rel_path, snippet),
            "tags":       infer_tags(path.name, rel_path, snippet),
            "author":     "",
            "modified":   modified,
            "created":    modified,
            "webUrl":     "#",
            "isMedia":    is_media,
            "snippet":    snippet,
            "content":    content,
        })

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    payload = {
        "generated":      datetime.utcnow().isoformat() + "Z",
        "source":         "local-folder",
        "sourceFolder":   str(root),
        "totalDocuments": len(documents),
        "skipped":        skipped,
        "documents":      documents,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    meta = {
        "last_updated":    datetime.utcnow().isoformat() + "Z",
        "source":          "local-folder",
        "document_count":  len(documents),
        "skipped":         skipped,
        "source_folder":   str(root),
    }
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"\n[DONE]  {len(documents)} documents indexed  ({skipped} skipped)", flush=True)
    print(f"        Output: {OUTPUT_FILE}", flush=True)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        folder = " ".join(sys.argv[1:])
    else:
        print("\nAB InBev Knowledge Base — Local Folder Extractor")
        print("-" * 50)
        print("Drag a folder onto this window, or type the path:\n")
        folder = input("Folder path: ").strip().strip('"').strip("'")

    if not folder:
        print("[ERROR] No folder specified.")
        sys.exit(1)

    run(folder)
