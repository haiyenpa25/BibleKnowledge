from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
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


