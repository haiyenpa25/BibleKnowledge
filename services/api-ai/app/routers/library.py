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
            enriched_sources.append({
                **s,
                **cat_info
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

    # Count categories
    cat_counts = {
        "commentary": 0,
        "dictionary": 0,
        "survey": 0,
        "monograph": 0
    }
    total_chars = 0
    total_chapters = 0

    for s in sources:
        cat = s.get("category", "monograph")
        if cat in cat_counts:
            cat_counts[cat] += 1
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
        }
    }


@router.get("/catalog")
def list_catalog(
    category: Optional[str] = Query(None, description="'commentary', 'dictionary', 'survey', or 'monograph'"),
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

    if q and q.strip():
        q_clean = q.lower().strip()
        filtered = [
            s for s in filtered 
            if q_clean in s.get("title", "").lower() 
            or q_clean in s.get("author", "").lower()
            or q_clean in s.get("filename", "").lower()
        ]

    total_filtered = len(filtered)
    paged = filtered[offset : offset + limit]

    return {
        "total": total_filtered,
        "limit": limit,
        "offset": offset,
        "books": paged
    }


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
            for ch in raw_chapters:
                sections_count = len(ch.get("sections", []))
                first_section_txt = ""
                if sections_count > 0:
                    first_section_txt = ch["sections"][0].get("content", "")[:250]

                chapters_summary.append({
                    "title": ch.get("title", "Chương"),
                    "sections_count": sections_count,
                    "preview": first_section_txt
                })

            if raw_chapters and raw_chapters[0].get("sections"):
                sample_excerpt = raw_chapters[0]["sections"][0].get("content", "")[:600]

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
