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
