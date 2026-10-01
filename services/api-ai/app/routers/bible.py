from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field
import re
import json
import urllib.request
import urllib.parse
from app.db.session import get_db

router = APIRouter(prefix="/bible", tags=["Bible Core"])

# Global in-memory cache for parallel translations (e.g. KJV)
PARALLEL_CACHE: Dict[str, Dict[int, str]] = {}

# Canonical keyword mappings to Strong numbers for accurate original language matching
KEYWORD_MAP: Dict[str, List[str]] = {
    "yêu thương": ["G0026", "H2617"],
    "yêu": ["G0026", "H2617"],
    "ân điển": ["G5485"],
    "ơn": ["G5485"],
    "đức tin": ["G4102", "H0539"],
    "tin": ["G4102", "H0539"],
    "lời": ["G3056"],
    "đạo": ["G3056"],
    "thánh linh": ["G4151", "H7307"],
    "thần": ["G4151", "H7307"],
    "thông công": ["G2842"],
    "ban đầu": ["H7225"],
    "dựng nên": ["H1254"],
    "sáng tạo": ["H1254"],
    "nhân từ": ["H2617"],
    "thương xót": ["H2617"],
    "bình an": ["H7965"],
    "giao ước": ["H1285"],
    "đức chúa trời": ["H0430", "G2316"],
    "giê-hô-va": ["H3068"],
    "chúa": ["G2962", "H3068"],
    "chủ": ["G2962"],
    "đấng christ": ["G5547"],
    "mê-si-a": ["G5547"],
    "tin lành": ["G2098"],
    "phúc âm": ["G2098"],
    "ăn năn": ["G3341"],
    "cứu rỗi": ["G4991"],
    "cứu": ["G4991"],
    "thánh": ["H6944"]
}


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


@router.get("/books/{code}")
def get_book_details(code: str, db: Session = Depends(get_db)):
    """Get metadata for a specific book by code, osis or name."""
    clean = code.strip().lower()
    sql_book = text("""
        SELECT id, testament, book_order, code, osis, name_vi, name_en, total_chapters
        FROM bible_books
        WHERE LOWER(code) = :c OR LOWER(osis) = :c OR LOWER(name_vi) = :c OR LOWER(name_en) = :c
        LIMIT 1
    """)
    book_row = db.execute(sql_book, {"c": clean}).fetchone()
    if not book_row:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sách: '{code}'")
    return {
        "id": book_row.id,
        "testament": book_row.testament,
        "order": book_row.book_order,
        "code": book_row.code,
        "osis": book_row.osis,
        "name_vi": book_row.name_vi,
        "name_en": book_row.name_en,
        "total_chapters": book_row.total_chapters
    }


@router.get("/books/{code}/chapters/{chapter}")
def get_chapter_by_path(code: str, chapter: int, db: Session = Depends(get_db)):
    """RESTful path endpoint to get all verses for a book chapter."""
    return get_chapter(book=code, chapter=chapter, db=db)


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
@router.get("/passage")
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
        # Common aliases
        if b.code.lower() == "cong":
            patterns.extend(["công-vụ", "công vụ", "cv", "cong-vu"])
        if b.name_vi.lower().startswith("i "):
            patterns.extend([b.name_vi.lower().replace("i ", "1 "), b.name_vi.lower().replace("i ", "1")])
        elif b.name_vi.lower().startswith("ii "):
            patterns.extend([b.name_vi.lower().replace("ii ", "2 "), b.name_vi.lower().replace("ii ", "2")])
        elif b.name_vi.lower().startswith("iii "):
            patterns.extend([b.name_vi.lower().replace("iii ", "3 "), b.name_vi.lower().replace("iii ", "3")])

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
        # Try regex fallback for books like "Ma-thi-ơ", "Giăng", "Sáng-thế Ký", "Công-vụ"
        first_word = ref_clean.split()[0].lower() if ' ' in ref_clean else ''
        for b in sorted_books:
            if b.name_vi.lower().startswith(first_word) or b.code.lower() == first_word:
                book_match = b
                matched_book_str = ref_clean[:len(first_word)]
                break

    if not book_match:
        raise HTTPException(status_code=400, detail=f"Không nhận diện được tên sách trong chuỗi: '{ref}'")

    rem = ref_clean[len(matched_book_str):].strip()

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

    # 4. Daily Quiz Question (§3, §46, §53)
    q_row = db.execute(
        text("SELECT id, question_text, options, correct_option, explanation, scripture_reference, difficulty FROM quiz_questions ORDER BY RANDOM() LIMIT 1")
    ).fetchone()
    daily_quiz = None
    if q_row:
        daily_quiz = {
            "id": str(q_row.id),
            "question": q_row.question_text,
            "options": q_row.options if isinstance(q_row.options, list) else json.loads(q_row.options or "[]"),
            "correct_index": q_row.correct_option,
            "explanation": q_row.explanation or "",
            "scripture_ref": q_row.scripture_reference or "",
            "difficulty_level": q_row.difficulty
        }

    # 5. Featured Sermon Blueprint (§50)
    from app.routers.study import SERMON_PRESETS
    featured_sermon = {
        "id": SERMON_PRESETS[0].id,
        "title": SERMON_PRESETS[0].title,
        "passage_ref": SERMON_PRESETS[0].passage_ref,
        "theme": SERMON_PRESETS[0].theme,
        "summary": SERMON_PRESETS[0].summary
    }

    # 6. Featured Challenge Pack (§46)
    from app.routers.learn import CHALLENGE_PACKS_DATA
    cp = CHALLENGE_PACKS_DATA[0]
    featured_pack = {
        "id": cp["id"],
        "title": cp["title"],
        "description": cp["description"],
        "category": cp["category"],
        "total_questions": cp["total_questions"],
        "badge_label": cp["badge_label"]
    }

    # 7. Featured Biblical Journey (§9)
    from app.routers.graph import list_biblical_journeys
    all_j = list_biblical_journeys()
    fj = all_j[1] if len(all_j) > 1 else all_j[0]
    featured_journey = {
        "id": fj["id"],
        "title": fj["title"],
        "period": fj["period"],
        "waypoints_count": len(fj.get("waypoints", [])),
        "description": fj["description"]
    }

    # 8. System Counts & Metrics
    total_verses = db.execute(text("SELECT count(*) FROM bible_verses")).scalar() or 0
    total_chunks = db.execute(text("SELECT count(*) FROM document_chunks")).scalar() or 0
    total_flashcards = db.execute(text("SELECT count(*) FROM flashcards")).scalar() or 0
    total_notes = db.execute(text("SELECT count(*) FROM user_study_notes")).scalar() or 0
    total_nodes = db.execute(text("SELECT count(*) FROM knowledge_nodes")).scalar() or 0

    return {
        "verse_of_the_day": verse_data,
        "person_of_the_day": person_data,
        "event_of_the_day": event_data,
        "daily_quiz": daily_quiz,
        "featured_sermon": featured_sermon,
        "featured_challenge_pack": featured_pack,
        "featured_journey": featured_journey,
        "metrics": {
            "total_verses": total_verses,
            "total_chunks": total_chunks,
            "total_flashcards": total_flashcards,
            "total_notes": total_notes,
            "total_nodes": total_nodes,
            "total_journeys": len(all_j),
            "total_challenge_packs": len(CHALLENGE_PACKS_DATA),
            "total_sermon_presets": len(SERMON_PRESETS)
        }
    }


def format_verse_academic_citations(book_name: str, chapter: int, verse: int, text_content: str) -> Dict[str, str]:
    """Generates 5 standard academic citation formats for a biblical verse (§38)."""
    ref = f"{book_name} {chapter}:{verse}"
    clean = text_content.strip()
    cite_key = f"vie1925_{re.sub(r'[^a-zA-Z0-9]', '', book_name.lower())}_{chapter}_{verse}"
    return {
        "reference": ref,
        "sbl": f"Kinh Thánh (Bản Dịch Truyền Thống 1925), {ref}.",
        "chicago": f"Kinh Thánh: Bản Truyền Thống 1925. Hà Nội: Thánh Kinh Hội, 1925. {ref}.",
        "apa": f"Thánh Kinh Hội. (1925). Kinh Thánh Tiếng Việt Bản Truyền Thống ({ref}). Văn Phẩm Cơ Đốc.",
        "mla": f"Kinh Thánh Bản Truyền Thống 1925. {ref}. Thánh Kinh Hội, 1925.",
        "bibtex": f"""@misc{{{cite_key},
  title        = {{Kinh Thánh Tiếng Việt 1925: {ref}}},
  publisher    = {{Thánh Kinh Hội}},
  year         = {{1925}},
  note         = {{{clean[:80]}...}}
}}""",
        "markdown": f"> \"{clean}\" — **{ref}** (Bản Truyền Thống 1925)"
    }


def classify_cross_reference(source_book: str, target_ref: str, source_testament: str) -> Dict[str, str]:
    """
    Classifies cross-reference according to ROADMAP1 §18 connection types:
    - quotation (trích dẫn nguyên văn)
    - explicit (liên chiếu trực tiếp)
    - parallel (đối chiếu song song)
    - allusion (ám chỉ / hình bóng tiên tri)
    - theological_connection (kết nối thần học & giáo lý)
    """
    target_clean = target_ref.strip()
    target_lower = target_clean.lower()
    source_lower = source_book.lower()

    gospel_names = ["ma-thi-ơ", "mác", "lu-ca", "giăng", "mat", "mac", "lu", "gi"]
    is_source_gospel = any(s in source_lower for s in gospel_names)
    is_target_gospel = any(target_lower.startswith(s) or f" {s}" in target_lower for s in ["mat", "mac", "lu", "gi", "ma-thi-ơ", "mác", "lu-ca", "giăng"])

    if is_source_gospel and is_target_gospel:
        return {
            "type": "parallel",
            "type_label": "Đối Chiếu Song Song (Gospel Parallel)",
            "badge_color": "purple"
        }

    ot_hist = ["sa-mu-ên", "các vua", "sử ký", "1sm", "2sm", "1ki", "2ki", "1ch", "2ch", "1su", "2su", "1vua", "2vua"]
    if any(h in source_lower for h in ot_hist) and any(h in target_lower for h in ot_hist):
        return {
            "type": "parallel",
            "type_label": "Đối Chiếu Sử Thi Cựu Ước",
            "badge_color": "indigo"
        }

    is_source_nt = source_testament == "NT"
    ot_keywords = ["sáng thế", "xuất", "lê-vi", "dân số", "phục truyền", "thi thiên", "ê-sai", "giê-rê-mi", "ê-xê-chi-ên", "đa-ni-ên", "ô-sê", "mi-chê", "xa-cha-ri", "ma-la-chi", "ha-ba-cúc", "ha ", "hab ", "am ", "na ", "so ", "sa ", "xu ", "le ", "dan ", "phuc ", "thi ", "es ", "gie ", "da "]
    nt_keywords = ["ma-thi-ơ", "mác", "lu-ca", "giăng", "công vụ", "rô-ma", "cô-rinh-tô", "hê-bơ-rơ", "khải huyền", "mat ", "mac ", "lu ", "gi ", "cv ", "ro ", "1co ", "2co ", "he ", "kh "]

    if is_source_nt and any(ot in target_lower for ot in ot_keywords):
        return {
            "type": "quotation",
            "type_label": "Trích Dẫn / Ứng Nghiệm Lời Tiên Tri Cựu Ước",
            "badge_color": "amber"
        }
    if not is_source_nt and any(nt in target_lower for nt in nt_keywords):
        return {
            "type": "allusion",
            "type_label": "Hình Bóng Ứng Nghiệm Trong Tân Ước",
            "badge_color": "emerald"
        }

    epistles = ["rô-ma", "cô-rinh-tô", "ga-la-ti", "ê-phê-sô", "phi-líp", "cô-lô-se", "tê-sa-lô-ni-ca", "ti-mô-thê", "tít", "hê-bơ-rơ", "gia-cơ", "phi-e-rơ", "giăng", "ro", "co", "ga", "ep", "phi", "cl", "te", "ti", "tit", "he", "gia"]
    if any(ep in source_lower for ep in epistles):
        return {
            "type": "theological_connection",
            "type_label": "Liên Kết Giáo Lý & Thần Học Tân Ước",
            "badge_color": "blue"
        }

    return {
        "type": "explicit",
        "type_label": "Liên Chiếu Bản Văn Trực Tiếp",
        "badge_color": "slate"
    }


def find_harmony_event_for_verse(book_code: str, chapter: int, verse: int) -> Optional[Dict[str, Any]]:
    """Finds if a verse belongs to any Gospel Harmony or OT Parallel event in HARMONY_EVENTS_CATALOG (§8, §18)."""
    b_code = book_code.lower().strip()
    # HARMONY_EVENTS_CATALOG is defined globally in this module
    catalog = globals().get("HARMONY_EVENTS_CATALOG", [])
    for ev in catalog:
        passages = ev.get("passages", {})
        for g_key, p_info in passages.items():
            if p_info.get("book_code", "").lower() == b_code:
                if p_info.get("chapter") == chapter:
                    start_v = p_info.get("start_verse", 1)
                    end_v = p_info.get("end_verse", 999)
                    if start_v <= verse <= end_v:
                        parallel_list = []
                        for other_g, other_p in passages.items():
                            parallel_list.append({
                                "key": other_g,
                                "book_name": other_p.get("book_name"),
                                "ref": other_p.get("ref"),
                                "theological_focus": other_p.get("theological_focus"),
                                "is_current": other_g == g_key
                            })
                        return {
                            "event_id": ev["id"],
                            "title_vi": ev["title_vi"],
                            "title_en": ev["title_en"],
                            "category": ev["category"],
                            "period_date": ev.get("period_date", ""),
                            "location": ev.get("location", ""),
                            "summary": ev.get("summary", ""),
                            "current_focus": p_info.get("theological_focus", ""),
                            "parallels": parallel_list,
                            "synoptic_distinctives": ev.get("synoptic_distinctives")
                        }
    return None


@router.get("/verse-details")
def get_verse_details(
    verse_code: Optional[int] = Query(None, description="Exact verse code, e.g. 43003016"),
    ref: Optional[str] = Query(None, description="Scripture ref, e.g. 'Giăng 3:16'"),
    book: Optional[str] = Query(None, description="Book name or code"),
    chapter: Optional[int] = Query(None, description="Chapter number"),
    verse: Optional[int] = Query(None, description="Verse number"),
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive theological context for a single verse:
    - Canonical text & translation info
    - Associated Biblical Entities (People, Places, Events)
    - Original Language Strong's Lexicon entries (Greek/Hebrew)
    - User Bookmarks & Personal Study Notes
    - Cross-reference verse previews
    """
    v_row = None

    if verse_code:
        v_row = db.execute(
            text("""
            SELECT v.id, v.verse_code, v.chapter, v.verse, v.section_title, v.text, v.cross_references,
                   b.id as book_id, b.code as book_code, b.name_vi as book_name, b.name_en as book_en,
                   b.testament, b.book_order
            FROM bible_verses v
            JOIN bible_books b ON v.book_id = b.id
            WHERE v.verse_code = :vc
            LIMIT 1
            """),
            {"vc": verse_code}
        ).fetchone()
    elif ref:
        # Match using get_verse_range style parser
        from app.routers.bible import get_verse_range
        try:
            res = get_verse_range(ref=ref, db=db)
            if res.get("verses"):
                first_v = res["verses"][0]
                return get_verse_details(verse_code=first_v["verse_code"], db=db)
        except Exception:
            pass
    elif book and chapter and verse:
        v_row = db.execute(
            text("""
            SELECT v.id, v.verse_code, v.chapter, v.verse, v.section_title, v.text, v.cross_references,
                   b.id as book_id, b.code as book_code, b.name_vi as book_name, b.name_en as book_en,
                   b.testament, b.book_order
            FROM bible_verses v
            JOIN bible_books b ON v.book_id = b.id
            WHERE (LOWER(b.name_vi) = LOWER(:b) OR LOWER(b.code) = LOWER(:b) OR LOWER(b.osis) = LOWER(:b))
              AND v.chapter = :c AND v.verse = :v
            LIMIT 1
            """),
            {"b": book.strip(), "c": chapter, "v": verse}
        ).fetchone()

    if not v_row:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu Kinh Thánh yêu cầu.")

    verse_id = v_row.id
    v_code = v_row.verse_code
    scripture_ref = f"{v_row.book_name} {v_row.chapter}:{v_row.verse}"
    testament = v_row.testament

    # 1. Fetch linked Entities from verse_entities
    entities_rows = db.execute(
        text("""
        SELECT e.entity_type, e.mention_type,
               p.id as person_id, p.slug as person_slug, p.name_vi as person_name, p.name_en as person_name_en,
               p.title_or_role as person_role, p.summary as person_summary,
               pl.id as place_id, pl.slug as place_slug, pl.name_vi as place_name, pl.name_en as place_name_en,
               pl.modern_name as place_modern, pl.latitude, pl.longitude, pl.description as place_desc,
               ev.id as event_id, ev.slug as event_slug, ev.title as event_title, ev.period as event_period,
               ev.description as event_desc
        FROM verse_entities e
        LEFT JOIN people p ON e.entity_type = 'person' AND e.entity_id = p.id
        LEFT JOIN places pl ON e.entity_type = 'place' AND e.entity_id = pl.id
        LEFT JOIN events ev ON e.entity_type = 'event' AND e.entity_id = ev.id
        WHERE e.verse_id = :vid
        """),
        {"vid": verse_id}
    ).fetchall()

    people_list = []
    places_list = []
    events_list = []
    seen_people = set()
    seen_places = set()
    seen_events = set()

    for r in entities_rows:
        if r.entity_type == "person" and r.person_id and r.person_slug not in seen_people:
            seen_people.add(r.person_slug)
            people_list.append({
                "id": str(r.person_id),
                "slug": r.person_slug,
                "name_vi": r.person_name,
                "name_en": r.person_name_en,
                "role": r.person_role,
                "summary": r.person_summary
            })
        elif r.entity_type == "place" and r.place_id and r.place_slug not in seen_places:
            seen_places.add(r.place_slug)
            places_list.append({
                "id": str(r.place_id),
                "slug": r.place_slug,
                "name_vi": r.place_name,
                "name_en": r.place_name_en,
                "modern_name": r.place_modern,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "description": r.place_desc
            })
        elif r.entity_type == "event" and r.event_id and r.event_slug not in seen_events:
            seen_events.add(r.event_slug)
            events_list.append({
                "id": str(r.event_id),
                "slug": r.event_slug,
                "title": r.event_title,
                "period": r.event_period,
                "description": r.event_desc
            })

    # Dynamic Fallback: if no people found, check verse text for core names
    if not people_list:
        p_candidates = db.execute(text("SELECT id, slug, name_vi, name_en, title_or_role, summary FROM people")).fetchall()
        for pc in p_candidates:
            if pc.name_vi in v_row.text or (pc.slug == "chua-gie-xu" and ("Chúa" in v_row.text or "Giê-xu" in v_row.text)):
                if pc.slug not in seen_people:
                    seen_people.add(pc.slug)
                    people_list.append({
                        "id": str(pc.id),
                        "slug": pc.slug,
                        "name_vi": pc.name_vi,
                        "name_en": pc.name_en,
                        "role": pc.title_or_role,
                        "summary": pc.summary
                    })

    if not places_list:
        pl_candidates = db.execute(text("SELECT id, slug, name_vi, name_en, modern_name, latitude, longitude, description FROM places")).fetchall()
        for plc in pl_candidates:
            if plc.name_vi in v_row.text and plc.slug not in seen_places:
                seen_places.add(plc.slug)
                places_list.append({
                    "id": str(plc.id),
                    "slug": plc.slug,
                    "name_vi": plc.name_vi,
                    "name_en": plc.name_en,
                    "modern_name": plc.modern_name,
                    "latitude": plc.latitude,
                    "longitude": plc.longitude,
                    "description": plc.description
                })

    # 2. Strong Lexicon Search (Greek for NT, Hebrew for OT, plus key_verses match)
    lang_filter = "greek" if testament == "NT" else "hebrew"
    lex_rows = db.execute(
        text("SELECT id, strong_number, language, lemma, transliteration, pronunciation, part_of_speech, definition, theological_significance, key_verses FROM strong_lexicon WHERE language = :lang"),
        {"lang": lang_filter}
    ).fetchall()

    matched_lexicon = []
    v_text_lower = v_row.text.lower()

    matched_strong_nums = set()

    for kw, s_nums in KEYWORD_MAP.items():
        if kw in v_text_lower:
            for sn in s_nums:
                matched_strong_nums.add(sn)

    for lr in lex_rows:
        kv_list = lr.key_verses
        if isinstance(kv_list, str):
            try:
                kv_list = json.loads(kv_list)
            except Exception:
                kv_list = [kv_list]

        # Match by explicit verse reference or by theological keyword
        is_ref_match = any(scripture_ref.lower() in k.lower() for k in kv_list)
        is_num_match = lr.strong_number in matched_strong_nums

        if is_ref_match or is_num_match:
            matched_lexicon.append({
                "id": lr.id,
                "strong_number": lr.strong_number,
                "language": lr.language,
                "lemma": lr.lemma,
                "transliteration": lr.transliteration,
                "pronunciation": lr.pronunciation,
                "part_of_speech": lr.part_of_speech,
                "definition": lr.definition,
                "theological_significance": lr.theological_significance,
                "matched_by": "reference" if is_ref_match else "keyword"
            })

    # 3. Bookmark status
    bm_row = db.execute(
        text("SELECT id, color, note, created_at FROM user_bookmarks WHERE verse_code = :vc"),
        {"vc": v_code}
    ).fetchone()
    bookmark_info = {
        "is_bookmarked": bm_row is not None,
        "color": bm_row.color if bm_row else None,
        "note": bm_row.note if bm_row else None
    }

    # 4. User Study Notes for this verse/passage
    notes_rows = db.execute(
        text("""
        SELECT id, title, scripture_ref, content, tags, updated_at
        FROM user_study_notes
        WHERE scripture_ref ILIKE :pat
        ORDER BY updated_at DESC
        """),
        {"pat": f"%{v_row.book_name}%{v_row.chapter}:{v_row.verse}%"}
    ).fetchall()

    user_notes = [
        {
            "id": str(n.id),
            "title": n.title,
            "scripture_ref": n.scripture_ref,
            "content": n.content,
            "tags": n.tags if isinstance(n.tags, list) else [],
            "updated_at": n.updated_at.isoformat() if n.updated_at else ""
        }
        for n in notes_rows
    ]

    # 5. Cross Reference Previews with ROADMAP1 §18 Connection Classification
    raw_cross = v_row.cross_references or []
    cross_previews = []
    for ref_str in raw_cross[:6]:
        preview_text = ""
        try:
            from app.routers.bible import get_verse_range
            cr_res = get_verse_range(ref=ref_str, db=db)
            if cr_res.get("verses"):
                preview_text = cr_res["verses"][0]["text"]
        except Exception:
            preview_text = ""
        
        classification = classify_cross_reference(v_row.book_name, ref_str, v_row.testament)
        cross_previews.append({
            "reference": ref_str,
            "preview_text": preview_text,
            "connection_type": classification["type"],
            "connection_label": classification["type_label"],
            "badge_color": classification["badge_color"]
        })

    # 6. Gospel Harmony & Cross-Passage Parallel Passages Engine (§8, §18)
    harmony_match = find_harmony_event_for_verse(v_row.book_code, v_row.chapter, v_row.verse)

    # 7. Academic Citation Engine (§38)
    citations = format_verse_academic_citations(v_row.book_name, v_row.chapter, v_row.verse, v_row.text)

    return {
        "verse": {
            "global_id": v_row.id,
            "verse_code": v_row.verse_code,
            "book_id": v_row.book_id,
            "book_code": v_row.book_code,
            "book_name": v_row.book_name,
            "book_en": v_row.book_en,
            "testament": v_row.testament,
            "chapter": v_row.chapter,
            "verse": v_row.verse,
            "section_title": v_row.section_title or "",
            "text": v_row.text,
            "reference": scripture_ref
        },
        "entities": {
            "people": people_list,
            "places": places_list,
            "events": events_list
        },
        "lexicon": matched_lexicon,
        "bookmark": bookmark_info,
        "user_notes": user_notes,
        "cross_references": cross_previews,
        "harmony_event": harmony_match,
        "citations": citations
    }


@router.get("/lexicon")
def list_lexicon(
    lang: Optional[str] = Query(None, description="Filter by language: 'greek' or 'hebrew'"),
    q: Optional[str] = Query(None, description="Search term in lemma, transliteration, definition or Strong number"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List and search Strong's Greek and Hebrew Lexicon entries."""
    conditions = []
    params: Dict[str, Any] = {"lim": limit}

    if lang:
        conditions.append("LOWER(language) = :lang")
        params["lang"] = lang.lower().strip()

    if q:
        cleaned_q = f"%{q.strip().lower()}%"
        conditions.append("""
            (LOWER(strong_number) LIKE :q 
             OR LOWER(lemma) LIKE :q 
             OR LOWER(transliteration) LIKE :q 
             OR LOWER(definition) LIKE :q 
             OR LOWER(theological_significance) LIKE :q)
        """)
        params["q"] = cleaned_q

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = text(f"""
        SELECT strong_number, language, lemma, transliteration, pronunciation,
               part_of_speech, definition, theological_significance,
               occurrences_count, key_verses
        FROM strong_lexicon
        {where_clause}
        ORDER BY language DESC, occurrences_count DESC
        LIMIT :lim
    """)

    rows = db.execute(sql, params).fetchall()
    return [
        {
            "strong_number": r.strong_number,
            "language": r.language,
            "lemma": r.lemma,
            "transliteration": r.transliteration,
            "pronunciation": r.pronunciation or "",
            "part_of_speech": r.part_of_speech or "",
            "definition": r.definition,
            "theological_significance": r.theological_significance or "",
            "occurrences_count": r.occurrences_count,
            "key_verses": r.key_verses if isinstance(r.key_verses, list) else []
        }
        for r in rows
    ]


@router.get("/lexicon/{strong_number}")
def get_lexicon_detail(
    strong_number: str,
    db: Session = Depends(get_db)
):
    """Retrieve detailed Strong's Lexicon entry with resolved key verses."""
    s_clean = strong_number.strip().upper()
    row = db.execute(
        text("""
        SELECT strong_number, language, lemma, transliteration, pronunciation,
               part_of_speech, definition, theological_significance,
               occurrences_count, key_verses
        FROM strong_lexicon
        WHERE UPPER(strong_number) = :s
        LIMIT 1
        """),
        {"s": s_clean}
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Strong entry '{strong_number}' not found")

    raw_verses = row.key_verses if isinstance(row.key_verses, list) else []
    resolved_verses = []
    from app.routers.bible import get_verse_range
    for ref_str in raw_verses:
        v_text = ""
        try:
            res = get_verse_range(ref=ref_str, db=db)
            if res.get("verses"):
                v_text = res["verses"][0]["text"]
        except Exception:
            v_text = ""
        resolved_verses.append({
            "reference": ref_str,
            "text": v_text
        })

    return {
        "strong_number": row.strong_number,
        "language": row.language,
        "lemma": row.lemma,
        "transliteration": row.transliteration,
        "pronunciation": row.pronunciation or "",
        "part_of_speech": row.part_of_speech or "",
        "definition": row.definition,
        "theological_significance": row.theological_significance or "",
        "occurrences_count": row.occurrences_count,
        "resolved_verses": resolved_verses
    }


@router.get("/concordance")
def get_concordance(
    strong_number: Optional[str] = Query(None, description="Strong number (e.g. 'G4102', 'H7965')"),
    q: Optional[str] = Query(None, description="Theological concept keyword (e.g. 'đức tin', 'bình an', 'giao ước')"),
    testament: Optional[str] = Query(None, description="OT or NT"),
    limit: int = Query(25, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Concordance search across the 31,081 Bible verses for key theological terms and Strong roots."""
    search_term = ""
    lex_info = None

    if strong_number:
        s_clean = strong_number.strip().upper()
        lex_row = db.execute(
            text("SELECT strong_number, language, lemma, transliteration, definition FROM strong_lexicon WHERE UPPER(strong_number) = :s"),
            {"s": s_clean}
        ).fetchone()
        if lex_row:
            lex_info = {
                "strong_number": lex_row.strong_number,
                "language": lex_row.language,
                "lemma": lex_row.lemma,
                "transliteration": lex_row.transliteration,
                "definition": lex_row.definition
            }
            # Extract main keyword for text search from definition
            search_term = lex_row.definition.split(",")[0].strip()

    if q:
        search_term = q.strip()

    if not search_term:
        raise HTTPException(status_code=400, detail="Must provide either strong_number or search keyword q")

    # Clean search keywords
    clean_kw = search_term.split(";")[0].split("(")[0].strip()
    # Remove leading articles if any
    clean_kw = re.sub(r'^(sự|lẽ|đấng|người)\s+', '', clean_kw, flags=re.IGNORECASE).strip()
    if not clean_kw:
        clean_kw = search_term.strip()

    params: Dict[str, Any] = {"pat": f"%{clean_kw}%", "lim": limit}
    test_filter = ""
    if testament:
        test_filter = "AND b.testament = :test"
        params["test"] = testament.upper().strip()

    # Get testament counts
    count_sql = text("""
        SELECT b.testament, count(v.id) as cnt
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        WHERE v.text ILIKE :pat
        GROUP BY b.testament
    """)
    count_rows = db.execute(count_sql, {"pat": f"%{clean_kw}%"}).fetchall()
    ot_count = next((r.cnt for r in count_rows if r.testament == "OT"), 0)
    nt_count = next((r.cnt for r in count_rows if r.testament == "NT"), 0)

    # Get distribution across individual books
    book_sql = text("""
        SELECT b.name_vi, count(v.id) as cnt
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        WHERE v.text ILIKE :pat
        GROUP BY b.book_order, b.name_vi
        ORDER BY cnt DESC
        LIMIT 6;
    """)
    book_rows = db.execute(book_sql, {"pat": f"%{clean_kw}%"}).fetchall()
    book_distribution = [{"book": r.name_vi, "count": r.cnt} for r in book_rows]

    # Related Strong words map (§14)
    RELATED_LEXICON_MAP = {
        "G4102": [
            {"strong_number": "G4100", "lemma": "πιστεύω", "transliteration": "pisteuo", "definition": "Tin, phó thác, nương cậy"},
            {"strong_number": "G4103", "lemma": "πιστός", "transliteration": "pistos", "definition": "Trung tín, đáng tin cậy"},
            {"strong_number": "H0539", "lemma": "אָמַן", "transliteration": "aman", "definition": "Vững bền, xác quyết (A-men)"}
        ],
        "G0026": [
            {"strong_number": "G0025", "lemma": "ἀγαπάω", "transliteration": "agapao", "definition": "Yêu thương bằng ý chí và sự hy sinh"},
            {"strong_number": "G5368", "lemma": "φιλέω", "transliteration": "phileo", "definition": "Yêu mến, tình bằng hữu trìu mến"},
            {"strong_number": "H2617", "lemma": "חֶסֶד", "transliteration": "chesed", "definition": "Tình yêu thành tín giao ước"}
        ],
        "G5485": [
            {"strong_number": "G5463", "lemma": "χαίρω", "transliteration": "chairo", "definition": "Vui mừng, hân hoan"},
            {"strong_number": "H2580", "lemma": "חֵן", "transliteration": "chen", "definition": "Ơn huệ, sự đoái hoài dịu dàng"}
        ],
        "H7965": [
            {"strong_number": "H7999", "lemma": "שָׁלַם", "transliteration": "shalam", "definition": "Làm cho trọn vẹn, hòa giải, đền bù"},
            {"strong_number": "G1515", "lemma": "εἰρήνη", "transliteration": "eirene", "definition": "Sự bình an, hòa thuận thiêng liêng"}
        ],
        "G4991": [
            {"strong_number": "G4982", "lemma": "σῴζω", "transliteration": "sozo", "definition": "Cứu rỗi, giải cứu, chữa lành"},
            {"strong_number": "H3444", "lemma": "יְשׁוּעָה", "transliteration": "yeshuah", "definition": "Sự cứu rỗi (Gốc tên Chúa Giê-xu)"}
        ]
    }

    sn_key = lex_info.get("strong_number", "") if lex_info else ""
    related_words = RELATED_LEXICON_MAP.get(sn_key, [])

    theological_summary = ""
    if sn_key == "G4102":
        theological_summary = "Pistis (Đức tin) trong Tân Ước không đơn thuần là sự đồng thuận lý trí mà là sự dâng hiến trọn vẹn của con người bề trong đối với Đấng Christ. Trọng tâm của sự cứu rỗi duy bởi đức tin (Sola Fide)."
    elif sn_key == "G0026":
        theological_summary = "Agapē là tình yêu tự nguyện, vô điều kiện và hy sinh tối thượng, bắt nguồn từ chính bản tính thánh khiết của Đức Chúa Trời và được bày tỏ trọn vẹn nơi thập tự giá."
    elif sn_key == "H7965":
        theological_summary = "Shalom trong tư tưởng Kinh Thánh Cựu Ước vượt xa sự vắng bóng xung đột; đó là sự trọn vẹn, thịnh vượng tâm linh, công bình và hòa thuận hoàn hảo trong mối quan hệ với Đức Chúa Trời."

    # Get sample verses
    verses_sql = text(f"""
        SELECT v.id, v.verse_code, b.name_vi as book_name, b.code as book_code,
               b.testament, v.chapter, v.verse, v.text
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        WHERE v.text ILIKE :pat {test_filter}
        ORDER BY b.book_order ASC, v.chapter ASC, v.verse ASC
        LIMIT :lim
    """)
    v_rows = db.execute(verses_sql, params).fetchall()

    return {
        "search_term": search_term,
        "clean_keyword": clean_kw,
        "lexicon_info": lex_info,
        "related_words": related_words,
        "theological_summary": theological_summary,
        "distribution": {
            "old_testament": ot_count,
            "new_testament": nt_count,
            "total_matches": ot_count + nt_count
        },
        "book_distribution": book_distribution,
        "verses": [
            {
                "global_id": r.id,
                "verse_code": r.verse_code,
                "reference": f"{r.book_name} {r.chapter}:{r.verse}",
                "book_code": r.book_code,
                "testament": r.testament,
                "chapter": r.chapter,
                "verse": r.verse,
                "text": r.text
            }
            for r in v_rows
        ]
    }


_KJV_DATA = None

def get_kjv_data():
    global _KJV_DATA
    if _KJV_DATA is None:
        import os
        kjv_path = "/app/data/bible/en_kjv.json"
        if os.path.exists(kjv_path):
            try:
                with open(kjv_path, "r", encoding="utf-8") as f:
                    _KJV_DATA = json.load(f)
            except Exception:
                _KJV_DATA = []
        else:
            _KJV_DATA = []
    return _KJV_DATA

def get_kjv_chapter_verses(book_order: int, chapter: int) -> Dict[int, str]:
    data = get_kjv_data()
    result = {}
    if data and 1 <= book_order <= len(data):
        b = data[book_order - 1]
        chaps = b.get("chapters", [])
        if 1 <= chapter <= len(chaps):
            verse_list = chaps[chapter - 1]
            for idx, text_str in enumerate(verse_list, start=1):
                result[idx] = text_str
    return result


@router.get("/parallel-chapter")
def get_parallel_chapter(
    book: str = Query(..., description="Book code, OSIS, or name (e.g. 'mat', 'sa', 'Gen')"),
    chapter: int = Query(1, ge=1, description="Chapter number (1..N)"),
    target_translation: str = Query("kjv", description="Target translation code, e.g. kjv"),
    db: Session = Depends(get_db)
):
    """
    Get parallel text for a chapter comparing Vietnamese 1925 with a target translation (e.g. English KJV).
    Also includes original language Strong's Lexicon entries for Interlinear study mode.
    Reference: ROADMAP1.md Section 2.1 & Section 31.
    """
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

    # 1. Fetch Vietnamese 1925 verses
    sql_verses = text("""
        SELECT global_id, verse_code, chapter, verse, section_title, text, cross_references
        FROM bible_verses
        WHERE book_id = :book_id AND chapter = :chapter
        ORDER BY verse ASC
    """)
    rows = db.execute(sql_verses, {"book_id": b.id, "chapter": chapter}).fetchall()

    # 2. Fetch parallel translation (e.g. KJV)
    target_clean = target_translation.strip().lower()
    target_verses: Dict[int, str] = {}

    if target_clean == "kjv":
        target_verses = get_kjv_chapter_verses(b.book_order, chapter)

    # Fallback to cache / bible-api if not found from local file
    if not target_verses:
        cache_key = f"{b.name_en.lower()}_{chapter}_{target_clean}"
        if cache_key in PARALLEL_CACHE:
            target_verses = PARALLEL_CACHE[cache_key]
        else:
            try:
                clean_book_en = b.name_en.replace(" ", "+")
                url = f"https://bible-api.com/{clean_book_en}+{chapter}?translation={urllib.parse.quote(target_clean)}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BibleKnowledge/1.0"})
                with urllib.request.urlopen(req, timeout=4) as response:
                    if response.status == 200:
                        api_data = json.loads(response.read().decode('utf-8'))
                        for v_item in api_data.get("verses", []):
                            v_num = v_item.get("verse")
                            v_txt = v_item.get("text", "").strip()
                            if v_num and v_txt:
                                target_verses[v_num] = v_txt
                        if target_verses:
                            PARALLEL_CACHE[cache_key] = target_verses
            except Exception:
                pass

    # 3. Fetch Strong's Lexicon entries for Interlinear mode
    lang_filter = "greek" if b.testament == "NT" else "hebrew"
    lex_rows = db.execute(
        text("SELECT id, strong_number, language, lemma, transliteration, pronunciation, part_of_speech, definition, theological_significance, key_verses FROM strong_lexicon WHERE language = :lang"),
        {"lang": lang_filter}
    ).fetchall()

    lex_by_strong = {lr.strong_number: lr for lr in lex_rows}

    # Build response verses
    combined_verses = []
    for r in rows:
        v_num = r.verse
        v_text_lower = r.text.lower()

        # Find matching lexicon items
        verse_lexicon = []
        seen_strongs = set()

        for kw, s_nums in KEYWORD_MAP.items():
            if kw in v_text_lower:
                for sn in s_nums:
                    if sn in lex_by_strong and sn not in seen_strongs:
                        seen_strongs.add(sn)
                        lr = lex_by_strong[sn]
                        verse_lexicon.append({
                            "strong_number": lr.strong_number,
                            "language": lr.language,
                            "lemma": lr.lemma,
                            "transliteration": lr.transliteration,
                            "pronunciation": lr.pronunciation or "",
                            "definition": lr.definition,
                            "matched_keyword": kw
                        })

        combined_verses.append({
            "global_id": r.global_id,
            "verse_code": r.verse_code,
            "chapter": r.chapter,
            "verse": r.verse,
            "section_title": r.section_title or "",
            "text_vi": r.text,
            "text_target": target_verses.get(v_num, ""),
            "cross_references": r.cross_references or [],
            "lexicon": verse_lexicon
        })

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
        "source_translation": {
            "id": "vi_1934",
            "name": "Bản Dịch Truyền Thống 1925",
            "language": "Tiếng Việt"
        },
        "target_translation": {
            "id": target_clean,
            "name": "King James Version (KJV 1611)" if target_clean == "kjv" else target_clean.upper(),
            "language": "English"
        },
        "verses": combined_verses
    }


# ==============================================================================
# SECTION 8 & 18: GOSPEL HARMONY & CROSS-PASSAGE PARALLELS CATALOG & ENDPOINTS
# ==============================================================================

HARMONY_EVENTS_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "baptism_of_jesus",
        "title_vi": "Lễ Báp-têm Của Chúa Giê-xu & Chúa Ba Ngôi Hiện Diện",
        "title_en": "The Baptism of Jesus & The Triune Revelation",
        "category": "Khởi Đầu Chức Vụ",
        "period_date": "Mùa thu năm 26 hoặc 27 CN",
        "location": "Sông Giô-đanh (Bê-tha-ni bên kia sông Giô-đanh)",
        "summary": "Chúa Giê-xu chịu báp-têm bởi Giăng Báp-tít để làm trọn mọi sự công bình. Đức Thánh Linh ngự xuống như chim bồ câu và tiếng Đức Chúa Cha phán từ trời.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 3:13-17",
                "chapter": 3,
                "start_verse": 13,
                "end_verse": 17,
                "theological_focus": "Nhấn mạnh cuộc đối thoại với Giăng Báp-tít để 'làm trọn mọi sự công bình' của Luật pháp và chức vụ Đấng Mê-si."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 1:9-11",
                "chapter": 1,
                "start_verse": 9,
                "end_verse": 11,
                "theological_focus": "Hành văn nhanh gọn, dùng chữ 'ngay lập tức' (euthus), các từng trời 'xé ra' (schizomenous)."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 3:21-22",
                "chapter": 3,
                "start_verse": 21,
                "end_verse": 22,
                "theological_focus": "Ghi nhận chi tiết Chúa Giê-xu đang cầu nguyện khi trời mở ra; nhấn mạnh Thánh Linh lấy hình thể như chim bồ câu."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 1:29-34",
                "chapter": 1,
                "start_verse": 29,
                "end_verse": 34,
                "theological_focus": "Lời chứng trực tiếp của Giăng Báp-tít: 'Kìa, Chiên Con của Đức Chúa Trời', xác nhận Khải thị Đấng làm phép báp-têm bằng Đức Thánh Linh."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Đức Thánh Linh ngự xuống như hình chim bồ câu",
                "Tiếng phán của Đức Chúa Cha từ trời tuyên xưng Con Yêu Dấu",
                "Sự chứng thực thiêng liêng về thần tính của Chúa Cứu Thế"
            ],
            "unique_details": {
                "matthew": "Đối thoại giữa Chúa Giê-xu và Giăng về sự xứng đáng và sự công bình.",
                "mark": "Mô tả các từng trời bị 'xé rách' (tương đồng với bức màn đền thờ bị xé khi Ngài trút linh hồn).",
                "luke": "Chúa Giê-xu đang cầu nguyện và toàn thể dân chúng cũng đã chịu báp-têm.",
                "john": "Lời tôn xưng Chiên Con của Đức Chúa Trời cất tội lỗi thế gian đi."
            },
            "theological_significance": "Sự mạc khải công khai đầu tiên về Ba Ngôi Đức Chúa Trời cùng lúc trong Tân Ước: Con vâng phục, Thánh Linh ngự xuống, Cha chuẩn nhận.",
            "key_themes": ["Ba Ngôi Đức Chúa Trời", "Sự Công Bình", "Xức Dầu Thánh Linh", "Chiên Con Cứu Chuộc"]
        }
    },
    {
        "id": "temptation_in_wilderness",
        "title_vi": "Sự Cám Dỗ Trong Sa Mạc (Chúa Giê-xu Đắc Thắng Ma Quỷ)",
        "title_en": "The Temptation of Jesus in the Wilderness",
        "category": "Khởi Đầu Chức Vụ",
        "period_date": "Mùa đông năm 26-27 CN (ngay sau Lễ Báp-têm)",
        "location": "Đồng vắng Giu-đê",
        "summary": "Sau 40 ngày kiêng ăn, Chúa Giê-xu bị ma quỷ cám dỗ về thể xác, danh vọng và quyền lực. Ngài đắc thắng hoàn toàn bằng Lời Đức Chúa Trời trích từ Phục Truyền.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 4:1-11",
                "chapter": 4,
                "start_verse": 1,
                "end_verse": 11,
                "theological_focus": "Thứ tự cám dỗ: Bánh mì -> Nóc đền thờ -> Các nước thế gian (kết thúc bằng núi cao nơi Đấng Mê-si từ chối quyền lực ma quỷ)."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 1:12-13",
                "chapter": 1,
                "start_verse": 12,
                "end_verse": 13,
                "theological_focus": "Tóm lược súc tích, Đức Thánh Linh 'thúc giục' Ngài vào đồng vắng; Ngài ở giữa các thú rừng và các thiên sứ hầu việc Ngài."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 4:1-13",
                "chapter": 4,
                "start_verse": 1,
                "end_verse": 13,
                "theological_focus": "Thứ tự: Bánh mì -> Các nước thế gian -> Nóc đền thờ (kết thúc tại Giê-ru-sa-lem, trọng tâm địa lý cứu rỗi của Lu-ca)."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "40 ngày kiêng ăn trong đồng vắng dưới sự dẫn dắt của Đức Thánh Linh",
                "Satan dùng chính Lời Chúa để bóp méo mục đích cứu rỗi",
                "Chúa Giê-xu đánh tan ma quỷ độc nhất bằng Lời Kinh Thánh (Phục Truyền)"
            ],
            "unique_details": {
                "matthew": "Nhấn mạnh Chúa từ chối quỳ lạy Satan để nhận các vương quốc trần gian, thiên sứ đến hầu việc.",
                "mark": "Chi tiết sống chung với thú rừng nơi hoang vắng (biểu tượng phục hồi địa đàng bình an).",
                "luke": "Ghi nhận Satan tạm lìa Ngài 'cho đến một dịp tiện khác' (báo hiệu cuộc chiến Gethsemane)."
            },
            "theological_significance": "Chúa Giê-xu là A-đam Thứ Hai trung tín và là Y-sơ-ra-ên thật vượt qua 40 năm thử thách sa mạc mà không phạm tội.",
            "key_themes": ["Lời Đức Chúa Trời", "Đắc Thắng Cám Dỗ", "A-đam Thứ Hai", "Kiêng Ăn Cầu Nguyện"]
        }
    },
    {
        "id": "parable_of_the_sower",
        "title_vi": "Dụ Ngôn Người Gieo Giống & Bốn Loại Đất Lòng",
        "title_en": "The Parable of the Sower & The Four Soils",
        "category": "Dụ Ngôn Nước Trời",
        "period_date": "Khoảng năm 28 CN",
        "location": "Bờ Biển Ga-li-lê (ngồi trên thuyền giảng giải)",
        "summary": "Dụ ngôn nền tảng về Nước Trời: Hạt giống Đạo rơi vào bên đường, nơi đá sỏi, bụi gai, và đất tốt, tượng trưng cho thái độ đón nhận Lời Đức Chúa Trời.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 13:1-9",
                "chapter": 13,
                "start_verse": 1,
                "end_verse": 9,
                "theological_focus": "Mở đầu cụm 7 dụ ngôn Nước Trời; kết quả bội phần: 'một hạt ra một trăm, một hạt ra sáu chục, một hạt ra ba chục'."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 4:1-9",
                "chapter": 4,
                "start_verse": 1,
                "end_verse": 9,
                "theological_focus": "Kèm lời kêu gọi 'Hãy lắng nghe!' (Shema) và thứ tự kết quả tăng tiến: ba chục -> sáu chục -> một trăm."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 8:4-8",
                "chapter": 8,
                "start_verse": 4,
                "end_verse": 8,
                "theological_focus": "Thêm chi tiết hạt giống bên đường 'bị giày đạp dưới chân'; giải thích đất tốt là tấm lòng 'thành thật trọn vẹn, kiên trì kết quả'."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Bốn tình trạng của hạt giống ứng với bốn thái độ tâm linh",
                "Giải nghĩa rõ ràng cho môn đồ về kẻ thù ma quỷ cướp Lời, bắt bớ làm khô héo, lo toan nghẹt ngòi"
            ],
            "unique_details": {
                "matthew": "Tập trung vào sự hiểu biết Lời Chúa và trái bông hạt.",
                "mark": "Cấu trúc lời giảng trên thuyền với lời cảnh tỉnh lắng nghe mạnh mẽ.",
                "luke": "Nhấn mạnh sự 'kiên trì chịu đựng' (hypomone) của mảnh đất tốt."
            },
            "theological_significance": "Quyền năng biến đổi nằm nơi hạt giống tinh ròng (Lời Chúa), nhưng trách nhiệm đáp ứng thuộc về sự cày xới của tấm lòng con người.",
            "key_themes": ["Lời Đức Chúa Trời", "Nước Thiên Đàng", "Sự Bắt Bớ", "Trái Thánh Linh"]
        }
    },
    {
        "id": "calming_the_storm",
        "title_vi": "Chúa Yên Lặng Sóng Gió Biển Hồ Ga-li-lê",
        "title_en": "Jesus Calms the Wind and the Sea",
        "category": "Phép Lạ Quyền Năng",
        "period_date": "Năm 28 CN",
        "location": "Biển Ga-li-lê",
        "summary": "Một cơn bão bất ngờ dâng sóng ngập thuyền khi Chúa đang ngủ. Các môn đồ kinh hãi thức Ngài dậy. Ngài quở gió và biển, tất cả liền yên lặng như tờ.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 8:23-27",
                "chapter": 8,
                "start_verse": 23,
                "end_verse": 27,
                "theological_focus": "Chúa quở trách sự yếu đức tin của môn đồ TRƯỚC rồi mới quở bão biển; dùng từ bão lớn là 'seismos' (cơn chấn động)."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 4:35-41",
                "chapter": 4,
                "start_verse": 35,
                "end_verse": 41,
                "theological_focus": "Chi tiết sống động: Chúa đang ngủ ở đằng lái trên một chiếc gối; lời truyền lệnh: 'Hãy êm đi, lặng đi!' (siopa, pephimoso)."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 8:22-25",
                "chapter": 8,
                "start_verse": 22,
                "end_verse": 25,
                "theological_focus": "Nhấn mạnh câu hỏi sâu sắc: 'Đức tin các ngươi ở đâu?'; các môn đồ run sợ và thán phục quyền năng Đấng Tạo Hóa."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Cơn bão bất thình lình trên hồ nước ngọt",
                "Chúa Giê-xu có uy quyền tối thượng trên các thế lực tự nhiên",
                "Môn đồ sững sờ: 'Người nầy là ai mà gió và biển cũng đều vâng lệnh?'"
            ],
            "unique_details": {
                "matthew": "Quy tụ trong cụm 10 phép lạ chứng minh quyền năng Vua Đấng Mê-si.",
                "mark": "Chi tiết Chúa gối đầu ngủ trên gối nơi lái thuyền biểu hiện sự an nghỉ tuyệt đối trong Đức Chúa Cha.",
                "luke": "Nêu rõ bão táp ập xuống hồ và nước dâng đầy hiểm nghèo."
            },
            "theological_significance": "Khẳng định thần tính của Đức Chúa Giê-xu: Chỉ có Đức Giê-hô-va trong Cựu Ước mới dẹp yên sóng gió biển khơi (Thi thiên 107:29).",
            "key_themes": ["Thần Tính Của Đấng Christ", "Đức Tin", "Bình An Vượt Mọi Hoàn Cảnh", "Tạo Hóa Vâng Phục"]
        }
    },
    {
        "id": "feeding_5000",
        "title_vi": "Phép Lạ Hóa Bánh Nuôi 5.000 Người (Có Trong Cả 4 Phúc Âm)",
        "title_en": "Feeding of the 5,000 (Recorded in All Four Gospels)",
        "category": "Phép Lạ Quyền Năng",
        "period_date": "Mùa xuân năm 29 CN (gần Lễ Vượt Qua)",
        "location": "Bê-sai-đa, sườn đồi phía đông bắc Biển Ga-li-lê",
        "summary": "Phép lạ duy nhất được ghi lại trong cả 4 Phúc Âm: Từ 5 chiếc bánh mạch nha và 2 con cá nhỏ của một em bé, Chúa chúc tạ và bẻ ra cho hơn 5.000 người ăn no nê còn thừa 12 giỏ.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 14:13-21",
                "chapter": 14,
                "start_verse": 13,
                "end_verse": 21,
                "theological_focus": "Ghi rõ số lượng 5.000 người nam chưa kể đàn bà con trẻ; lòng thương xót chữa lành người đau ốm trước khi cho ăn."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 6:30-44",
                "chapter": 6,
                "start_verse": 30,
                "end_verse": 44,
                "theological_focus": "Mô tả dân chúng như 'chiên không có người chăn'; sắp xếp dân chúng ngồi từng nhóm 50 và 100 trên cỏ xanh."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 9:10-17",
                "chapter": 9,
                "start_verse": 10,
                "end_verse": 17,
                "theological_focus": "Định vị rõ tại thành Bê-sai-đa; Chúa tiếp đón dân chúng, giảng về Nước Đức Chúa Trời và chữa lành kẻ bệnh."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 6:1-14",
                "chapter": 6,
                "start_verse": 1,
                "end_verse": 14,
                "theological_focus": "Nêu đích danh Phi-líp và Anh-rê; chính Anh-rê dẫn cậu bé mang 5 ổ bánh mạch nha và 2 con cá đến; dẫn nhập bài giảng 'Bánh Sự Sống'."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Năm chiếc bánh và hai con cá",
                "Chúa ngước mắt lên trời, tạ ơn, bẻ bánh ra giao cho môn đồ phân phát",
                "Hơn 5.000 người ăn thỏa mãn và thu lại đúng 12 giỏ bánh vụn đầy"
            ],
            "unique_details": {
                "matthew": "Nhấn mạnh số lượng chưa kể đàn bà và con trẻ.",
                "mark": "Hình ảnh cỏ xanh rực rỡ và các nhóm ngồi hàng lối như những luống hoa.",
                "luke": "Nối liền với cuộc hồi trình sau chuyến sai phái 12 sứ đồ đi truyền giáo.",
                "john": "Bối cảnh Lễ Vượt Qua gần kề và phản ứng dân chúng muốn tôn Chúa làm Vua."
            },
            "theological_significance": "Tiên trưng Chúa Giê-xu là Bánh Hằng Sống từ trời ban xuống; hình bóng tiệc Vượt Qua Mới và Đấng Chăn Chiên Lành chu cấp trọn vẹn.",
            "key_themes": ["Bánh Sự Sống", "Lòng Thương Xót", "Sự Cung Ứng Siêu Nhiên", "Lễ Vượt Qua"]
        }
    },
    {
        "id": "walking_on_water",
        "title_vi": "Chúa Đi Bộ Trên Mặt Nước & Phi-e-rơ Bước Ra Khỏi Thuyền",
        "title_en": "Jesus Walks on the Water & Peter's Step of Faith",
        "category": "Phép Lạ Quyền Năng",
        "period_date": "Đêm ngay sau phép lạ hóa bánh cho 5.000 người (năm 29 CN)",
        "location": "Biển Ga-li-lê (canh tư đêm)",
        "summary": "Môn đồ chèo thuyền ngược gió bão giữa hồ. Vào canh tư đêm, Chúa đi bộ trên mặt nước đến với họ. Phi-e-rơ xin bước đi trên nước, nhưng khi thấy gió thổi thì hoảng sợ bắt đầu chìm.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 14:22-33",
                "chapter": 14,
                "start_verse": 22,
                "end_verse": 33,
                "theological_focus": "Sách duy nhất ghi lại biến cố Phi-e-rơ bước xuống nước; lời kêu cứu 'Chúa ôi, xin cứu tôi!' và lời xưng nhận: 'Thầy thật là Con Đức Chúa Trời!'"
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 6:45-52",
                "chapter": 6,
                "start_verse": 45,
                "end_verse": 52,
                "theological_focus": "Ghi nhận chi tiết Chúa muốn 'đi vượt qua họ'; nhấn mạnh lòng môn đồ còn cứng cỏi chưa hiểu phép lạ hóa bánh."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 6:16-21",
                "chapter": 6,
                "start_verse": 16,
                "end_verse": 21,
                "theological_focus": "Lời tuyên bố thần thượng 'Chính Ta đây (Ego Eimi), đừng sợ!'; thuyền lập tức cặp bờ nơi họ định đến một cách diệu kỳ."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Chúa một mình lên núi cầu nguyện sau khi giải tán dân chúng",
                "Thuyền gặp sóng gió ngược dòng giữa biển đêm",
                "Chúa đi bộ trên mặt biển; môn đồ tưởng là ma và la hét",
                "Lời trấn an vang dội: 'Hãy yên lòng, Ta đây, đừng sợ!'"
            ],
            "unique_details": {
                "matthew": "Ký thuật đầy đủ về Phi-e-rơ đi trên nước và tay Chúa đưa ra nắm lấy ông.",
                "mark": "Ghi nhận sự kinh ngạc cực độ của môn đồ vì lòng họ còn chai lì chưa ngộ phép lạ bánh.",
                "john": "Phép lạ không gian: Vừa khi tiếp Ngài vào thuyền, thuyền liền tới ngay bến đỗ."
            },
            "theological_significance": "Lời tuyên xưng thần danh 'EGO EIMI' (Ta Là Đấng Tự Hữu Hằng Hữu); Đấng đạp trên các ngọn sóng của biển cả (Gióp 9:8).",
            "key_themes": ["Đức Tin & Nghi Ngờ", "Ego Eimi (Ta Là)", "Quyền Bính Vũ Trụ", "Sự Cầu Nguyện"]
        }
    },
    {
        "id": "peters_confession",
        "title_vi": "Lời Tuyên Tín Của Phi-e-rơ Tại Sê-sa-rê Phi-líp",
        "title_en": "Peter's Great Confession at Caesarea Philippi",
        "category": "Khởi Đầu Chức Vụ",
        "period_date": "Mùa thu năm 29 CN",
        "location": "Vùng Sê-sa-rê Phi-líp (chân Núi Hẹt-môn)",
        "summary": "Tại trung tâm thờ lạy tà thần ngoại giáo, Chúa hỏi: 'Các ngươi nói Ta là ai?'. Phi-e-rơ tuyên xưng: 'Thầy là Đấng Christ, Con Đức Chúa Trời hằng sống'.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 16:13-20",
                "chapter": 16,
                "start_verse": 13,
                "end_verse": 20,
                "theological_focus": "Ghi chép lời chúc phước cho Si-môn Ba-giô-na; lời hứa xây dựng Hội Thánh trên vầng đá và chìa khóa Nước Thiên Đàng."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 8:27-30",
                "chapter": 8,
                "start_verse": 27,
                "end_verse": 30,
                "theological_focus": "Ngắn gọn, trực tiếp: 'Thầy là Đấng Christ'; sau đó lập tức Chúa báo trước về sự thương khó và chịu chết."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 9:18-21",
                "chapter": 9,
                "start_verse": 18,
                "end_verse": 21,
                "theological_focus": "Chi tiết Chúa đang 'cầu nguyện riêng' trước khi hỏi các môn đồ; lời tuyên tín: 'Thầy là Đấng Christ của Đức Chúa Trời'."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Bối cảnh câu hỏi dân chúng coi Ngài là ai (Giăng Báp-tít, Ê-li, Giê-rê-mi, hay đấng tiên tri nào đó)",
                "Lời tuyên xưng Đấng Christ then chốt biến đổi toàn bộ chặng đường chức vụ"
            ],
            "unique_details": {
                "matthew": "Tuyên bố xây Hội Thánh, cửa âm phủ không thắng nổi, và trao quyền buộc/mở trên trời.",
                "mark": "Đóng vai trò bản lề trung tâm của toàn bộ sách Mác (từ chức vụ phép lạ chuyển sang con đường Thập tự giá).",
                "luke": "Nối kết biến cố với sự tĩnh nguyện sâu nhiệm của Chúa Giê-xu."
            },
            "theological_significance": "Bước ngoặt trong sự mặc khải Cơ Đốc học: Nhận diện Đấng Mê-si không phải là vua chinh chiến chính trị mà là Tôi Tớ Đau Thương chịu chết chuộc tội.",
            "key_themes": ["Cơ Đốc Học", "Nền Tảng Hội Thánh", "Khải Thị Thuộc Linh", "Thập Tự Giá"]
        }
    },
    {
        "id": "the_transfiguration",
        "title_vi": "Sự Hóa Hình Trên Núi Thánh (Vinh Hiển Nước Trời)",
        "title_en": "The Transfiguration of Jesus on the Mount",
        "category": "Khởi Đầu Chức Vụ",
        "period_date": "Năm 29 CN (khoảng 6-8 ngày sau lời tuyên tín)",
        "location": "Núi cao (truyền thống là Núi Hẹt-môn hoặc Núi Tha-bô)",
        "summary": "Chúa đưa Phi-e-rơ, Gia-cơ và Giăng lên núi. Dung mạo Ngài biến đổi sáng lòa như mặt trời, áo trắng tinh. Môi-se và Ê-li hiện ra đàm đạo với Ngài. Mây sáng rực bao phủ và tiếng Chúa Cha phán.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 17:1-9",
                "chapter": 17,
                "start_verse": 1,
                "end_verse": 9,
                "theological_focus": "Khuôn mặt Ngài 'sáng lòa như mặt trời'; các môn đồ sấp mặt xuống đất kinh hãi; Chúa đến sờ họ và phán 'Đừng sợ'."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 9:2-10",
                "chapter": 9,
                "start_verse": 2,
                "end_verse": 10,
                "theological_focus": "Mô tả chiếc áo trắng chói lọi 'không một thợ nhuộm nào trên đất có thể làm trắng được như vậy'; bối rối của Phi-e-rơ khi không biết mình nói gì."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 9:28-36",
                "chapter": 9,
                "start_verse": 28,
                "end_verse": 36,
                "theological_focus": "Sách duy nhất ghi lại đề tài cuộc đàm đạo: Môi-se và Ê-li nói về 'sự xuất hành' (exodos) mà Chúa sắp hoàn tất tại Giê-ru-sa-lem."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Ba môn đồ thân tín: Phi-e-rơ, Gia-cơ, Giăng",
                "Môi-se (đại diện Luật Pháp) và Ê-li (đại diện Tiên Tri) xuất hiện",
                "Đám mây sáng che phủ và tiếng phán từ trời: 'Nầy là Con yêu dấu của Ta... hãy nghe Ngài!'"
            ],
            "unique_details": {
                "matthew": "Mặt Chúa sáng như mặt trời, thiên sứ không cần thiết hiện ra vì Chúa chính là nguồn sáng.",
                "mark": "Nhấn mạnh sự kinh hãi và việc giữ bí mật cho đến khi Con Người từ kẻ chết sống lại.",
                "luke": "Nội dung cuộc trò chuyện về sự chết tại Giê-ru-sa-lem (Exodus mới giải cứu nhân loại)."
            },
            "theological_significance": "Chúa Giê-xu trổi hơn và làm trọn vẹn cả Luật pháp lẫn Tiên tri; hé mở trước vinh quang tái lâm của Con Trời.",
            "key_themes": ["Vinh Quang Thiên Thượng", "Luật Pháp & Tiên Tri", "Exodus Mới", "Vâng Nghe Lời Chúa"]
        }
    },
    {
        "id": "triumphal_entry",
        "title_vi": "Chúa Vào Thành Giê-ru-sa-lem Khải Hoàn (Chúa Nhật Lễ Lá)",
        "title_en": "The Triumphal Entry into Jerusalem (Palm Sunday)",
        "category": "Tuần Lễ Khổ Nạn",
        "period_date": "Nisan 9 hoặc 10, năm 30 CN (Chủ Nhật trước Lễ Vượt Qua)",
        "location": "Từ Núi Ô-liu, Bê-pha-gê đến Cổng Đông Thành Giê-ru-sa-lem",
        "summary": "Chúa Giê-xu cỡi lừa con tiến vào Giê-ru-sa-lem trong tiếng reo hò 'Hô-sa-na!' của đoàn dân rải áo và cành kè đón Vua Đấng Mê-si khiêm nhường.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 21:1-11",
                "chapter": 21,
                "start_verse": 1,
                "end_verse": 11,
                "theological_focus": "Trích dẫn trực tiếp lời tiên tri Xa-cha-ri 9:9: 'Kìa, Vua ngươi đến cùng ngươi, nhu mì cỡi lừa'; cả thành đều chấn động hỏi 'Người nầy là ai?'."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 11:1-11",
                "chapter": 11,
                "start_verse": 1,
                "end_verse": 11,
                "theological_focus": "Ký thuật chi tiết việc tìm lừa con chưa ai từng cưỡi; kết thúc bằng việc Chúa vào đền thờ xem xét mọi sự rồi trở về Bê-tha-ni."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 19:28-40",
                "chapter": 19,
                "start_verse": 28,
                "end_verse": 40,
                "theological_focus": "Ghi nhận người Pha-ri-si đòi cấm môn đồ reo hò; Chúa đáp: 'Nếu họ nín lặng thì đá sẽ kêu lên!'; tiếp theo là phân đoạn Chúa khóc thương thành Giê-ru-sa-lem."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 12:12-19",
                "chapter": 12,
                "start_verse": 12,
                "end_verse": 19,
                "theological_focus": "Ghi rõ dân chúng cầm các 'nhành kè' (la-ba); gắn liền cơn sốt của đám đông với phép lạ Chúa vừa kêu La-xa-rơ sống lại."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Cỡi lừa con thay vì ngựa chiến thể hiện Vua Bình An khiêm nhường",
                "Tiếng tung hô trích Thi thiên 118:25-26: 'Hô-sa-na! Đáng chúc tụng Đấng nhân danh Chúa mà đến!'",
                "Trải áo xống và cành cây trên đường đón Vua"
            ],
            "unique_details": {
                "matthew": "Nhắc cả lừa mẹ và lừa con theo sát lời thi ca đối xứng của Xa-cha-ri.",
                "mark": "Chúa vào nhìn quanh đền thờ lúc trời đã tối rồi mới rút lui về Bê-tha-ni.",
                "luke": "Lời tuyên bố chấn động về việc sỏi đá sẽ cất tiếng ngợi khen và nước mắt của Ngài khóc cho thành.",
                "john": "Mối liên hệ nhân quả với sự việc La-xa-rơ sống lại khiến giới cầm quyền thốt lên: 'Cả thế gian đều chạy theo người!'."
            },
            "theological_significance": "Sự xuất hiện công khai chính thức của Vua Giao Ước; chọn con lừa biểu thị vương quyền cứu chuộc trong hòa bình chứ không phải bạo lực quân sự.",
            "key_themes": ["Vua Khiêm Nhu", "Hô-sa-na", "Lời Tiên Tri Ứng Nghiệm", "Lễ Vượt Qua"]
        }
    },
    {
        "id": "the_last_supper",
        "title_vi": "Lễ Tiệc Thánh & Thiết Lập Giao Ước Mới",
        "title_en": "The Last Supper & Institution of the New Covenant",
        "category": "Tuần Lễ Khổ Nạn",
        "period_date": "Nisan 14, năm 30 CN (Tối Thứ Năm)",
        "location": "Phòng Cao, Thành Giê-ru-sa-lem",
        "summary": "Trong bữa ăn Lễ Vượt Qua cuối cùng, Chúa Giê-xu cầm bánh bẻ ra và chén rượu trao cho môn đồ, thiết lập Giao Ước Mới trong huyết Ngài đổ ra tha tội cho muôn người.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 26:26-29",
                "chapter": 26,
                "start_verse": 26,
                "end_verse": 29,
                "theological_focus": "Nhấn mạnh huyết giao ước đổ ra 'cho nhiều người được tha tội' (sự cứu chuộc đại diện thay thế)."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 14:22-25",
                "chapter": 14,
                "start_verse": 22,
                "end_verse": 25,
                "theological_focus": "Hành văn trực tiếp, nhấn mạnh 'hết thảy đều uống chén ấy' và lời thề không uống rượu nho cho đến ngày trong Nước Trời."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 22:14-20",
                "chapter": 22,
                "start_verse": 14,
                "end_verse": 20,
                "theological_focus": "Hai chiếc chén; công thức tưởng niệm muôn đời: 'Hãy làm sự nầy để nhớ đến Ta'; nhấn mạnh thân thể vì anh em mà phó cho."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 13:1-17",
                "chapter": 13,
                "start_verse": 1,
                "end_verse": 17,
                "theological_focus": "Không tập trung vào bánh chén mà khắc họa hành động Chúa quấn khăn rửa chân cho từng môn đồ như bài học khiêm nhường tột cùng."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Bánh tượng trưng thân thể Đấng Christ vỡ tan vì nhân loại",
                "Chén rượu nho tượng trưng Huyết của Giao Ước Mới",
                "Lời cảnh báo về kẻ phản bội Giu-đa Ích-ca-ri-ốt"
            ],
            "unique_details": {
                "matthew": "Mục đích rõ rệt: 'được tha tội' (eis aphesin hamartion).",
                "mark": "Cấu trúc súc tích dồn sức nặng vào chén huyết giao ước.",
                "luke": "Mạng lệnh lập lễ tưởng niệm thường xuyên cho Hội Thánh ('Hãy làm điều này').",
                "john": "Gương rửa chân và Điều Răn Mới: 'Các ngươi hãy yêu nhau như Ta đã yêu các ngươi'."
            },
            "theological_significance": "Hoàn tất lễ nghi Chiên Con Vượt Qua Cựu Ước, khai sinh Giao Ước Mới đời đời bằng huyết vô tội của Đấng Cứu Thế.",
            "key_themes": ["Giao Ước Mới", "Sự Cứu Chuộc Tha Tội", "Khiêm Nhường Rửa Chân", "Tiệc Thánh Tưởng Niệm"]
        }
    },
    {
        "id": "gethsemane_agony",
        "title_vi": "Nỗi Thống Khổ & Lời Cầu Nguyện Tại Vườn Ghết-sê-ma-nê",
        "title_en": "The Agony & Submission in the Garden of Gethsemane",
        "category": "Tuần Lễ Khổ Nạn",
        "period_date": "Đêm Thứ Năm rạng sáng Thứ Sáu (Nisan 14)",
        "location": "Vườn Ghết-sê-ma-nê (dưới chân Núi Ô-liu)",
        "summary": "Đối diện với chén thạnh nộ của tội lỗi nhân loại, Chúa Giê-xu đau đớn tột cùng cầu nguyện: 'Xin chén nầy lìa khỏi Con, song không theo ý Con mà theo ý Cha'. Môn đồ ngủ mê vì mệt mỏi.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 26:36-46",
                "chapter": 26,
                "start_verse": 36,
                "end_verse": 46,
                "theological_focus": "Ba lần Chúa cầu nguyện cùng một lời; Ngài than thở: 'Linh hồn Ta buồn rầu cay đắng cho đến chết'."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 14:32-42",
                "chapter": 14,
                "start_verse": 32,
                "end_verse": 42,
                "theological_focus": "Tiếng kêu thân thương bằng tiếng A-ram: 'A-ba, Cha ôi! Mọi sự Cha đều làm được'; sự kinh hãi và xao xuyến tột bực."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 22:39-46",
                "chapter": 22,
                "start_verse": 39,
                "end_verse": 46,
                "theological_focus": "Thiên sứ từ trời hiện đến thêm sức; cơn đau thương quằn quại khiến mồ hôi Ngài trở nên như những giọt máu lớn rơi xuống đất."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 18:1-11",
                "chapter": 18,
                "start_verse": 1,
                "end_verse": 11,
                "theological_focus": "Không chép lại lời cầu nguyện xin cất chén mà nhấn mạnh quyền năng uy nghi: Khi Chúa phán 'Chính Ta đây', quân lính đều thối lui ngã xuống đất."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Đưa Phi-e-rơ, Gia-cơ, Giăng đi riêng vào chỗ cầu nguyện sâu hơn",
                "Cuộc chiến cam go giữa sự yếu đuối xác thịt và sự vâng phục tuyệt đối ý chỉ Đức Chúa Cha",
                "Môn đồ ngủ gục vì buồn rầu"
            ],
            "unique_details": {
                "matthew": "Nhấn mạnh ba lần cầu nguyện kiên định không đổi.",
                "mark": "Ghi giữ danh xưng thân mật 'Abba' phản ánh tình phụ tử thâm sâu.",
                "luke": "Bác sĩ Lu-ca mô tả hiện tượng sinh lý học mồ hôi như máu (hematidrosis) và thiên sứ thêm sức.",
                "john": "Tư thế chủ động của Chúa bảo vệ môn đồ: 'Nếu các ngươi tìm Ta thì hãy để cho những người nầy đi'."
            },
            "theological_significance": "Sự đầu phục hoàn toàn của Ý Chí Con Người Đấng Christ trước Ý Chỉ Cứu Chuộc của Đức Chúa Cha; Ngài nhận lấy chén thịnh nộ thay cho tội nhân.",
            "key_themes": ["Sự Vâng Phục Tột Cùng", "Chén Thạnh Nộ", "Cầu Nguyện Đắc Thắng", "Tình Yêu Cha Con"]
        }
    },
    {
        "id": "crucifixion_of_jesus",
        "title_vi": "Sự Chết Chuộc Tội Của Chúa Giê-xu Trên Thập Tự Giá",
        "title_en": "The Crucifixion & Atoning Death of Jesus Christ",
        "category": "Tuần Lễ Khổ Nạn",
        "period_date": "Nisan 14, năm 30 CN (Thứ Sáu, từ 9h sáng đến 3h chiều)",
        "location": "Đồi Gô-gô-tha (Nơi Sọ), bên ngoài tường thành Giê-ru-sa-lem",
        "summary": "Chúa Giê-xu bị đóng đinh giữa hai tên trộm cướp. Trời tối sầm trong ba tiếng đồng hồ. Chúa trút linh hồn sau khi kêu lớn; bức màn đền thờ bị xé làm đôi từ trên xuống dưới.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 27:32-50",
                "chapter": 27,
                "start_verse": 32,
                "end_verse": 50,
                "theological_focus": "Tiếng kêu trích Thi thiên 22: 'Ê-li, Ê-li, lam-ma sa-bách-ta-ni?'; đất rúng động, vầng đá nứt nẻ và mồ mả người thánh mở ra."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 15:21-37",
                "chapter": 15,
                "start_verse": 21,
                "end_verse": 37,
                "theological_focus": "Ghi mốc thời gian giờ thứ ba (9h sáng); lời thú nhận của thầy đội La Mã: 'Người nầy thật là Con Đức Chúa Trời!'."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 23:26-46",
                "chapter": 23,
                "start_verse": 26,
                "end_verse": 46,
                "theological_focus": "Lời cầu tha thứ cho kẻ hành hình; cuộc đối thoại cứu rỗi tên cướp biết ăn năn: 'Hôm nay ngươi sẽ ở với Ta trong nơi Ba-ra-đi'; lời trút hơi thở: 'Cha ôi, Con giao linh hồn lại trong tay Cha'."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 19:16-30",
                "chapter": 19,
                "start_verse": 16,
                "end_verse": 30,
                "theological_focus": "Gửi gắm mẹ Ma-ri cho sứ đồ Giăng; lời phán long trời lở đất: 'Mọi sự đã được trọn!' (Tetelestai) - công cuộc cứu chuộc đã hoàn tất mỹ mãn."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Bảng án viết trên đầu thập tự bằng ba thứ tiếng: 'Jêsus Người Na-xa-rét, Vua Dân Giu-đa'",
                "Binh lính bắt thăm chia nhau áo xống ứng nghiệm Thi thiên 22",
                "Bóng tối bao trùm khắp xứ từ giờ thứ sáu đến giờ thứ chín (12h trưa đến 3h chiều)",
                "Bức màn đền thờ bị xé đôi từ trên xuống dưới"
            ],
            "unique_details": {
                "matthew": "Động đất dữ dội, mồ mả người thánh mở ra báo trước sự đắc thắng sự chết.",
                "mark": "Lời tuyên xưng thần tính then chốt của thầy đội La Mã.",
                "luke": "Ân điển cứu rỗi tức thì cho tên trộm cướp trên thập tự giá.",
                "john": "Lời tuyên bố chiến thắng 'Mọi sự đã trọn' và huyết cùng nước tuôn trào từ cạnh sườn bị đâm thủng."
            },
            "theological_significance": "Trọng tâm của Tin Lành: Sự hy sinh chuộc tội đại diện một lần đủ cả; xóa bỏ bức tường ngăn cách giữa Đức Chúa Trời và con người.",
            "key_themes": ["Sự Chuộc Tội Thay Thế", "Tetelestai (Mọi Sự Đã Trọn)", "Bức Màn Đền Thờ Xé Đôi", "Ân Điển Cứu Rỗi"]
        }
    },
    {
        "id": "resurrection_empty_tomb",
        "title_vi": "Sự Sống Lại Vinh Hiển & Ngôi Mộ Trống",
        "title_en": "The Glorious Resurrection & The Empty Tomb",
        "category": "Phục Sinh & Thăng Thiên",
        "period_date": "Nisan 16, năm 30 CN (Sáng sớm Chúa Nhật Phục Sinh)",
        "location": "Khu vườn có ngôi mộ đá của Giô-sép người A-ri-ma-thê",
        "summary": "Sáng sớm ngày thứ nhất trong tuần, những người nữ đến mộ và thấy hòn đá đã lăn ra khỏi cửa mộ. Thiên sứ báo tin: 'Ngài không ở đây đâu, Ngài sống lại rồi như lời Ngài đã phán'.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 28:1-10",
                "chapter": 28,
                "start_verse": 1,
                "end_verse": 10,
                "theological_focus": "Động đất lớn, thiên sứ từ trời lăn hòn đá ngồi lên trên; quân lính canh mộ run rẩy như kẻ chết; Chúa phục sinh hiện ra đón các người nữ."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 16:1-8",
                "chapter": 16,
                "start_verse": 1,
                "end_verse": 8,
                "theological_focus": "Các người nữ lo lắng 'Ai sẽ lăn hòn đá lấp cửa mộ giùm chúng ta?'; thấy một người trẻ tuổi mặc áo dài trắng ngồi bên hữu."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 24:1-12",
                "chapter": 24,
                "start_verse": 1,
                "end_verse": 12,
                "theological_focus": "Hai người nam mặc áo sáng chói phán: 'Sao các ngươi tìm kẻ sống trong vòng kẻ chết?'; Phi-e-rơ chạy đến mộ thấy chỉ còn lại vải liệm."
            },
            "john": {
                "book_code": "gi",
                "book_name": "Giăng",
                "ref": "Giăng 20:1-10",
                "chapter": 20,
                "start_verse": 1,
                "end_verse": 10,
                "theological_focus": "Cuộc chạy đua giữa Phi-e-rơ và sứ đồ Giăng; khăn che đầu Chúa được cuốn tròn để riêng một nơi minh chứng đây là sự phục sinh trật tự siêu nhiên chứ không phải trộm xác."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Thời điểm sáng sớm ngày thứ nhất trong tuần khi trời còn mờ sương",
                "Hòn đá nặng chặn cửa mộ đã được lăn ra",
                "Ngôi mộ trống hoàn toàn không còn thi hài Chúa",
                "Sứ điệp phục sinh giao cho các phụ nữ làm những người chứng kiến đầu tiên"
            ],
            "unique_details": {
                "matthew": "Sự hiện diện của lính canh La Mã bị hối lộ để phao tin thất thiệt.",
                "mark": "Mạng lệnh đặc biệt: 'Hãy đi nói cho môn đồ Ngài VÀ PHI-E-RƠ' (sự phục hồi người từng vấp ngã).",
                "luke": "Lời nhắc nhở về những lời Chúa đã phán khi còn ở xứ Ga-li-lê.",
                "john": "Chi tiết khăn trùm đầu xếp riêng ngăn nắp thuyết phục môn đồ Giăng tin ngay lập tức."
            },
            "theological_significance": "Chiến thắng chung cuộc trên sự chết và ma quỷ; sự xác nhận của Đức Chúa Cha rằng sự hy sinh chuộc tội của Con Ngài đã được nhậm trọn vẹn.",
            "key_themes": ["Sự Sống Lại", "Ngôi Mộ Trống", "Chiến Thắng Sự Chết", "Niềm Hy Vọng Sống"]
        }
    },
    {
        "id": "great_commission_ascension",
        "title_vi": "Đại Mạng Lệnh & Sự Thăng Thiên Của Chúa Cứu Thế",
        "title_en": "The Great Commission & Ascension of the Lord",
        "category": "Phục Sinh & Thăng Thiên",
        "period_date": "Năm 30 CN (40 ngày sau Phục Sinh)",
        "location": "Núi tại Ga-li-lê & Núi Ô-liu gần Bê-tha-ni",
        "summary": "Chúa Giê-xu ban Đại Mạng Lệnh sai phái môn đồ đi môn đệ hóa muôn dân. Ngài giơ tay chúc phước rồi được cất lên trời trong đám mây vinh hiển trước mắt các sứ đồ.",
        "passages": {
            "matthew": {
                "book_code": "mat",
                "book_name": "Ma-thi-ơ",
                "ref": "Ma-thi-ơ 28:16-20",
                "chapter": 28,
                "start_verse": 16,
                "end_verse": 20,
                "theological_focus": "Đại Mạng Lệnh kinh điển: 'Hết cả quyền phép trên trời và dưới đất đã giao cho Ta... hãy đi khiến muôn dân trở nên môn đồ Ta... Ta thường ở cùng các ngươi luôn cho đến tận thế'."
            },
            "mark": {
                "book_code": "mac",
                "book_name": "Mác",
                "ref": "Mác 16:19-20",
                "chapter": 16,
                "start_verse": 19,
                "end_verse": 20,
                "theological_focus": "Chúa được cất lên trời 'ngồi bên hữu Đức Chúa Trời'; môn đồ đi ra giảng đạo và Chúa dùng các dấu lạ cặp theo để làm chứng cho Lời."
            },
            "luke": {
                "book_code": "lu",
                "book_name": "Lu-ca",
                "ref": "Lu-ca 24:50-53",
                "chapter": 24,
                "start_verse": 50,
                "end_verse": 53,
                "theological_focus": "Chúa dẫn môn đồ đến Bê-tha-ni, giơ tay chúc phước đang khi được cất lên; môn đồ thờ lạy Ngài và trở về Giê-ru-sa-lem mừng rỡ ca tụng Chúa."
            },
            "acts": {
                "book_code": "cong",
                "book_name": "Công-vụ",
                "ref": "Công-vụ 1:6-11",
                "chapter": 1,
                "start_verse": 6,
                "end_verse": 11,
                "theological_focus": "Lời hứa nhận lãnh quyền phép Thánh Linh làm chứng nhân từ Giê-ru-sa-lem đến cùng trái đất; hai thiên sứ hứa Ngài sẽ tái lâm y như cách Ngài lên trời."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Mạng lệnh truyền giảng Phúc Âm cho mọi sắc dân",
                "Lời hứa quyền năng Thánh Linh và sự hiện diện hằng sống của Chúa",
                "Sự thăng thiên hữu hình ngự về bên hữu Đức Chúa Cha"
            ],
            "unique_details": {
                "matthew": "Công thức báp-têm nhân danh Đức Cha, Đức Con và Đức Thánh Linh.",
                "mark": "Vị trí tôn cao tột bực của Đấng Christ bên hữu ngai Đức Chúa Trời.",
                "luke": "Cử chỉ cuối cùng của Chúa trên đất là giơ tay ban phước lành trên con dân Ngài.",
                "acts": "Lời tiên tri rõ ràng về sự Tái Lâm vinh hiển trên mây trời."
            },
            "theological_significance": "Chúa Giê-xu bước vào chức vụ Thầy Tế Lễ Thượng Phẩm và Vua vinh hiển cầu thay cho Hội Thánh; chuyển giao chức vụ truyền giáo cho Hội Thánh toàn cầu.",
            "key_themes": ["Đại Mạng Lệnh", "Môn Đồ Hóa Muôn Dân", "Thăng Thiên Vinh Hiển", "Lời Hứa Tái Lâm"]
        }
    },
    {
        "id": "ot_david_census",
        "title_vi": "Cựu Ước Song Hành: Đa-vít Kiểm Kê Dân Số (II Sa-mu-ên & I Sử-ký)",
        "title_en": "OT Parallel: David's Census & The Altar on Mount Moriah",
        "category": "Song Hành Cựu Ước",
        "period_date": "Khoảng năm 975 TCN",
        "location": "Giê-ru-sa-lem, Sân đập lúa của A-rau-na (Ô-rơ-nan)",
        "summary": "Biến cố Đa-vít kiểm tra quân số Y-sơ-ra-ên dẫn đến cơn thạnh nộ phạt dịch lệ, kết thúc bằng việc Đa-vít lập bàn thờ tại sân đập lúa A-rau-na, nơi sau này xây Đền Thờ Sa-lô-môn.",
        "passages": {
            "samuel": {
                "book_code": "2sa",
                "book_name": "II Sa-mu-ên",
                "ref": "II Sa-mu-ên 24:1-9",
                "chapter": 24,
                "start_verse": 1,
                "end_verse": 9,
                "theological_focus": "Góc nhìn lịch sử - tiên tri: 'Cơn thạnh nộ của Đức Giê-hô-va lại nổi phừng cùng dân Y-sơ-ra-ên, và Ngài giục lòng Đa-vít...'; quân số 800.000 Y-sơ-ra-ên và 500.000 Giu-đa."
            },
            "chronicles": {
                "book_code": "1su",
                "book_name": "I Sử-ký",
                "ref": "I Sử-ký 21:1-8",
                "chapter": 21,
                "start_verse": 1,
                "end_verse": 8,
                "theological_focus": "Góc nhìn hậu lưu đày - thuộc linh: 'Sa-tan dấy lên nghịch cùng Y-sơ-ra-ên và giục Đa-vít kiểm tra dân số'; quân số 1.100.000 Y-sơ-ra-ên và 470.000 Giu-đa; Giô-áp ghê tởm lệnh vua."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Đa-vít ra lệnh kiểm kê dân số vì sự kiêu ngạo dựa vào quân số thay vì Đức Giê-hô-va",
                "Tướng Giô-áp hết lời can ngăn nhưng không lay chuyển được lệnh vua",
                "Địa điểm mua sân đập lúa trở thành nền móng xây Đền Thờ Giê-ru-sa-lem (Núi Mô-ri-a)"
            ],
            "unique_details": {
                "samuel": "Ghi nhận nguyên nhân khởi thủy là cơn thịnh nộ của Chúa cho phép xảy ra.",
                "chronicles": "Làm rõ vai trò kích động trực tiếp của Sa-tan và lý do Giô-áp không kiểm đếm chi phái Lê-vi và Bên-gia-min."
            },
            "theological_significance": "Bài học thần học sâu sắc về sự tể trị tối cao của Đức Chúa Trời: Chúa cho phép Sa-tan thử thách để phơi bày lòng kiêu ngạo, nhưng biến sự sửa phạt thành nơi thiết lập bàn thờ cứu rỗi và Đền Thờ của Ngài.",
            "key_themes": ["Sự Tể Trị Của Đức Chúa Trời", "Cám Dỗ Của Sa-tan", "Sự Ăn Năn", "Nền Đền Thờ Mô-ri-a"]
        }
    },
    {
        "id": "ot_solomon_temple_dedication",
        "title_vi": "Cựu Ước Song Hành: Vua Sa-lô-môn Cầu Nguyện Cung Hiến Đền Thờ",
        "title_en": "OT Parallel: Solomon's Prayer Dedicating the Temple",
        "category": "Song Hành Cựu Ước",
        "period_date": "Khoảng năm 960 TCN",
        "location": "Đền Thờ Giê-ru-sa-lem",
        "summary": "Vua Sa-lô-môn quỳ gối trước toàn dân Y-sơ-ra-ên giơ tay lên trời cầu nguyện cung hiến Đền Thờ, xin Chúa đoái nghe lời cầu xin của dân sự khi họ hướng về nơi thánh này.",
        "passages": {
            "kings": {
                "book_code": "1vua",
                "book_name": "I Các Vua",
                "ref": "I Các Vua 8:22-30",
                "chapter": 8,
                "start_verse": 22,
                "end_verse": 30,
                "theological_focus": "Nhấn mạnh Giao Ước Đa-vít và thực tế Đấng Tạo Hóa vô hạn không thể bị giới hạn trong đền thờ cất bởi tay người: 'Trời của các từng trời còn chẳng chứa Ngài được, phương chi cái đền nầy!'"
            },
            "chronicles": {
                "book_code": "2su",
                "book_name": "II Sử-ký",
                "ref": "II Sử-ký 6:12-21",
                "chapter": 6,
                "start_verse": 12,
                "end_verse": 21,
                "theological_focus": "Bổ sung chi tiết Sa-lô-môn làm một cái bục đồng cao ba trượng đứng giữa sân rồi quỳ gối xuống trước hội chúng; hướng về giao ước đời đời và đền thờ thờ phượng."
            }
        },
        "synoptic_distinctives": {
            "shared_elements": [
                "Sa-lô-môn đứng trước bàn thờ của Đức Giê-hô-va và giơ tay lên trời cầu nguyện",
                "Xác tín Đức Chúa Trời giữ giao ước và lòng thương xót cho kẻ bước đi hết lòng",
                "Khẩn xin mắt Chúa đoái xem đền thờ đêm ngày và tha thứ tội lỗi mỗi khi dân sự ăn năn hướng về nơi nầy"
            ],
            "unique_details": {
                "kings": "Nhấn mạnh bối cảnh chính trị - vương quyền kế thừa ngai vàng Đa-vít.",
                "chronicles": "Ký thuật chi tiết về bục đồng cung hiến và sau đó lửa từ trời giáng xuống thiêu hóa của lễ thiêu biểu thị sự nhậm lời thiêng liêng."
            },
            "theological_significance": "Đền Thờ là biểu tượng ngự trị của Danh Chúa giữa dân sự, tiên trưng Đấng Christ - Đền Thờ thật - nơi Đức Chúa Trời hòa giải trọn vẹn với loài người.",
            "key_themes": ["Sự Hiện Diện Của Chúa", "Giao Ước Thành Tín", "Sự Cầu Nguyện", "Tha Thứ Tội Lỗi"]
        }
    }
]


@router.get("/harmony-events")
def list_harmony_events(
    category: Optional[str] = Query(None, description="Lọc theo phân loại (e.g. 'Khởi Đầu Chức Vụ', 'Phép Lạ Quyền Năng', 'Tuần Lễ Khổ Nạn', 'Song Hành Cựu Ước')"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tiêu đề hoặc từ khóa sự kiện song hành")
):
    """
    Returns the comprehensive catalog of Gospel Harmony & Cross-Passage Parallels (§8, §18).
    Includes synoptic comparison anchors across Matthew, Mark, Luke, John, and OT Historical books.
    """
    events = HARMONY_EVENTS_CATALOG

    if category and category.lower() != "all":
        cat_lower = category.strip().lower()
        events = [e for e in events if cat_lower in e["category"].lower()]

    if search:
        s_lower = search.strip().lower()
        events = [
            e for e in events
            if s_lower in e["title_vi"].lower()
            or s_lower in e["title_en"].lower()
            or s_lower in e["summary"].lower()
            or s_lower in e["location"].lower()
            or any(s_lower in p["ref"].lower() for p in e["passages"].values())
            or any(s_lower in t.lower() for t in e["synoptic_distinctives"].get("key_themes", []))
        ]

    return {
        "total_events": len(events),
        "categories": [
            "Tất cả",
            "Khởi Đầu Chức Vụ",
            "Phép Lạ Quyền Năng",
            "Dụ Ngôn Nước Trời",
            "Tuần Lễ Khổ Nạn",
            "Phục Sinh & Thăng Thiên",
            "Song Hành Cựu Ước"
        ],
        "events": events
    }


@router.get("/harmony-detail")
def get_harmony_detail(
    event_id: str = Query(..., description="ID của sự kiện song hành (e.g. 'the_last_supper', 'feeding_5000')"),
    include_kjv: bool = Query(False, description="Đính kèm bản dịch KJV đối chiếu nếu có"),
    db: Session = Depends(get_db)
):
    """
    Fetches full side-by-side Scripture verses from PostgreSQL for each book passage in a parallel event.
    Provides verified Vietnamese 1925 text for each synoptic column.
    """
    clean_id = event_id.strip().lower()
    event = next((e for e in HARMONY_EVENTS_CATALOG if e["id"] == clean_id), None)
    if not event:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sự kiện song hành với ID: '{event_id}'")

    populated_passages = {}

    for book_key, passage_info in event["passages"].items():
        book_code = passage_info["book_code"]
        chapter = passage_info["chapter"]
        start_v = passage_info["start_verse"]
        end_v = passage_info["end_verse"]

        # Fetch verses from PostgreSQL
        sql = text("""
            SELECT v.verse, v.text, v.section_title
            FROM bible_verses v
            JOIN bible_books b ON v.book_id = b.id
            WHERE LOWER(b.code) = :code
              AND v.chapter = :chapter
              AND v.verse BETWEEN :start_v AND :end_v
            ORDER BY v.verse ASC
        """)
        rows = db.execute(sql, {
            "code": book_code.lower(),
            "chapter": chapter,
            "start_v": start_v,
            "end_v": end_v
        }).fetchall()

        verse_list = [
            {
                "verse": r.verse,
                "text": r.text,
                "section_title": r.section_title or ""
            }
            for r in rows
        ]

        # Optional KJV retrieval
        kjv_verses = {}
        if include_kjv:
            cache_key = f"{book_code}_{chapter}"
            if cache_key in PARALLEL_CACHE:
                kjv_verses = PARALLEL_CACHE[cache_key]
            else:
                kjv_file = "/data/bible/en_kjv.json"
                import os
                if os.path.exists(kjv_file):
                    try:
                        with open(kjv_file, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            # Match book by name or code
                            for b_entry in data.get("books", []):
                                if b_entry.get("code", "").lower() == book_code.lower() or b_entry.get("name", "").lower() == passage_info.get("book_name", "").lower():
                                    for c_entry in b_entry.get("chapters", []):
                                        if c_entry.get("chapter") == chapter:
                                            kjv_verses = {v.get("verse"): v.get("text", "") for v in c_entry.get("verses", [])}
                                            PARALLEL_CACHE[cache_key] = kjv_verses
                                            break
                    except Exception:
                        pass

        populated_passages[book_key] = {
            **passage_info,
            "total_verses": len(verse_list),
            "verses": [
                {
                    "verse": v["verse"],
                    "text_vi": v["text"],
                    "text_kjv": kjv_verses.get(v["verse"], "") if include_kjv else "",
                    "section_title": v["section_title"]
                }
                for v in verse_list
            ]
        }

    return {
        "event_id": event["id"],
        "title_vi": event["title_vi"],
        "title_en": event["title_en"],
        "category": event["category"],
        "period_date": event["period_date"],
        "location": event["location"],
        "summary": event["summary"],
        "synoptic_distinctives": event["synoptic_distinctives"],
        "passages": populated_passages
    }


# ==============================================================================
# §3, §46, §53 — Bible Reading Plans & Daily Devotional Tracker
# ==============================================================================

class ToggleDayRequest(BaseModel):
    day: int = Field(..., ge=1, description="Day number in the plan")
    completed: Optional[bool] = Field(None, description="True for complete, False for uncomplete, None to toggle")
    user_identifier: str = Field("local_user", description="User ID for local profile tracking")


# In-memory backup cache if DB table access is unavailable
READING_PROGRESS_CACHE: Dict[str, Dict[str, Any]] = {}


def _generate_1_year_plan_days() -> List[Dict[str, Any]]:
    """Generates 365 canonical reading days balancing OT, NT, Psalms and Proverbs."""
    days = []
    # Curated milestones for key foundational days
    milestones = {
        1: ("Sáng Tạo & Gia Phả Đấng Christ", ["Sáng-thế Ký 1-2", "Ma-thi-ơ 1", "Thi-thiên 1"], "sa", 1, "Sáng-thế Ký 1:1 - Ban đầu Đức Chúa Trời dựng nên trời đất.", "Đức Chúa Trời là cội nguồn của mọi trật tự và vẻ đẹp. Hãy bắt đầu năm mới bằng việc tôn nhận Ngài là Chủ đời sống bạn."),
        2: ("Sự Sa Ngã & Lời Tiên Tri Đầu Tiên", ["Sáng-thế Ký 3-4", "Ma-thi-ơ 2", "Thi-thiên 2"], "sa", 3, "Sáng-thế Ký 3:15 - Dòng dõi người nữ sẽ giày đạp đầu con rắn.", "Ngay trong bi kịch sa ngã, ân điển cứu chuộc của Thiên Chúa đã được mở ra qua lời hứa về Đấng Cứu Thế."),
        3: ("Gia Phổ Tộc Trưởng & Sự Công Bình", ["Sáng-thế Ký 5-6", "Ma-thi-ơ 3", "Thi-thiên 3"], "sa", 6, "Sáng-thế Ký 6:8 - Nhưng Nô-ê được ơn trước mặt Đức Giê-hô-va.", "Giữa một thế hệ bại hoại, người bước đi cùng Đức Chúa Trời sẽ trở nên ngọn hải đăng của đức tin."),
        12: ("Lời Kêu Gọi Áp-ra-ham", ["Sáng-thế Ký 12-13", "Ma-thi-ơ 12", "Thi-thiên 12"], "sa", 12, "Sáng-thế Ký 12:2-3 - Ta sẽ làm cho ngươi nên một dân lớn và ban phước cho ngươi.", "Đức tin là sự vâng phục bước ra khỏi vùng an toàn khi Chúa kêu gọi."),
        22: ("Núi Mô-ri-a: Chúa Sắm Sẵn", ["Sáng-thế Ký 22-23", "Ma-thi-ơ 22", "Thi-thiên 22"], "sa", 22, "Sáng-thế Ký 22:14 - Giê-hô-va Di-rê: Trên núi của Đức Giê-hô-va sẽ có sắm sẵn.", "Khi dâng điều quý nhất cho Chúa, chúng ta kinh nghiệm sự chu cấp kỳ diệu của Đấng Thành Tín."),
        50: ("Xuất Hành Khỏi Ai Cập", ["Xuất Ê-díp-tô Ký 12-14", "Mác 10", "Thi-thiên 50"], "xk", 14, "Xuất Ê-díp-tô Ký 14:14 - Đức Giê-hô-va sẽ chiến cự cho các ngươi; còn các ngươi cứ yên lặng.", "Chúa mở đường biển đỏ nơi mắt loài người chỉ thấy ngõ cụt."),
        100: ("Đất Hứa & Lời Hứa Bền Vững", ["Giô-suê 1-3", "Lu-ca 15", "Thi-thiên 100"], "gs", 1, "Giô-suê 1:9 - Hãy vững lòng bền chí, chớ run sợ; vì Giê-hô-va Đức Chúa Trời ngươi ở cùng ngươi.", "Sự hiện diện của Chúa xua tan mọi nỗi sợ hãi trước những thành lũy kiên cố."),
        180: ("Vương Triều Đa-vít & Lòng Tôn Kính", ["2 Sa-mu-ên 7", "Công-vụ 2", "Thi-thiên 84"], "2sm", 7, "2 Sa-mu-ên 7:16 - Nhà ngươi và nước ngươi sẽ được bền vững đời đời trước mặt ta.", "Giao ước Đa-vít hướng thẳng về Ngôi Vương đời đời của Đấng Christ."),
        270: ("Lời Hứa Về Giao Ước Mới", ["Giê-rê-mi 31", "Rô-ma 8", "Thi-thiên 119:1-32"], "gr", 31, "Giê-rê-mi 31:33 - Ta sẽ ghi luật pháp ta vào lòng chúng nó và tạc vào dạ.", "Giao ước mới trong huyết Chúa Giê-xu ban một tấm lòng mới được biến đổi bởi Đức Thánh Linh."),
        365: ("Trời Mới Đất Mới & Khải Hoàn Đời Đời", ["Ma-la-chi 3-4", "Khải-huyền 21-22", "Thi-thiên 150"], "kh", 22, "Khải-huyền 22:20 - Đấng làm chứng các điều này phán rằng: Phải, ta đến mau chóng! A-men, lạy Đức Chúa Giê-xu, xin hãy đến!", "Hoàn tất lộ trình đọc Kinh Thánh trọn năm trong niềm hy vọng vinh quang về sự tái lâm của Chúa Giê-xu Christ!")
    }

    # Generate full 365 sequence
    for d in range(1, 366):
        if d in milestones:
            title, passages, p_book, p_ch, golden, prompt = milestones[d]
        else:
            # Mathematical canonical distribution
            ot_ch = ((d - 1) * 3) % 929 + 1
            nt_ch = ((d - 1) * 1) % 260 + 1
            ps_ch = ((d - 1) % 150) + 1
            title = f"Ngày {d}: Hành Trình Ân Điển Cựu Ước & Tân Ước"
            passages = [f"Phân đoạn Cựu Ước (Bài đọc {d})", f"Phân đoạn Tân Ước {nt_ch}", f"Thi-thiên {ps_ch}"]
            p_book = "sa" if d <= 50 else ("xk" if d <= 90 else ("thi" if d <= 200 else "mt"))
            p_ch = (d % 28) + 1
            golden = f"Thi-thiên 119:105 - Lời Chúa là ngọn đèn cho chân tôi, ánh sáng cho đường lối tôi."
            prompt = f"Nguyện Lời Chúa hôm nay soi sáng từng quyết định và đem lại bình an sâu nhiệm trong tâm hồn bạn."

        days.append({
            "day": d,
            "title": title,
            "passages": passages,
            "primary_book": p_book,
            "primary_chapter": p_ch,
            "golden_verse": golden,
            "devotional_prompt": prompt
        })
    return days


def _generate_nt_90_plan_days() -> List[Dict[str, Any]]:
    """Generates 90 days reading through all 260 chapters of the New Testament (approx 3 chapters/day)."""
    nt_books_plan = [
        ("Ma-thi-ơ", "mt", 28),
        ("Mác", "mc", 16),
        ("Lu-ca", "lc", 24),
        ("Giăng", "gi", 21),
        ("Công-vụ các Sứ-đồ", "cv", 28),
        ("Rô-ma", "rm", 16),
        ("1 Cô-rinh-tô", "1cr", 16),
        ("2 Cô-rinh-tô", "2cr", 13),
        ("Ga-la-ti", "gl", 6),
        ("Ê-phê-sô", "ep", 6),
        ("Phi-líp", "pl", 4),
        ("Cô-lô-se", "cl", 4),
        ("1 Tê-sa-lô-ni-ca", "1ts", 5),
        ("2 Tê-sa-lô-ni-ca", "2ts", 3),
        ("1 Ti-mô-thê", "1tm", 6),
        ("2 Ti-mô-thê", "2tm", 4),
        ("Tít", "tt", 3),
        ("Phi-lê-môn", "pm", 1),
        ("Hê-bơ-rơ", "hb", 13),
        ("Gia-cơ", "gc", 5),
        ("1 Phi-e-rơ", "1pr", 5),
        ("2 Phi-e-rơ", "2pr", 3),
        ("1 Giăng", "1g", 5),
        ("2 Giăng", "2g", 1),
        ("3 Giăng", "3g", 1),
        ("Giu-đe", "gd", 1),
        ("Khải-huyền", "kh", 22),
    ]

    all_chapters = []
    for b_name, b_code, total_c in nt_books_plan:
        for c in range(1, total_c + 1):
            all_chapters.append((b_name, b_code, c))

    days = []
    total_ch = len(all_chapters) # 260
    for day in range(1, 91):
        idx_start = int((day - 1) * (total_ch / 90.0))
        idx_end = int(day * (total_ch / 90.0))
        if day == 90:
            idx_end = total_ch

        chunk = all_chapters[idx_start:idx_end]
        if not chunk:
            chunk = [all_chapters[-1]]

        b_name_first, b_code_first, c_first = chunk[0]
        b_name_last, _, c_last = chunk[-1]

        if b_name_first == b_name_last:
            if c_first == c_last:
                pass_label = f"{b_name_first} {c_first}"
            else:
                pass_label = f"{b_name_first} {c_first}-{c_last}"
        else:
            pass_label = f"{b_name_first} {c_first} - {b_name_last} {c_last}"

        days.append({
            "day": day,
            "title": f"Ngày {day}: {pass_label}",
            "passages": [f"{item[0]} {item[2]}" for item in chunk],
            "primary_book": b_code_first,
            "primary_chapter": c_first,
            "golden_verse": f"{b_name_first} {c_first} - Lời ban sự sống đời đời trong Chúa Cứu Thế Giê-xu.",
            "devotional_prompt": f"Đón nhận sứ điệp Tân Ước cho đời sống hôm nay: Bước đi theo gương Chúa Giê-xu và quyền năng Đức Thánh Linh."
        })
    return days


def _generate_wisdom_30_plan_days() -> List[Dict[str, Any]]:
    """Generates 30 days of Wisdom and Poetry (Job, Psalms, Proverbs, Ecclesiastes, Song of Songs)."""
    topics = [
        ("Thi-thiên 1-5", "thi", 1, "Hai Con Đường: Người Công Bình & Kẻ Hung Ác", "Phước cho người không đi theo mưu kế kẻ dữ."),
        ("Thi-thiên 8 & 19", "thi", 8, "Vinh Quang Đấng Tạo Hóa Trong Vũ Trụ", "Hỡi Đức Giê-hô-va là Chúa chúng tôi, danh Chúa le lói khắp đất biết bao!"),
        ("Thi-thiên 23 & 27", "thi", 23, "Đức Giê-hô-va Là Đấng Chăn Giữ Tôi", "Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ chẳng thiếu thốn gì."),
        ("Thi-thiên 34 & 37", "thi", 34, "Sự Giải Cứu & Trông Đợi Chúa Bền Lòng", "Hãy nếm thử và thấy Đức Giê-hô-va tốt lành dường bao!"),
        ("Thi-thiên 42 & 46", "thi", 46, "Nơi Trú Ẩn Vững Bền Trong Cơn Giông Bão", "Đức Chúa Trời là nơi ẩn náu và sức lực của chúng tôi, Đấng giúp đỡ trong hoạn nạn."),
        ("Thi-thiên 51 & 63", "thi", 51, "Lời Cầu Nguyện Ăn Năn & Tấm Lòng Tan Vỡ", "Đức Chúa Trời ôi! xin hãy dựng nên trong tôi một lòng trong sạch."),
        ("Thi-thiên 84 & 90", "thi", 90, "Nơi Ở Đời Nầy Qua Đời Kia", "Cầu xin Chúa dạy chúng tôi biết đếm các ngày chúng tôi, hầu cho chúng tôi được lòng khôn ngoan."),
        ("Thi-thiên 91 & 100", "thi", 91, "Sự Che Chở Nơi Đấng Chí Cao", "Người nào ở nơi kín đáo của Đấng Chí Cao, sẽ được hằng ở dưới bóng của Đấng Toàn Năng."),
        ("Thi-thiên 103 & 104", "thi", 103, "Ngợi Khen Ân Huệ & Lòng Nhân Từ Đời Đời", "Hỡi linh hồn ta, hãy ngợi khen Đức Giê-hô-va, chớ quên các ân huệ của Ngài."),
        ("Thi-thiên 119:1-48", "thi", 119, "Phước Hạnh Của Người Yêu Mến Luật Pháp Chúa", "Lời Chúa là ngọn đèn cho chân tôi, ánh sáng cho đường lối tôi."),
        ("Thi-thiên 121 & 127", "thi", 121, "Đấng Gìn Giữ Y-sơ-ra-ên Không Bao Giờ Nhắm Mắt", "Tôi ngước mắt lên trên núi: Sự tiếp trợ tôi đến từ đâu? Sự tiếp trợ tôi đến từ Đức Giê-hô-va."),
        ("Thi-thiên 139", "thi", 139, "Sự Toàn Tri Tuyệt Đối & Tình Yêu Vô Điều Kiện", "Đức Chúa Trời ôi! xin hãy tra xét tôi, và biết lòng tôi; hãy thử thách tôi, và biết tư tưởng tôi."),
        ("Thi-thiên 145-150", "thi", 150, "Bản Hùng Ca Đại Tán Tụng", "Phàm vật chi thở, hãy ngợi khen Đức Giê-hô-va! Ha-lê-lu-gia!"),
        ("Châm-ngôn 1-3", "cn", 3, "Khởi Đầu Sự Khôn Ngoan & Tin Cậy Hết Lòng", "Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con."),
        ("Châm-ngôn 4-6", "cn", 4, "Gìn Giữ Tấm Lòng Vì Nguồn Sự Sống", "Khá cẩn thận giữ tấm lòng của con hơn hết, vì các nguồn sự sống do nơi nó mà ra."),
        ("Châm-ngôn 8-9", "cn", 8, "Tiếng Kêu Gọi Của Sự Khôn Ngoan Đời Đời", "Kính sợ Đức Giê-hô-va, ấy là khởi đầu sự khôn ngoan."),
        ("Châm-ngôn 10-12", "cn", 10, "Lời Nói, Sự Chăm Chỉ & Sự Công Bình", "Môi miệng người công bình nuôi nấng nhiều người; nhưng kẻ ngu dại chết vì thiếu trí hiểu."),
        ("Châm-ngôn 15-17", "cn", 16, "Mưu Kế Con Người & Ý Chỉ Đức Chúa Trời", "Lòng loài người toan tính đường lối mình; song Đức Giê-hô-va chỉ dẫn các bước của người."),
        ("Châm-ngôn 18-20", "cn", 18, "Danh Chúa Là Tháp Vững Bền", "Danh Đức Giê-hô-va là một tháp vững bền; kẻ công bình chạy đến đó, gặp được nơi ẩn náu cao."),
        ("Châm-ngôn 22-24", "cn", 22, "Danh Tiếng Quý Hơn Tiền Của", "Danh tiếng tốt chăng hơn tiền của nhiều; và ơn nghĩa quý hơn vàng bạc."),
        ("Châm-ngôn 27-29", "cn", 27, "Tình Bạn Chân Thật & Lòng Khiêm Nhường", "Sắt mài nhọn sắt, cũng vậy người mài giũa diện mạo bạn hữu mình."),
        ("Châm-ngôn 30-31", "cn", 31, "Người Nữ Tiết Hạnh & Kính Sợ Chúa", "Duyên là giả dối, sắc lại hư không; nhưng người nữ nào kính sợ Đức Giê-hô-va sẽ được khen ngợi."),
        ("Gióp 1-3", "gp", 1, "Thử Thách Khốc Liệt & Lời Tuyên Xưng Kiên Định", "Đức Giê-hô-va đã ban cho, Đức Giê-hô-va lại cất đi; đáng ngợi khen danh Đức Giê-hô-va!"),
        ("Gióp 19 & 23", "gp", 19, "Đấng Cứu Chuộc Tôi Hằng Sống", "Tôi biết rằng Đấng Cứu chuộc tôi vẫn sống, đến ngày tận thế Ngài sẽ đứng trên đất."),
        ("Gióp 38-40", "gp", 38, "Tiếng Chúa Phán Giữa Cơn Bão Lốc", "Ngươi đã ở đâu khi ta đặt nền trái đất? Hãy nói đi, nếu ngươi có trí hiểu."),
        ("Gióp 42", "gp", 42, "Mắt Tôi Đã Thấy Chúa & Sự Phục Hồi Gấp Đôi", "Trước lỗ tai tôi có nghe đồn về Chúa, nhưng bây giờ mắt tôi đã thấy Ngài."),
        ("Truyền-đạo 1-3", "td", 3, "Mọi Sự Đều Có Kỳ Định Dưới Trời", "Phàm sự gì có thì tiết; mọi việc dưới trời có kỳ định của nó."),
        ("Truyền-đạo 7-9", "td", 7, "Chiêm Nghiệm Thực Tế Cuộc Đời", "Ngày thịnh vượng hãy vui mừng, ngày tai nạn hãy suy nghĩ."),
        ("Truyền-đạo 11-12", "td", 12, "Tưởng Nhớ Đấng Tạo Hóa Lúc Còn Trẻ", "Hãy kính sợ Đức Chúa Trời và giữ các điều răn Ngài; ấy là trọn phận sự của ngươi."),
        ("Nhã-ca 1-8", "nc", 8, "Tình Yêu Mạnh Như Sự Chết", "Nước nhiều không dập tắt được tình yêu, các dòng sông không nhận chìm nó được.")
    ]
    days = []
    for idx, (pass_str, b_code, b_ch, title, prompt) in enumerate(topics, start=1):
        days.append({
            "day": idx,
            "title": f"Ngày {idx}: {title}",
            "passages": [pass_str],
            "primary_book": b_code,
            "primary_chapter": b_ch,
            "golden_verse": prompt,
            "devotional_prompt": f"Ngẫm suy và áp dụng lẽ thật khôn ngoan này vào các mối quan hệ và thách thức trong ngày sống hôm nay."
        })
    return days


def _generate_gospels_40_plan_days() -> List[Dict[str, Any]]:
    """Generates 40 days following Jesus' Life, Passion and Resurrection."""
    curated_journey = [
        ("Sự Giáng Sinh & Ngôi Lời Hóa Thân Nhục Thể", "Giăng 1:1-18", "gi", 1, "Ngôi Lời đã trở nên xác thịt, ở giữa chúng ta, đầy ơn và lẽ thật."),
        ("Sứ Mạng Của Giăng Báp-tít & Lễ Báp-tem", "Ma-thi-ơ 3:1-17", "mt", 3, "Nầy là Con yêu dấu của ta, đẹp lòng ta mọi đường."),
        ("Sự Cám Dỗ Trong Đồng Vắng & Sự Chiến Thắng", "Ma-thi-ơ 4:1-11", "mt", 4, "Người ta sống chẳng phải chỉ nhờ bánh mà thôi, song nhờ mọi lời nói ra từ miệng Đức Chúa Trời."),
        ("Kêu Gọi Các Môn Đồ Đầu Tiên & Phép Lạ Cana", "Giăng 1:35-51, 2:1-11", "gi", 2, "Hễ Ngài phán bảo điều chi, hãy vâng theo điều nấy."),
        ("Cuộc Đàm Đạo Ban Đêm Với Ni-cô-đem", "Giăng 3:1-21", "gi", 3, "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài."),
        ("Người Đàn Bà Sa-ma-ri Bên Giếng Gia-cốp", "Giăng 4:1-30", "gi", 4, "Nước ta cho sẽ thành một mạch nước văng ra cho đến sự sống đời đời."),
        ("Bài Giảng Trên Núi: Tám Phước Lành", "Ma-thi-ơ 5:1-16", "mt", 5, "Các ngươi là muối của đất... Các ngươi là sự sáng của thế gian."),
        ("Bài Giảng Trên Núi: Luật Yêu Kẻ Thù & Cầu Nguyện", "Ma-thi-ơ 6:1-15", "mt", 6, "Lạy Cha chúng tôi ở trên trời; Danh Cha được thánh; Nước Cha được đến."),
        ("Chớ Lo Lắng Về Ngày Mai", "Ma-thi-ơ 6:19-34", "mt", 6, "Trước hết hãy tìm kiếm nước Đức Chúa Trời và sự công bình của Ngài."),
        ("Xây Nhà Trên Vầng Đá", "Ma-thi-ơ 7:13-29", "mt", 7, "Kẻ nào nghe lời ta phán đây mà làm theo, ví như người khôn cất nhà mình trên vầng đá."),
        ("Dẹp Yên Bão Tố Trên Biển Ga-li-lê", "Mác 4:35-41", "mc", 4, "Ngài thức dậy, quở gió và phán cùng biển rằng: Hãy êm đi, lặng đi!"),
        ("Chữa Lành Người Bị Quỷ Ám Tại Ga-đa-ra", "Mác 5:1-20", "mc", 5, "Hãy về nhà ngươi, nơi bà con ngươi, mà thuật lại cho họ điều lớn lao Chúa đã làm cho ngươi."),
        ("Hóa Bánh Cho 5000 Người Ăn", "Lu-ca 9:10-17", "lc", 9, "Chính các ngươi hãy cho họ ăn!"),
        ("Chúa Giê-xu Đi Bộ Trên Mặt Nước", "Ma-thi-ơ 14:22-33", "mt", 14, "Hãy yên lòng; ấy là ta đây, đừng sợ!"),
        ("Ta Là Bánh Hằng Sống Từ Trên Trời Xuống", "Giăng 6:26-51", "gi", 6, "Ai đến cùng ta chẳng hề đói, và ai tin ta chẳng hề khát."),
        ("Lời Tuyên Xưng Đức Tin Của Phi-e-rơ Tại Sê-xa-rê", "Ma-thi-ơ 16:13-20", "mt", 16, "Thầy là Đấng Christ, Con Đức Chúa Trời hằng sống."),
        ("Sự Hóa Hình Vinh Hiển Trên Núi", "Ma-thi-ơ 17:1-13", "mt", 17, "Nầy là Con yêu dấu của ta, đẹp lòng ta mọi bề; hãy nghe lời Con đó!"),
        ("Người Samari Nhân Lành: Ai Là Kẻ Lân Cận?", "Lu-ca 10:25-37", "lc", 10, "Hãy hết lòng, hết linh hồn, hết sức, hết trí mà kính mến Chúa là Đức Chúa Trời ngươi."),
        ("Mari & Martha: Phần Tốt Nhất Không Bị Cất Đi", "Lu-ca 10:38-42", "lc", 10, "Chỉ có một điều cần dùng mà thôi. Ma-ri đã chọn phần tốt, là phần không ai cất lấy được."),
        ("Người Đầy Tớ Bất Dung Thứ & Sự Tha Thứ 70 Lần 7", "Ma-thi-ơ 18:21-35", "mt", 18, "Không phải bảy lần, nhưng là bảy mươi lần bảy."),
        ("Người Mù Từ Thuở Sanh Ra Được Sáng Mắt", "Giăng 9:1-41", "gi", 9, "Một điều tôi biết, là tôi đã mù, mà bây giờ lại sáng."),
        ("Người Chăn Hiền Lành Vì Chiên Phó Sự Sống", "Giăng 10:1-18", "gi", 10, "Ta là người chăn hiền lành; người chăn hiền lành vì chiên mình phó sự sống."),
        ("Người Con Hoang Đàng & Tấm Lòng Người Cha", "Lu-ca 15:11-32", "lc", 15, "Vì con ta đây đã chết mà bây giờ lại sống, đã mất mà bây giờ lại thấy được."),
        ("Người Giàu & La-xa-rơ Nơi Âm Phủ", "Lu-ca 16:19-31", "lc", 16, "Nếu không nghe Môi-se và các tiên tri, thì dầu có ai từ kẻ chết sống lại, họ cũng chẳng tin."),
        ("Phép Lạ Phục Sinh La-xa-rơ Tại Bê-tha-ni", "Giăng 11:1-44", "gi", 11, "Ta là sự sống lại và sự sống; kẻ nào tin ta thì sẽ sống, mặc dầu đã chết rồi."),
        ("Xê-ca-ê Người Thu Thuế Ăn Năn", "Lu-ca 19:1-10", "lc", 19, "Bởi vì Con người đã đến tìm và cứu kẻ bị hư mất."),
        ("Ma-ri Xức Dầu Thơm Quý Giá Cho Chân Chúa", "Giăng 12:1-11", "gi", 12, "Người đã làm điều mình có thể làm được; người đã ướp xác ta trước để chôn."),
        ("Khải Hoàn Tiến Vào Thành Giê-ru-sa-lem (Chúa Nhật Lễ Lá)", "Lu-ca 19:28-44", "lc", 19, "Hô-sa-na! Đáng chúc tụng Đấng nhân danh Chúa mà đến!"),
        ("Dẹp Sạch Đền Thờ: Nhà Ta Là Nhà Cầu Nguyện", "Mác 11:12-19", "mc", 11, "Nhà ta sẽ gọi là nhà cầu nguyện cho muôn dân."),
        ("Thí Dụ Mười Người Nữ Đồng Trinh & Ta-lâng", "Ma-thi-ơ 25:1-30", "mt", 25, "Hỡi đầy tớ ngay lành và trung tín, ngươi đã trung tín trong việc nhỏ, ta sẽ lập ngươi coi sóc nhiều."),
        ("Chúa Rửa Chân Cho Các Môn Đồ", "Giăng 13:1-17", "gi", 13, "Nếu ta là Chúa và là Thầy, mà đã rửa chân cho các ngươi, thì các ngươi cũng phải rửa chân lẫn nhau."),
        ("Tiệc Thánh Đầu Tiên: Bánh & Chén Giao Ước", "Lu-ca 22:7-23", "lc", 22, "Nầy là thân thể ta vì các ngươi mà phó cho; hãy làm sự nầy để nhớ đến ta."),
        ("Ta Là Gốc Nho, Các Ngươi Là Nhánh", "Giăng 15:1-17", "gi", 15, "Ai cứ ở trong ta và ta trong người ấy, thì sanh ra lắm trái; vì ngoài ta các ngươi chẳng làm chi được."),
        ("Lời Cầu Nguyện Trong Vườn Ghết-sê-ma-nê", "Ma-thi-ơ 26:36-46", "mt", 26, "Cha ơi, nếu có thể được, xin cho chén nầy lìa khỏi con! Song không theo ý muốn con, mà theo ý muốn Cha."),
        ("Sự Phản Bội, Bị Bắt & Phi-e-rơ Chối Chúa", "Mác 14:43-72", "mc", 14, "Phi-e-rơ nhớ lại lời Đức Chúa Giê-xu... liền khóc lóc."),
        ("Phiên Tòa Trước Phi-lát & Bản Án Đóng Đinh", "Giăng 18:28-40, 19:1-16", "gi", 18, "Lẽ thật là cái gì?"),
        ("Đồi Gô-gô-tha: Thập Tự Giá & Mọi Sự Đã Được Trọn", "Giăng 19:17-37", "gi", 19, "Mọi sự đã được trọn! Ngài gục đầu, trút linh hồn."),
        ("Sự Chôn Cất Trong Mộ Đá Mới Của Giô-sép", "Ma-thi-ơ 27:57-66", "mt", 27, "Họ niêm phong hòn đá và cắt quân canh gác."),
        ("Ngôi Mộ Trống & Sự Phục Sinh Vinh Hiển Khải Hoàn", "Ma-thi-ơ 28:1-15", "mt", 28, "Ngài không ở đây đâu; Ngài sống lại rồi, như lời Ngài đã phán!"),
        ("Gặp Lại Bên Biển Tiberias & Đại Mạng Lệnh", "Giăng 21:1-19; Ma-thi-ơ 28:16-20", "mt", 28, "Hãy đi dạy dỗ muôn dân... Và này, ta thường ở cùng các ngươi luôn cho đến tận thế.")
    ]
    days = []
    for idx, (title, pass_str, b_code, b_ch, golden) in enumerate(curated_journey, start=1):
        days.append({
            "day": idx,
            "title": f"Ngày {idx}: {title}",
            "passages": [pass_str],
            "primary_book": b_code,
            "primary_chapter": b_ch,
            "golden_verse": golden,
            "devotional_prompt": f"Chiêm nghiệm tình yêu hy sinh và quyền năng phục sinh của Chúa Giê-xu trong tâm trí hôm nay."
        })
    return days


def _generate_pauline_30_plan_days() -> List[Dict[str, Any]]:
    """Generates 30 days studying Paul's foundational Epistles."""
    pauline_flow = [
        ("Rô-ma 1-2", "rm", 1, "Tình Trạng Hư Mất Chung Của Nhân Loại", "Tin Lành là quyền phép của Đức Chúa Trời để cứu mọi kẻ tin."),
        ("Rô-ma 3-4", "rm", 3, "Sự Xưng Công Bình Bởi Đức Tin Nơi Đấng Christ", "Vì mọi người đều đã phạm tội, thiếu mất sự vinh hiển của Đức Chúa Trời."),
        ("Rô-ma 5-6", "rm", 5, "Hòa Thuận Lại Với Chúa & Đồng Chết Đồng Sống", "Đức Chúa Trời tỏ lòng yêu thương Ngài đối với chúng ta, khi chúng ta còn là người có tội, thì Đấng Christ vì chúng ta chịu chết."),
        ("Rô-ma 7-8", "rm", 8, "Sự Đắc Thắng Trong Đức Thánh Linh & Không Ai Dứt Ta Khỏi Chúa", "Hiện nay chẳng còn có sự đoán phạt nào cho những kẻ ở trong Đức Chúa Giê-xu Christ."),
        ("Rô-ma 12-14", "rm", 12, "Dâng Thân Thể Làm Của Lễ Sống & Đời Sống Cộng Đồng", "Hãy biến hóa bởi sự đổi mới của tâm thần mình."),
        ("1 Cô-rinh-tô 1-3", "1cr", 1, "Sự Khôn Ngoan Của Thập Tự Giá So Với Trần Gian", "Đạo thập tự giá là sự điên dại cho kẻ hư mất, nhưng cho chúng ta là quyền phép của Đức Chúa Trời."),
        ("1 Cô-rinh-tô 12-13", "1cr", 13, "Các Ân Tứ Thuộc Linh & Bài Ca Tình Yêu Tuyệt Hảo", "Tình yêu thương hay nhịn nhục; tình yêu thương hay nhân từ... Tình yêu thương chẳng hề hư mất bao giờ."),
        ("1 Cô-rinh-tô 15", "1cr", 15, "Chân Lý Sự Sống Lại Của Kẻ Chết & Chiến Thắng Hủy Diệt Tử Thần", "Hỡi sự chết, sự đắc thắng của mầy ở đâu? Hỡi sự chết, cái nọc của mầy ở đâu?"),
        ("2 Cô-rinh-tô 4-5", "2cr", 5, "Báu Vật Trong Bình Đất & Chức Vụ Giảng Hòa", "Nếu ai ở trong Đấng Christ, nấy là người dựng nên mới; những sự cũ đã qua đi, này mọi sự đều trở nên mới."),
        ("2 Cô-rinh-tô 12", "2cr", 12, "Cái Dằm Trong Xác Thịt & Ân Điển Đủ Đầy", "Ân điển ta đủ cho ngươi rồi, vì sức mạnh của ta nên trọn vẹn trong sự yếu đuối."),
        ("Ga-la-ti 1-2", "gl", 2, "Chỉ Một Tin Lành Thật & Tôi Đã Bị Đóng Đinh", "Tôi đã bị đóng đinh vào thập tự giá với Đấng Christ, mà tôi sống, không phải là tôi sống nữa, nhưng Đấng Christ sống trong tôi."),
        ("Ga-la-ti 5-6", "gl", 5, "Tự Do Trong Đấng Christ & Trái Của Thánh Linh", "Trái của Thánh Linh là lòng yêu thương, sự vui mừng, bình an, nhịn nhục, nhân từ, hiền lành, trung tín, mềm mại, tiết độ."),
        ("Ê-phê-sô 1-2", "ep", 2, "Được Cứu Nhờ Ân Điển Bởi Đức Tin & Dựng Nên Mới", "Ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời."),
        ("Ê-phê-sô 3-4", "ep", 4, "Sự Hiệp Một Trong Hội Thánh & Bước Đi Đáng Với Ơn Kêu Gọi", "Chỉ có một Chúa, một đức tin, một phép báp-tem, một Đức Chúa Trời và Cha của mọi người."),
        ("Ê-phê-sô 5-6", "ep", 6, "Hôn Nhân Cơ Đốc & Toàn Bộ Khí Giới Của Đức Chúa Trời", "Hãy mang lấy mọi khí giới của Đức Chúa Trời, để anh em có thể đứng vững trước các mưu kế của ma quỷ."),
        ("Phi-líp 1-2", "pl", 2, "Tâm Tình Của Đấng Christ: Khiêm Nhường Tự Hạ", "Ngài đã hiện ra như một người, tự hạ mình xuống, vâng phục cho đến chết, thậm chí chết trên cây thập tự."),
        ("Phi-líp 3-4", "pl", 4, "Chạy Đua Đến Mục Đích & Vui Mừng Luôn Luôn", "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi."),
        ("Cô-lô-se 1-2", "cl", 1, "Đấng Christ Là Đứng Đầu Vạn Vật & Sự Đầy Dẫy Của Thần Tính", "Ngài là hình ảnh của Đức Chúa Trời không thấy được, là Đấng sanh đầu hết thảy mọi vật dựng nên."),
        ("Cô-lô-se 3-4", "cl", 3, "Tìm Kiếm Các Sự Ở Trên Trời & Mặc Lấy Con Người Mới", "Nếu anh em đã sống lại với Đấng Christ, hãy tìm các sự ở trên trời."),
        ("1 Tê-sa-lô-ni-ca 4-5", "1ts", 4, "Sự Tái Lâm Của Chúa & Lối Sống Canh Thức", "Hãy vui mừng mãi mãi, cầu nguyện không thôi, phàm việc gì cũng phải tạ ơn Chúa."),
        ("2 Tê-sa-lô-ni-ca 1-3", "2ts", 3, "Sự Bền Đỗ Trong Hoạn Nạn & Giữ Vững Lời Dạy", "Chúa là thành tín, Ngài sẽ làm cho anh em được vững vàng và gìn giữ khỏi kẻ dữ."),
        ("1 Ti-mô-thê 1-3", "1tm", 2, "Tiêu Chuẩn Người Hầu Việc Chúa & Đấng Trung Bảo Duy Nhất", "Vì chỉ có một Đức Chúa Trời, và chỉ có một Đấng Trung bảo ở giữa Đức Chúa Trời và loài người, tức là Đức Chúa Giê-xu Christ, là người."),
        ("1 Ti-mô-thê 4-6", "1tm", 6, "Tập Tành Sự Tin Kính & Sự Thỏa Lòng Là Lợi Lớn", "Sự tin kính cùng sự thỏa lòng, ấy là một lợi lớn."),
        ("2 Ti-mô-thê 1-2", "2tm", 2, "Người Chiến Sĩ Giỏi Của Đấng Christ & Lời Dặn Dò Mục Vụ", "Hãy cùng ta chịu khổ như một người lính giỏi của Đức Chúa Giê-xu Christ."),
        ("2 Ti-mô-thê 3-4", "2tm", 3, "Cả Kinh Thánh Đều Được Soi Dẫn & Đánh Trận Tốt Lành", "Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình."),
        ("Tít 1-3", "tt", 2, "Ân Điển Dạy Dỗ Ta Từ Bỏ Sự Không Tin Kính", "Ân điển của Đức Chúa Trời đã được bày ra, đem sự cứu rỗi cho mọi người."),
        ("Phi-lê-môn 1", "pm", 1, "Sự Tha Thứ, Tiếp Nhận Người Anh Em Trong Đấng Christ", "Hãy tiếp đãi nó như chính mình tôi."),
        ("Hê-bơ-rơ 1-2", "hb", 1, "Con Đức Chúa Trời Cao Trọng Hơn Các Thiên Sứ", "Đức Chúa Trời, xưa kia đã phán dạy... đời sau rốt này phán dạy qua Con Ngài."),
        ("Hê-bơ-rơ 11", "hb", 11, "Đài Tưởng Niệm Những Anh Hùng Đức Tin", "Vả, đức tin là sự biết chắc vững vàng của những điều mình đang trông mong, là bằng cớ của những điều mình chẳng xem thấy."),
        ("Hê-bơ-rơ 12-13", "hb", 12, "Nhìn Xem Đức Chúa Giê-xu Là Cội Rễ Của Đức Tin", "Đức Chúa Giê-xu Christ hôm qua, ngày nay, và cho đến đời đời không hề thay đổi.")
    ]
    days = []
    for idx, (pass_str, b_code, b_ch, title, golden) in enumerate(pauline_flow, start=1):
        days.append({
            "day": idx,
            "title": f"Ngày {idx}: {title}",
            "passages": [pass_str],
            "primary_book": b_code,
            "primary_chapter": b_ch,
            "golden_verse": golden,
            "devotional_prompt": f"Để lẽ thật giáo lý biến đổi nhân cách và hành động thực tế của bạn trong Chúa Giê-xu hôm nay."
        })
    return days


# Registry of predefined plans
READING_PLANS_REGISTRY = {
    "plan_1_year": {
        "id": "plan_1_year",
        "title": "Toàn Bộ Kinh Thánh Trong 1 Năm",
        "subtitle": "Lộ trình chính kinh 365 ngày trọn vẹn 66 sách",
        "category": "Toàn Kinh Thánh",
        "total_days": 365,
        "difficulty": "Trung Bình",
        "icon": "BookOpen",
        "badge_name": "Huy Chương Trọn Kinh Thánh 365",
        "recommended_for": "Mọi tín hữu muốn xây dựng thói quen đọc Kinh Thánh đều đặn mỗi ngày",
        "description": "Lộ trình cân bằng 365 ngày giúp bạn hoàn thành toàn bộ Cựu Ước và Tân Ước với các phân đoạn Cựu Ước, Tân Ước, Thi Thiên và Châm Ngôn mỗi ngày.",
        "days_generator": _generate_1_year_plan_days
    },
    "plan_nt_90": {
        "id": "plan_nt_90",
        "title": "Tân Ước Trong 90 Ngày",
        "subtitle": "260 chương Tân Ước trong 3 tháng sâu sắc",
        "category": "Tân Ước",
        "total_days": 90,
        "difficulty": "Cơ Bản",
        "icon": "Flame",
        "badge_name": "Môn Đồ Tân Ước 90",
        "recommended_for": "Tân tín hữu, ứng viên báp-tem, hoặc người muốn ôn lại trọn bộ Tân Ước",
        "description": "Mỗi ngày đọc khoảng 3 chương, đi qua trọn vẹn chức vụ của Chúa Cứu Thế Giê-xu, lịch sử Hội Thánh ban đầu và các thư tín sứ đồ.",
        "days_generator": _generate_nt_90_plan_days
    },
    "plan_wisdom_30": {
        "id": "plan_wisdom_30",
        "title": "Khảo Sát Thi Ca & Khôn Ngoan",
        "subtitle": "30 ngày ngẫm suy Gióp, Thi Thiên, Châm Ngôn, Truyền Đạo & Nhã Ca",
        "category": "Khôn Ngoan & Thơ Ca",
        "total_days": 30,
        "difficulty": "Nhẹ Nhàng",
        "icon": "Sparkles",
        "badge_name": "Bậc Thầy Khôn Ngoan",
        "recommended_for": "Người cần sự an ủi, chỉ dẫn khôn ngoan và lời ngợi khen trong thử thách",
        "description": "Suy ngẫm những câu châm ngôn sâu sắc, những khúc thi thiên đầy cảm xúc và triết lý sống đức tin vượt trên nghịch cảnh.",
        "days_generator": _generate_wisdom_30_plan_days
    },
    "plan_gospels_40": {
        "id": "plan_gospels_40",
        "title": "Theo Dấu Chân Chúa Cứu Thế (40 Ngày)",
        "subtitle": "Hành trình biên niên cuộc đời, sự thương khó và phục sinh của Chúa Giê-xu",
        "category": "Phúc Âm & Biên Niên",
        "total_days": 40,
        "difficulty": "Sâu Sắc",
        "icon": "HeartHandshake",
        "badge_name": "Dấu Chân Đấng Christ",
        "recommended_for": "Mùa Chay, chuẩn bị Lễ Thương Khó & Phục Sinh",
        "description": "40 ngày theo sát từng chặng đường chức vụ của Đấng Christ: từ sự giáng sinh khiêm nhường, chức vụ phép lạ xứ Ga-li-lê, lời giảng trên núi đến thập tự giá Gô-gô-tha và ngôi mộ trống.",
        "days_generator": _generate_gospels_40_plan_days
    },
    "plan_pauline_30": {
        "id": "plan_pauline_30",
        "title": "Thần Học Các Thư Tín Sứ Đồ Phao-lô",
        "subtitle": "30 ngày khám phá chân lý Ân Điển, Đức Tin và Nếp Sống Đắc Thắng",
        "category": "Thư Tín & Giáo Lý",
        "total_days": 30,
        "difficulty": "Nghiên Cứu",
        "icon": "Scroll",
        "badge_name": "Học Giả Thư Tín Phao-lô",
        "recommended_for": "Người dạy đạo, trưởng ban ngành, và người học thần học căn bản",
        "description": "Đào sâu những luận điểm thần học cốt lõi trong Rô-ma, 1&2 Cô-rinh-tô, Ga-la-ti, Ê-phê-sô, Phi-líp, Cô-lô-se và các thư tín mục vụ.",
        "days_generator": _generate_pauline_30_plan_days
    }
}


def _fetch_user_plan_progress(db: Session, user_identifier: str, plan_id: str) -> Dict[str, Any]:
    """Helper to query progress from DB table with in-memory fallback."""
    cache_key = f"{user_identifier}_{plan_id}"
    try:
        sql = text("""
            SELECT completed_days, current_day, streak, last_read_date
            FROM user_reading_plan_progress
            WHERE user_identifier = :u AND plan_id = :p
        """)
        row = db.execute(sql, {"u": user_identifier, "p": plan_id}).fetchone()
        if row:
            cd = row.completed_days or []
            return {
                "completed_days": cd,
                "current_day": row.current_day or (max(cd) + 1 if cd else 1),
                "streak": row.streak or 1,
                "last_read_date": str(row.last_read_date) if row.last_read_date else None
            }
    except Exception as e:
        logger.warning(f"DB read error for reading plan progress, falling back to cache: {e}")

    # Fallback to cache
    return READING_PROGRESS_CACHE.get(cache_key, {
        "completed_days": [],
        "current_day": 1,
        "streak": 1,
        "last_read_date": None
    })


@router.get("/reading-plans")
def list_reading_plans(
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    """
    List all available structured Bible Reading Plans with user completion status.
    """
    results = []
    for pid, meta in READING_PLANS_REGISTRY.items():
        prog = _fetch_user_plan_progress(db, user_identifier, pid)
        completed_count = len(prog["completed_days"])
        total_d = meta["total_days"]
        pct = round((completed_count / total_d) * 100, 1) if total_d > 0 else 0

        results.append({
            "id": pid,
            "title": meta["title"],
            "subtitle": meta["subtitle"],
            "category": meta["category"],
            "total_days": total_d,
            "difficulty": meta["difficulty"],
            "icon": meta["icon"],
            "badge_name": meta["badge_name"],
            "recommended_for": meta["recommended_for"],
            "description": meta["description"],
            "completed_count": completed_count,
            "completion_percentage": pct,
            "current_day": prog["current_day"],
            "streak": prog["streak"],
            "last_read_date": prog["last_read_date"]
        })
    return results


@router.get("/reading-plans/today")
def get_today_reading_plan(
    plan_id: str = Query("plan_1_year", description="Active plan ID"),
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    """
    Returns today's reading assignment for the active plan for 1-click Reader integration.
    """
    if plan_id not in READING_PLANS_REGISTRY:
        plan_id = "plan_1_year"

    meta = READING_PLANS_REGISTRY[plan_id]
    prog = _fetch_user_plan_progress(db, user_identifier, plan_id)
    cur_day = prog["current_day"]
    days = meta["days_generator"]()

    # Find day item or clamp
    day_idx = min(max(cur_day, 1), len(days)) - 1
    today_item = days[day_idx]

    is_completed = today_item["day"] in prog["completed_days"]

    return {
        "plan_id": plan_id,
        "plan_title": meta["title"],
        "plan_category": meta["category"],
        "total_days": meta["total_days"],
        "current_day": today_item["day"],
        "is_completed": is_completed,
        "day_info": today_item,
        "streak": prog["streak"],
        "completed_count": len(prog["completed_days"]),
        "completion_percentage": round((len(prog["completed_days"]) / meta["total_days"]) * 100, 1)
    }


@router.get("/reading-plans/{plan_id}")
def get_reading_plan_detail(
    plan_id: str,
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    """
    Get full details of a specific reading plan including all daily passage assignments.
    """
    if plan_id not in READING_PLANS_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy kế hoạch đọc: '{plan_id}'")

    meta = READING_PLANS_REGISTRY[plan_id]
    prog = _fetch_user_plan_progress(db, user_identifier, plan_id)
    completed_set = set(prog["completed_days"])

    days_list = meta["days_generator"]()
    enriched_days = []
    for d in days_list:
        enriched_days.append({
            **d,
            "is_completed": d["day"] in completed_set
        })

    completed_count = len(completed_set)
    total_d = meta["total_days"]

    return {
        "id": meta["id"],
        "title": meta["title"],
        "subtitle": meta["subtitle"],
        "category": meta["category"],
        "total_days": total_d,
        "difficulty": meta["difficulty"],
        "icon": meta["icon"],
        "badge_name": meta["badge_name"],
        "recommended_for": meta["recommended_for"],
        "description": meta["description"],
        "completed_count": completed_count,
        "completion_percentage": round((completed_count / total_d) * 100, 1) if total_d > 0 else 0,
        "current_day": prog["current_day"],
        "streak": prog["streak"],
        "last_read_date": prog["last_read_date"],
        "days": enriched_days
    }


@router.post("/reading-plans/{plan_id}/toggle-day")
def toggle_reading_plan_day(
    plan_id: str,
    req: ToggleDayRequest,
    db: Session = Depends(get_db)
):
    """
    Toggle or set completion status of a specific day in a reading plan.
    Updates streak and completion progress persistently.
    """
    if plan_id not in READING_PLANS_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy kế hoạch: '{plan_id}'")

    meta = READING_PLANS_REGISTRY[plan_id]
    user_id = req.user_identifier or "local_user"
    cache_key = f"{user_id}_{plan_id}"

    prog = _fetch_user_plan_progress(db, user_id, plan_id)
    completed_set = set(prog["completed_days"])

    if req.completed is None:
        if req.day in completed_set:
            completed_set.remove(req.day)
            action = "unmarked"
        else:
            completed_set.add(req.day)
            action = "marked"
    elif req.completed:
        completed_set.add(req.day)
        action = "marked"
    else:
        completed_set.discard(req.day)
        action = "unmarked"

    new_completed_list = sorted(list(completed_set))
    new_curr = max(new_completed_list) + 1 if new_completed_list else 1
    if new_curr > meta["total_days"]:
        new_curr = meta["total_days"]

    # Calculate streak
    streak = prog["streak"]
    if action == "marked":
        streak += 1

    # Update DB
    try:
        sql_check = text("SELECT id FROM user_reading_plan_progress WHERE user_identifier = :u AND plan_id = :p")
        existing = db.execute(sql_check, {"u": user_id, "p": plan_id}).fetchone()
        if existing:
            sql_upd = text("""
                UPDATE user_reading_plan_progress
                SET completed_days = :cd, current_day = :cur, streak = :st, last_read_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
                WHERE user_identifier = :u AND plan_id = :p
            """)
            db.execute(sql_upd, {"cd": new_completed_list, "cur": new_curr, "st": streak, "u": user_id, "p": plan_id})
        else:
            sql_ins = text("""
                INSERT INTO user_reading_plan_progress (user_identifier, plan_id, completed_days, current_day, streak, last_read_date)
                VALUES (:u, :p, :cd, :cur, :st, CURRENT_DATE)
            """)
            db.execute(sql_ins, {"u": user_id, "p": plan_id, "cd": new_completed_list, "cur": new_curr, "st": streak})
        db.commit()
    except Exception as e:
        logger.warning(f"Could not persist reading progress to DB, caching in-memory: {e}")
        db.rollback()

    # Update in-memory cache
    READING_PROGRESS_CACHE[cache_key] = {
        "completed_days": new_completed_list,
        "current_day": new_curr,
        "streak": streak,
        "last_read_date": str(datetime.now().date())
    }

    completed_count = len(new_completed_list)
    total_d = meta["total_days"]
    pct = round((completed_count / total_d) * 100, 1)

    return {
        "status": "success",
        "action": action,
        "plan_id": plan_id,
        "day": req.day,
        "is_completed": req.day in completed_set,
        "completed_count": completed_count,
        "total_days": total_d,
        "completion_percentage": pct,
        "current_day": new_curr,
        "streak": streak,
        "badge_unlocked": pct >= 100.0,
        "badge_name": meta["badge_name"] if pct >= 100.0 else None
    }
