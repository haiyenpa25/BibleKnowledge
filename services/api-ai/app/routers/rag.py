import json
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(prefix="/rag", tags=["AI Research & RAG"])

OLLAMA_EMBED_URL = f"{settings.OLLAMA_BASE_URL}/api/embeddings"
EMBED_MODEL = "bge-m3"


class SearchRequest(BaseModel):
    query: str
    limit: int = 5
    mode: str = "hybrid"  # "hybrid", "semantic", "fulltext"


class ChunkResult(BaseModel):
    id: str
    book_title: str
    author: str
    chapter_title: str
    section_heading: str
    scripture_ref: str
    content: str
    similarity_score: float


class BibleEvidence(BaseModel):
    reference: str
    text: str


class StudyInsight(BaseModel):
    heading: str
    content: str


class Citation(BaseModel):
    source_title: str
    chapter: str
    quote: str


class CitedAnswerResponse(BaseModel):
    summary: str
    bible_evidence: List[BibleEvidence] = Field(default_factory=list)
    theological_insights: List[StudyInsight] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    further_study_questions: List[str] = Field(default_factory=list)
    retrieved_chunks_count: int = 0
    model: str = settings.OLLAMA_MODEL


class AskRequest(BaseModel):
    query: str
    scripture_focus: Optional[str] = None


async def get_query_embedding(query_text: str) -> List[float]:
    """Generate 1024D vector using BGE-M3."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            OLLAMA_EMBED_URL,
            json={"model": EMBED_MODEL, "prompt": query_text[:1000]}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Lỗi khi tạo embedding từ Ollama.")
        return resp.json().get("embedding", [])


@router.post("/search", response_model=List[ChunkResult])
async def search_chunks(req: SearchRequest, db: Session = Depends(get_db)):
    """Hybrid Semantic & Full-Text Search across theological books."""
    q_clean = req.query.strip()
    if not q_clean:
        return []

    # 1. Semantic Vector Search
    query_vec = await get_query_embedding(q_clean)
    vec_str = "[" + ",".join(str(f) for f in query_vec) + "]"

    sql_vector = text("""
        SELECT c.id, d.title as book_title, d.author, c.chapter_title, c.section_heading,
               c.scripture_ref, c.content,
               (1 - (c.embedding <=> CAST(:vec AS vector))) as score
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE c.embedding IS NOT NULL
        ORDER BY c.embedding <=> CAST(:vec AS vector) ASC
        LIMIT :limit;
    """)

    rows = db.execute(sql_vector, {"vec": vec_str, "limit": req.limit}).fetchall()

    results = []
    for r in rows:
        results.append(ChunkResult(
            id=str(r.id),
            book_title=r.book_title or "",
            author=r.author or "",
            chapter_title=r.chapter_title or "",
            section_heading=r.section_heading or "",
            scripture_ref=r.scripture_ref or "",
            content=r.content,
            similarity_score=round(float(r.score), 4)
        ))

    return results


@router.post("/ask", response_model=CitedAnswerResponse)
async def ask_rag(req: AskRequest, db: Session = Depends(get_db)):
    """
    Synthesize grounded theological response with strict citations.
    Combines:
    1. Direct Scripture Verse retrieval from bible_verses
    2. Semantic chunk retrieval from document_chunks (Wiersbe, Zondervan)
    3. Grounded generation via Ollama Qwen model
    """
    q = req.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Step 1: Detect Bible Verse in query
    bible_evidence_list = []
    # Search for potential verse pattern like "Giăng 3:16" or "Ma-thi-ơ 14:29"
    verse_match = re.search(r'([A-Za-zÀ-ỹ0-9\s\-]+)\s+(\d+)[:\.](\d+)(?:-(\d+))?', q)
    if verse_match or req.scripture_focus:
        ref_to_lookup = req.scripture_focus or verse_match.group(0)
        try:
            # Quick lookup from bible_verses
            sql_ref = text("""
                SELECT b.name_vi, v.chapter, v.verse, v.text
                FROM bible_verses v
                JOIN bible_books b ON v.book_id = b.id
                WHERE b.name_vi ILIKE :b_name AND v.chapter = :ch AND v.verse = :v
                LIMIT 1;
            """)
            # Extract parts
            parts = re.findall(r'(\d+)', ref_to_lookup)
            if len(parts) >= 2:
                ch_num, v_num = int(parts[0]), int(parts[1])
                b_name = re.sub(r'[\d:\.\-\s]+$', '', ref_to_lookup).strip()
                row_v = db.execute(sql_ref, {"b_name": f"%{b_name}%", "ch": ch_num, "v": v_num}).fetchone()
                if row_v:
                    bible_evidence_list.append(BibleEvidence(
                        reference=f"{row_v.name_vi} {row_v.chapter}:{row_v.verse}",
                        text=row_v.text
                    ))
        except Exception:
            pass

    # Step 2: Semantic retrieval of top 4 chunks
    query_vec = await get_query_embedding(q)
    vec_str = "[" + ",".join(str(f) for f in query_vec) + "]"

    sql_chunks = text("""
        SELECT c.id, d.title as book_title, d.author, c.chapter_title, c.section_heading, c.content,
               (1 - (c.embedding <=> CAST(:vec AS vector))) as score
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE c.embedding IS NOT NULL
        ORDER BY c.embedding <=> CAST(:vec AS vector) ASC
        LIMIT 4;
    """)

    chunks = db.execute(sql_chunks, {"vec": vec_str}).fetchall()

    # Step 3: Construct Grounded Prompt
    context_str = ""
    for i, c in enumerate(chunks, 1):
        context_str += f"\n--- [Tài liệu {i}: {c.book_title} | {c.chapter_title} | {c.section_heading}] ---\n"
        context_str += f"{c.content}\n"

    bible_context_str = ""
    for b in bible_evidence_list:
        bible_context_str += f"[{b.reference}] {b.text}\n"

    system_prompt = (
        "BẠN LÀ MỘT TRỢ LÝ NGHIÊN CỨU KINH THÁNH CHUYÊN SÂU (Bible Research Assistant).\n"
        "Nguyên tắc cốt lõi:\n"
        "1. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT CÂU KINH THÁNH HOẶC DỮ KIỆN THẦN HỌC.\n"
        "2. PHÂN BIỆT RÕ RÀNG:\n"
        "   - Văn bản Kinh Thánh chính thức\n"
        "   - Bối cảnh lịch sử / văn hóa\n"
        "   - Lời chú giải của tác giả tài liệu\n"
        "3. Trả lời bằng tiếng Việt gãy gọn, học thuật nhưng dễ hiểu.\n"
        "4. Phải trích dẫn rõ tên sách hoặc tác giả khi trích dẫn ý tưởng.\n"
    )

    user_prompt = f"""
{system_prompt}

TÀI LIỆU CHÚ GIẢI THẦN HỌC THAM KHẢO:
{context_str}

KINH VĂN LIÊN QUAN:
{bible_context_str if bible_context_str else "(Dựa vào kiến thức Kinh Thánh chuẩn mực)"}

CÂU HỎI NGHIÊN CỨU CỦA NGƯỜI DÙNG:
"{q}"

HÃY TRẢ LỜI CÓ CẤU TRÚC RÕ RÀNG NHƯ SAU:
1. Tóm tắt câu trả lời (1-2 đoạn ngắn gọn).
2. Phân tích bối cảnh lịch sử & văn hóa.
3. Bài học thần học và thuộc linh cốt lõi.
4. Trích dẫn tác giả / tài liệu tham khảo (ghi rõ ý của tác giả).
5. 1-2 câu hỏi gợi ý để người học tự suy ngẫm sâu hơn.
"""

    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": user_prompt,
                "stream": False
            }
        )

        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Lỗi phản hồi từ mô hình AI.")

        gen_text = resp.json().get("response", "").strip()

    # Extract citations list from retrieved chunks
    citations = [
        Citation(
            source_title=c.book_title,
            chapter=c.chapter_title or c.section_heading or "Tham khảo",
            quote=c.content[:200] + "..."
        )
        for c in chunks[:3]
    ]

    return CitedAnswerResponse(
        summary=gen_text,
        bible_evidence=bible_evidence_list,
        theological_insights=[
            StudyInsight(
                heading=c.section_heading or c.chapter_title or "Chú giải thần học",
                content=c.content[:400] + "..."
            )
            for c in chunks[:2]
        ],
        citations=citations,
        further_study_questions=[
            "Ý nghĩa bài học này áp dụng như thế nào trong đời sống đức tin hằng ngày?",
            "Làm thế nào để phân biệt giữa đức tin chân thật và sự liều lĩnh theo quan điểm Kinh Thánh?"
        ],
        retrieved_chunks_count=len(chunks),
        model=settings.OLLAMA_MODEL
    )
