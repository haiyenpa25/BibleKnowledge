from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import httpx
import json
import logging
from datetime import datetime

from app.db.session import get_db
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/study", tags=["study"])


# ==============================================================================
# Schemas
# ==============================================================================

class LexiconItem(BaseModel):
    id: str
    strong_number: str
    language: str
    lemma: str
    transliteration: str
    pronunciation: Optional[str]
    part_of_speech: Optional[str]
    definition: str
    theological_significance: Optional[str]
    occurrences_count: int
    key_verses: List[str]


class PassageStudyRequest(BaseModel):
    reference: str = Field(..., description="Bible passage, e.g. 'Giăng 3:16-21' or 'Rô-ma 8:28-39'")


class PassageStudyResponse(BaseModel):
    reference: str
    passage_text: str
    literary_context: str
    theological_themes: List[str]
    structural_outline: List[Dict[str, str]]
    original_language_insights: str
    application_questions: List[str]


class StudyNoteCreate(BaseModel):
    title: str = Field(..., max_length=200)
    scripture_ref: Optional[str] = None
    content: str
    tags: List[str] = []


class StudyNoteItem(BaseModel):
    id: str
    title: str
    scripture_ref: Optional[str]
    content: str
    tags: List[str]
    created_at: str
    updated_at: str


class BookmarkCreate(BaseModel):
    verse_code: int
    reference: str
    note: Optional[str] = None
    color: str = "blue"


class BookmarkItem(BaseModel):
    id: str
    verse_code: int
    reference: str
    note: Optional[str]
    color: str
    created_at: str


# ==============================================================================
# 1. Strong Lexicon Endpoints (Original Languages)
# ==============================================================================

@router.get("/lexicon", response_model=List[LexiconItem])
def list_lexicon(
    language: Optional[str] = Query(None, description="greek or hebrew"),
    search: Optional[str] = Query(None, description="Keyword search in lemma or definition"),
    db: Session = Depends(get_db)
):
    query_str = "SELECT id, strong_number, language, lemma, transliteration, pronunciation, part_of_speech, definition, theological_significance, occurrences_count, key_verses FROM strong_lexicon"
    conditions = []
    params: dict = {}

    if language:
        conditions.append("language = :lang")
        params["lang"] = language.lower()

    if search:
        conditions.append("(lemma ILIKE :search OR transliteration ILIKE :search OR definition ILIKE :search)")
        params["search"] = f"%{search}%"

    if conditions:
        query_str += " WHERE " + " AND ".join(conditions)

    query_str += " ORDER BY id ASC"

    rows = db.execute(text(query_str), params).fetchall()
    results = []
    for r in rows:
        kv = r.key_verses
        if isinstance(kv, str):
            try:
                kv = json.loads(kv)
            except Exception:
                kv = [kv]
        results.append(LexiconItem(
            id=r.id,
            strong_number=r.strong_number,
            language=r.language,
            lemma=r.lemma,
            transliteration=r.transliteration,
            pronunciation=r.pronunciation,
            part_of_speech=r.part_of_speech,
            definition=r.definition,
            theological_significance=r.theological_significance,
            occurrences_count=r.occurrences_count or 0,
            key_verses=kv or []
        ))
    return results


@router.get("/lexicon/{strong_id}", response_model=LexiconItem)
def get_lexicon_detail(strong_id: str, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT id, strong_number, language, lemma, transliteration, pronunciation, part_of_speech, definition, theological_significance, occurrences_count, key_verses FROM strong_lexicon WHERE id = :id"),
        {"id": strong_id.upper()}
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy mục từ điển Strong này.")

    kv = row.key_verses
    if isinstance(kv, str):
        try:
            kv = json.loads(kv)
        except Exception:
            kv = [kv]

    return LexiconItem(
        id=row.id,
        strong_number=row.strong_number,
        language=row.language,
        lemma=row.lemma,
        transliteration=row.transliteration,
        pronunciation=row.pronunciation,
        part_of_speech=row.part_of_speech,
        definition=row.definition,
        theological_significance=row.theological_significance,
        occurrences_count=row.occurrences_count or 0,
        key_verses=kv or []
    )


# ==============================================================================
# 2. Passage Study Engine (AI Guided Exegesis)
# ==============================================================================

@router.post("/passage", response_model=PassageStudyResponse)
async def analyze_passage_study(
    req: PassageStudyRequest,
    db: Session = Depends(get_db)
):
    """
    Perform deep exegesis and structured passage analysis with local Qwen.
    """
    # 1. Retrieve scripture text from bible_verses
    search_q = req.reference.replace("-", " ")
    verses_rows = db.execute(
        text("""
        SELECT b.name_vi, v.chapter, v.verse, v.text
        FROM bible_verses v
        JOIN bible_books b ON b.id = v.book_id
        WHERE v.search_vector @@ plainto_tsquery('simple', :ref_q)
        LIMIT 15
        """),
        {"ref_q": search_q}
    ).fetchall()

    if verses_rows:
        passage_text = "\n".join([f"{r.name_vi} {r.chapter}:{r.verse} - {r.text}" for r in verses_rows])
    else:
        passage_text = f"Phân đoạn: {req.reference}"

    prompt = f"""Bạn là một học giả thần học giải kinh Kinh Thánh Tin Lành chính thống.
Hãy phân tích chuyên sâu phân đoạn Kinh Thánh sau:
---
{passage_text}
---

YÊU CẦU:
Phân tích theo đúng cấu trúc JSON sau, tuyệt đối không bịa đặt, bảo đảm trung thành với Kinh Thánh:
{{
  "literary_context": "Bối cảnh văn học, lịch sử và đối tượng người nhận.",
  "theological_themes": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"],
  "structural_outline": [
    {{"section": "Phần 1 (Câu ...)", "theme": "Nội dung chính"}},
    {{"section": "Phần 2 (Câu ...)", "theme": "Nội dung chính"}}
  ],
  "original_language_insights": "Ý nghĩa từ ngữ nguyên ngữ (Hy Lạp/Hê-bơ-rơ) nếu có, cách dùng từ đắt giá.",
  "application_questions": ["Câu hỏi suy ngẫm thực tế 1", "Câu hỏi suy ngẫm thực tế 2"]
}}
Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ, không kèm văn bản giải thích thêm nào khác.
"""
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "num_predict": 1024
                    }
                }
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("response", "").strip()

            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            analysis = json.loads(raw_text)

            return PassageStudyResponse(
                reference=req.reference,
                passage_text=passage_text,
                literary_context=analysis.get("literary_context", ""),
                theological_themes=analysis.get("theological_themes", []),
                structural_outline=analysis.get("structural_outline", []),
                original_language_insights=analysis.get("original_language_insights", ""),
                application_questions=analysis.get("application_questions", [])
            )

    except Exception as e:
        logger.error(f"Error analyzing passage: {e}")
        raise HTTPException(status_code=500, detail=f"Không thể phân tích phân đoạn: {str(e)}")


# ==============================================================================
# 3. Personal Study Notes & Bookmarks
# ==============================================================================

@router.get("/notes", response_model=List[StudyNoteItem])
def list_study_notes(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, title, scripture_ref, content, tags, created_at, updated_at FROM user_study_notes ORDER BY updated_at DESC")
    ).fetchall()

    results = []
    for r in rows:
        tags = r.tags
        if isinstance(tags, str):
            try:
                tags = json.loads(tags)
            except Exception:
                tags = [tags]
        results.append(StudyNoteItem(
            id=str(r.id),
            title=r.title,
            scripture_ref=r.scripture_ref,
            content=r.content,
            tags=tags or [],
            created_at=r.created_at.isoformat() if r.created_at else "",
            updated_at=r.updated_at.isoformat() if r.updated_at else ""
        ))
    return results


@router.post("/notes", response_model=StudyNoteItem)
def create_study_note(req: StudyNoteCreate, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    res = db.execute(
        text("""
        INSERT INTO user_study_notes (title, scripture_ref, content, tags, created_at, updated_at)
        VALUES (:title, :ref, :content, :tags, :created_at, :updated_at)
        RETURNING id, created_at, updated_at
        """),
        {
            "title": req.title,
            "ref": req.scripture_ref,
            "content": req.content,
            "tags": json.dumps(req.tags, ensure_ascii=False),
            "created_at": now,
            "updated_at": now
        }
    ).fetchone()
    db.commit()

    return StudyNoteItem(
        id=str(res.id),
        title=req.title,
        scripture_ref=req.scripture_ref,
        content=req.content,
        tags=req.tags,
        created_at=res.created_at.isoformat(),
        updated_at=res.updated_at.isoformat()
    )


@router.delete("/notes/{note_id}")
def delete_study_note(note_id: str, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM user_study_notes WHERE id = :id"), {"id": note_id})
    db.commit()
    return {"message": "Đã xóa ghi chú thành công."}


@router.get("/bookmarks", response_model=List[BookmarkItem])
def list_bookmarks(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, verse_code, reference, note, color, created_at FROM user_bookmarks ORDER BY created_at DESC")
    ).fetchall()

    results = []
    for r in rows:
        results.append(BookmarkItem(
            id=str(r.id),
            verse_code=r.verse_code,
            reference=r.reference,
            note=r.note,
            color=r.color or "blue",
            created_at=r.created_at.isoformat() if r.created_at else ""
        ))
    return results


@router.post("/bookmarks", response_model=BookmarkItem)
def create_bookmark(req: BookmarkCreate, db: Session = Depends(get_db)):
    res = db.execute(
        text("""
        INSERT INTO user_bookmarks (verse_code, reference, note, color, created_at)
        VALUES (:code, :ref, :note, :color, CURRENT_TIMESTAMP)
        RETURNING id, created_at
        """),
        {
            "code": req.verse_code,
            "ref": req.reference,
            "note": req.note,
            "color": req.color
        }
    ).fetchone()
    db.commit()

    return BookmarkItem(
        id=str(res.id),
        verse_code=req.verse_code,
        reference=req.reference,
        note=req.note,
        color=req.color,
        created_at=res.created_at.isoformat()
    )


@router.delete("/bookmarks/{bm_id}")
def delete_bookmark(bm_id: str, db: Session = Depends(get_db)):
    db.execute(text("DELETE FROM user_bookmarks WHERE id = :id"), {"id": bm_id})
    db.commit()
    return {"message": "Đã gỡ bookmark thành công."}
