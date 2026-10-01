from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import re
from app.db.session import get_db

router = APIRouter(prefix="/bible", tags=["Bible Core"])


@router.get("/books")
def list_books(db: Session = Depends(get_db)):
    """List all 66 canonical Bible books."""
    sql = text("""
        SELECT id, testament, book_order, code, osis, name_vi, name_en, total_chapters
        FROM bible_books
        ORDER BY book_order ASC
    """)
    rows = db.execute(sql).fetchall()
    return [
        {
            "id": r.id,
            "testament": r.testament,
            "order": r.book_order,
            "code": r.code,
            "osis": r.osis,
            "name_vi": r.name_vi,
            "name_en": r.name_en,
            "total_chapters": r.total_chapters
        }
        for r in rows
    ]


@router.get("/chapter")
def get_chapter(
    book: str = Query(..., description="Book code, OSIS, or name (e.g. 'sa', 'Gen', 'Sáng-thế Ký')"),
    chapter: int = Query(1, ge=1, description="Chapter number (1..N)"),
    db: Session = Depends(get_db)
):
    """Get all verses for a specific chapter of a book."""
    clean = book.strip().lower()
    sql_book = text("""
        SELECT id, testament, book_order, code, osis, name_vi, name_en, total_chapters
        FROM bible_books
        WHERE LOWER(code) = :c OR LOWER(osis) = :c OR LOWER(name_vi) = :c OR LOWER(name_en) = :c
        LIMIT 1
    """)
    b = db.execute(sql_book, {"c": clean}).fetchone()
    if not b:
        sql_fallback = text("""
            SELECT id, testament, book_order, code, osis, name_vi, name_en, total_chapters
            FROM bible_books
            WHERE LOWER(name_vi) LIKE :c
            LIMIT 1
        """)
        b = db.execute(sql_fallback, {"c": f"%{clean}%"}).fetchone()

    if not b:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sách: '{book}'")

    if chapter > b.total_chapters:
        raise HTTPException(status_code=400, detail=f"Sách {b.name_vi} chỉ có {b.total_chapters} đoạn.")

    sql_verses = text("""
        SELECT global_id, verse_code, chapter, verse, section_title, text, cross_references
        FROM bible_verses
        WHERE book_id = :book_id AND chapter = :chapter
        ORDER BY verse ASC
    """)
    rows = db.execute(sql_verses, {"book_id": b.id, "chapter": chapter}).fetchall()

    return {
        "book": {
            "id": b.id,
            "order": b.book_order,
            "code": b.code,
            "osis": b.osis,
            "name_vi": b.name_vi,
            "name_en": b.name_en,
            "testament": b.testament,
            "total_chapters": b.total_chapters
        },
        "chapter": chapter,
        "total_verses": len(rows),
        "has_previous": chapter > 1 or b.book_order > 1,
        "has_next": chapter < b.total_chapters or b.book_order < 66,
        "verses": [
            {
                "global_id": r.global_id,
                "verse_code": r.verse_code,
                "chapter": r.chapter,
                "verse": r.verse,
                "section_title": r.section_title or "",
                "text": r.text,
                "cross_references": r.cross_references or []
            }
            for r in rows
        ]
    }


@router.get("/verse-range")
def get_verse_range(
    ref: str = Query(..., description="Scripture reference (e.g. 'Giăng 3:16', 'Giăng 3:16-18', 'Ma-thi-ơ 14:22 - 15:5')"),
    db: Session = Depends(get_db)
):
    """
    Extract scripture verses across single verse, intra-chapter, or cross-chapter ranges.
    Uses composite verse_code index: (book_order * 1,000,000) + (chapter * 1,000) + verse.
    """
    ref_clean = ref.strip()

    # Get all books for alias matching
    books = db.execute(text("SELECT id, book_order, code, osis, name_vi, name_en FROM bible_books")).fetchall()
    book_match = None
    matched_book_str = ""

    # Sort books by name length descending to match longest first (e.g. "I Sa-mu-ên" before "Sa-mu-ên")
    sorted_books = sorted(books, key=lambda b: len(b.name_vi), reverse=True)

    for b in sorted_books:
        patterns = [
            b.name_vi.lower(),
            b.name_vi.lower().replace("-", " "),
            b.code.lower(),
            b.osis.lower(),
            b.name_en.lower()
        ]
        for p in patterns:
            if ref_clean.lower().startswith(p):
                # Ensure word boundary or space
                rest = ref_clean[len(p):].strip()
                if rest and (rest[0].isdigit() or rest[0] in [':', '.']):
                    book_match = b
                    matched_book_str = ref_clean[:len(p)]
                    break
        if book_match:
            break

    if not book_match:
        # Try regex fallback for books like "Ma-thi-ơ", "Giăng", "Sáng-thế Ký"
        first_word = ref_clean.split()[0].lower() if ' ' in ref_clean else ''
        for b in sorted_books:
            if b.name_vi.lower().startswith(first_word) or b.code.lower() == first_word:
                book_match = b
                break

    if not book_match:
        raise HTTPException(status_code=400, detail=f"Không nhận diện được tên sách trong chuỗi: '{ref}'")

    rem = ref_clean[len(matched_book_str):].strip() if matched_book_str else ref_clean.replace(book_match.name_vi, "").strip()

    start_chap, start_v, end_chap, end_v = 1, 1, 1, 1

    # 1. Cross-chapter: "14:22 - 15:5" or "14:22-15:5"
    m_cross = re.match(r'^(\d+)[:\.](\d+)\s*[-–—]\s*(\d+)[:\.](\d+)$', rem)
    if m_cross:
        start_chap = int(m_cross.group(1))
        start_v = int(m_cross.group(2))
        end_chap = int(m_cross.group(3))
        end_v = int(m_cross.group(4))
    else:
        # 2. Intra-chapter range: "3:16-18"
        m_intra = re.match(r'^(\d+)[:\.](\d+)\s*[-–—]\s*(\d+)$', rem)
        if m_intra:
            start_chap = int(m_intra.group(1))
            start_v = int(m_intra.group(2))
            end_chap = start_chap
            end_v = int(m_intra.group(3))
        else:
            # 3. Single verse: "3:16"
            m_single = re.match(r'^(\d+)[:\.](\d+)$', rem)
            if m_single:
                start_chap = int(m_single.group(1))
                start_v = int(m_single.group(2))
                end_chap = start_chap
                end_v = start_v
            else:
                raise HTTPException(status_code=400, detail=f"Định dạng chương/câu không hợp lệ: '{rem}'")

    start_code = (book_match.book_order * 1000000) + (start_chap * 1000) + start_v
    end_code = (book_match.book_order * 1000000) + (end_chap * 1000) + end_v

    sql = text("""
        SELECT v.global_id, v.verse_code, b.name_vi, b.osis, v.chapter, v.verse, v.section_title, v.text, v.cross_references
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        WHERE v.verse_code >= :start_code AND v.verse_code <= :end_code
        ORDER BY v.verse_code ASC
    """)

    rows = db.execute(sql, {"start_code": start_code, "end_code": end_code}).fetchall()

    return {
        "reference": ref,
        "book": book_match.name_vi,
        "total_verses": len(rows),
        "verses": [
            {
                "global_id": r.global_id,
                "verse_code": r.verse_code,
                "book": r.name_vi,
                "osis": r.osis,
                "chapter": r.chapter,
                "verse": r.verse,
                "section_title": r.section_title,
                "text": r.text,
                "cross_references": r.cross_references
            }
            for r in rows
        ]
    }


@router.get("/search")
def search_bible(
    q: str = Query(..., min_length=2, description="Từ khóa tìm kiếm"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Full-text search across 31,081 Bible verses using PostgreSQL GIN tsvector."""
    # Convert query into simple terms joined with &
    terms = [w.strip() for w in q.split() if w.strip()]
    tsquery = " & ".join(terms)

    sql = text("""
        SELECT v.global_id, v.verse_code, b.name_vi, v.chapter, v.verse, v.section_title, v.text,
               ts_rank(v.search_vector, to_tsquery('simple', :tsquery)) as rank
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        WHERE v.search_vector @@ to_tsquery('simple', :tsquery)
        ORDER BY rank DESC, v.verse_code ASC
        LIMIT :limit
    """)

    rows = db.execute(sql, {"tsquery": tsquery, "limit": limit}).fetchall()

    return {
        "query": q,
        "count": len(rows),
        "results": [
            {
                "global_id": r.global_id,
                "verse_code": r.verse_code,
                "book": r.name_vi,
                "chapter": r.chapter,
                "verse": r.verse,
                "section_title": r.section_title,
                "text": r.text,
                "rank": float(r.rank)
            }
            for r in rows
        ]
    }


@router.get("/daily-insight")
def get_daily_insight(db: Session = Depends(get_db)):
    """
    Get Daily Verse, Person of the Day, Event of the Day, and system overview metrics.
    Reference: ROADMAP1.md Section 53
    """
    # 1. Verse of the Day (Curated pool)
    curated_refs = [
        "Giăng 3:16",
        "Thi-thiên 23:1",
        "Rô-ma 8:28",
        "Phi-líp 4:13",
        "Châm-ngôn 3:5-6",
        "Ê-sai 40:31",
        "Giê-rê-mi 29:11"
    ]
    import random
    selected_ref = random.choice(curated_refs)

    # Fetch verse text
    v_row = db.execute(
        text("""
        SELECT b.name_vi, v.chapter, v.verse, v.text, v.verse_code
        FROM bible_verses v
        JOIN bible_books b ON b.id = v.book_id
        WHERE v.search_vector @@ plainto_tsquery('simple', :ref_q)
        LIMIT 1
        """),
        {"ref_q": selected_ref}
    ).fetchone()

    verse_data = None
    if v_row:
        verse_data = {
            "reference": selected_ref,
            "book": v_row.name_vi,
            "chapter": v_row.chapter,
            "verse": v_row.verse,
            "text": v_row.text,
            "verse_code": v_row.verse_code
        }
    else:
        verse_data = {
            "reference": "Giăng 3:16",
            "book": "Giăng",
            "chapter": 3,
            "verse": 16,
            "text": "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
            "verse_code": 43003016
        }

    # 2. Person of the Day
    p_row = db.execute(
        text("SELECT slug, name_vi, name_en, title_or_role, summary, timeline_period, metadata FROM people ORDER BY RANDOM() LIMIT 1")
    ).fetchone()

    person_data = None
    if p_row:
        person_data = {
            "slug": p_row.slug,
            "name_vi": p_row.name_vi,
            "name_en": p_row.name_en,
            "title_or_role": p_row.title_or_role,
            "summary": p_row.summary,
            "timeline_period": p_row.timeline_period,
            "key_verse": (p_row.metadata or {}).get("key_verse")
        }

    # 3. Event of the Day
    e_row = db.execute(
        text("SELECT slug, title, approximate_date, period, description, metadata FROM events ORDER BY RANDOM() LIMIT 1")
    ).fetchone()

    event_data = None
    if e_row:
        event_data = {
            "slug": e_row.slug,
            "title": e_row.title,
            "approximate_date": e_row.approximate_date,
            "period": e_row.period,
            "description": e_row.description,
            "scripture": (e_row.metadata or {}).get("scripture")
        }

    # 4. System Counts
    total_verses = db.execute(text("SELECT count(*) FROM bible_verses")).scalar() or 0
    total_chunks = db.execute(text("SELECT count(*) FROM document_chunks")).scalar() or 0
    total_flashcards = db.execute(text("SELECT count(*) FROM flashcards")).scalar() or 0
    total_notes = db.execute(text("SELECT count(*) FROM user_study_notes")).scalar() or 0
    total_nodes = db.execute(text("SELECT count(*) FROM knowledge_nodes")).scalar() or 0

    return {
        "verse_of_the_day": verse_data,
        "person_of_the_day": person_data,
        "event_of_the_day": event_data,
        "metrics": {
            "total_verses": total_verses,
            "total_chunks": total_chunks,
            "total_flashcards": total_flashcards,
            "total_notes": total_notes,
            "total_nodes": total_nodes
        }
    }

