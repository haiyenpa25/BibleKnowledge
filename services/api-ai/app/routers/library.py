import os
import json
import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter(prefix="/library", tags=["Library & Documents"])

CATALOG_PATH = "/app/data/catalog.json"
SOURCES_DIR = "/app/data/sources"

_CATALOG_CACHE: Optional[Dict[str, Any]] = None


def determine_category(title: str, author: str) -> Dict[str, str]:
    t_lower = title.lower()
    a_lower = author.lower() if author else ""

    if any(k in t_lower for k in [
        "commentary", "tntc", "totc", "nivac", "bk commentary", "be series", "be-series", "expositor",
        "macarthur bible commentary", "asbury", "wycliffe", "theology of work"
    ]):
        return {"category": "commentary", "category_vi": "Bộ Chú Giải Kinh Thánh"}

    if any(k in t_lower for k in [
        "dictionary", "encyclopedia", "lexicon", "concordance", "atlas", "zondervan encyclopedia",
        "strong's", "easton", "eerdmans", "holman illustrated", "nelson's new illustrated", "vine's"
    ]):
        return {"category": "dictionary", "category_vi": "Từ Điển & Bách Khoa Toàn Thư"}

    if any(k in t_lower for k in [
        "survey", "introduction", "background", "essentials", "manners and customs", "companion",
        "world of the new testament", "origins of the bible", "mears bible survey"
    ]):
        return {"category": "survey", "category_vi": "Khảo Lược & Dẫn Nhập"}

    return {"category": "monograph", "category_vi": "Thần Học Chuyên Đề & Đời Sống"}


def extract_series(title: str) -> str:
    t = title or ""
    if re.search(r"wiersbe.*be\s+series", t, re.IGNORECASE):
        return "Warren Wiersbe's Be Series"
    if re.search(r"tntc|tyndale new testament", t, re.IGNORECASE):
        return "Tyndale New Testament Commentaries (TNTC)"
    if re.search(r"totc|tyndale old testament", t, re.IGNORECASE):
        return "Tyndale Old Testament Commentaries (TOTC)"
    if re.search(r"nivac|niv application", t, re.IGNORECASE):
        return "NIV Application Commentary"
    if re.search(r"bk commentary|bible knowledge commentary", t, re.IGNORECASE):
        return "Bible Knowledge Commentary"
    if re.search(r"oxford", t, re.IGNORECASE):
        return "Oxford Reference Collection"
    if re.search(r"ivp", t, re.IGNORECASE):
        return "IVP Reference & Academic"
    if re.search(r"zondervan", t, re.IGNORECASE):
        return "Zondervan Reference Collection"
    if re.search(r"holman", t, re.IGNORECASE):
        return "Holman Reference Guides"
    return "Độc lập / Tuyển tập chuyên khảo"


def load_catalog() -> Dict[str, Any]:
    global _CATALOG_CACHE
    if _CATALOG_CACHE is not None:
        return _CATALOG_CACHE

    if not os.path.exists(CATALOG_PATH):
        return {"notebook_name": "Library", "total_sources": 0, "sources": []}

    try:
        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)

        enriched_sources = []
        for s in raw.get("sources", []):
            cat_info = determine_category(s.get("title", ""), s.get("author", ""))
            series_name = extract_series(s.get("title", ""))
            enriched_sources.append({
                **s,
                **cat_info,
                "series": series_name
            })

        raw["sources"] = enriched_sources
        _CATALOG_CACHE = raw
        return raw
    except Exception as e:
        print(f"Error loading catalog: {e}")
        return {"notebook_name": "Library", "total_sources": 0, "sources": []}


@router.get("/stats")
def get_library_stats(db: Session = Depends(get_db)):
    """Retrieve global metrics across the 275 theological works and indexed RAG chunks."""
    catalog = load_catalog()
    sources = catalog.get("sources", [])

    # Count categories and series
    cat_counts = {
        "commentary": 0,
        "dictionary": 0,
        "survey": 0,
        "monograph": 0
    }
    series_counts: Dict[str, int] = {}
    total_chars = 0
    total_chapters = 0

    for s in sources:
        cat = s.get("category", "monograph")
        if cat in cat_counts:
            cat_counts[cat] += 1
        ser = s.get("series", "Độc lập / Tuyển tập chuyên khảo")
        series_counts[ser] = series_counts.get(ser, 0) + 1

        total_chars += s.get("chars", 0)
        total_chapters += s.get("total_chapters", 0)

    # Chunks and notes from DB
    chunks_count = 0
    try:
        chunks_count = db.execute(text("SELECT count(*) FROM document_chunks;")).scalar() or 0
    except Exception:
        pass

    notes_count = 0
    try:
        notes_count = db.execute(text("SELECT count(*) FROM user_study_notes;")).scalar() or 0
    except Exception:
        pass

    return {
        "notebook_name": catalog.get("notebook_name", "NGHIÊN CỨU KINH THÁNH © AICoDoc.com"),
        "total_books": len(sources),
        "total_chunks_indexed": chunks_count,
        "total_chapters": total_chapters,
        "total_characters": total_chars,
        "total_user_notes": notes_count,
        "categories": {
            "commentaries": {
                "count": cat_counts["commentary"],
                "label_vi": "Bộ Chú Giải (Commentaries)"
            },
            "dictionaries": {
                "count": cat_counts["dictionary"],
                "label_vi": "Từ Điển & Bách Khoa (Dictionaries & Encyclopedias)"
            },
            "surveys": {
                "count": cat_counts["survey"],
                "label_vi": "Khảo Lược & Dẫn Nhập (Surveys & Introductions)"
            },
            "monographs": {
                "count": cat_counts["monograph"],
                "label_vi": "Thần Học Chuyên Đề (Theological Monographs)"
            }
        },
        "series": [
            {"series_name": k, "count": v}
            for k, v in sorted(series_counts.items(), key=lambda x: x[1], reverse=True)
            if k != "Độc lập / Tuyển tập chuyên khảo"
        ]
    }


@router.get("/series")
def list_library_series():
    """Retrieve series breakdown with counts."""
    stats = get_library_stats()
    return stats.get("series", [])


@router.get("/catalog")
def list_catalog(
    category: Optional[str] = Query(None, description="'commentary', 'dictionary', 'survey', or 'monograph'"),
    series: Optional[str] = Query(None, description="Filter by book series name"),
    q: Optional[str] = Query(None, description="Search by title, author or keyword"),
    limit: int = Query(50, ge=1, le=300),
    offset: int = Query(0, ge=0)
):
    """Retrieve catalog list of theological books with filtering and pagination."""
    catalog = load_catalog()
    all_sources = catalog.get("sources", [])

    filtered = all_sources

    if category and category != "all":
        c_clean = category.lower().strip()
        filtered = [s for s in filtered if s.get("category") == c_clean]

    if series and series != "all":
        s_clean = series.lower().strip()
        filtered = [s for s in filtered if s_clean in s.get("series", "").lower()]

    if q and q.strip():
        q_clean = q.lower().strip()
        filtered = [
            s for s in filtered 
            if q_clean in s.get("title", "").lower() 
            or q_clean in s.get("author", "").lower()
            or q_clean in s.get("filename", "").lower()
            or q_clean in s.get("series", "").lower()
        ]

    total_filtered = len(filtered)
    paged = filtered[offset : offset + limit]

    return {
        "total": total_filtered,
        "limit": limit,
        "offset": offset,
        "books": paged
    }


def extract_section_text(sec: dict) -> str:
    if "content" in sec and sec["content"]:
        return str(sec["content"])
    if "paragraphs" in sec and isinstance(sec["paragraphs"], list):
        return "\n\n".join(str(p) for p in sec["paragraphs"] if p)
    return ""


@router.get("/books/{book_index}")
def get_book_details(book_index: int):
    """Retrieve detailed outline and chapter structure for a specific theological book."""
    catalog = load_catalog()
    sources = catalog.get("sources", [])

    matched = next((s for s in sources if s.get("index") == book_index), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Book index {book_index} not found in catalog")

    filename = matched.get("filename", "")
    full_path = os.path.join(SOURCES_DIR, filename)

    chapters_summary = []
    sample_excerpt = ""

    if os.path.exists(full_path):
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = json.load(f)

            raw_chapters = content.get("chapters", [])
            for idx, ch in enumerate(raw_chapters):
                raw_secs = ch.get("sections", [])
                sections_count = len(raw_secs)
                first_section_txt = ""
                for s in raw_secs:
                    txt = extract_section_text(s).strip()
                    if txt:
                        first_section_txt = txt[:280]
                        break

                chapters_summary.append({
                    "chapter_index": ch.get("index", idx),
                    "title": ch.get("title", f"Chương {idx + 1}"),
                    "sections_count": sections_count,
                    "preview": first_section_txt
                })

            for ch in raw_chapters:
                for s in ch.get("sections", []):
                    txt = extract_section_text(s).strip()
                    if txt:
                        sample_excerpt = txt[:600]
                        break
                if sample_excerpt:
                    break

        except Exception as e:
            print(f"Error reading source file {filename}: {e}")

    return {
        "index": matched.get("index"),
        "id": matched.get("id"),
        "title": matched.get("title"),
        "author": matched.get("author"),
        "category": matched.get("category"),
        "category_vi": matched.get("category_vi"),
        "chars": matched.get("chars"),
        "total_chapters": matched.get("total_chapters"),
        "chapters_outline": chapters_summary,
        "sample_excerpt": sample_excerpt
    }


class ChapterSectionItem(BaseModel):
    heading: str
    content: str
    paragraphs: List[str] = []
    scripture_ref: Optional[str] = None


class ChapterDetailResponse(BaseModel):
    book_index: int
    book_title: str
    book_author: str
    series: Optional[str]
    chapter_index: int
    chapter_title: str
    chapter_number: Optional[str]
    total_sections: int
    sections: List[ChapterSectionItem]
    has_previous: bool
    has_next: bool
    previous_chapter_index: Optional[int]
    next_chapter_index: Optional[int]


@router.get("/books/{book_index}/chapters/{chapter_index}", response_model=ChapterDetailResponse)
def get_chapter_content(book_index: int, chapter_index: int):
    """Retrieve full text and sections of a specific chapter from a theological book."""
    catalog = load_catalog()
    sources = catalog.get("sources", [])

    matched = next((s for s in sources if s.get("index") == book_index), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Book index {book_index} not found in catalog")

    filename = matched.get("filename", "")
    full_path = os.path.join(SOURCES_DIR, filename)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"Source content file {filename} not found")

    try:
        with open(full_path, "r", encoding="utf-8") as f:
            content = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read book file: {str(e)}")

    raw_chapters = content.get("chapters", [])
    if not raw_chapters:
        raise HTTPException(status_code=404, detail="No chapters available in this book")

    target_ch = None
    target_pos = -1
    for pos, ch in enumerate(raw_chapters):
        if ch.get("index") == chapter_index or pos == chapter_index:
            target_ch = ch
            target_pos = pos
            break

    if target_ch is None:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_index} not found in book {book_index}")

    sections_data = []
    for sec in target_ch.get("sections", []):
        heading = sec.get("heading", "")
        raw_paras = sec.get("paragraphs", [])
        if not raw_paras and "content" in sec and sec["content"]:
            raw_paras = [sec["content"]]
        text_content = extract_section_text(sec)
        sections_data.append(ChapterSectionItem(
            heading=heading,
            content=text_content,
            paragraphs=[str(p) for p in raw_paras if p],
            scripture_ref=sec.get("scripture", "") or sec.get("scripture_ref", "") or None
        ))

    has_prev = target_pos > 0
    has_next = target_pos < len(raw_chapters) - 1
    prev_idx = raw_chapters[target_pos - 1].get("index", target_pos - 1) if has_prev else None
    next_idx = raw_chapters[target_pos + 1].get("index", target_pos + 1) if has_next else None

    return ChapterDetailResponse(
        book_index=matched.get("index"),
        book_title=matched.get("title", ""),
        book_author=matched.get("author", ""),
        series=matched.get("series", ""),
        chapter_index=target_ch.get("index", chapter_index),
        chapter_title=target_ch.get("title", f"Chương {chapter_index}"),
        chapter_number=target_ch.get("chapter_number", ""),
        total_sections=len(sections_data),
        sections=sections_data,
        has_previous=has_prev,
        has_next=has_next,
        previous_chapter_index=prev_idx,
        next_chapter_index=next_idx
    )


# --- Personal Study Notes API ---

class NoteCreateRequest(BaseModel):
    title: str = Field(..., max_length=200)
    scripture_ref: Optional[str] = Field(None, max_length=100)
    content: str
    tags: Optional[List[str]] = Field(default_factory=list)


@router.get("/notes")
def list_notes(
    q: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve user study notes with text and tag filtering."""
    conditions = []
    params: Dict[str, Any] = {"lim": limit}

    if q and q.strip():
        conditions.append("(title ILIKE :q OR content ILIKE :q OR scripture_ref ILIKE :q)")
        params["q"] = f"%{q.strip()}%"

    if tag and tag.strip():
        conditions.append("tags::jsonb ? :tag")
        params["tag"] = tag.strip()

    where_sql = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = text(f"""
        SELECT id, title, scripture_ref, content, tags, created_at, updated_at
        FROM user_study_notes
        {where_sql}
        ORDER BY updated_at DESC
        LIMIT :lim
    """)

    rows = db.execute(sql, params).fetchall()
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "scripture_ref": r.scripture_ref or "",
            "content": r.content,
            "tags": r.tags if isinstance(r.tags, list) else [],
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else ""
        }
        for r in rows
    ]


@router.post("/notes")
def create_note(req: NoteCreateRequest, db: Session = Depends(get_db)):
    """Create a new study note."""
    sql = text("""
        INSERT INTO user_study_notes (title, scripture_ref, content, tags)
        VALUES (:t, :s, :c, :tags::jsonb)
        RETURNING id, title, scripture_ref, content, tags, created_at, updated_at
    """)
    row = db.execute(
        sql,
        {
            "t": req.title.strip(),
            "s": req.scripture_ref.strip() if req.scripture_ref else None,
            "c": req.content.strip(),
            "tags": json.dumps(req.tags or [], ensure_ascii=False)
        }
    ).fetchone()
    db.commit()

    return {
        "id": str(row.id),
        "title": row.title,
        "scripture_ref": row.scripture_ref or "",
        "content": row.content,
        "tags": row.tags if isinstance(row.tags, list) else [],
        "created_at": row.created_at.isoformat() if row.created_at else "",
        "updated_at": row.updated_at.isoformat() if row.updated_at else ""
    }


@router.delete("/notes/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    """Delete a personal study note."""
    res = db.execute(text("DELETE FROM user_study_notes WHERE id = :nid"), {"nid": note_id})
    db.commit()
    if res.rowcount == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "success", "deleted_id": note_id}


# ==============================================================================
# SECTION 38 & 52: ACADEMIC CITATION SYSTEM & CORPUS ANALYTICS
# ==============================================================================

def format_academic_citations(book: Dict[str, Any]) -> Dict[str, str]:
    """Generates 5 standard academic citation formats (Chicago, SBL, APA, MLA, BibTeX, Markdown)."""
    title = book.get("title", "").strip()
    author = book.get("author", "").strip() or "Unknown"
    series = book.get("series", "").strip()
    category = book.get("category", "")

    # Estimate publisher based on series or default
    publisher = "InterVarsity Press"
    if "wiersbe" in title.lower() or "be series" in series.lower():
        publisher = "David C Cook"
    elif "zondervan" in title.lower() or "zondervan" in series.lower() or "nivac" in series.lower():
        publisher = "Zondervan Academic"
    elif "tyndale" in series.lower() or "totc" in title.lower() or "tntc" in title.lower() or "ivp" in series.lower():
        publisher = "IVP Academic"
    elif "oxford" in series.lower() or "oxford" in title.lower():
        publisher = "Oxford University Press"
    elif "macarthur" in title.lower():
        publisher = "Thomas Nelson"
    elif "baker" in title.lower() or "eerdmans" in title.lower():
        publisher = "Eerdmans Publishing"
    elif "kregel" in title.lower() or "40 questions" in title.lower():
        publisher = "Kregel Academic"

    # Split author into Last, First if possible
    author_parts = author.split(" ")
    if len(author_parts) >= 2 and "," not in author:
        last_name = author_parts[-1]
        first_names = " ".join(author_parts[:-1])
        author_reversed = f"{last_name}, {first_names}"
    else:
        author_reversed = author

    # Year estimate for bibliographic completeness
    year = 2012
    if "totc" in title.lower() or "tntc" in title.lower():
        year = 2008
    elif "wiersbe" in title.lower():
        year = 2009
    elif "macarthur" in title.lower():
        year = 2005

    # 1. Chicago / Turabian Style (Theological Seminary Standard)
    series_part = f" {series}." if series and "độc lập" not in series.lower() else ""
    chicago = f"{author_reversed}. {title}.{series_part} Grand Rapids: {publisher}, {year}."

    # 2. SBL Handbook of Style (Society of Biblical Literature)
    sbl = f"{author_reversed}. *{title}*.{series_part} {publisher}, {year}."

    # 3. APA 7th Edition
    initials = " ".join([p[0] + "." for p in author_parts[:-1]]) if len(author_parts) >= 2 else author
    apa_author = f"{author_parts[-1]}, {initials}" if len(author_parts) >= 2 else author
    apa = f"{apa_author} ({year}). {title}. {publisher}."

    # 4. MLA 9th Edition
    mla = f"{author_reversed}. *{title}*. {publisher}, {year}."

    # 5. BibTeX Entry
    cite_key = re.sub(r'[^a-zA-Z0-9]', '', author_parts[-1].lower() + str(year) + title[:6].lower())
    bibtex = f"""@book{{{cite_key},
  author    = {{{author}}},
  title     = {{{title}}},
  series    = {{{series}}},
  publisher = {{{publisher}}},
  year      = {{{year}}}
}}"""

    # 6. Markdown Copyable Citation
    markdown_cite = f"> **{author}** ({year}). *{title}*. {publisher}. (BibleKnowledge Theological Library Series: {series})"

    return {
        "chicago": chicago,
        "sbl": sbl,
        "apa": apa,
        "mla": mla,
        "bibtex": bibtex,
        "markdown": markdown_cite,
        "publisher": publisher,
        "estimated_year": str(year)
    }


@router.get("/citations")
def get_book_citations(
    book_index: Optional[int] = Query(None, description="Index của sách (0..274)"),
    q: Optional[str] = Query(None, description="Tìm kiếm sách để tạo trích dẫn học thuật"),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Returns multi-style formatted academic citations (§38) for theological books in the library.
    Supports Chicago, SBL, APA, MLA, BibTeX, and Markdown export.
    """
    catalog = load_catalog()
    sources = catalog.get("sources", [])

    results = []

    if book_index is not None:
        matched = next((s for s in sources if s.get("index") == book_index), None)
        if matched:
            cites = format_academic_citations(matched)
            return {
                "total": 1,
                "citations": [{
                    **matched,
                    "citations": cites
                }]
            }
        raise HTTPException(status_code=404, detail=f"Book index {book_index} not found")

    filtered = sources
    if q and q.strip():
        q_clean = q.lower().strip()
        filtered = [
            s for s in filtered
            if q_clean in s.get("title", "").lower()
            or q_clean in s.get("author", "").lower()
            or q_clean in s.get("series", "").lower()
        ]

    for s in filtered[:limit]:
        cites = format_academic_citations(s)
        results.append({
            "index": s.get("index"),
            "id": s.get("id"),
            "title": s.get("title"),
            "author": s.get("author"),
            "category": s.get("category"),
            "category_vi": s.get("category_vi"),
            "series": s.get("series"),
            "chars": s.get("chars"),
            "total_chapters": s.get("total_chapters"),
            "citations": cites
        })

    return {
        "total": len(filtered),
        "returned": len(results),
        "citations": results
    }


@router.get("/authors")
def list_library_authors():
    """
    Returns aggregated author statistics across the 275 theological works (§52).
    Ranks authors by volume count, chapters, and character depth.
    """
    catalog = load_catalog()
    sources = catalog.get("sources", [])

    author_map: Dict[str, Dict[str, Any]] = {}

    for s in sources:
        author = s.get("author", "").strip() or "Unknown / Biên Tập Viên Độc Lập"
        chars = s.get("chars", 0)
        chaps = s.get("total_chapters", 0)
        cat = s.get("category", "monograph")

        if author not in author_map:
            author_map[author] = {
                "name": author,
                "total_books": 0,
                "total_chapters": 0,
                "total_chars": 0,
                "categories": set(),
                "sample_books": []
            }

        rec = author_map[author]
        rec["total_books"] += 1
        rec["total_chapters"] += chaps
        rec["total_chars"] += chars
        rec["categories"].add(cat)
        if len(rec["sample_books"]) < 3:
            rec["sample_books"].append({
                "index": s.get("index"),
                "title": s.get("title"),
                "category_vi": s.get("category_vi")
            })

    # Sort authors by total_books DESC, then total_chars DESC
    sorted_authors = sorted(
        author_map.values(),
        key=lambda a: (a["total_books"], a["total_chars"]),
        reverse=True
    )

    # Convert categories set to list
    formatted_authors = []
    for a in sorted_authors:
        formatted_authors.append({
            **a,
            "categories": list(a["categories"]),
            "chars_formatted": f"{(a['total_chars'] / 1000000):.2f}M ký tự"
        })

    return {
        "total_distinct_authors": len(formatted_authors),
        "authors": formatted_authors
    }


@router.get("/series-catalog")
def list_series_catalog():
    """
    Returns complete breakdown of theological series collections in the library (§34, §52).
    Groups the 275 works by publisher sets and expository collections.
    """
    catalog = load_catalog()
    sources = catalog.get("sources", [])

    series_map: Dict[str, Dict[str, Any]] = {}

    for s in sources:
        series_name = s.get("series", "Độc lập / Tuyển tập chuyên khảo")
        if series_name not in series_map:
            series_map[series_name] = {
                "series_name": series_name,
                "total_volumes": 0,
                "total_chapters": 0,
                "total_chars": 0,
                "volumes": []
            }

        s_rec = series_map[series_name]
        s_rec["total_volumes"] += 1
        s_rec["total_chapters"] += s.get("total_chapters", 0)
        s_rec["total_chars"] += s.get("chars", 0)
        s_rec["volumes"].append({
            "index": s.get("index"),
            "id": s.get("id"),
            "title": s.get("title"),
            "author": s.get("author"),
            "category": s.get("category"),
            "category_vi": s.get("category_vi"),
            "chars": s.get("chars"),
            "total_chapters": s.get("total_chapters")
        })

    sorted_series = sorted(
        series_map.values(),
        key=lambda s: s["total_volumes"],
        reverse=True
    )

    return {
        "total_series": len(sorted_series),
        "series": sorted_series
    }

