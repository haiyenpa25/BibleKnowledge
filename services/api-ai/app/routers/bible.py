from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
import re
import json
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

    # Keyword mappings to Strong numbers for accurate matching
    keyword_map = {
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

    matched_strong_nums = set()

    for kw, s_nums in keyword_map.items():
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

    # 5. Cross Reference Previews
    raw_cross = v_row.cross_references or []
    cross_previews = []
    for ref_str in raw_cross[:4]:
        # Try to find preview verse text
        preview_text = ""
        try:
            from app.routers.bible import get_verse_range
            cr_res = get_verse_range(ref=ref_str, db=db)
            if cr_res.get("verses"):
                preview_text = cr_res["verses"][0]["text"]
        except Exception:
            preview_text = ""
        cross_previews.append({
            "reference": ref_str,
            "preview_text": preview_text
        })

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
        "cross_references": cross_previews
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
        "distribution": {
            "old_testament": ot_count,
            "new_testament": nt_count,
            "total_matches": ot_count + nt_count
        },
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



