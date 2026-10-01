from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
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




