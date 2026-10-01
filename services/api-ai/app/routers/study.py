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


class StudyProjectCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = ""
    category: str = "theology"
    pinned_verses: List[Dict[str, Any]] = []
    pinned_entities: List[Dict[str, Any]] = []
    study_questions: List[str] = []


class StudyProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    pinned_verses: Optional[List[Dict[str, Any]]] = None
    pinned_entities: Optional[List[Dict[str, Any]]] = None
    study_questions: Optional[List[str]] = None
    ai_outline: Optional[List[Dict[str, Any]]] = None


class StudyProjectItem(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: str
    pinned_verses: List[Dict[str, Any]]
    pinned_entities: List[Dict[str, Any]]
    study_questions: List[str]
    ai_outline: List[Dict[str, Any]]
    created_at: str
    updated_at: str


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


# ==============================================================================
# 5. Study Projects Workspace (ROADMAP1 Section 50)
# ==============================================================================

def parse_json_field(val: Any) -> list:
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return []
    return []


@router.get("/projects", response_model=List[StudyProjectItem])
def list_study_projects(db: Session = Depends(get_db)):
    """List all study projects with pinned elements and outline."""
    rows = db.execute(
        text("SELECT id, title, description, category, pinned_verses, pinned_entities, study_questions, ai_outline, created_at, updated_at FROM study_projects ORDER BY updated_at DESC")
    ).fetchall()

    results = []
    for r in rows:
        results.append(StudyProjectItem(
            id=str(r.id),
            title=r.title,
            description=r.description or "",
            category=r.category or "theology",
            pinned_verses=parse_json_field(r.pinned_verses),
            pinned_entities=parse_json_field(r.pinned_entities),
            study_questions=parse_json_field(r.study_questions),
            ai_outline=parse_json_field(r.ai_outline),
            created_at=r.created_at.isoformat() if r.created_at else "",
            updated_at=r.updated_at.isoformat() if r.updated_at else ""
        ))
    return results


@router.post("/projects", response_model=StudyProjectItem)
def create_study_project(req: StudyProjectCreate, db: Session = Depends(get_db)):
    """Create a new research study project."""
    res = db.execute(
        text("""
        INSERT INTO study_projects (title, description, category, pinned_verses, pinned_entities, study_questions, created_at, updated_at)
        VALUES (:title, :desc, :cat, :verses, :entities, :questions, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, created_at, updated_at
        """),
        {
            "title": req.title,
            "desc": req.description,
            "cat": req.category,
            "verses": json.dumps(req.pinned_verses, ensure_ascii=False),
            "entities": json.dumps(req.pinned_entities, ensure_ascii=False),
            "questions": json.dumps(req.study_questions, ensure_ascii=False)
        }
    ).fetchone()
    db.commit()

    return StudyProjectItem(
        id=str(res.id),
        title=req.title,
        description=req.description,
        category=req.category,
        pinned_verses=req.pinned_verses,
        pinned_entities=req.pinned_entities,
        study_questions=req.study_questions,
        ai_outline=[],
        created_at=res.created_at.isoformat(),
        updated_at=res.updated_at.isoformat()
    )


@router.get("/projects/{project_id}", response_model=StudyProjectItem)
def get_study_project(project_id: str, db: Session = Depends(get_db)):
    """Fetch single study project by ID."""
    r = db.execute(
        text("SELECT id, title, description, category, pinned_verses, pinned_entities, study_questions, ai_outline, created_at, updated_at FROM study_projects WHERE id = :id"),
        {"id": project_id}
    ).fetchone()

    if not r:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án nghiên cứu.")

    return StudyProjectItem(
        id=str(r.id),
        title=r.title,
        description=r.description or "",
        category=r.category or "theology",
        pinned_verses=parse_json_field(r.pinned_verses),
        pinned_entities=parse_json_field(r.pinned_entities),
        study_questions=parse_json_field(r.study_questions),
        ai_outline=parse_json_field(r.ai_outline),
        created_at=r.created_at.isoformat() if r.created_at else "",
        updated_at=r.updated_at.isoformat() if r.updated_at else ""
    )


@router.put("/projects/{project_id}", response_model=StudyProjectItem)
def update_study_project(project_id: str, req: StudyProjectUpdate, db: Session = Depends(get_db)):
    """Update study project elements."""
    curr = db.execute(text("SELECT id FROM study_projects WHERE id = :id"), {"id": project_id}).fetchone()
    if not curr:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án nghiên cứu.")

    updates = []
    params: dict = {"id": project_id}

    if req.title is not None:
        updates.append("title = :title")
        params["title"] = req.title
    if req.description is not None:
        updates.append("description = :desc")
        params["desc"] = req.description
    if req.category is not None:
        updates.append("category = :cat")
        params["cat"] = req.category
    if req.pinned_verses is not None:
        updates.append("pinned_verses = :verses")
        params["verses"] = json.dumps(req.pinned_verses, ensure_ascii=False)
    if req.pinned_entities is not None:
        updates.append("pinned_entities = :entities")
        params["entities"] = json.dumps(req.pinned_entities, ensure_ascii=False)
    if req.study_questions is not None:
        updates.append("study_questions = :questions")
        params["questions"] = json.dumps(req.study_questions, ensure_ascii=False)
    if req.ai_outline is not None:
        updates.append("ai_outline = :outline")
        params["outline"] = json.dumps(req.ai_outline, ensure_ascii=False)

    updates.append("updated_at = CURRENT_TIMESTAMP")
    sql = f"UPDATE study_projects SET {', '.join(updates)} WHERE id = :id"
    db.execute(text(sql), params)
    db.commit()

    return get_study_project(project_id, db=db)


@router.delete("/projects/{project_id}")
def delete_study_project(project_id: str, db: Session = Depends(get_db)):
    """Delete a study project."""
    db.execute(text("DELETE FROM study_projects WHERE id = :id"), {"id": project_id})
    db.commit()
    return {"message": "Đã xóa dự án nghiên cứu thành công."}


@router.post("/projects/{project_id}/generate-outline", response_model=StudyProjectItem)
async def generate_project_outline(project_id: str, db: Session = Depends(get_db)):
    """Use Ollama local LLM to generate structured study outline for the project."""
    r = db.execute(
        text("SELECT id, title, description, category, pinned_verses FROM study_projects WHERE id = :id"),
        {"id": project_id}
    ).fetchone()

    if not r:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án nghiên cứu.")

    verses_list = parse_json_field(r.pinned_verses)
    verses_context = "\n".join(f"- {v.get('reference', '')}: {v.get('text', '')}" for v in verses_list)

    prompt = f"""Bạn là nhà thần học Kinh Thánh. Hãy lập dàn ý nghiên cứu có cấu trúc chuẩn mực cho đề tài sau:
Đề tài: {r.title}
Mô tả: {r.description}
Các câu Kinh Thánh trọng tâm:
{verses_context if verses_context else "(Chưa ghim câu Kinh Thánh)"}

Yêu cầu trả về định dạng JSON array hợp lệ, KHÔNG thêm bất kỳ giải thích ngoài:
[
  {{"section": "I. Tên Phân Đoạn 1", "content": "Nội dung tóm tắt nghiên cứu 1-2 câu"}},
  {{"section": "II. Tên Phân Đoạn 2", "content": "Nội dung tóm tắt nghiên cứu 1-2 câu"}},
  {{"section": "III. Tên Phân Đoạn 3", "content": "Nội dung tóm tắt nghiên cứu 1-2 câu"}}
]
"""
    outline_data = []
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                raw_text = resp.json().get("response", "").strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                elif raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()
                parsed = json.loads(raw_text)
                if isinstance(parsed, list):
                    outline_data = parsed
    except Exception as e:
        logger.warning(f"Failed to generate outline with Ollama: {e}")

    if not outline_data:
        # Fallback outline
        outline_data = [
            {"section": f"I. Khảo Luận Bối Cảnh Lịch Sử & Tác Giả", "content": f"Tìm hiểu thời điểm, tác giả và hoàn cảnh lịch sử liên quan đến đề tài {r.title}."},
            {"section": f"II. Căn Cứ Thần Học Cốt Lõi", "content": f"Phân tích các phân đoạn Kinh Thánh trọng tâm làm nền tảng đức tin."},
            {"section": f"III. Bài Học Thuộc Linh & Thực Tiễn", "content": f"Ý nghĩa áp dụng cho đời sống thờ phượng và bước đi cùng Chúa hôm nay."}
        ]

    db.execute(
        text("""
        UPDATE study_projects
        SET ai_outline = :outline,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
        """),
        {"outline": json.dumps(outline_data, ensure_ascii=False), "id": project_id}
    )
    db.commit()

    return get_study_project(project_id, db=db)


@router.post("/projects/{project_id}/export-flashcards")
def export_project_to_flashcards(project_id: str, db: Session = Depends(get_db)):
    """Export project outline and verses into SM-2 spaced repetition flashcards."""
    r = db.execute(
        text("SELECT id, title, ai_outline, pinned_verses FROM study_projects WHERE id = :id"),
        {"id": project_id}
    ).fetchone()

    if not r:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án nghiên cứu.")

    outline = parse_json_field(r.ai_outline)
    verses = parse_json_field(r.pinned_verses)

    created_count = 0

    # Create flashcards from outline
    for sec in outline:
        front = f"[{r.title}] {sec.get('section', '')} có ý nghĩa gì?"
        back = sec.get('content', '')
        if front and back:
            db.execute(
                text("""
                INSERT INTO flashcards (card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at)
                VALUES ('doctrine', :front, :back, 1, 0, 1, CURRENT_TIMESTAMP)
                """),
                {"front": front, "back": back}
            )
            created_count += 1

    # Create flashcards from verses
    for v in verses:
        front = f"Câu Kinh Thánh nào nói về: {r.title} ({v.get('reference', '')})?"
        back = v.get('text', '')
        if front and back:
            db.execute(
                text("""
                INSERT INTO flashcards (card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at)
                VALUES ('verse', :front, :back, 2, 0, 1, CURRENT_TIMESTAMP)
                """),
                {"front": front, "back": back}
            )
            created_count += 1

    db.commit()
    return {"message": f"Đã xuất thành công {created_count} thẻ ghi nhớ Flashcard vào hệ thống Học Tập!", "created_count": created_count}


@router.get("/export-bundle")
def export_study_bundle(db: Session = Depends(get_db)):
    """Export complete user study workspace as structured JSON and Markdown summary bundle (§48, §50)."""
    # 1. Bookmarks
    bm_rows = db.execute(
        text("SELECT verse_code, reference, note, color, created_at FROM user_bookmarks ORDER BY created_at DESC")
    ).fetchall()
    bookmarks = [
        {
            "verse_code": r.verse_code,
            "reference": r.reference,
            "note": r.note or "",
            "color": r.color or "blue",
            "created_at": r.created_at.isoformat() if r.created_at else ""
        }
        for r in bm_rows
    ]

    # 2. Notes
    note_rows = db.execute(
        text("SELECT id, title, scripture_ref, content, tags, created_at, updated_at FROM user_study_notes ORDER BY updated_at DESC")
    ).fetchall()
    notes = [
        {
            "id": str(r.id),
            "title": r.title,
            "scripture_ref": r.scripture_ref or "",
            "content": r.content,
            "tags": r.tags if isinstance(r.tags, list) else json.loads(r.tags or "[]"),
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else ""
        }
        for r in note_rows
    ]

    # 3. Projects
    proj_rows = db.execute(
        text("SELECT id, title, description, category, pinned_verses, pinned_entities, study_questions, ai_outline, created_at, updated_at FROM study_projects ORDER BY updated_at DESC")
    ).fetchall()
    projects = [
        {
            "id": str(r.id),
            "title": r.title,
            "description": r.description or "",
            "category": r.category or "theology",
            "pinned_verses": parse_json_field(r.pinned_verses),
            "pinned_entities": parse_json_field(r.pinned_entities),
            "study_questions": parse_json_field(r.study_questions),
            "ai_outline": parse_json_field(r.ai_outline),
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else ""
        }
        for r in proj_rows
    ]

    # 4. Generate Comprehensive Markdown Document
    md_lines = [
        "# Sổ Tay & Hồ Sơ Nghiên Cứu Kinh Thánh — BibleKnowledge",
        f"> Xuất dữ liệu vào: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "---",
        "",
        f"## 1. Ghi Chú Cá Nhân ({len(notes)} ghi chú)",
        ""
    ]

    if notes:
        for idx, n in enumerate(notes, 1):
            md_lines.append(f"### {idx}. {n['title']}")
            if n['scripture_ref']:
                md_lines.append(f"- **Kinh văn tham chiếu**: `{n['scripture_ref']}`")
            if n['tags']:
                md_lines.append(f"- **Nhãn chủ đề**: {', '.join(f'`#{t}`' for t in n['tags'])}")
            md_lines.append(f"- **Ngày cập nhật**: {n['updated_at']}")
            md_lines.append("")
            md_lines.append(n['content'])
            md_lines.append("")
            md_lines.append("---")
            md_lines.append("")
    else:
        md_lines.append("*Chưa có ghi chú cá nhân.*")
        md_lines.append("")

    md_lines.append(f"## 2. Các Đoạn Kinh Thánh Đánh Dấu ({len(bookmarks)} câu)")
    md_lines.append("")
    if bookmarks:
        for bm in bookmarks:
            note_str = f" — *{bm['note']}*" if bm['note'] else ""
            md_lines.append(f"- **{bm['reference']}** ({bm['color']}){note_str}")
    else:
        md_lines.append("*Chưa có câu đánh dấu.*")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")

    md_lines.append(f"## 3. Dự Án Nghiên Cứu Thần Học ({len(projects)} chuyên đề)")
    md_lines.append("")
    for p in projects:
        md_lines.append(f"### Chuyên đề: {p['title']}")
        if p['description']:
            md_lines.append(f"> {p['description']}")
            md_lines.append("")
        if p['study_questions']:
            md_lines.append("#### Câu hỏi trọng tâm:")
            for q in p['study_questions']:
                md_lines.append(f"- {q}")
            md_lines.append("")
        if p['pinned_verses']:
            md_lines.append("#### Kinh văn nền tảng:")
            for pv in p['pinned_verses']:
                md_lines.append(f"- **{pv.get('reference', '')}**: {pv.get('text', '')}")
            md_lines.append("")
        if p['ai_outline']:
            md_lines.append("#### Đề cương nghiên cứu:")
            for sec in p['ai_outline']:
                md_lines.append(f"- **{sec.get('section', '')}**: {sec.get('content', '')}")
            md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

    return {
        "summary": {
            "total_notes": len(notes),
            "total_bookmarks": len(bookmarks),
            "total_projects": len(projects)
        },
        "notes": notes,
        "bookmarks": bookmarks,
        "projects": projects,
        "markdown_bundle": "\n".join(md_lines)
    }

