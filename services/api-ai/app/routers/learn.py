from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import httpx
import json
import logging
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/learn", tags=["learn"])


# ==============================================================================
# Schemas
# ==============================================================================

class QuizQuestionItem(BaseModel):
    id: str
    question_type: str
    question_text: str
    options: List[str]
    correct_option: int
    explanation: Optional[str]
    scripture_reference: Optional[str]
    difficulty: int


class GenerateQuizRequest(BaseModel):
    scripture_ref: str = Field(..., description="Bible passage, e.g. Giăng 3:1-16 or Sáng-thế Ký 1")
    count: int = Field(3, ge=1, le=5)
    question_type: str = Field("multiple_choice", description="multiple_choice, who_am_i, or true_false")


class FlashcardItem(BaseModel):
    id: str
    card_type: str
    front_text: str
    back_text: str
    difficulty_level: int
    repetition_count: int
    interval_days: int
    next_review_at: str


class FlashcardReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=4, description="1: Again, 2: Hard, 3: Good, 4: Easy")


class GenerateFlashcardsRequest(BaseModel):
    topic: str = Field(..., description="Bible character, passage or doctrine, e.g. 'Sứ đồ Phi-e-rơ' or 'Ân Điển'")
    card_type: str = Field("person", description="person, verse, event, or word")
    count: int = Field(3, ge=1, le=5)


# ==============================================================================
# Quiz Endpoints
# ==============================================================================

@router.get("/quiz", response_model=List[QuizQuestionItem])
def get_quiz_questions(
    question_type: Optional[str] = Query(None, description="multiple_choice, who_am_i, true_false, verse_challenge"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query_str = "SELECT id, question_type, question_text, options, correct_option, explanation, scripture_reference, difficulty FROM quiz_questions"
    params: dict = {"limit": limit}

    if question_type:
        query_str += " WHERE question_type = :q_type"
        params["q_type"] = question_type

    query_str += " ORDER BY RANDOM() LIMIT :limit"

    rows = db.execute(text(query_str), params).fetchall()
    results = []
    for r in rows:
        opts = r.options
        if isinstance(opts, str):
            try:
                opts = json.loads(opts)
            except Exception:
                opts = [opts]
        results.append(QuizQuestionItem(
            id=str(r.id),
            question_type=r.question_type,
            question_text=r.question_text,
            options=opts,
            correct_option=r.correct_option,
            explanation=r.explanation,
            scripture_reference=r.scripture_reference,
            difficulty=r.difficulty
        ))
    return results


@router.post("/quiz/generate", response_model=List[QuizQuestionItem])
async def generate_quiz_from_scripture(
    req: GenerateQuizRequest,
    db: Session = Depends(get_db)
):
    """
    Generate new grounded quiz questions from a Scripture passage using local Qwen.
    Saves generated questions into database.
    """
    # 1. Fetch relevant scripture verses
    verses_rows = db.execute(
        text("""
        SELECT b.name_vi, v.chapter, v.verse, v.text
        FROM bible_verses v
        JOIN bible_books b ON b.id = v.book_id
        WHERE v.search_vector @@ plainto_tsquery('simple', :ref_query)
        LIMIT 10
        """),
        {"ref_query": req.scripture_ref}
    ).fetchall()

    passage_context = ""
    if verses_rows:
        passage_context = "\n".join([f"{r.name_vi} {r.chapter}:{r.verse} - {r.text}" for r in verses_rows])
    else:
        # Fallback to general query
        passage_context = f"Kinh thánh phân đoạn: {req.scripture_ref}"

    prompt = f"""Bạn là một chuyên gia khảo thí Kinh Thánh Tin Lành chính thống.
Dựa trên phân đoạn Kinh Thánh sau:
---
{passage_context}
---

Hãy tạo {req.count} câu hỏi trắc nghiệm Kinh Thánh dạng {req.question_type} bằng tiếng Việt.
YÊU CẦU BẮT BUỘC:
1. Câu hỏi phải chính xác tuyệt đối theo văn bản Kinh Thánh.
2. Không bịa đặt tình tiết hoặc giáo lý sai lệch.
3. Trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown, không có lời mở đầu hay kết thúc), theo đúng định dạng sau:
[
  {{
    "question_text": "Nội dung câu hỏi rõ ràng?",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correct_option": 0,
    "explanation": "Giải thích ngắn gọn lý do đúng và bài học thuộc linh.",
    "scripture_reference": "{req.scripture_ref}",
    "difficulty": 1
  }}
]
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

            # Clean JSON formatting
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            questions_data = json.loads(raw_text)

            created_items = []
            for q in questions_data:
                q_opts = q.get("options", [])
                correct_idx = q.get("correct_option", 0)
                if correct_idx >= len(q_opts):
                    correct_idx = 0

                insert_res = db.execute(
                    text("""
                    INSERT INTO quiz_questions (
                        question_type, question_text, options, correct_option, explanation, scripture_reference, difficulty
                    ) VALUES (
                        :q_type, :q_text, :options, :correct_opt, :explanation, :ref, :diff
                    ) RETURNING id
                    """),
                    {
                        "q_type": req.question_type,
                        "q_text": q.get("question_text", ""),
                        "options": json.dumps(q_opts, ensure_ascii=False),
                        "correct_opt": correct_idx,
                        "explanation": q.get("explanation", ""),
                        "ref": q.get("scripture_reference", req.scripture_ref),
                        "diff": q.get("difficulty", 1)
                    }
                ).fetchone()
                db.commit()

                created_items.append(QuizQuestionItem(
                    id=str(insert_res.id),
                    question_type=req.question_type,
                    question_text=q.get("question_text", ""),
                    options=q_opts,
                    correct_option=correct_idx,
                    explanation=q.get("explanation", ""),
                    scripture_reference=q.get("scripture_reference", req.scripture_ref),
                    difficulty=q.get("difficulty", 1)
                ))

            return created_items

    except Exception as e:
        logger.error(f"Error generating quiz questions: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Không thể tạo câu hỏi từ AI: {str(e)}")


# ==============================================================================
# Flashcard Endpoints (Spaced Repetition SM-2)
# ==============================================================================

@router.get("/flashcards", response_model=List[FlashcardItem])
def get_flashcards(
    card_type: Optional[str] = Query(None, description="person, verse, event, word"),
    due_only: bool = Query(False, description="Only fetch cards due for review"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query_str = """
    SELECT id, card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at
    FROM flashcards
    """
    conditions = []
    params: dict = {"limit": limit}

    if card_type:
        conditions.append("card_type = :card_type")
        params["card_type"] = card_type

    if due_only:
        conditions.append("next_review_at <= CURRENT_TIMESTAMP")

    if conditions:
        query_str += " WHERE " + " AND ".join(conditions)

    query_str += " ORDER BY next_review_at ASC LIMIT :limit"

    rows = db.execute(text(query_str), params).fetchall()
    results = []
    for r in rows:
        results.append(FlashcardItem(
            id=str(r.id),
            card_type=r.card_type,
            front_text=r.front_text,
            back_text=r.back_text,
            difficulty_level=r.difficulty_level,
            repetition_count=r.repetition_count,
            interval_days=r.interval_days,
            next_review_at=r.next_review_at.isoformat() if r.next_review_at else ""
        ))
    return results


@router.post("/flashcards/{card_id}/review", response_model=FlashcardItem)
def review_flashcard(
    card_id: str,
    req: FlashcardReviewRequest,
    db: Session = Depends(get_db)
):
    """
    Update flashcard spaced repetition parameters using SM-2 algorithm.
    Rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    """
    card = db.execute(
        text("SELECT id, card_type, front_text, back_text, difficulty_level, repetition_count, interval_days FROM flashcards WHERE id = :id"),
        {"id": card_id}
    ).fetchone()

    if not card:
        raise HTTPException(status_code=404, detail="Không tìm thấy thẻ ghi nhớ.")

    rep_count = card.repetition_count
    interval = card.interval_days
    diff = card.difficulty_level

    # SM-2 calculation
    if req.rating == 1:  # Again
        rep_count = 0
        interval = 1
        diff = min(5, diff + 1)
    elif req.rating == 2:  # Hard
        rep_count += 1
        interval = max(1, int(interval * 1.2))
    elif req.rating == 3:  # Good
        rep_count += 1
        if rep_count == 1:
            interval = 1
        elif rep_count == 2:
            interval = 3
        else:
            interval = int(interval * 2.2)
    elif req.rating == 4:  # Easy
        rep_count += 1
        diff = max(1, diff - 1)
        if rep_count == 1:
            interval = 2
        elif rep_count == 2:
            interval = 5
        else:
            interval = int(interval * 3.0)

    next_review = datetime.utcnow() + timedelta(days=interval)

    db.execute(
        text("""
        UPDATE flashcards
        SET repetition_count = :rep_count,
            interval_days = :interval,
            difficulty_level = :diff,
            next_review_at = :next_review
        WHERE id = :id
        """),
        {
            "id": card_id,
            "rep_count": rep_count,
            "interval": interval,
            "diff": diff,
            "next_review": next_review
        }
    )
    db.commit()

    return FlashcardItem(
        id=str(card.id),
        card_type=card.card_type,
        front_text=card.front_text,
        back_text=card.back_text,
        difficulty_level=diff,
        repetition_count=rep_count,
        interval_days=interval,
        next_review_at=next_review.isoformat()
    )


@router.post("/flashcards/generate", response_model=List[FlashcardItem])
async def generate_flashcards_ai(
    req: GenerateFlashcardsRequest,
    db: Session = Depends(get_db)
):
    """
    Generate new biblical flashcards using local Qwen.
    """
    prompt = f"""Bạn là một học giả Kinh Thánh Tin Lành chuyên biên soạn tài liệu học tập.
Hãy tạo {req.count} thẻ ghi nhớ (Flashcard) loại '{req.card_type}' xoay quanh chủ đề: "{req.topic}".

YÊU CẦU:
1. Mỗi thẻ gồm:
   - "front_text": Câu hỏi, tên nhân vật, hoặc câu gốc để người học tự kiểm tra trí nhớ.
   - "back_text": Câu trả lời chi tiết, bao gồm bối cảnh, câu Kinh Thánh liên quan, ý nghĩa thần học.
   - "difficulty_level": Độ khó từ 1 đến 3.
2. Trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown):
[
  {{
    "front_text": "Mặt trước của thẻ",
    "back_text": "Mặt sau chi tiết với câu Kinh Thánh",
    "difficulty_level": 1
  }}
]
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
                        "temperature": 0.3,
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

            cards_data = json.loads(raw_text)
            created_cards = []

            for c in cards_data:
                front = c.get("front_text", "").strip()
                back = c.get("back_text", "").strip()
                diff = c.get("difficulty_level", 1)

                if not front or not back:
                    continue

                insert_res = db.execute(
                    text("""
                    INSERT INTO flashcards (
                        card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at
                    ) VALUES (
                        :card_type, :front, :back, :diff, 0, 1, CURRENT_TIMESTAMP
                    ) RETURNING id, next_review_at
                    """),
                    {
                        "card_type": req.card_type,
                        "front": front,
                        "back": back,
                        "diff": diff
                    }
                ).fetchone()
                db.commit()

                created_cards.append(FlashcardItem(
                    id=str(insert_res.id),
                    card_type=req.card_type,
                    front_text=front,
                    back_text=back,
                    difficulty_level=diff,
                    repetition_count=0,
                    interval_days=1,
                    next_review_at=insert_res.next_review_at.isoformat()
                ))

            return created_cards

    except Exception as e:
        logger.error(f"Error generating flashcards: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Không thể tạo thẻ ghi nhớ: {str(e)}")
