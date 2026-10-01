from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import httpx
import json
import logging
from datetime import datetime, timedelta
import csv
import io

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


class FlashcardExportResponse(BaseModel):
    format: str
    filename: str
    card_count: int
    content: str
    download_mime: str


class ChallengePackQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option: int
    explanation: str
    scripture_reference: str
    points: int = 20


class ChallengePackItem(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    icon_name: str
    badge_label: str
    description: str
    target_doctrine: str
    estimated_minutes: int
    difficulty_level: str
    total_questions: int
    passing_score: int
    questions: List[ChallengePackQuestion]


class SubmitChallengePackRequest(BaseModel):
    answers: Dict[str, int]


class SubmitChallengePackResponse(BaseModel):
    pack_id: str
    total_questions: int
    correct_count: int
    score_percentage: float
    passed: bool
    badge_earned: Optional[str]
    feedback_message: str
    results_detail: List[Dict[str, Any]]


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


@router.get("/flashcards/export", response_model=FlashcardExportResponse)
def export_flashcards(
    format: str = Query("anki", description="anki, csv, or json"),
    card_type: Optional[str] = Query(None, description="person, verse, event, word, or None for all"),
    db: Session = Depends(get_db)
):
    """
    Export flashcard collection to Anki deck (.txt/.tsv), CSV (.csv), or JSON format (§4, §46, §50).
    """
    query_str = "SELECT id, card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at FROM flashcards"
    params: dict = {}
    if card_type and card_type != "all":
        query_str += " WHERE card_type = :card_type"
        params["card_type"] = card_type
    query_str += " ORDER BY id ASC"

    rows = db.execute(text(query_str), params).fetchall()

    if format.lower() == "anki":
        lines = []
        for r in rows:
            front = (r.front_text or "").replace("\t", " ").replace("\r\n", "<br>").replace("\n", "<br>")
            back = (r.back_text or "").replace("\t", " ").replace("\r\n", "<br>").replace("\n", "<br>")
            tag = f"BibleKnowledge::{r.card_type}"
            lines.append(f"{front}\t{back}\t{tag}")
        content = "\n".join(lines)
        return FlashcardExportResponse(
            format="anki",
            filename="bibleknowledge_cards_anki.txt",
            card_count=len(rows),
            content=content,
            download_mime="text/tab-separated-values"
        )
    elif format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["ID", "Loại_Thẻ", "Mặt_Trước", "Mặt_Sau", "Độ_Khó", "Số_Lần_Ôn", "Khoảng_Cách_Ngày", "Ngày_Ôn_Kế_Tiếp"])
        for r in rows:
            writer.writerow([
                str(r.id),
                r.card_type,
                r.front_text or "",
                r.back_text or "",
                r.difficulty_level,
                r.repetition_count,
                r.interval_days,
                r.next_review_at.isoformat() if r.next_review_at else ""
            ])
        return FlashcardExportResponse(
            format="csv",
            filename="bibleknowledge_cards.csv",
            card_count=len(rows),
            content=output.getvalue(),
            download_mime="text/csv"
        )
    else:  # json
        cards_list = []
        for r in rows:
            cards_list.append({
                "id": str(r.id),
                "card_type": r.card_type,
                "front_text": r.front_text,
                "back_text": r.back_text,
                "difficulty_level": r.difficulty_level,
                "repetition_count": r.repetition_count,
                "interval_days": r.interval_days,
                "next_review_at": r.next_review_at.isoformat() if r.next_review_at else None
            })
        return FlashcardExportResponse(
            format="json",
            filename="bibleknowledge_cards.json",
            card_count=len(rows),
            content=json.dumps(cards_list, ensure_ascii=False, indent=2),
            download_mime="application/json"
        )


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


# ==============================================================================
# User Mastery & Progress System (ROADMAP1 Section 5, 46)
# ==============================================================================

class UserProfileResponse(BaseModel):
    user_identifier: str
    total_score: int
    daily_streak: int
    level_title: str
    total_quizzes_completed: int
    total_flashcards_reviewed: int
    mastery_by_topic: Dict[str, int]


class QuizSubmitRequest(BaseModel):
    correct_count: int
    total_questions: int
    topic: Optional[str] = "Gospels"


def get_level_title(score: int) -> str:
    if score < 200:
        return "Người Tìm Kiếm Chân Lý"
    elif score < 500:
        return "Môn Đồ Bước Đầu"
    elif score < 1000:
        return "Người Học Lời Chúa Chăm Chỉ"
    elif score < 2500:
        return "Học Giả Kinh Thánh"
    else:
        return "Bậc Thầy Nghiên Cứu Lời Chúa"


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(db: Session = Depends(get_db)):
    """Fetch user's gamified learning stats, streak, score, and topic mastery."""
    row = db.execute(
        text("SELECT user_identifier, total_score, daily_streak, total_quizzes_completed, total_flashcards_reviewed, mastery_by_topic FROM user_learning_profiles WHERE user_identifier = 'local_user' LIMIT 1")
    ).fetchone()

    if not row:
        return UserProfileResponse(
            user_identifier="local_user",
            total_score=0,
            daily_streak=1,
            level_title="Người Tìm Kiếm Chân Lý",
            total_quizzes_completed=0,
            total_flashcards_reviewed=0,
            mastery_by_topic={"Gospels": 50, "Pentateuch": 40, "Pauline": 45}
        )

    mastery = row.mastery_by_topic
    if isinstance(mastery, str):
        try:
            mastery = json.loads(mastery)
        except Exception:
            mastery = {}

    return UserProfileResponse(
        user_identifier=row.user_identifier,
        total_score=row.total_score,
        daily_streak=row.daily_streak,
        level_title=get_level_title(row.total_score),
        total_quizzes_completed=row.total_quizzes_completed,
        total_flashcards_reviewed=row.total_flashcards_reviewed,
        mastery_by_topic=mastery or {}
    )


@router.post("/quiz/submit", response_model=UserProfileResponse)
def submit_quiz_score(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    """Record quiz completion, award points, and increase streak/mastery."""
    earned_points = req.correct_count * 20
    topic = req.topic or "Gospels"

    # Fetch current profile
    row = db.execute(
        text("SELECT id, total_score, daily_streak, total_quizzes_completed, total_flashcards_reviewed, mastery_by_topic FROM user_learning_profiles WHERE user_identifier = 'local_user'")
    ).fetchone()

    if row:
        new_score = row.total_score + earned_points
        new_quizzes = row.total_quizzes_completed + 1
        mastery = row.mastery_by_topic
        if isinstance(mastery, str):
            try:
                mastery = json.loads(mastery)
            except Exception:
                mastery = {}
        if not isinstance(mastery, dict):
            mastery = {}

        # Increment topic mastery percentage slightly
        curr_mastery = mastery.get(topic, 50)
        boost = int((req.correct_count / max(1, req.total_questions)) * 5)
        mastery[topic] = min(100, curr_mastery + boost)

        db.execute(
            text("""
            UPDATE user_learning_profiles
            SET total_score = :score,
                total_quizzes_completed = :quizzes,
                mastery_by_topic = :mastery,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
            """),
            {
                "score": new_score,
                "quizzes": new_quizzes,
                "mastery": json.dumps(mastery),
                "id": row.id
            }
        )
        db.commit()

        return UserProfileResponse(
            user_identifier="local_user",
            total_score=new_score,
            daily_streak=row.daily_streak,
            level_title=get_level_title(new_score),
            total_quizzes_completed=new_quizzes,
            total_flashcards_reviewed=row.total_flashcards_reviewed,
            mastery_by_topic=mastery
        )
    else:
        # Create profile
        db.execute(
            text("""
            INSERT INTO user_learning_profiles (user_identifier, total_score, daily_streak, total_quizzes_completed, total_flashcards_reviewed, mastery_by_topic)
            VALUES ('local_user', :score, 1, 1, 0, :mastery)
            """),
            {"score": earned_points, "mastery": json.dumps({topic: 60})}
        )
        db.commit()
        return get_user_profile(db=db)


# ==============================================================================
# Interactive Game Modes (§3 ROADMAP1.md): Fill in Blank & Timeline Order
# ==============================================================================

class FillInBlankWord(BaseModel):
    text: str
    is_blank: bool
    blank_index: Optional[int] = None


class FillInBlankItem(BaseModel):
    id: str
    reference: str
    full_text: str
    display_segments: List[FillInBlankWord]
    blank_answers: List[str]
    word_bank: List[str]
    topic: str
    difficulty: int


class TimelineEventItem(BaseModel):
    slug: str
    title: str
    correct_order: int
    period: str
    approximate_date: str
    scripture: Optional[str]
    description: str


class TimelineChallenge(BaseModel):
    id: str
    era_title: str
    description: str
    events: List[TimelineEventItem]
    narrative_explanation: str


@router.get("/fill-in-blank", response_model=List[FillInBlankItem])
def get_fill_in_blank_challenges():
    """Retrieve scripture memory verse challenges with missing blanks and scrambled word bank (§3)."""
    raw_challenges = [
        {
            "id": "fib-1",
            "reference": "Giăng 3:16",
            "full_text": "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
            "topic": "Tình Yêu Cứu Rỗi",
            "difficulty": 1,
            "segments": [
                {"text": "Vì Đức Chúa Trời ", "is_blank": False},
                {"text": "yêu thương", "is_blank": True, "blank_index": 0},
                {"text": " thế gian, đến nỗi đã ban ", "is_blank": False},
                {"text": "Con một", "is_blank": True, "blank_index": 1},
                {"text": " của Ngài, hầu cho hễ ai ", "is_blank": False},
                {"text": "tin", "is_blank": True, "blank_index": 2},
                {"text": " Con ấy không bị hư mất mà được ", "is_blank": False},
                {"text": "sự sống đời đời", "is_blank": True, "blank_index": 3},
                {"text": ".", "is_blank": False}
            ],
            "answers": ["yêu thương", "Con một", "tin", "sự sống đời đời"],
            "distractors": ["hận thù", "công đức", "thiên sứ"]
        },
        {
            "id": "fib-2",
            "reference": "Phi-líp 4:13",
            "full_text": "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi.",
            "topic": "Năng Lực Thuộc Linh",
            "difficulty": 1,
            "segments": [
                {"text": "Tôi làm được ", "is_blank": False},
                {"text": "mọi sự", "is_blank": True, "blank_index": 0},
                {"text": " nhờ ", "is_blank": False},
                {"text": "Đấng", "is_blank": True, "blank_index": 1},
                {"text": " ban ", "is_blank": False},
                {"text": "thêm sức", "is_blank": True, "blank_index": 2},
                {"text": " cho tôi.", "is_blank": False}
            ],
            "answers": ["mọi sự", "Đấng", "thêm sức"],
            "distractors": ["tiền bạc", "tự mình", "sự giàu có"]
        },
        {
            "id": "fib-3",
            "reference": "Rô-ma 8:28",
            "full_text": "Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định.",
            "topic": "Sự Tể Trị Của Chúa",
            "difficulty": 2,
            "segments": [
                {"text": "Vả, chúng ta biết rằng mọi sự ", "is_blank": False},
                {"text": "hiệp lại", "is_blank": True, "blank_index": 0},
                {"text": " làm ", "is_blank": False},
                {"text": "ích", "is_blank": True, "blank_index": 1},
                {"text": " cho kẻ ", "is_blank": False},
                {"text": "yêu mến", "is_blank": True, "blank_index": 2},
                {"text": " Đức Chúa Trời, tức là cho kẻ được gọi theo ", "is_blank": False},
                {"text": "ý muốn", "is_blank": True, "blank_index": 3},
                {"text": " Ngài đã định.", "is_blank": False}
            ],
            "answers": ["hiệp lại", "ích", "yêu mến", "ý muốn"],
            "distractors": ["hại", "ngẫu nhiên", "chối từ"]
        },
        {
            "id": "fib-4",
            "reference": "Thi-thiên 23:1",
            "full_text": "Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ chẳng thiếu thốn gì.",
            "topic": "Sự Chu Cấp Bình An",
            "difficulty": 1,
            "segments": [
                {"text": "Đức Giê-hô-va là Đấng ", "is_blank": False},
                {"text": "chăn giữ", "is_blank": True, "blank_index": 0},
                {"text": " tôi; tôi sẽ chẳng ", "is_blank": False},
                {"text": "thiếu thốn", "is_blank": True, "blank_index": 1},
                {"text": " gì.", "is_blank": False}
            ],
            "answers": ["chăn giữ", "thiếu thốn"],
            "distractors": ["bỏ rơi", "dư giả"]
        },
        {
            "id": "fib-5",
            "reference": "Châm-ngôn 3:5-6",
            "full_text": "Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con. Phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.",
            "topic": "Sự Dẫn Dắt Thiêng Liêng",
            "difficulty": 2,
            "segments": [
                {"text": "Hãy ", "is_blank": False},
                {"text": "hết lòng", "is_blank": True, "blank_index": 0},
                {"text": " ", "is_blank": False},
                {"text": "tin cậy", "is_blank": True, "blank_index": 1},
                {"text": " Đức Giê-hô-va, chớ nương cậy nơi sự ", "is_blank": False},
                {"text": "thông sáng", "is_blank": True, "blank_index": 2},
                {"text": " của con. Phàm trong các việc làm của con, khá ", "is_blank": False},
                {"text": "nhận biết", "is_blank": True, "blank_index": 3},
                {"text": " Ngài, thì Ngài sẽ ", "is_blank": False},
                {"text": "chỉ dẫn", "is_blank": True, "blank_index": 4},
                {"text": " các nẻo của con.", "is_blank": False}
            ],
            "answers": ["hết lòng", "tin cậy", "thông sáng", "nhận biết", "chỉ dẫn"],
            "distractors": ["nghi ngờ", "khoe khoang", "sức mình"]
        },
        {
            "id": "fib-6",
            "reference": "Giô-suê 1:9",
            "full_text": "Hãy vững lòng bền chí, chớ run sợ, chớ kinh khủng; vì Giê-hô-va Đức Chúa Trời ngươi vẫn ở cùng ngươi trong mọi nơi ngươi đi.",
            "topic": "Lòng Can Đảm & Đức Tin",
            "difficulty": 2,
            "segments": [
                {"text": "Hãy ", "is_blank": False},
                {"text": "vững lòng bền chí", "is_blank": True, "blank_index": 0},
                {"text": ", chớ ", "is_blank": False},
                {"text": "run sợ", "is_blank": True, "blank_index": 1},
                {"text": ", chớ kinh khủng; vì Giê-hô-va Đức Chúa Trời ngươi vẫn ", "is_blank": False},
                {"text": "ở cùng ngươi", "is_blank": True, "blank_index": 2},
                {"text": " trong mọi nơi ngươi đi.", "is_blank": False}
            ],
            "answers": ["vững lòng bền chí", "run sợ", "ở cùng ngươi"],
            "distractors": ["sợ hãi", "bỏ cuộc", "cô đơn"]
        }
    ]

    import random
    results = []
    for c in raw_challenges:
        all_words = list(c["answers"]) + list(c["distractors"])
        random.shuffle(all_words)
        results.append(FillInBlankItem(
            id=c["id"],
            reference=c["reference"],
            full_text=c["full_text"],
            display_segments=[FillInBlankWord(**seg) for seg in c["segments"]],
            blank_answers=c["answers"],
            word_bank=all_words,
            topic=c["topic"],
            difficulty=c["difficulty"]
        ))
    return results


@router.get("/timeline-challenge", response_model=List[TimelineChallenge])
def get_timeline_challenges(db: Session = Depends(get_db)):
    """Retrieve Biblical chronological timeline sorting challenges (§3)."""
    import random

    challenges_config = [
        {
            "id": "tl-1",
            "era_title": "Toàn Cảnh Lịch Sử Cứu Rỗi (Từ Sáng Thế Đến Hội Thánh)",
            "description": "Sắp xếp theo thứ tự thời gian các biến cố định hình lịch sử đức tin từ lúc ban đầu đến khi Hội Thánh lan rộng.",
            "event_slugs": [
                "su-sang-tao",
                "giao-uoc-ap-ra-ham",
                "xuat-ai-cap-vuot-bien-do",
                "xay-den-tho-sa-lo-mon",
                "su-giang-sinh-chua-gie-xu",
                "bien-co-le-ngu-tuan"
            ],
            "explanation": "Dòng thời gian bắt đầu từ Sáng Tạo Vũ Trụ -> Giao ước Áp-ra-ham (2091 TCN) -> Xuất Ai Cập (1446 TCN) -> Đền thờ Sa-lô-môn (966 TCN) -> Chúa Giê-xu Giáng sinh (5 TCN) -> Đức Thánh Linh giáng lâm (30 SCN)."
        },
        {
            "id": "tl-2",
            "era_title": "Cuộc Đời & Chức Vụ Của Chúa Cứu Thế Giê-xu",
            "description": "Sắp xếp các cột mốc then chốt trong chức vụ trên đất của Đức Chúa Giê-xu Christ.",
            "event_slugs": [
                "su-giang-sinh-chua-gie-xu",
                "phep-la-ca-na",
                "di-bo-tren-mat-bien",
                "su-dong-dinh-thap-tu-gia",
                "su-phuc-sinh-vinh-hien"
            ],
            "explanation": "Chúa Giê-xu giáng sinh tại Bết-lê-hem -> Phép lạ đầu tiên tại tiệc cưới Ca-na (27 SCN) -> Đi bộ trên Biển Ga-li-lê (29 SCN) -> Chịu đóng đinh đền tội (30 SCN) -> Phục sinh khải hoàn sau 3 ngày."
        },
        {
            "id": "tl-3",
            "era_title": "Hội Thánh Đầu Tiên & Chức Vụ Sứ Đồ",
            "description": "Sắp xếp các biến cố từ sự giáng lâm của Đức Thánh Linh đến sự biến cải của Sứ đồ Phao-lô.",
            "event_slugs": [
                "su-phuc-sinh-vinh-hien",
                "bien-co-le-ngu-tuan",
                "su-bien-cai-cua-phao-lo"
            ],
            "explanation": "Sau sự Phục sinh của Chúa Giê-xu, Đức Thánh Linh giáng lâm vào Lễ Ngũ Tuần làm bùng cháy Hội Thánh Giê-ru-sa-lem, sau đó Sau-lơ được biến cải trên đường Đa-mách để trở thành Sứ đồ Phao-lô cho Dân Ngoại."
        }
    ]

    results = []
    for cfg in challenges_config:
        slug_order_map = {slug: idx + 1 for idx, slug in enumerate(cfg["event_slugs"])}
        slugs_tuple = tuple(cfg["event_slugs"])

        rows = db.execute(
            text("""
            SELECT slug, title, period, approximate_date, description, metadata
            FROM events
            WHERE slug IN :slugs
            """),
            {"slugs": slugs_tuple}
        ).fetchall()

        events_list = []
        for r in rows:
            meta = r.metadata if isinstance(r.metadata, dict) else {}
            events_list.append(TimelineEventItem(
                slug=r.slug,
                title=r.title,
                correct_order=slug_order_map.get(r.slug, 99),
                period=r.period or "",
                approximate_date=r.approximate_date or "",
                scripture=meta.get("scripture", "") if meta else "",
                description=r.description or ""
            ))

        # Sort initially by correct_order then scramble order for the challenge
        events_list.sort(key=lambda x: x.correct_order)
        shuffled = list(events_list)
        random.shuffle(shuffled)

        results.append(TimelineChallenge(
            id=cfg["id"],
            era_title=cfg["era_title"],
            description=cfg["description"],
            events=shuffled,
            narrative_explanation=cfg["explanation"]
        ))

    return results


# ==============================================================================
# Who Am I? Interactive Multi-Clue Character Riddles (§3, §5)
# ==============================================================================

class WhoAmIClue(BaseModel):
    order: int
    text: str
    difficulty_label: str
    points: int


class WhoAmIQuestion(BaseModel):
    id: str
    clues: List[WhoAmIClue]
    options: List[str]
    correct_option: int
    correct_name: str
    character_slug: str
    title_or_role: str
    scripture_reference: str
    explanation: str
    era_or_testament: str


@router.get("/who-am-i", response_model=List[WhoAmIQuestion])
def get_who_am_i_challenges():
    """Retrieve multi-stage 'Who Am I?' character guessing challenges (§3)."""
    challenges = [
        WhoAmIQuestion(
            id="wai-1",
            correct_name="Si-môn Phi-e-rơ",
            character_slug="si-mon-phi-e-ro",
            title_or_role="Ngư phủ & Sứ đồ trưởng của Chúa Giê-xu",
            era_or_testament="Tân Ước (Gospels & Early Church)",
            scripture_reference="Ma-thi-ơ 14:28-31; 26:69-75; Công vụ 2:14-41",
            explanation="Phi-e-rơ là người nhiệt thành, từng đi trên mặt biển, vấp ngã chối Chúa nhưng được Chúa phục hồi và trở thành trụ cột lãnh đạo Hội Thánh ban đầu.",
            options=["Anh-rê", "Si-môn Phi-e-rơ", "Gia-cơ", "Giu-đa Ít-ca-ri-ốt"],
            correct_option=1,
            clues=[
                WhoAmIClue(order=1, text="Tôi là một ngư phủ bình dị sinh sống bên bờ Biển Ga-li-lê, được anh trai mình dẫn đến gặp Chúa Cứu Thế.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Tôi từng bước đi trên mặt nước sóng gió, nhưng vì sợ hãi mà bắt đầu chìm xuống cho đến khi được bàn tay Thầy nắm lấy.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Trong đêm bi thương trước khi Chúa chịu đóng đinh, tôi đã chối Ngài 3 lần trước khi gà gáy, sau đó khóc lóc thảm thiết.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi được Chúa phục hồi bên đống lửa than với câu hỏi 'Ngươi yêu ta chăng?' và trở thành người giảng luận cảm hóa 3,000 người trong ngày Ngũ Tuần.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-2",
            correct_name="Môi-se",
            character_slug="moi-se",
            title_or_role="Người Giải Phóng Tuyển Dân & Ban Luật Pháp",
            era_or_testament="Cựu Ước (Exodus & Wilderness)",
            scripture_reference="Xuất Ê-díp-tô Ký 2:1-10; 3:1-12; 14:21-22; 20:1-17",
            explanation="Môi-se là vị tiên tri khiêm nhường nhất trên đất, người được diện đối diện với Đức Chúa Trời và dẫn dắt Y-sơ-ra-ên ra khỏi ách nô lệ Ai Cập.",
            options=["A-rôn", "Giô-suê", "Môi-se", "Ghi-đê-ôn"],
            correct_option=2,
            clues=[
                WhoAmIClue(order=1, text="Lúc sơ sinh, tôi được giấu trong chiếc nôi mây trét chai thả nổi giữa đám sậy dòng sông Nin và được công chúa Ai Cập vớt lên nuôi nấng.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Sau 40 năm chăn chiên nơi đồng vắng Ma-đi-an, tôi kinh ngạc thấy một bụi gai cháy hừng hực nhưng không hề tàn rụi bên chân núi Hô-rếp.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Đức Chúa Trời dùng cây gậy nơi tay tôi giáng 10 tai vạ xuống Pha-ra-ôn và rẽ đôi Biển Đỏ cho tuyển dân bước qua như trên đất khô.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi lên đỉnh núi Si-na-i giữa mây mù sấm sét trong 40 ngày đêm và nhận lãnh Hai Bảng Chứng Mười Điều Răn do chính ngón tay Chúa khắc ghi.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-3",
            correct_name="Sứ đồ Phao-lô",
            character_slug="su-do-phao-lo",
            title_or_role="Sứ đồ cho Dân Ngoại & Nhà Thần Học Tiên Phong",
            era_or_testament="Tân Ước (Apostolic Age)",
            scripture_reference="Công vụ 9:1-19; 22:3; 2 Ti-mô-thê 4:7-8",
            explanation="Từ một người nhiệt thành bắt bớ đạo Chúa, Sau-lơ đã được ánh sáng từ trời biến cải để trở thành nhà truyền giáo vĩ đại nhất của Tân Ước.",
            options=["Sứ đồ Phao-lô", "Ba-na-ba", "Phi-líp", "A-bô-lô"],
            correct_option=0,
            clues=[
                WhoAmIClue(order=1, text="Tôi sinh ra tại Tạt-sơ, là công dân La-mã và được thụ giáo dưới chân đại giáo sư danh tiếng Ga-ma-li-ên.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Thuở thanh niên, tôi nhiệt thành lùng bắt các tín hữu theo Đạo và tán thành việc ném đá xử tử thầy phó tế Ê-tiên trung tín.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Một luồng ánh sáng chói lòa hơn mặt trời giáng xuống khiến tôi mù mắt trên đường đến Đa-mách, cùng tiếng phán: 'Sau-lơ, Sau-lơ, sao ngươi bắt bớ Ta?'", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Sau khi được Chúa biến cải, tôi đi 3 chuyến truyền giáo khắp Đế quốc La-mã, lập nên vô số Hội Thánh và viết nên 13 bức thư tín bất hủ.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-4",
            correct_name="Vua Đa-vít",
            character_slug="vua-da-vit",
            title_or_role="Vua vĩ đại của Y-sơ-ra-ên & Người đẹp lòng Chúa",
            era_or_testament="Cựu Ước (United Monarchy)",
            scripture_reference="1 Sa-mu-ên 16:11-13; 17:40-50; Thi-thiên 23",
            explanation="Đa-vít khởi đầu là kẻ chăn chiên nghèo, đánh bại tướng Gô-li-át bằng đức tin, thống nhất vương quốc và lập nên dòng dõi của Đấng Mê-si-a.",
            options=["Vua Sau-lơ", "Vua Sa-lô-môn", "Vua Đa-vít", "Giô-na-than"],
            correct_option=2,
            clues=[
                WhoAmIClue(order=1, text="Tôi là con út trong gia đình tại Bết-lê-hem, từng làm kẻ chăn chiên đàn hát thi ca ca ngợi Đấng Tạo Hóa nơi đồng nội.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Chỉ với một cái trành ném đá và năm hòn sỏi bóng láng, tôi đã hạ gục tên tướng khổng lồ Gô-li-át đang buông lời sỉ nhục quân đội Đức Chúa Trời.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Dù bị vua Sau-lơ truy sát ghen ghét suốt nhiều năm trong hang đá, tôi hai lần từ chối tra tay làm hại người được xức dầu của Chúa.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi được Đức Chúa Trời gọi là 'người đẹp lòng Ta', thống nhất toàn cõi Y-sơ-ra-ên, định đô Giê-ru-sa-lem và sáng tác phần lớn các bài Thi Thiên.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-5",
            correct_name="Áp-ra-ham",
            character_slug="ap-ra-ham",
            title_or_role="Tổ phụ của đức tin & Bạn của Đức Chúa Trời",
            era_or_testament="Cựu Ước (Patriarchal Era)",
            scripture_reference="Sáng-thế Ký 12:1-4; 17:1-8; 22:1-14; Rô-ma 4:11",
            explanation="Áp-ra-ham vì đức tin đã vâng lời Chúa rời quê hương, nhận lãnh giao ước về dòng dõi đông như sao trên trời, cát dưới biển.",
            options=["Lót", "Áp-ra-ham", "Y-sác", "Nô-ê"],
            correct_option=1,
            clues=[
                WhoAmIClue(order=1, text="Tôi rời bỏ quê hương văn minh phồn thịnh U-rơ của người Canh-đê để đi đến một xứ sở mà thuở ban đầu tôi chưa từng biết rõ.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Khi tôi 99 tuổi và vợ tôi son sẻ đã già, Đức Chúa Trời lập giao ước đời đời và đổi tên tôi với lời hứa trở nên 'cha của nhiều dân tộc'.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Trên đỉnh núi Mô-ri-a, tôi đã vâng phục dâng đứa con một duy nhất mà mình yêu dấu, trước khi Chúa chuẩn bị con chiên đực mắc sừng thay thế.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi được Kinh Thánh tôn vinh là 'Tổ Phụ Của Mọi Kẻ Tin' và là người duy nhất được gọi là 'Bạn Của Đức Chúa Trời'.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-6",
            correct_name="Giô-sép",
            character_slug="gio-sep",
            title_or_role="Quan Tể Tướng Ai Cập & Vị cứu tinh của gia tộc",
            era_or_testament="Cựu Ước (Patriarchal Era)",
            scripture_reference="Sáng-thế Ký 37:3-28; 39:1-20; 41:39-44; 50:20",
            explanation="Dù bị các anh bán làm nô lệ và bị giam oan, Giô-sép nhờ sự kính sợ Chúa đã được cất nhắc lên làm Tể tướng cứu sống muôn dân qua nạn đói.",
            options=["Bên-gia-min", "Giu-đa", "Giô-sép", "Đa-ni-ên"],
            correct_option=2,
            clues=[
                WhoAmIClue(order=1, text="Cha tôi may tặng tôi chiếc áo dài nhiều màu rực rỡ, khiến các anh ruột sinh lòng ghen ghét và tìm cách hãm hại.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Tôi bị chính các anh ném xuống hố cạn rồi bán làm nô lệ sang xứ Ai Cập xa xôi với giá hai mươi miếng bạc.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Dù bị vợ quan Phô-ti-pha vu cáo và bị giam cầm oan uổng trong ngục tối, tôi vẫn giữ lòng thanh sạch kính sợ Đức Chúa Trời.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Nhờ giải mộng 7 năm được mùa và đói kém cho Pha-ra-ôn, tôi được phong làm Tể tướng trị nước Ai Cập và tha thứ cứu sống cả gia đình.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-7",
            correct_name="Tiên tri Ê-li",
            character_slug="e-li",
            title_or_role="Tiên tri của Lửa & Người bảo vệ Đức tin chân thật",
            era_or_testament="Cựu Ước (Divided Monarchy)",
            scripture_reference="1 Các Vua 17:1-16; 18:20-40; 2 Các Vua 2:11",
            explanation="Tiên tri Ê-li dũng cảm đối đầu vua A-háp và hoàng hậu Giê-sa-bên, thách thức tiên tri Ba-anh trên núi Cạt-mên và được cất lên trời trên xe lửa.",
            options=["Tiên tri Ê-li-sê", "Tiên tri Ê-li", "Tiên tri Giê-rê-mi", "Tiên tri Ê-sai"],
            correct_option=1,
            clues=[
                WhoAmIClue(order=1, text="Trong những ngày hạn hán khốc liệt 3 năm rưỡi, tôi được Đức Chúa Trời sai chim quạ đem bánh và thịt đến nuôi dưỡng bên khe suối Kê-rít.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Tại nhà người đàn bà góa Sa-rép-ta, nhờ lời cầu nguyện của tôi, hũ bột chẳng hề vơi và bình dầu không bao giờ cạn.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Một mình tôi thách thức 450 tiên tri Ba-anh trên núi Cạt-mên; lửa từ trời đã giáng xuống thiêu rụi của lễ đẫm nước chứng minh Chúa là chân thật.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi không trải qua sự chết nhưng được đưa thẳng lên trời bằng xe lửa và ngựa lửa giữa luồng gió lốc diệu kỳ.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-8",
            correct_name="Đa-ni-ên",
            character_slug="da-ni-en",
            title_or_role="Quan Triều Đình & Nhà Tiên Tri Thời Lưu Đày",
            era_or_testament="Cựu Ước (Babylonian Exile)",
            scripture_reference="Đa-ni-ên 1:8; 2:1-45; 5:25-28; 6:10-23",
            explanation="Đa-ni-ên giữ trọn sự thánh khiết nơi đất khách quê người, được ban sự khôn ngoan giải mộng và được Chúa gìn giữ trong hang sư tử đói.",
            options=["Nê-hê-mi", "Ê-xơ-ra", "Đa-ni-ên", "Mạc-đô-chê"],
            correct_option=2,
            clues=[
                WhoAmIClue(order=1, text="Thuở niên thiếu, tôi bị bắt lưu đày sang Ba-by-lôn nhưng quyết chí trong lòng không để mình bị ô uế bởi đồ ăn và rượu của vua ban.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Đức Chúa Trời ban cho tôi sự khôn ngoan gấp 10 lần các thuật sĩ và giải thích được giấc chiêm bao về pho tượng khổng lồ bằng kim loại cho vua Nê-bu-cát-nết-sa.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Chính tôi đã đọc và giải nghĩa những dòng chữ bí ẩn 'MÊ-NÊ, MÊ-NÊ, TÊ-KHEU, U-PHÁC-SIN' xuất hiện trên vách tường hoàng cung vua Bên-xát-sa.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Vì trung tín cầu nguyện 3 lần mỗi ngày hướng về Giê-ru-sa-lem, tôi bị ném vào hang sư tử đói, nhưng thiên sứ của Chúa đã bịt miệng sư tử gìn giữ tôi.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-9",
            correct_name="Ma-ri (Mẹ Chúa Giê-xu)",
            character_slug="ma-ri",
            title_or_role="Người Nữ Được Ơn & Mẹ của Đấng Cứu Thế",
            era_or_testament="Tân Ước (Gospels)",
            scripture_reference="Lu-ca 1:26-56; 2:7; Giăng 19:25",
            explanation="Ma-ri khiêm nhường vâng phục ý chỉ Thiên Chúa, trở thành người mẹ sinh hạ Đấng Cứu Thế và đồng hành suốt cuộc đời Ngài đến tận chân thập tự giá.",
            options=["Ê-li-sa-bét", "Ma-thê", "Ma-ri Ma-đơ-len", "Ma-ri (Mẹ Chúa Giê-xu)"],
            correct_option=3,
            clues=[
                WhoAmIClue(order=1, text="Tôi là một thiếu nữ khiêm nhường sống tại thành Na-xa-rét nghèo nàn xứ Ga-li-lê, đã đính hôn cùng chàng thợ mộc Giô-sép.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Thiên sứ Gáp-ri-ên hiện ra chào tôi: 'Hỡi người được ơn, Chúa ở cùng ngươi!' và báo tin tôi sẽ mang thai bởi quyền phép Đức Thánh Linh.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Tôi đáp lại với đức tin trọn vẹn: 'Tôi là tôi tớ Chúa; xin sự ấy xảy ra cho tôi theo lời người!' và hát bài ca Ngợi Khen (Magnificat) bất hủ.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi đã sinh Đấng Cứu Thế nơi máng cỏ chuồng chiên Bết-lê-hem và đứng nghẹn ngào dưới chân thập tự giá chứng kiến Con mình chịu chết.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        ),
        WhoAmIQuestion(
            id="wai-10",
            correct_name="Tiên tri Giô-na",
            character_slug="gio-na",
            title_or_role="Tiên tri trốn chạy & Bài học về lòng thương xót",
            era_or_testament="Cựu Ước (Divided Monarchy)",
            scripture_reference="Giô-na 1:1-17; 2:1-10; 3:1-5",
            explanation="Giô-na tìm cách trốn chạy khỏi tiếng gọi Chúa, trải qua 3 ngày 3 đêm trong bụng cá lớn trước khi vâng phục đến Ni-ni-ve rao giảng sự ăn năn.",
            options=["Tiên tri Giô-na", "Tiên tri Na-hum", "Tiên tri Ha-ba-cúc", "Tiên tri Ô-sê"],
            correct_option=0,
            clues=[
                WhoAmIClue(order=1, text="Tôi là tiên tri được Chúa truyền lệnh đi đến cảnh cáo thành phố lớn Ni-ni-ve gian ác, nhưng tôi lại tìm cách trốn tránh tiếng gọi Ngài.", difficulty_label="Khởi Đầu (100đ)", points=100),
                WhoAmIClue(order=2, text="Tôi xuống cảng Giốp-pê mua vé lên một chiếc thuyền chạy sang Ta-rê-sơ để trốn khỏi mặt Đức Giê-hô-va.", difficulty_label="Bối Cảnh (70đ)", points=70),
                WhoAmIClue(order=3, text="Một trận bão biển dữ dội ập đến; các thủy thủ rút thăm trúng tôi và theo lời tôi, họ ném tôi xuống biển thì sóng gió lập tức yên lặng.", difficulty_label="Quyết Định (40đ)", points=40),
                WhoAmIClue(order=4, text="Tôi ở trong bụng một con cá lớn suốt ba ngày ba đêm cầu nguyện ăn năn trước khi được mửa ra trên đất khô và tiếp tục sứ mạng.", difficulty_label="Rõ Nét (20đ)", points=20)
            ]
        )
    ]
    return challenges


# ==============================================================================
# Match Challenge (Nối Cặp / Ghép Đôi Thực Thể Kinh Thánh — §3)
# ==============================================================================

class MatchPairItem(BaseModel):
    id: str
    left_text: str
    left_subtext: Optional[str] = None
    right_text: str
    right_subtext: Optional[str] = None
    scripture: str
    explanation: str


class MatchChallengeItem(BaseModel):
    id: str
    title: str
    topic: str
    difficulty: int
    description: str
    pairs: List[MatchPairItem]


@router.get("/match-challenges", response_model=List[MatchChallengeItem])
def get_match_challenges():
    """Retrieve Match Challenges pairing biblical characters, events, miracles, and original language terms (§3)."""
    challenges = [
        MatchChallengeItem(
            id="match-1",
            title="Nhân Vật Cựu Ước & Biến Cố Trọng Đại",
            topic="Cựu Ước Lịch Sử",
            difficulty=1,
            description="Ghép đôi 5 vĩ nhân đức tin thời Cựu Ước với biến cố lịch sử gắn liền với cuộc đời họ.",
            pairs=[
                MatchPairItem(
                    id="m1-1",
                    left_text="A-bơ-ra-ham",
                    left_subtext="Tổ Phụ Đức Tin",
                    right_text="Rời quê hương U-rơ & Dâng Y-sác trên núi Mô-ri-a",
                    right_subtext="Sáng-thế Ký 12; 22",
                    scripture="Sáng-thế Ký 22:1-18",
                    explanation="A-bơ-ra-ham vâng lời Chúa rời quê hương đi đến xứ hứa và sẵn sàng dâng con một Y-sác, minh chứng cho đức tin trọn vẹn nơi Đức Chúa Trời."
                ),
                MatchPairItem(
                    id="m1-2",
                    left_text="Môi-se",
                    left_subtext="Người Giải Phóng Xuất Hành",
                    right_text="Rẽ Biển Đỏ & Nhận 10 Điều Răn tại núi Si-na-i",
                    right_subtext="Xuất Ê-díp-tô Ký 14; 20",
                    scripture="Xuất Ê-díp-tô Ký 14:21-22",
                    explanation="Đức Chúa Trời dùng cây gậy của Môi-se để rẽ đôi Biển Đỏ giải cứu tuyển dân và truyền ban Luật pháp trên đỉnh núi Si-na-i."
                ),
                MatchPairItem(
                    id="m1-3",
                    left_text="Đa-vít",
                    left_subtext="Vị Vua Hợp Lòng Chúa",
                    right_text="Hạ gục người khổng lồ Gô-li-át bằng trũng đá & hòn sỏi",
                    right_subtext="I Sa-mu-ên 17",
                    scripture="I Sa-mu-ên 17:45-50",
                    explanation="Chàng trai chăn chiên Đa-vít nhờ cậy danh Đức Giê-hô-va vạn quân đã dùng ná bắn một hòn sỏi duy nhất hạ gục dũng sĩ Phi-li-tin Gô-li-át."
                ),
                MatchPairItem(
                    id="m1-4",
                    left_text="Tiên tri Ê-li",
                    left_subtext="Tiên Tri Lửa",
                    right_text="Lửa giáng trên núi Cạt-mên & Được cất lên trời bằng xe lửa",
                    right_subtext="I Các Vua 18; II Các Vua 2",
                    scripture="I Các Vua 18:36-39",
                    explanation="Ê-li thách thức 450 tiên tri Ba-anh trên núi Cạt-mên; Chúa nhậm lời bằng cách giáng lửa thiêu đốt của lễ, khẳng định Giê-hô-va là Đức Chúa Trời."
                ),
                MatchPairItem(
                    id="m1-5",
                    left_text="Đa-ni-ên",
                    left_subtext="Bậc Khôn Ngoan Tại Ba-by-lôn",
                    right_text="Giữ lòng trung tín cầu nguyện trong hang sư tử đói",
                    right_subtext="Đa-ni-ên 6",
                    scripture="Đa-ni-ên 6:16-23",
                    explanation="Đa-ni-ên không chịu ngừng cầu nguyện cùng Đức Chúa Trời nên bị quăng vào hang sư tử, nhưng Chúa sai thiên sứ bịt miệng sư tử gìn giữ ông an toàn."
                )
            ]
        ),
        MatchChallengeItem(
            id="match-2",
            title="Các Sứ Đồ Của Chúa Giê-xu & Dấu Ấn Mục Vụ",
            topic="Tân Ước Phúc Âm",
            difficulty=2,
            description="Nối đúng 5 vị sứ đồ với những sự kiện quyết định trong hành trình theo Thầy.",
            pairs=[
                MatchPairItem(
                    id="m2-1",
                    left_text="Phi-e-rơ (Si-môn)",
                    left_subtext="Trưởng Nhóm Môn Đồ",
                    right_text="Đi bộ trên mặt nước, chối Chúa 3 lần và giảng ngày Ngũ Tuần",
                    right_subtext="Ma-thi-ơ 14; 26; Công vụ 2",
                    scripture="Công vụ các Sứ đồ 2:14-41",
                    explanation="Phi-e-rơ đầy nhiệt huyết từng vấp ngã chối Chúa nhưng được phục hồi và trở thành trụ cột rao giảng làm 3.000 người tin Chúa trong ngày Ngũ Tuần."
                ),
                MatchPairItem(
                    id="m2-2",
                    left_text="Sứ đồ Giăng",
                    left_subtext="Môn Đồ Được Chúa Yêu",
                    right_text="Đứng bên chân thập tự giá & Viết sách Khải Huyền tại đảo Bát-mô",
                    right_subtext="Giăng 19:26; Khải Huyền 1",
                    scripture="Khải Huyền 1:9-19",
                    explanation="Giăng là sứ đồ trẻ tuổi tựa lòng Chúa trong Lễ Vượt Qua, được Chúa phó thác săn sóc thân mẫu Ma-ri và nhận mặc khải khải huyền tại đảo Bát-mô."
                ),
                MatchPairItem(
                    id="m2-3",
                    left_text="Anh-rê",
                    left_subtext="Người Dắt Đưa Linh Hồn",
                    right_text="Dắt anh trai Phi-e-rơ & Cậu bé có 5 bánh 2 cá đến với Chúa",
                    right_subtext="Giăng 1:40-42; 6:8-9",
                    scripture="Giăng 1:41-42",
                    explanation="Anh-rê có tinh thần mục vụ khiêm nhường, luôn chú ý quan sát và dẫn dắt người khác đến gặp Đấng Mê-si."
                ),
                MatchPairItem(
                    id="m2-4",
                    left_text="Thô-ma",
                    left_subtext="Từ Nghi Ngờ Đến Xác Tín",
                    right_text="Chạm vào vết đinh rồi tuyên xưng 'Lạy Chúa tôi và Đức Chúa Trời tôi!'",
                    right_subtext="Giăng 20:24-29",
                    scripture="Giăng 20:28",
                    explanation="Thô-ma sau khi thấy tận mắt Đấng Phục Sinh đã cất lên lời xưng nhận thần học vĩ đại nhất về thần tính tuyệt đối của Chúa Giê-xu."
                ),
                MatchPairItem(
                    id="m2-5",
                    left_text="Phao-lô (Sau-lơ)",
                    left_subtext="Sứ Đồ Của Dân Ngoại",
                    right_text="Thấy ánh sáng chói lòa trên đường Đa-mách & Viết 13 thư tín",
                    right_subtext="Công vụ 9; Rô-ma",
                    scripture="Công vụ các Sứ đồ 9:3-6",
                    explanation="Từ một người Pha-ri-si bắt bớ Hội Thánh, Sau-lơ được biến cải trở thành Sứ đồ truyền giáo vĩ đại vượt Địa Trung Hải đem Phúc Âm đến khắp thế giới La Mã."
                )
            ]
        ),
        MatchChallengeItem(
            id="match-3",
            title="Phép Lạ Của Chúa Giê-xu & Địa Danh Lịch Sử",
            topic="Địa Lý Phúc Âm",
            difficulty=2,
            description="Ghép nối mỗi phép lạ vĩ đại của Chúa Giê-xu với địa danh xảy ra sự kiện đó.",
            pairs=[
                MatchPairItem(
                    id="m3-1",
                    left_text="Hóa nước thành rượu ngon tại tiệc cưới",
                    left_subtext="Dấu lạ đầu tiên bày tỏ vinh hiển",
                    right_text="Ca-na xứ Ga-li-lê",
                    right_subtext="Vùng đồi phía bắc Na-xa-rét",
                    scripture="Giăng 2:1-11",
                    explanation="Tại tiệc cưới làng Ca-na, Chúa Giê-xu làm phép lạ đầu tiên biến 6 ché nước lã thành rượu hảo hạng, khiến các môn đồ tin nhận Ngài."
                ),
                MatchPairItem(
                    id="m3-2",
                    left_text="Kêu La-xa-rơ sống lại sau 4 ngày trong mộ",
                    left_subtext="Chiến thắng sự chết thuộc thể",
                    right_text="Làng Bê-tha-ni",
                    right_subtext="Cách Giê-ru-sa-lem chừng 3 km",
                    scripture="Giăng 11:1-44",
                    explanation="Tại Bê-tha-ni, trước sự chứng kiến của nhiều người Do Thái, Chúa Giê-xu phán: 'La-xa-rơ, hãy ra!' và người chết liền bước ra khỏi mộ."
                ),
                MatchPairItem(
                    id="m3-3",
                    left_text="Chữa lành người bại liệt 38 năm",
                    left_subtext="Tại hồ nước có năm vòm cửa",
                    right_text="Hồ Bê-tết-đa (Giê-ru-sa-lem)",
                    right_subtext="Gần Cửa Chiên",
                    scripture="Giăng 5:1-9",
                    explanation="Bên hồ Bê-tết-đa (Nhà Của Lòng Thương Xót), Chúa truyền cho người bại: 'Hãy đứng dậy, vác giường ngươi và đi!', chữa lành hoàn toàn một căn bệnh 38 năm."
                ),
                MatchPairItem(
                    id="m3-4",
                    left_text="Dẹp yên cơn bão tố cuồng phong dữ dội",
                    left_subtext="Ngay cả gió và biển cũng vâng lệnh",
                    right_text="Biển Ga-li-lê (Hồ Ti-bê-ri-át)",
                    right_subtext="Vùng trũng 200m dưới mực nước biển",
                    scripture="Ma-thi-ơ 8:23-27",
                    explanation="Chúa Giê-xu quở gió và biển rằng: 'Hãy êm đi, lặng đi!', lập tức gió lặng như tờ, minh chứng Ngài là Đấng Tạo Hóa tể trị thiên nhiên."
                ),
                MatchPairItem(
                    id="m3-5",
                    left_text="Chúa Giê-xu giáng sinh trong máng cỏ chuồng chiên",
                    left_subtext="Ứng nghiệm lời tiên tri Mi-chê",
                    right_text="Bết-lê-hem xứ Giu-đê",
                    right_subtext="Quê hương của Vua Đa-vít",
                    scripture="Mi-chê 5:2; Lu-ca 2:1-7",
                    explanation="Chúa Cứu Thế giáng sinh tại Bết-lê-hem ('Nhà Bánh') nghèo hèn, ứng nghiệm chính xác lời tiên tri Mi-chê đã chép hơn 700 năm trước."
                )
            ]
        ),
        MatchChallengeItem(
            id="match-4",
            title="Từ Ngữ Căn Nguyên Văn & Ý Nghĩa Thần Học",
            topic="Nguyên Ngữ Strong",
            difficulty=3,
            description="Ghép nối từ ngữ căn Hy Lạp / Hê-bơ-rơ với định nghĩa cứu rỗi chính yếu.",
            pairs=[
                MatchPairItem(
                    id="m4-1",
                    left_text="Agape (ἀγάπη - G0026)",
                    left_subtext="Tiếng Hy Lạp Tân Ước",
                    right_text="Tình yêu hy sinh, tự nguyện vô điều kiện của Đức Chúa Trời",
                    right_subtext="I Cô-rinh-tô 13; Giăng 3:16",
                    scripture="I Giăng 4:8-10",
                    explanation="Agape là tình yêu thần thượng xuất phát từ bản tính của Chúa, yêu thương và hy sinh chính Con Một vì kẻ có tội ngay khi họ còn là kẻ thù."
                ),
                MatchPairItem(
                    id="m4-2",
                    left_text="Charis (χάρις - G5485)",
                    left_subtext="Tiếng Hy Lạp Tân Ước",
                    right_text="Ân điển, ơn lành nhưng không mà con người không xứng đáng",
                    right_subtext="Ê-phê-sô 2:8-9",
                    scripture="Ê-phê-sô 2:8",
                    explanation="Charis là ơn phước nhưng không, hoàn toàn bởi lòng rộng rãi của Thiên Chúa ban tặng cho con người mà không do công đức của bất kỳ ai."
                ),
                MatchPairItem(
                    id="m4-3",
                    left_text="Logos (λόγος - G3056)",
                    left_subtext="Tiếng Hy Lạp Tân Ước",
                    right_text="Ngôi Lời hằng sống, Đấng hiện hữu từ ban đầu hóa thành xác thịt",
                    right_subtext="Giăng 1:1, 14",
                    scripture="Giăng 1:1",
                    explanation="Logos không chỉ là lời nói, mà là chính Ngôi Lời Thần Thượng - Chúa Cứu Thế Giê-xu, Đấng mặc khải trọn vẹn Đức Chúa Trời cho nhân loại."
                ),
                MatchPairItem(
                    id="m4-4",
                    left_text="Shalom (שָׁלוֹם - H7965)",
                    left_subtext="Tiếng Hê-bơ-rơ Cựu Ước",
                    right_text="Sự bình an trọn vẹn, trật tự, hòa thuận và an khang toàn diện",
                    right_subtext="Dân-số Ký 6:26; Ê-sai 9:6",
                    scripture="Ê-sai 26:3",
                    explanation="Shalom vượt trên sự vắng bóng chiến tranh; đó là sự an khang thịnh vượng, lành lặn và hài hòa trọn vẹn trong mối liên hệ với Thiên Chúa."
                ),
                MatchPairItem(
                    id="m4-5",
                    left_text="Hesed (חֶסֶד - H2617)",
                    left_subtext="Tiếng Hê-bơ-rơ Cựu Ước",
                    right_text="Tình yêu giao ước kiên định, lòng thương xót và thành tín đời đời",
                    right_subtext="Thi-thiên 136; Xuất 34:6",
                    scripture="Thi-thiên 136:1",
                    explanation="Hesed là tình yêu trung kiên trong giao ước của Đức Giê-hô-va đối với dân Ngài, không bao giờ thay đổi dẫu con người có bội ước."
                )
            ]
        )
    ]
    return challenges


# ==============================================================================
# Adaptive Learning System & Spaced Repetition Mastery (§5)
# ==============================================================================

class TopicMasteryItem(BaseModel):
    topic_key: str
    topic_name: str
    icon: str
    mastery_percentage: int
    status: str  # Vững vàng | Khá | Cần củng cố | Khởi đầu
    recommended_focus: str


class DueFlashcardItem(BaseModel):
    id: str
    card_type: str
    front_text: str
    back_text: str
    difficulty_level: int
    interval_days: int
    is_due: bool


class AdaptiveAnalyticsResponse(BaseModel):
    user_identifier: str
    total_score: int
    daily_streak: int
    level_title: str
    retention_rate_pct: int
    memory_stability_days: float
    total_due_flashcards: int
    total_cards_mastered: int
    total_quizzes_completed: int
    total_flashcards_reviewed: int
    topic_masteries: List[TopicMasteryItem]
    weakness_summary: str
    adaptive_recommendations: List[str]
    due_cards: List[DueFlashcardItem]


@router.get("/adaptive-analytics", response_model=AdaptiveAnalyticsResponse)
def get_adaptive_analytics(db: Session = Depends(get_db)):
    """
    Adaptive Learning System (§5):
    Evaluates SM-2 spaced repetition memory retention, detects topic weaknesses,
    and returns personalized review recommendations and due flashcards.
    """
    # 1. Fetch user learning profile
    row = db.execute(
        text("SELECT total_score, daily_streak, total_quizzes_completed, total_flashcards_reviewed, mastery_by_topic FROM user_learning_profiles WHERE user_identifier = 'local_user' LIMIT 1")
    ).fetchone()

    total_score = row.total_score if row else 350
    daily_streak = row.daily_streak if row else 4
    total_quizzes = row.total_quizzes_completed if row else 6
    total_reviewed = row.total_flashcards_reviewed if row else 14
    level_title = get_level_title(total_score)

    user_mastery = {}
    if row and row.mastery_by_topic:
        m = row.mastery_by_topic
        if isinstance(m, str):
            try:
                user_mastery = json.loads(m)
            except Exception:
                user_mastery = {}
        elif isinstance(m, dict):
            user_mastery = m

    # 2. Fetch Flashcards data & Due cards
    now = datetime.utcnow()
    cards_rows = db.execute(
        text("SELECT id, card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at FROM flashcards ORDER BY id ASC")
    ).fetchall()

    due_cards_list = []
    mastered_count = 0
    total_intervals = 0

    for c in cards_rows:
        nxt = c.next_review_at
        is_due = True
        if nxt:
            if isinstance(nxt, str):
                try:
                    nxt_dt = datetime.fromisoformat(nxt.replace("Z", "+00:00")).replace(tzinfo=None)
                    is_due = nxt_dt <= now
                except Exception:
                    is_due = True
            elif isinstance(nxt, datetime):
                nxt_naive = nxt.replace(tzinfo=None) if nxt.tzinfo is not None else nxt
                is_due = nxt_naive <= now

        if is_due:
            due_cards_list.append(DueFlashcardItem(
                id=str(c.id),
                card_type=c.card_type,
                front_text=c.front_text,
                back_text=c.back_text,
                difficulty_level=c.difficulty_level,
                interval_days=c.interval_days,
                is_due=True
            ))

        if c.interval_days >= 4 or c.repetition_count >= 2:
            mastered_count += 1
        total_intervals += c.interval_days

    total_cards = len(cards_rows) if cards_rows else 1
    avg_stability = round(total_intervals / max(1, total_cards), 1)
    retention_pct = min(96, max(65, int((mastered_count / total_cards) * 40 + 55)))

    # 3. Topic masteries with 6 standard divisions
    topic_configs = [
        {
            "key": "Pentateuch",
            "name": "Ngũ Kinh Môi-se",
            "icon": "Scroll",
            "default_val": 65,
            "focus": "Giao ước Si-na-i, 10 Điều Răn & Lễ Vượt Qua"
        },
        {
            "key": "History",
            "name": "Lịch Sử Tuyển Dân",
            "icon": "Castle",
            "default_val": 58,
            "focus": "Thời kỳ Các Vua Y-sơ-ra-ên & Biến cố Lưu Đày Ba-by-lôn"
        },
        {
            "key": "Wisdom",
            "name": "Thi Ca & Khôn Ngoan",
            "icon": "Sparkles",
            "default_val": 70,
            "focus": "Thi-thiên Đa-vít & Châm-ngôn Sa-lô-môn"
        },
        {
            "key": "Prophecy",
            "name": "Các Sách Tiên Tri",
            "icon": "Flame",
            "default_val": 45,
            "focus": "Lời tiên tri Đấng Mê-si trong Ê-sai 53 & Đa-ni-ên"
        },
        {
            "key": "Gospels",
            "name": "Bốn Sách Phúc Âm",
            "icon": "Cross",
            "default_val": 82,
            "focus": "Phép lạ, Diễn từ & Sự Phục Sinh của Chúa Cứu Thế"
        },
        {
            "key": "Pauline",
            "name": "Thư Tín & Giáo Lý",
            "icon": "BookOpen",
            "default_val": 78,
            "focus": "Xưng công bình bởi đức tin & Đời sống bước đi theo Thánh Linh"
        }
    ]

    topic_items = []
    weakest_topic = None
    min_score = 999

    for cfg in topic_configs:
        pct = user_mastery.get(cfg["key"], cfg["default_val"])
        if pct >= 80:
            status = "Vững vàng"
        elif pct >= 65:
            status = "Khá"
        elif pct >= 50:
            status = "Cần củng cố"
        else:
            status = "Khởi đầu"

        if pct < min_score:
            min_score = pct
            weakest_topic = cfg["name"]

        topic_items.append(TopicMasteryItem(
            topic_key=cfg["key"],
            topic_name=cfg["name"],
            icon=cfg["icon"],
            mastery_percentage=pct,
            status=status,
            recommended_focus=cfg["focus"]
        ))

    # 4. Adaptive personalized recommendations
    recs = [
        f"Chủ đề '{weakest_topic}' đang ở mức {min_score}%. Hãy ưu tiên làm bài trắc nghiệm chuyên biệt để nâng cao độ thành thục.",
        f"Có {len(due_cards_list)} thẻ ghi nhớ đến hạn ôn tập hôm nay theo thuật toán SM-2 để ngăn chặn đường cong quên lãng (Forgetting Curve).",
        "Tiếp tục duy trì chuỗi học tập hàng ngày (Streak) để kích hoạt phần thưởng EXP và mở khóa huy hiệu Học Giả.",
        "Nghiên cứu nguyên ngữ Hy Lạp Agape & Charis để củng cố nền tảng giải kinh phần Thư tín."
    ]

    weakness_summary = f"Chỉ số ghi nhớ đạt {retention_pct}%. Bạn đang nắm rất vững mảng Phúc Âm và Thư Tín, nhưng mảng '{weakest_topic}' cần được luyện tập bổ sung thêm câu hỏi tình huống."

    return AdaptiveAnalyticsResponse(
        user_identifier="local_user",
        total_score=total_score,
        daily_streak=daily_streak,
        level_title=level_title,
        retention_rate_pct=retention_pct,
        memory_stability_days=avg_stability,
        total_due_flashcards=len(due_cards_list),
        total_cards_mastered=mastered_count,
        total_quizzes_completed=total_quizzes,
        total_flashcards_reviewed=total_reviewed,
        topic_masteries=topic_items,
        weakness_summary=weakness_summary,
        adaptive_recommendations=recs,
        due_cards=due_cards_list[:6]
    )


# ==============================================================================
# Specialized Challenge Packs Catalog & Engine (§3, §4, §46)
# ==============================================================================

CHALLENGE_PACKS_DATA: List[Dict[str, Any]] = [
    {
        "id": "pack-discipleship",
        "slug": "hanh-trinh-mon-do",
        "title": "Hành Trình Môn Đồ (Discipleship Trail)",
        "category": "Thực Hành Môn Đồ Hóa",
        "icon_name": "Compass",
        "badge_label": "Môn Đồ Trung Kiên",
        "description": "Khảo cứu nền tảng ơn gọi, cái giá của việc theo Chúa, vác thập tự giá mỗi ngày và Đại Mạng Lệnh rao truyền Phúc Âm.",
        "target_doctrine": "Ma-thi-ơ 16, 28; Lu-ca 9, 14; Giăng 21",
        "estimated_minutes": 5,
        "difficulty_level": "Trung Cấp",
        "total_questions": 5,
        "passing_score": 80,
        "questions": [
            {
                "id": "cd-1",
                "question_text": "Theo Ma-thi-ơ 16:24, điều kiện tiên quyết Chúa Giê-xu phán cho bất kỳ ai muốn bước theo Ngài là gì?",
                "options": [
                    "Học rộng biết nhiều về luật pháp truyền khẩu",
                    "Liều mình, vác thập tự giá mình mà theo Ta",
                    "Dâng hiến toàn bộ tài sản cho hội đường",
                    "Lánh xa thế tục lên chốn non cao ẩn cư"
                ],
                "correct_option": 1,
                "explanation": "Chúa Giê-xu phán: 'Nếu ai muốn theo ta, thì phải liều mình, vác thập tự giá mình mà theo ta.'",
                "scripture_reference": "Ma-thi-ơ 16:24",
                "points": 20
            },
            {
                "id": "cd-2",
                "question_text": "Trong Đại Mạng Lệnh (Ma-thi-ơ 28:19-20), mệnh lệnh trọng tâm Chúa Giê-xu truyền cho các môn đồ là gì?",
                "options": [
                    "Xây dựng các thánh đường nguy nga",
                    "Hãy đi khiến muôn dân trở nên môn đồ Ta",
                    "Chinh phục các thành phố bằng quyền lực thế gian",
                    "Thành lập các hội đoàn từ thiện Do Thái"
                ],
                "correct_option": 1,
                "explanation": "Mệnh lệnh cốt lõi là 'Môn đệ hóa muôn dân' (Make disciples of all nations), làm phép báp-tem và dạy họ giữ mọi điều Chúa truyền.",
                "scripture_reference": "Ma-thi-ơ 28:19-20",
                "points": 20
            },
            {
                "id": "cd-3",
                "question_text": "Bên bờ biển Ti-bê-ri-át, Chúa Giê-xu phục sinh đã hỏi Phi-e-rơ ba lần điều gì trước khi tái xác lập chức vụ chăn bầy?",
                "options": [
                    "Ngươi có hứa không chối Ta nữa chăng?",
                    "Ngươi yêu Ta hơn những kẻ này chăng?",
                    "Ngươi đã đánh được bao nhiêu con cá lớn?",
                    "Ngươi có thề trung thành trọn đời chăng?"
                ],
                "correct_option": 1,
                "explanation": "Chúa hỏi: 'Si-môn, con Giô-na, ngươi yêu ta hơn những kẻ này chăng?' Tình yêu Đấng Christ là động lực và nền tảng duy nhất của sứ mạng chăn bầy.",
                "scripture_reference": "Giăng 21:15-17",
                "points": 20
            },
            {
                "id": "cd-4",
                "question_text": "Trong Lu-ca 14:28-30, Chúa Giê-xu dùng hình ảnh minh họa nào để nhấn mạnh môn đồ cần 'tính phí tổn' trước khi theo Ngài?",
                "options": [
                    "Người đánh cá trên biển sâu",
                    "Người xây một cái tháp phải ngồi tính phí tổn trước",
                    "Người gieo giống trên các loại đất khác nhau",
                    "Người làm công trong vườn nho"
                ],
                "correct_option": 1,
                "explanation": "Chúa dạy: 'Có ai trong các ngươi muốn xây một cái tháp, mà trước không ngồi tính phí tổn xem mình có đủ tiền hoàn thành chăng?' Theo Chúa đòi hỏi cam kết dâng trọn vẹn.",
                "scripture_reference": "Lu-ca 14:28-30",
                "points": 20
            },
            {
                "id": "cd-5",
                "question_text": "Theo Giăng 13:35, dấu hiệu nhận biết tối thượng mà thiên hạ sẽ dùng để nhận ra môn đồ thật của Chúa Giê-xu là gì?",
                "options": [
                    "Nói được các thứ tiếng lạ lưu loát",
                    "Làm được nhiều phép lạ dấu kỳ lẫy lừng",
                    "Có lòng yêu thương nhau chân thành",
                    "Mặc trang phục biệt riêng nghiêm ngặt"
                ],
                "correct_option": 2,
                "explanation": "Chúa phán: 'Nếu các ngươi có lòng yêu thương nhau, thì ấy là tại điều đó mà thiên hạ sẽ nhận biết các ngươi là môn đồ ta.'",
                "scripture_reference": "Giăng 13:35",
                "points": 20
            }
        ]
    },
    {
        "id": "pack-messianic-prophecy",
        "slug": "loi-tien-tri-dang-me-si",
        "title": "Lời Tiên Tri Đấng Mê-si & Sự Ứng Nghiệm (Messianic Prophecies)",
        "category": "Cơ Đốc Học & Tiên Tri",
        "icon_name": "Sparkles",
        "badge_label": "Học Giả Lời Tiên Tri",
        "description": "Khảo chứng sự ứng nghiệm mầu nhiệm từng chi tiết cuộc đời, sự chết chuộc tội và phục sinh của Đấng Mê-si qua Kinh Thánh Cựu Ước.",
        "target_doctrine": "Ê-sai 7, 53; Mi-chê 5; Xa-cha-ri 11; Thi-thiên 22",
        "estimated_minutes": 6,
        "difficulty_level": "Nâng Cao",
        "total_questions": 5,
        "passing_score": 80,
        "questions": [
            {
                "id": "mp-1",
                "question_text": "Tiên tri Mi-chê 5:1 (5:2) đã tiên báo chính xác Đấng Cai Trị đời đời của Y-sơ-ra-ên sẽ giáng sinh tại địa danh nào?",
                "options": [
                    "Na-xa-rét xứ Ga-li-lê",
                    "Giê-ru-sa-lem thành thánh",
                    "Bết-lê-hem Ép-ra-ta",
                    "Si-chem xứ Sa-ma-ri"
                ],
                "correct_option": 2,
                "explanation": "Mi-chê 5:1 chép: 'Hỡi Bết-lê-hem Ép-ra-ta... từ nơi ngươi sẽ ra cho ta một Đấng cai trị trong Y-sơ-ra-ên, gốc tích của Ngài bởi từ đời xưa, từ trước vô cùng.'",
                "scripture_reference": "Mi-chê 5:1-2",
                "points": 20
            },
            {
                "id": "mp-2",
                "question_text": "Trong Ê-sai 7:14, dấu lạ Đức Giê-hô-va ban cho nhà vua Đa-vít về sự lâm phàm của Đấng Mê-si là gì?",
                "options": [
                    "Một ngôi sao băng sáng chói từ phương đông",
                    "Một gái đồng trinh sẽ chịu thai, sinh một con trai đặt tên là Em-ma-nu-ên",
                    "Ngai vàng Sa-lô-môn được trùng tu hoàn hảo",
                    "Tiếng kèn vang dội từ đỉnh núi Si-na-i"
                ],
                "correct_option": 1,
                "explanation": "Ê-sai 7:14: 'Này, một gái đồng trinh sẽ chịu thai, sinh một con trai, và đặt tên là Em-ma-nu-ên' (ứng nghiệm trọn vẹn trong Ma-thi-ơ 1:22-23).",
                "scripture_reference": "Ê-sai 7:14",
                "points": 20
            },
            {
                "id": "mp-3",
                "question_text": "Theo Ê-sai 53:5, mục đích và bản chất sâu xa của sự đau thương mà Người Tôi Tớ Đức Giê-hô-va gánh chịu là gì?",
                "options": [
                    "Chịu sửa phạt vì lỗi lầm riêng của cá nhân",
                    "Vì tội lỗi chúng ta mà bị vết, vì sự gian ác chúng ta mà bị thương",
                    "Chịu khổ hình để rèn luyện ý chí anh hùng",
                    "Bị bắt bớ để trốn thoát ách thống trị Ba-by-lôn"
                ],
                "correct_option": 1,
                "explanation": "Ê-sai 53:5 tuyên xưng giáo lý thay thế chuộc tội: 'Ngài vì tội lỗi chúng ta mà bị vết, vì sự gian ác chúng ta mà bị thương; bởi sự sửa phạt Ngài chịu chúng ta được bình an, bởi lằn roi Ngài chịu chúng ta được lành bệnh.'",
                "scripture_reference": "Ê-sai 53:5",
                "points": 20
            },
            {
                "id": "mp-4",
                "question_text": "Tiên tri Xa-cha-ri 11:12-13 đã báo trước giá tiền kẻ bội bạc nhận và số bạc đó sẽ bị ném vào đâu?",
                "options": [
                    "50 lạng vàng ném xuống biển sâu",
                    "30 miếng bạc ném vào nhà người thợ gốm",
                    "100 đồng tiền đúc ném vào đền thờ",
                    "20 miếng bạc phân phát cho người hành khất"
                ],
                "correct_option": 1,
                "explanation": "Xa-cha-ri 11:12-13 chép đúng 30 miếng bạc ném vào nhà thợ gốm trong nhà Đức Giê-hô-va, ứng nghiệm từng chữ khi Giu-đa nộp Chúa (Ma-thi-ơ 26:15; 27:3-10).",
                "scripture_reference": "Xa-cha-ri 11:12-13",
                "points": 20
            },
            {
                "id": "mp-5",
                "question_text": "Thi-thiên 22:18 tiên tri chính xác hành động nào của những kẻ hành quyết dưới chân thập tự giá?",
                "options": [
                    "Đập gãy hai ống chân của tử tù",
                    "Chúng chia nhau áo xống tôi, và bắt thăm áo xống tôi",
                    "Hát bài ca khải hoàn ăn mừng chiến thắng",
                    "Chôn cất tử tội trong hang đá hoang vu"
                ],
                "correct_option": 1,
                "explanation": "Thi-thiên 22:18 chép: 'Chúng nó chia nhau áo xống tôi, và bắt thăm áo xống tôi', ứng nghiệm chính xác từng chi tiết nơi quân lính La-mã (Giăng 19:23-24).",
                "scripture_reference": "Thi-thiên 22:18",
                "points": 20
            }
        ]
    },
    {
        "id": "pack-parables",
        "slug": "du-ngon-nuoc-troi",
        "title": "Dụ Ngôn Nước Trời (Parables of the Kingdom)",
        "category": "Lời Dạy Của Chúa Giê-xu",
        "icon_name": "BookOpen",
        "badge_label": "Bậc Thầy Ẩn Dụ",
        "description": "Khám phá các chiều kích mầu nhiệm sâu nhiệm về Nước Thiên Đàng, ân điển cứu rỗi và sự tha thứ qua các ẩn dụ của Chúa Giê-xu.",
        "target_doctrine": "Ma-thi-ơ 13, 18; Lu-ca 10, 15",
        "estimated_minutes": 5,
        "difficulty_level": "Cơ Bản - Trung Cấp",
        "total_questions": 5,
        "passing_score": 80,
        "questions": [
            {
                "id": "pr-1",
                "question_text": "Trong dụ ngôn Người Gieo Giống (Ma-thi-ơ 13:3-23), hạt giống gieo nhằm 'đất tốt' tượng trưng cho điều gì?",
                "options": [
                    "Người nghe đạo nhưng bị sự lo lắng đời này bóp nghẹt",
                    "Người nghe đạo mừng rỡ nhưng không có rễ, gặp thử thách liền vấp ngã",
                    "Người nghe đạo hiểu rõ, giữ lấy và kết quả: một trăm, sáu chục, ba chục",
                    "Người hoàn toàn không chịu mở tai nghe lời giảng"
                ],
                "correct_option": 2,
                "explanation": "Đất tốt tượng trưng người nghe đạo và hiểu đạo, tấm lòng mở ra tiếp nhận và sinh bông trái dồi dào gấp bội.",
                "scripture_reference": "Ma-thi-ơ 13:23",
                "points": 20
            },
            {
                "id": "pr-2",
                "question_text": "Trong dụ ngôn Người Sa-ma-ri Nhân Lành (Lu-ca 10:25-37), ai là người đã dừng lại băng bó vết thương và cứu giúp nạn nhân?",
                "options": [
                    "Thầy tế lễ đi ngang qua",
                    "Người Lê-vi phục vụ đền thờ",
                    "Người Sa-ma-ri bị người Do Thái coi khinh",
                    "Quan trấn thủ La-mã"
                ],
                "correct_option": 2,
                "explanation": "Người Sa-ma-ri động lòng thương xót, lấy dầu và rượu xức vết thương, đem đến quán trọ chăm sóc; Chúa dạy 'Hãy đi làm theo như vậy'.",
                "scripture_reference": "Lu-ca 10:33-35",
                "points": 20
            },
            {
                "id": "pr-3",
                "question_text": "Dụ ngôn Người Con Hoang Đàng (Lu-ca 15:11-32) bày tỏ điều gì vĩ đại nhất về tấm lòng của Đức Chúa Trời đối với tội nhân?",
                "options": [
                    "Ngài đòi hỏi tội nhân bồi thường gấp bốn lần tài sản",
                    "Ngài chạy ra ôm hôn tha thứ khi tội nhân ăn năn trở về",
                    "Ngài giam cầm tội nhân để thử thách lòng thành",
                    "Ngài chỉ đón nhận người anh cả chăm chỉ làm việc"
                ],
                "correct_option": 1,
                "explanation": "Khi người con còn ở đàng xa, người cha thấy động lòng thương xót, chạy ra ôm cổ hôn, mặc áo tốt nhất và mở tiệc ăn mừng vì 'con ta đây đã chết mà nay lại sống'.",
                "scripture_reference": "Lu-ca 15:20-24",
                "points": 20
            },
            {
                "id": "pr-4",
                "question_text": "Trong Ma-thi-ơ 13:44-46, người tìm được của báu giấu trong ruộng và người buôn tìm ngọc châu quý giá đã hành động như thế nào?",
                "options": [
                    "Trộm lấy của báu đem chôn giấu nơi kín đáo khác",
                    "Vui mừng đi bán hết tài sản mình có để mua lại ruộng và viên ngọc đó",
                    "Phân vân đắn đo vì giá thành quá đắt đỏ",
                    "Kêu gọi bạn bè đến chia phần của báu"
                ],
                "correct_option": 1,
                "explanation": "Nước Trời quý giá đến mức người nhận biết sẵn sàng từ bỏ mọi sự tạm bợ của trần gian để chiếm lấy sự sống đời đời vô giá.",
                "scripture_reference": "Ma-thi-ơ 13:44-46",
                "points": 20
            },
            {
                "id": "pr-5",
                "question_text": "Trong Ma-thi-ơ 18:21-35, đầy tớ được tha món nợ mười ngàn ta-lâng nhưng lại siết cổ bạn nợ một trăm đơ-ni-ê đã nhận lấy hậu quả gì?",
                "options": [
                    "Được chủ thăng chức quản gia",
                    "Bị chủ nổi giận giao cho kẻ tra tấn cho đến khi trả hết nợ",
                    "Được bạn nợ cảm tạ vì bài học nghiêm khắc",
                    "Được tha bổng hoàn toàn vì luật pháp bảo vệ"
                ],
                "correct_option": 1,
                "explanation": "Chúa cảnh cáo: 'Nếu mỗi người trong các ngươi không hết lòng tha thứ anh em mình, thì Cha các ngươi ở trên trời cũng sẽ xử với các ngươi như vậy.'",
                "scripture_reference": "Ma-thi-ơ 18:34-35",
                "points": 20
            }
        ]
    },
    {
        "id": "pack-covenants",
        "slug": "cac-giao-uoc-cuu-chuoc",
        "title": "Các Giao Ước Cứu Chuộc (Redemptive Covenants)",
        "category": "Thần Học Giao Ước",
        "icon_name": "Layers",
        "badge_label": "Trọng Thần Giao Ước",
        "description": "Nghiên cứu tiến trình mạc khải cứu chuộc qua Giao ước Áp-ra-ham, Giao ước Si-na-i, Giao ước Đa-vít và Giao ước Mới trong huyết Đấng Christ.",
        "target_doctrine": "Sáng-thế Ký 12, 15; Xuất 19-20; 2 Sa-mu-ên 7; Giê-rê-mi 31; Hê-bơ-rơ 8",
        "estimated_minutes": 6,
        "difficulty_level": "Chuyên Sâu",
        "total_questions": 5,
        "passing_score": 80,
        "questions": [
            {
                "id": "cv-1",
                "question_text": "Trong Sáng-thế Ký 12:1-3, lời hứa tối thượng trong Giao ước Áp-ra-ham có tầm ảnh hưởng toàn cầu là gì?",
                "options": [
                    "Dòng dõi Áp-ra-ham sẽ chỉ độc quyền nhận phước hạnh",
                    "Các chi tộc nơi thế gian sẽ nhờ ngươi mà được phước",
                    "Áp-ra-ham sẽ cai trị toàn bộ đất Ai Cập",
                    "Mọi dân tộc phải học ngôn ngữ Hê-bơ-rơ"
                ],
                "correct_option": 1,
                "explanation": "Sáng-thế Ký 12:3: 'Các chi tộc nơi thế gian sẽ nhờ ngươi mà được phước', ứng nghiệm nơi Hạt Giống Đấng Christ đem ơn cứu chuộc cho muôn dân.",
                "scripture_reference": "Sáng-thế Ký 12:3; Ga-la-ti 3:8, 16",
                "points": 20
            },
            {
                "id": "cv-2",
                "question_text": "Tại Núi Si-na-i (Xuất Ê-díp-tô Ký 19:5-6), Đức Chúa Trời đặt định địa vị thánh khiết của dân giao ước là gì nếu họ vâng giữ tiếng Ngài?",
                "options": [
                    "Đạo quân bất khả chiến bại của vùng Cận Đông",
                    "Một vương quốc thầy tế lễ và một dân tộc thánh",
                    "Các nhà buôn giàu có nhất trên biển lớn",
                    "Nhóm người được miễn trừ mọi điều răn đạo đức"
                ],
                "correct_option": 1,
                "explanation": "Xuất 19:6: 'Các ngươi sẽ thành một vương quốc thầy tế lễ, cùng một dân tộc thánh cho ta' (tiếp nối trong 1 Phi-e-rơ 2:9).",
                "scripture_reference": "Xuất Ê-díp-tô Ký 19:5-6",
                "points": 20
            },
            {
                "id": "cv-3",
                "question_text": "Trong 2 Sa-mu-ên 7:12-16, Đức Chúa Trời lập Giao ước Đa-vít với lời hứa đời đời cốt lõi nào?",
                "options": [
                    "Ngai vàng và vương quốc của dòng dõi Đa-vít sẽ bền vững đời đời",
                    "Đa-vít sẽ sống mãi mãi trên đất",
                    "Đền thờ Giê-ru-sa-lem sẽ không bao giờ bị phá hủy",
                    "Các con trai Đa-vít không ai phạm tội"
                ],
                "correct_option": 0,
                "explanation": "2 Sa-mu-ên 7:16: 'Nhà ngươi và nước ngươi sẽ được bền vững đời đời trước mặt ta; ngôi ngươi sẽ được lập vững bền mãi mãi', ứng nghiệm trong Đấng Christ Đấng ngồi trên ngai Đa-vít (Lu-ca 1:32-33).",
                "scripture_reference": "2 Sa-mu-ên 7:12-16",
                "points": 20
            },
            {
                "id": "cv-4",
                "question_text": "Tiên tri Giê-rê-mi 31:31-34 báo trước đặc tính nội tâm hóa vượt trội của Giao Ước Mới là gì?",
                "options": [
                    "Luật pháp tiếp tục khắc trên bảng đá cẩm thạch",
                    "Ta sẽ ghi tạc luật pháp ta vào lòng và đặt vào tâm trí họ",
                    "Chỉ các thầy thông giáo mới được quyền đọc luật",
                    "Loại bỏ hoàn toàn khái niệm công bình thánh khiết"
                ],
                "correct_option": 1,
                "explanation": "Giê-rê-mi 31:33: 'Ta sẽ đặt luật pháp ta trong bụng chúng nó và chép vào lòng; ta sẽ làm Đức Chúa Trời chúng nó, chúng nó sẽ làm dân ta.'",
                "scripture_reference": "Giê-rê-mi 31:31-34",
                "points": 20
            },
            {
                "id": "cv-5",
                "question_text": "Trong Lễ Tiệc Thánh (Lu-ca 22:20; 1 Cô-rinh-tô 11:25), Chúa Giê-xu đã xác lập Giao Ước Mới bằng phương tiện thánh nào?",
                "options": [
                    "Huyết của bò đực và dê đực hàng năm",
                    "Huyết Ngài đổ ra vì nhân loại",
                    "Vàng bạc dâng hiến trong hòm giao ước",
                    "Bản văn tự ký kết với các sứ đồ"
                ],
                "correct_option": 1,
                "explanation": "Chúa Giê-xu cầm chén phán: 'Chén này là Giao ước mới trong huyết ta, vì các ngươi mà đổ ra.' Huyết Chúa là giá chuộc đời đời và bảo chứng trọn vẹn của ân điển cứu rỗi.",
                "scripture_reference": "Lu-ca 22:20; Hê-bơ-rơ 9:11-15",
                "points": 20
            }
        ]
    },
    {
        "id": "pack-miracles",
        "slug": "cac-phep-la-chua-cuu-the",
        "title": "Các Phép Lạ Của Chúa Cứu Thế (Miracles of Christ)",
        "category": "Thần Tính & Quyền Năng",
        "icon_name": "Zap",
        "badge_label": "Chứng Nhân Quyền Năng",
        "description": "Các dấu kỳ phép lạ minh chứng thần tính tuyệt đối của Chúa Giê-xu trên tạo vật, bệnh tật, tà linh và sự chết.",
        "target_doctrine": "Giăng 2, 9, 11; Ma-thi-ơ 8, 14; Mác 4",
        "estimated_minutes": 5,
        "difficulty_level": "Cơ Bản - Trung Cấp",
        "total_questions": 5,
        "passing_score": 80,
        "questions": [
            {
                "id": "mr-1",
                "question_text": "Phép lạ đầu tiên Chúa Giê-xu thi thố tại Ca-na xứ Ga-li-lê (Giăng 2:1-11) là gì?",
                "options": [
                    "Chữa lành người mù bẩm sinh",
                    "Hóa nước thành rượu ngon tại tiệc cưới",
                    "Hóa bánh nuôi 5000 người ăn no nê",
                    "Dẹp yên cơn bão biển dữ dội"
                ],
                "correct_option": 1,
                "explanation": "Chúa hóa sáu ché nước đá thành rượu ngon; Giăng ghi nhận: 'Ấy là phép lạ thứ nhất Chúa Giê-xu đã làm tại Ca-na... bày tỏ sự vinh hiển của Ngài; môn đồ bèn tin Ngài.'",
                "scripture_reference": "Giăng 2:11",
                "points": 20
            },
            {
                "id": "mr-2",
                "question_text": "Khi thuyền môn đồ gặp bão bùng trên Biển Ga-li-lê (Mác 4:35-41), Chúa Giê-xu đã quở gió và phán cùng biển lời gì?",
                "options": [
                    "Các ngươi hãy chèo mạnh vào bờ mau!",
                    "Hãy êm đi, lặng đi!",
                    "Gió bão hãy thổi sang phương tây!",
                    "Hỡi biển cả, hãy dâng nước lên cao!"
                ],
                "correct_option": 1,
                "explanation": "Chúa thức dậy quở gió và phán: 'Hãy êm đi, lặng đi!' Gió liền dứt và trời biển đều yên lặng như tờ; môn đồ kinh hãi tự hỏi: 'Ngài là ai mà gió và biển đều vâng lệnh Ngài?'",
                "scripture_reference": "Mác 4:39-41",
                "points": 20
            },
            {
                "id": "mr-3",
                "question_text": "Trong phép lạ nuôi 5000 người (Giăng 6:1-14), nguồn thực phẩm ban đầu do một đứa trẻ dâng hiến là bao nhiêu?",
                "options": [
                    "Mười ổ bánh mì lúa mạch và năm con cá nướng",
                    "Năm cái bánh lúa mạch và hai con cá nhỏ",
                    "Bảy cái bánh và vài con cá nhỏ",
                    "Một thúng đầy bánh mì tươi ngon"
                ],
                "correct_option": 1,
                "explanation": "Anh-rê thưa: 'Đây có một đứa trẻ có năm cái bánh lúa mạch và hai con cá nhỏ; nhưng ngần ấy có thấm vào đâu cho bấy nhiêu người?' Chúa tạ ơn bẻ ra và còn thu lại 12 giỏ đầy mảnh vụn.",
                "scripture_reference": "Giăng 6:9-13",
                "points": 20
            },
            {
                "id": "mr-4",
                "question_text": "Tại Bê-tha-ni, La-xa-rơ đã qua đời và được an táng trong hang đá bao nhiêu ngày trước khi Chúa Giê-xu gọi ông bước ra?",
                "options": [
                    "Một ngày",
                    "Hai ngày",
                    "Bốn ngày",
                    "Bảy ngày"
                ],
                "correct_option": 2,
                "explanation": "La-xa-rơ đã ở trong mộ bốn ngày và có mùi; Chúa Giê-xu tuyên bố: 'Ta là sự sống lại và sự sống' rồi phán lớn tiếng: 'Hỡi La-xa-rơ, hãy ra!' Người chết liền bước ra.",
                "scripture_reference": "Giăng 11:17, 38-44",
                "points": 20
            },
            {
                "id": "mr-5",
                "question_text": "Theo Giăng 20:30-31, mục đích tối hậu của các dấu kỳ phép lạ được ghi chép trong Kinh Thánh Phúc Âm là gì?",
                "options": [
                    "Để làm thỏa mãn tính hiếu kỳ của đám đông",
                    "Để các ngươi tin rằng Đức Chúa Giê-xu là Đấng Christ, Con Đức Chúa Trời, và nhờ tin Ngài mà được sự sống",
                    "Để chứng minh các môn đồ có phép thuật siêu nhiên",
                    "Để thách thức chính quyền cai trị La-mã"
                ],
                "correct_option": 1,
                "explanation": "Giăng 20:31: 'Nhưng các điều này đã chép, để các ngươi tin rằng Đức Chúa Giê-xu là Đấng Christ, Con Đức Chúa Trời, và nhờ tin Ngài mà các ngươi được sự sống bởi danh Ngài.'",
                "scripture_reference": "Giăng 20:30-31",
                "points": 20
            }
        ]
    }
]


@router.get("/challenge-packs", response_model=List[ChallengePackItem])
def list_challenge_packs():
    """
    Get curated thematic Challenge Packs for interactive learning and mastery (§3, §4, §46).
    """
    return CHALLENGE_PACKS_DATA


@router.post("/challenge-packs/{pack_id}/submit", response_model=SubmitChallengePackResponse)
def submit_challenge_pack(
    pack_id: str,
    req: SubmitChallengePackRequest,
    db: Session = Depends(get_db)
):
    """
    Submit answers for a Challenge Pack, evaluate results, compute percentage and award mastery badge.
    """
    pack = next((p for p in CHALLENGE_PACKS_DATA if p["id"] == pack_id), None)
    if not pack:
        raise HTTPException(status_code=404, detail="Không tìm thấy gói thử thách này.")

    total_q = len(pack["questions"])
    correct_count = 0
    results_detail = []

    for q in pack["questions"]:
        qid = q["id"]
        chosen = req.answers.get(qid, -1)
        is_corr = (chosen == q["correct_option"])
        if is_corr:
            correct_count += 1

        results_detail.append({
            "question_id": qid,
            "question_text": q["question_text"],
            "chosen_option": chosen,
            "correct_option": q["correct_option"],
            "is_correct": is_corr,
            "scripture_reference": q["scripture_reference"],
            "explanation": q["explanation"]
        })

    pct = round((correct_count / total_q) * 100, 1) if total_q > 0 else 0.0
    passed = pct >= pack["passing_score"]
    badge_earned = pack["badge_label"] if passed else None

    # Award score in user profile if exists
    if passed:
        try:
            db.execute(
                text("""
                UPDATE user_profiles 
                SET total_score = total_score + :bonus,
                    total_quizzes_completed = total_quizzes_completed + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_identifier = 'local_user'
                """),
                {"bonus": correct_count * 20}
            )
            db.commit()
        except Exception as e:
            logger.warning(f"Could not update user score: {e}")

    if passed:
        msg = f"Xuất sắc! Bạn đã vượt qua gói thử thách '{pack['title']}' với điểm số {pct}% và vinh dự nhận Huy hiệu: '{pack['badge_label']}'!"
    else:
        msg = f"Bạn đạt {pct}%. Hãy ôn tập kỹ lại các phân đoạn Kinh Thánh {pack['target_doctrine']} và thử sức lại để nhận Huy hiệu '{pack['badge_label']}'!"

    return SubmitChallengePackResponse(
        pack_id=pack["id"],
        total_questions=total_q,
        correct_count=correct_count,
        score_percentage=pct,
        passed=passed,
        badge_earned=badge_earned,
        feedback_message=msg,
        results_detail=results_detail
    )


# ==============================================================================
# §3, §4 — Interactive Scripture Memorization Assistant & Word Occlusion
# ==============================================================================

class RecordMemorizePracticeRequest(BaseModel):
    verse_id: str
    accuracy_percent: float = Field(..., ge=0.0, le=100.0)
    level_tested: int = Field(1, ge=1, le=3)
    user_identifier: str = Field("local_user")


class RecordMemorizePracticeResponse(BaseModel):
    verse_id: str
    stars_awarded: int
    xp_earned: int
    total_xp: int
    streak: int
    message: str


MEMORIZE_VERSES_DATA = [
    {
        "id": "john-3-16",
        "reference": "Giăng 3:16",
        "text": "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
        "category": "Tình Yêu & Sự Cứu Chuộc",
        "difficulty": 1,
        "xp_reward": 50,
        "core_doctrine": "Ân Điển & Sự Cứu Rỗi",
        "audio_anchor": "Vì Đức Chúa Trời yêu thương thế gian đến nỗi đã ban Con một của Ngài..."
    },
    {
        "id": "romans-8-28",
        "reference": "Rô-ma 8:28",
        "text": "Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định.",
        "category": "Sự Quan Phòng & Bình An",
        "difficulty": 2,
        "xp_reward": 60,
        "core_doctrine": "Sự Quan Phòng Thần Thượng",
        "audio_anchor": "Vả chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời..."
    },
    {
        "id": "philippians-4-13",
        "reference": "Phi-líp 4:13",
        "text": "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi.",
        "category": "Sức Mạnh & Sự Đắc Thắng",
        "difficulty": 1,
        "xp_reward": 40,
        "core_doctrine": "Năng Quyền Đấng Christ",
        "audio_anchor": "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi."
    },
    {
        "id": "psalm-23-1-3",
        "reference": "Thi-thiên 23:1-3",
        "text": "Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh. Ngài bổ lại linh hồn tôi, dẫn tôi vào các lối công bình, vì cớ danh Ngài.",
        "category": "Sự An Nghỉ & Tiếp Trợ",
        "difficulty": 2,
        "xp_reward": 75,
        "core_doctrine": "Đấng Chăn Chiên Hiền Lành",
        "audio_anchor": "Đức Giê-hô-va là Đấng chăn giữ tôi tôi sẽ chẳng thiếu thốn gì..."
    },
    {
        "id": "proverbs-3-5-6",
        "reference": "Châm-ngôn 3:5-6",
        "text": "Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con. Phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.",
        "category": "Sự Khôn Ngoan & Dẫn Dắt",
        "difficulty": 2,
        "xp_reward": 65,
        "core_doctrine": "Đức Tin & Sự Khôn Ngoan",
        "audio_anchor": "Hãy hết lòng tin cậy Đức Giê-hô-va chớ nương cậy nơi sự thông sáng của con..."
    },
    {
        "id": "jeremiah-29-11",
        "reference": "Giê-rê-mi 29:11",
        "text": "Đức Giê-hô-va phán: Vì ta biết ý tưởng ta nghĩ đối cùng các ngươi, là ý tưởng bình an, không phải tai họa, để ban cho các ngươi một sự trông cậy trong lúc cuối cùng của các ngươi.",
        "category": "Hy Vọng & Tương Lai",
        "difficulty": 2,
        "xp_reward": 60,
        "core_doctrine": "Kế Hoạch Tốt Lành Của Đức Chúa Trời",
        "audio_anchor": "Đức Giê-hô-va phán vì ta biết ý tưởng ta nghĩ đối cùng các ngươi..."
    },
    {
        "id": "galatians-2-20",
        "reference": "Ga-la-ti 2:20",
        "text": "Tôi đã bị đóng đinh vào thập tự giá với Đấng Christ, mà tôi sống, không phải là tôi sống nữa, nhưng Đấng Christ sống trong tôi; nay tôi còn sống trong xác thịt, ấy là sống trong đức tin của Con Đức Chúa Trời, là Đấng đã yêu tôi, và phó chính mình Ngài vì tôi.",
        "category": "Đời Sống Môn Đồ Mới",
        "difficulty": 3,
        "xp_reward": 80,
        "core_doctrine": "Sự Đồng Chết & Đồng Sống",
        "audio_anchor": "Tôi đã bị đóng đinh vào thập tự giá với Đấng Christ..."
    },
    {
        "id": "ephesians-2-8-9",
        "reference": "Ê-phê-sô 2:8-9",
        "text": "Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời. Ấy chẳng phải bởi việc làm đâu, hầu cho không ai khoe mình.",
        "category": "Ân Điển & Đức Tin",
        "difficulty": 2,
        "xp_reward": 65,
        "core_doctrine": "Sola Gratia - Sola Fide",
        "audio_anchor": "Vả ấy là nhờ ân điển bởi đức tin mà anh em được cứu..."
    },
    {
        "id": "2timothy-3-16-17",
        "reference": "2 Ti-mô-thê 3:16-17",
        "text": "Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình, hầu cho người của Đức Chúa Trời được trọn vẹn và sắm sẵn để làm mọi việc lành.",
        "category": "Lời Chúa & Nền Tảng",
        "difficulty": 2,
        "xp_reward": 70,
        "core_doctrine": "Thần Hựu Toàn Vẹn Của Kinh Thánh",
        "audio_anchor": "Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn..."
    },
    {
        "id": "hebrews-11-1",
        "reference": "Hê-bơ-rơ 11:1",
        "text": "Vả, đức tin là sự biết chắc vững vàng của những điều mình đang trông mong, là bằng cớ của những điều mình chẳng xem thấy.",
        "category": "Đức Tin",
        "difficulty": 1,
        "xp_reward": 50,
        "core_doctrine": "Định Nghĩa Đức Tin Thật",
        "audio_anchor": "Vả đức tin là sự biết chắc vững vàng của những điều mình đang trông mong..."
    },
    {
        "id": "joshua-1-9",
        "reference": "Giô-suê 1:9",
        "text": "Ta há không có phán dặn ngươi sao? Hãy vững lòng bền chí, chớ run sợ, chớ kinh khủng; vì Giê-hô-va Đức Chúa Trời ngươi vẫn ở cùng ngươi trong mọi nơi ngươi đi.",
        "category": "Lòng Can Đảm & Sự Hiện Diện",
        "difficulty": 2,
        "xp_reward": 60,
        "core_doctrine": "Sự Hiện Diện Toàn Năng Của Chúa",
        "audio_anchor": "Ta há không có phán dặn ngươi sao hãy vững lòng bền chí..."
    },
    {
        "id": "matthew-28-19-20",
        "reference": "Ma-thi-ơ 28:19-20",
        "text": "Vậy, hãy đi dạy dỗ muôn dân, hãy nhân danh Đức Cha, Đức Con, và Đức Thánh Linh mà làm phép báp-tem cho họ, và dạy họ giữ hết cả mọi điều mà ta đã truyền cho các ngươi. Và này, ta thường ở cùng các ngươi luôn cho đến tận thế.",
        "category": "Đại Mạng Lệnh & Sứ Mạng",
        "difficulty": 3,
        "xp_reward": 85,
        "core_doctrine": "Đại Mạng Lệnh Toàn Cầu",
        "audio_anchor": "Vậy hãy đi dạy dỗ muôn dân hãy nhân danh Đức Cha Đức Con và Đức Thánh Linh..."
    }
]


MEMORIZE_PRACTICE_CACHE: Dict[str, Dict[str, Any]] = {}


def _tokenize_verse_with_occlusion(text: str) -> Dict[str, Any]:
    """Splits verse text into words and generates level 1 (25%), level 2 (50%), and level 3 (100%) blank indices."""
    tokens = text.split()
    total = len(tokens)

    # Deterministic index generation based on word position and significance
    l1_blanks = [i for i in range(total) if i % 4 == 1 or (len(tokens[i]) > 4 and i % 3 == 0)]
    l2_blanks = [i for i in range(total) if i % 2 == 1 or i % 3 == 0]
    l3_blanks = list(range(total))

    # ensure deduplicated and sorted
    l1_blanks = sorted(list(set(l1_blanks)))
    l2_blanks = sorted(list(set(l2_blanks)))

    return {
        "words": tokens,
        "total_words": total,
        "level1_blank_indices": l1_blanks,
        "level2_blank_indices": l2_blanks,
        "level3_blank_indices": l3_blanks
    }


@router.get("/memorize-verses")
def get_memorize_verses(
    category: Optional[str] = Query(None),
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    """
    Get curated golden memorization verses with multi-level word occlusion and user practice records.
    """
    results = []

    # Query DB for practiced verses
    db_progress = {}
    try:
        sql = text("SELECT verse_key, mastery_stars, review_count, last_practiced FROM user_memorized_verses WHERE user_identifier = :u")
        rows = db.execute(sql, {"u": user_identifier}).fetchall()
        for r in rows:
            db_progress[r.verse_key] = {
                "mastery_stars": r.mastery_stars or 0,
                "review_count": r.review_count or 0,
                "last_practiced": str(r.last_practiced) if r.last_practiced else None
            }
    except Exception as e:
        logger.warning(f"Could not read user_memorized_verses: {e}")

    for v in MEMORIZE_VERSES_DATA:
        if category and category != "all" and v["category"] != category:
            continue

        occ = _tokenize_verse_with_occlusion(v["text"])
        user_rec = db_progress.get(v["id"]) or MEMORIZE_PRACTICE_CACHE.get(f"{user_identifier}_{v['id']}", {
            "mastery_stars": 0,
            "review_count": 0,
            "last_practiced": None
        })

        results.append({
            "id": v["id"],
            "reference": v["reference"],
            "text": v["text"],
            "category": v["category"],
            "difficulty": v["difficulty"],
            "xp_reward": v["xp_reward"],
            "core_doctrine": v["core_doctrine"],
            "audio_anchor": v["audio_anchor"],
            "words": occ["words"],
            "total_words": occ["total_words"],
            "level1_blank_indices": occ["level1_blank_indices"],
            "level2_blank_indices": occ["level2_blank_indices"],
            "level3_blank_indices": occ["level3_blank_indices"],
            "mastery_stars": user_rec["mastery_stars"],
            "review_count": user_rec["review_count"],
            "last_practiced": user_rec["last_practiced"]
        })

    return results


@router.post("/memorize-verses/record", response_model=RecordMemorizePracticeResponse)
def record_memorize_practice(
    req: RecordMemorizePracticeRequest,
    db: Session = Depends(get_db)
):
    """
    Record user practice session on a memorization verse, calculate stars and award XP.
    """
    v_item = next((v for v in MEMORIZE_VERSES_DATA if v["id"] == req.verse_id), None)
    if not v_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu Kinh Thánh này.")

    user_id = req.user_identifier or "local_user"
    cache_key = f"{user_id}_{req.verse_id}"

    # Calculate stars based on accuracy and level
    stars = 0
    if req.accuracy_percent >= 90.0:
        stars = 3 if req.level_tested == 3 else (2 if req.level_tested == 2 else 1)
    elif req.accuracy_percent >= 80.0:
        stars = 2 if req.level_tested >= 2 else 1
    elif req.accuracy_percent >= 60.0:
        stars = 1

    # XP bonus: base xp * level * accuracy ratio
    earned_xp = int(v_item["xp_reward"] * (req.level_tested * 0.5 + 0.5) * (req.accuracy_percent / 100.0))
    if earned_xp < 10:
        earned_xp = 10

    # Persist to DB
    total_xp = 0
    streak = 1
    try:
        sql_verse = text("""
            INSERT INTO user_memorized_verses (user_identifier, verse_key, mastery_stars, review_count, last_practiced)
            VALUES (:u, :v, :s, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (user_identifier, verse_key)
            DO UPDATE SET 
                mastery_stars = GREATEST(user_memorized_verses.mastery_stars, EXCLUDED.mastery_stars),
                review_count = user_memorized_verses.review_count + 1,
                last_practiced = CURRENT_TIMESTAMP
        """)
        db.execute(sql_verse, {"u": user_id, "v": req.verse_id, "s": stars})

        sql_user = text("""
            UPDATE user_learning_profiles
            SET total_score = total_score + :xp,
                daily_streak = daily_streak + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_identifier = :u
            RETURNING total_score, daily_streak
        """)
        row = db.execute(sql_user, {"xp": earned_xp, "u": user_id}).fetchone()
        if row:
            total_xp = row.total_score
            streak = row.daily_streak
        db.commit()
    except Exception as e:
        logger.warning(f"DB update failed for memorize practice: {e}")
        db.rollback()

    # Update in-memory cache
    prev = MEMORIZE_PRACTICE_CACHE.get(cache_key, {"mastery_stars": 0, "review_count": 0})
    MEMORIZE_PRACTICE_CACHE[cache_key] = {
        "mastery_stars": max(prev["mastery_stars"], stars),
        "review_count": prev["review_count"] + 1,
        "last_practiced": str(datetime.now())
    }

    if stars == 3:
        msg = f"Tuyệt hảo! Bạn đã xuất sắc ghi nhớ trọn vẹn câu {v_item['reference']} ở Mức 3 và đạt 3 Sao Vàng! (+{earned_xp} XP)"
    elif stars >= 1:
        msg = f"Rất tốt! Bạn đạt {req.accuracy_percent}% ở Mức {req.level_tested} và nhận được {stars} Sao! (+{earned_xp} XP)"
    else:
        msg = f"Bạn đạt {req.accuracy_percent}%. Hãy lắng nghe giọng đọc mẫu hoặc bật gợi ý chữ cái đầu để tiếp tục luyện tập nhé!"

    return RecordMemorizePracticeResponse(
        verse_id=req.verse_id,
        stars_awarded=stars,
        xp_earned=earned_xp,
        total_xp=total_xp,
        streak=streak,
        message=msg
    )


# ==============================================================================
# BIBLE READING PLANS ENDPOINTS (ROADMAP §3 & §46)
# ==============================================================================

@router.get("/reading-plans")
def list_reading_plans_learn(
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    from app.routers.bible import list_reading_plans
    return list_reading_plans(user_identifier=user_identifier, db=db)


@router.get("/reading-plans/today")
def get_today_reading_plan_learn(
    plan_id: str = Query("plan_1_year", description="Active plan ID"),
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    from app.routers.bible import get_today_reading_plan
    return get_today_reading_plan(plan_id=plan_id, user_identifier=user_identifier, db=db)


@router.get("/reading-plans/{plan_id}")
def get_reading_plan_detail_learn(
    plan_id: str,
    user_identifier: str = Query("local_user"),
    db: Session = Depends(get_db)
):
    from app.routers.bible import get_reading_plan_detail
    return get_reading_plan_detail(plan_id=plan_id, user_identifier=user_identifier, db=db)


@router.post("/reading-plans/{plan_id}/toggle-day")
def toggle_reading_plan_day_learn(
    plan_id: str,
    day_number: Optional[int] = Query(None, ge=1),
    completed: Optional[bool] = Query(None),
    user_identifier: Optional[str] = Query("local_user"),
    db: Session = Depends(get_db)
):
    from app.routers.bible import toggle_reading_plan_day, ToggleDayRequest
    req = ToggleDayRequest(
        day=day_number or 1,
        completed=completed,
        user_identifier=user_identifier
    )
    return toggle_reading_plan_day(plan_id=plan_id, req=req, db=db)





