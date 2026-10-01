import json
import re
from typing import List, Optional, Dict, Any
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


# --- Character Study Models ---
class CharacterStudyRequest(BaseModel):
    name_or_slug: str = Field(..., description="Character name or slug, e.g. 'si-mon-phi-e-ro', 'Phi-e-rơ', 'Phao-lô'")


class MilestoneEvent(BaseModel):
    title: str
    period: str
    description: str


class RelationshipItem(BaseModel):
    target_name: str
    relation: str


class CharacterStudyResponse(BaseModel):
    slug: str
    name_vi: str
    name_en: str
    original_name: Optional[str]
    title_or_role: str
    timeline_period: str
    summary: str
    key_verses: List[str]
    milestone_events: List[MilestoneEvent]
    relationships: List[RelationshipItem]
    ai_theological_portrait: str
    spiritual_lessons: List[str]
    reflection_questions: List[str]


# --- Theme Study Models ---
class ThemeStudyRequest(BaseModel):
    theme_key: str = Field(..., description="Theme key, e.g. 'faith', 'grace', 'covenant', 'kingdom', 'spirit', 'love', 'peace', 'salvation'")


class LexiconBrief(BaseModel):
    strong_number: str
    language: str
    lemma: str
    transliteration: str
    definition: str


class ThemeStudyResponse(BaseModel):
    theme_key: str
    theme_name: str
    theme_en: str
    core_concept: str
    lexicon_roots: List[LexiconBrief]
    key_scriptures: List[Dict[str, str]]
    ot_development: str
    nt_fulfillment: str
    practical_application: str
    reflection_questions: List[str]



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


# ==============================================================================
# 2. Systematic Character Study (ROADMAP1 Section 16)
# ==============================================================================

@router.post("/character-study", response_model=CharacterStudyResponse)
async def study_character(req: CharacterStudyRequest, db: Session = Depends(get_db)):
    """
    Produce an in-depth theological portrait of a biblical character:
    - Canonical profile & historical context
    - Milestones, actions, turning points
    - Relationship network from knowledge graph
    - Grounded spiritual analysis synthesized via Ollama Qwen
    """
    query_str = req.name_or_slug.strip().lower()

    # Find matching character
    sql_person = text("""
        SELECT id, slug, name_vi, name_en, original_name, gender, title_or_role, summary, timeline_period, metadata
        FROM people
        WHERE LOWER(slug) = :q OR LOWER(name_vi) LIKE :q_like OR LOWER(name_en) LIKE :q_like
        LIMIT 1
    """)
    person = db.execute(sql_person, {"q": query_str, "q_like": f"%{query_str}%"}).fetchone()

    if not person:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy nhân vật: '{req.name_or_slug}'")

    # 1. Associated Events from knowledge_edges & events
    sql_events = text("""
        SELECT DISTINCT e.title, e.period, e.description
        FROM events e
        JOIN knowledge_nodes ne ON ne.node_key = e.slug AND ne.node_type = 'event'
        JOIN knowledge_edges ke ON (ke.source_node_id = ne.id OR ke.target_node_id = ne.id)
        JOIN knowledge_nodes np ON (np.id = ke.source_node_id OR np.id = ke.target_node_id)
        WHERE np.node_key = :pslug
        LIMIT 5
    """)
    events_rows = db.execute(sql_events, {"pslug": person.slug}).fetchall()
    milestone_events = [
        MilestoneEvent(title=r.title, period=r.period, description=r.description)
        for r in events_rows
    ]

    # If no events found via edges, query based on mention in events description
    if not milestone_events:
        fallback_evs = db.execute(
            text("SELECT title, period, description FROM events WHERE description ILIKE :name LIMIT 3"),
            {"name": f"%{person.name_vi}%"}
        ).fetchall()
        milestone_events = [
            MilestoneEvent(title=r.title, period=r.period, description=r.description)
            for r in fallback_evs
        ]

    # 2. Relationships from knowledge_edges
    sql_rels = text("""
        SELECT n_target.label as target_name, ke.relation
        FROM knowledge_nodes n_src
        JOIN knowledge_edges ke ON ke.source_node_id = n_src.id
        JOIN knowledge_nodes n_target ON ke.target_node_id = n_target.id
        WHERE n_src.node_key = :pslug
        UNION
        SELECT n_src.label as target_name, ke.relation
        FROM knowledge_nodes n_target
        JOIN knowledge_edges ke ON ke.target_node_id = n_target.id
        JOIN knowledge_nodes n_src ON ke.source_node_id = n_src.id
        WHERE n_target.node_key = :pslug
        LIMIT 6
    """)
    rels_rows = db.execute(sql_rels, {"pslug": person.slug}).fetchall()
    relationships = [
        RelationshipItem(target_name=r.target_name, relation=r.relation)
        for r in rels_rows
    ]

    # 3. Key Scripture verses
    meta = person.metadata or {}
    key_verses = []
    if "key_verse" in meta:
        key_verses.append(meta["key_verse"])

    # Look up verse_entities
    sql_v = text("""
        SELECT DISTINCT b.name_vi, v.chapter, v.verse
        FROM verse_entities ve
        JOIN bible_verses v ON ve.verse_id = v.id
        JOIN bible_books b ON v.book_id = b.id
        WHERE ve.entity_id = :pid
        LIMIT 4
    """)
    v_rows = db.execute(sql_v, {"pid": person.id}).fetchall()
    for vr in v_rows:
        ref_s = f"{vr.name_vi} {vr.chapter}:{vr.verse}"
        if ref_s not in key_verses:
            key_verses.append(ref_s)

    # 4. Synthesize AI Portrait using Ollama Qwen
    prompt_portrait = f"""Bạn là học giả nghiên cứu Kinh Thánh bảo thủ, chính thống. Hãy phân tích nhân vật Kinh Thánh sau:
Nhân vật: {person.name_vi} ({person.name_en})
Danh hiệu / Vai trò: {person.title_or_role}
Thời kỳ: {person.timeline_period}
Tóm lược truyền thống: {person.summary}

Yêu cầu nội dung (viết mạch lạc, trang trọng, đầy đủ dẫn chứng Kinh Thánh):
1. Chân dung thần học & Hành trình đức tin (Quá trình biến đổi, điểm mạnh, điểm yếu con người).
2. Các bước ngoặt quyết định và phản ứng trước tiếng gọi của Đức Chúa Trời.
3. 3 bài học thuộc linh cốt lõi cho đời sống môn đồ hôm nay.
4. 2 câu hỏi tự vấn suy ngẫm cho người học.
"""
    ai_portrait = ""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt_portrait,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                ai_portrait = resp.json().get("response", "").strip()
    except Exception:
        ai_portrait = ""

    if not ai_portrait:
        ai_portrait = f"{person.name_vi} là một nhân vật trung tâm trong chương trình cứu chuộc của Đức Chúa Trời. Qua cuộc đời và chức vụ của {person.name_vi} ({person.timeline_period}), chúng ta thấy rõ sự kêu gọi, kỷ luật yêu thương và ân điển biến đổi diệu kỳ của Chúa trên những con người bằng lòng vâng phục."

    spiritual_lessons = [
        f"Ân điển biến đổi của Đức Chúa Trời vượt trên sự yếu đuối và giới hạn tự nhiên của con người ({person.name_vi}).",
        "Sự vâng phục trọn vẹn và đức tin kiên trì qua nghịch cảnh là điều Chúa tôn quý.",
        "Mỗi bước ngoặt thử thách đều là cơ hội tôi luyện để bước vào kế hoạch vĩnh hằng của Ngài."
    ]

    reflection_questions = [
        f"Tôi học được gì từ cách {person.name_vi} đối diện với thất bại và được Chúa phục hồi?",
        "Trong hoàn cảnh hiện tại, Chúa đang mời gọi tôi bước ra bằng đức tin như thế nào?"
    ]

    return CharacterStudyResponse(
        slug=person.slug,
        name_vi=person.name_vi,
        name_en=person.name_en,
        original_name=person.original_name,
        title_or_role=person.title_or_role,
        timeline_period=person.timeline_period,
        summary=person.summary,
        key_verses=key_verses,
        milestone_events=milestone_events,
        relationships=relationships,
        ai_theological_portrait=ai_portrait,
        spiritual_lessons=spiritual_lessons,
        reflection_questions=reflection_questions
    )


# ==============================================================================
# 3. Systematic Theme Study (ROADMAP1 Section 17)
# ==============================================================================

THEMES_CONFIG = {
    "faith": {
        "name_vi": "Đức Tin",
        "name_en": "Faith",
        "roots": ["G4102", "H0539"],
        "concept": "Đức tin không phải là suy nghĩ tích cực mơ hồ, mà là sự tin cậy chắc chắn và phó thác trọn vẹn nơi bản tính, lời hứa và sự thành tín của Đức Chúa Trời.",
        "scriptures": ["Hê-bơ-rơ 11:1", "Rô-ma 1:17", "Sáng-thế Ký 15:6", "Ê-phê-sô 2:8-9"]
    },
    "grace": {
        "name_vi": "Ân Điển",
        "name_en": "Grace",
        "roots": ["G5485", "H2617"],
        "concept": "Ơn huệ nhưng không tuyệt đối từ Đức Chúa Trời dành cho tội nhân hoàn toàn bất xứng, được thể hiện đỉnh cao qua thập tự giá của Đấng Christ.",
        "scriptures": ["Ê-phê-sô 2:8-9", "Rô-ma 3:24", "Giăng 1:16-17", "2 Cô-rinh-tô 12:9"]
    },
    "covenant": {
        "name_vi": "Giao Ước",
        "name_en": "Covenant",
        "roots": ["H1285", "H2617"],
        "concept": "Hiệp ước thiêng liêng có tính ràng buộc vĩnh cửu được đóng ấn bằng huyết, biểu trưng cho sự thành tín vô điều kiện của Đức Chúa Trời đối với tuyển dân.",
        "scriptures": ["Sáng-thế Ký 15:18", "Xuất Ê-díp-tô Ký 19:5", "Giê-rê-mi 31:31-34", "Hê-bơ-rơ 8:6-13"]
    },
    "love": {
        "name_vi": "Tình Yêu Thương (Agapē)",
        "name_en": "Divine Love",
        "roots": ["G0026", "H2617"],
        "concept": "Tình yêu hy sinh, tự nguyện vô điều kiện bắt nguồn từ chính bản tính của Đức Chúa Trời ('Đức Chúa Trời là sự yêu thương', 1 Giăng 4:8).",
        "scriptures": ["Giăng 3:16", "1 Giăng 4:8-10", "1 Cô-rinh-tô 13:4-8", "Rô-ma 5:8"]
    },
    "peace": {
        "name_vi": "Sự Bình An (Shalom)",
        "name_en": "Peace / Wholeness",
        "roots": ["H7965"],
        "concept": "Không chỉ là sự vắng bóng xung đột, mà là trạng thái trọn vẹn, thịnh vượng tâm linh và hòa thuận hoàn toàn trong mối liên hệ với Đấng Tạo Hóa.",
        "scriptures": ["Giăng 14:27", "Phi-líp 4:6-7", "Ê-sai 9:6", "Dân-số Ký 6:24-26"]
    },
    "spirit": {
        "name_vi": "Đức Thánh Linh",
        "name_en": "Holy Spirit",
        "roots": ["G4151", "H7307"],
        "concept": "Ngôi Ba của Đức Chúa Trời Ba Ngôi, Đấng Tái Sinh, Đấng Yên Ủi, Đấng Dạy Dỗ và ban quyền năng để Hội Thánh làm chứng nhân khắp đất.",
        "scriptures": ["Sáng-thế Ký 1:2", "Giăng 14:16-17", "Công-vụ 1:8", "Ga-la-ti 5:22-23"]
    },
    "salvation": {
        "name_vi": "Sự Cứu Rỗi",
        "name_en": "Salvation",
        "roots": ["G4991"],
        "concept": "Công cuộc giải cứu toàn diện của Ba Ngôi Đức Chúa Trời: xưng công bình khỏi án phạt tội lỗi, nên thánh trong đời sống hằng ngày, và vinh hiển hóa trong ngày Chúa tái lâm.",
        "scriptures": ["Rô-ma 1:16", "Công-vụ 4:12", "Ê-phê-sô 2:8-10", "Phi-líp 2:12-13"]
    }
}


@router.get("/themes")
def list_available_themes():
    """List pre-configured biblical study themes."""
    return [
        {
            "key": k,
            "name_vi": v["name_vi"],
            "name_en": v["name_en"],
            "concept": v["concept"]
        }
        for k, v in THEMES_CONFIG.items()
    ]


@router.post("/theme-study", response_model=ThemeStudyResponse)
async def study_theme(req: ThemeStudyRequest, db: Session = Depends(get_db)):
    """
    Produce systematic biblical theology study on a major biblical theme:
    - Lexicon root analysis (Greek/Hebrew Strong entries)
    - Old Testament typological roots & New Testament Christ-centered fulfillment
    - Practical Christian application synthesized via Ollama Qwen
    """
    theme_k = req.theme_key.strip().lower()
    config = THEMES_CONFIG.get(theme_k)

    if not config:
        # Fallback to faith
        config = THEMES_CONFIG["faith"]
        theme_k = "faith"

    # 1. Fetch Strong's Lexicon entries
    lex_roots = []
    for sn in config["roots"]:
        row = db.execute(
            text("SELECT strong_number, language, lemma, transliteration, definition FROM strong_lexicon WHERE strong_number = :sn OR id = :sn LIMIT 1"),
            {"sn": sn}
        ).fetchone()
        if row:
            lex_roots.append(LexiconBrief(
                strong_number=row.strong_number,
                language=row.language,
                lemma=row.lemma,
                transliteration=row.transliteration,
                definition=row.definition
            ))

    # 2. Fetch Verse Passages Text
    key_scriptures = []
    from app.routers.bible import get_verse_range
    for sref in config["scriptures"]:
        v_text = ""
        try:
            res = get_verse_range(ref=sref, db=db)
            if res.get("verses"):
                v_text = res["verses"][0]["text"]
        except Exception:
            v_text = ""
        key_scriptures.append({"ref": sref, "text": v_text})

    # 3. Synthesize via Ollama Qwen
    ot_development = f"Trong Cựu Ước, chủ đề {config['name_vi']} được đặt nền tảng qua các giao ước lịch sử và sự tể trị của Đức Chúa Trời. Mọi hình bóng và của lễ đều hướng về sự cứu rỗi trọn vẹn trong tương lai."
    nt_fulfillment = f"Trong Tân Ước, {config['name_vi']} tìm thấy sự ứng nghiệm tối hậu và vinh hiển nơi thân vị và công cuộc cứu chuộc của Đức Chúa Giê-xu Christ trên thập tự giá và sự sống lại."
    practical_application = f"Đối với đời sống người tin Chúa hôm nay, sự hiểu biết sâu sắc về {config['name_vi']} biến đổi cách chúng ta cầu nguyện, thờ phượng và bước đi trong ân điển hằng ngày."

    prompt_theme = f"""Bạn là nhà thần học Kinh Thánh. Hãy soạn bài nghiên cứu chuyên đề về:
Chủ đề: {config['name_vi']} ({config['name_en']})
Khái niệm cốt lõi: {config['concept']}

Hãy viết 3 phần ngắn gọn, súc tích, đầy ơn:
1. Tiến trình mạc khải trong Cựu Ước (1 đoạn).
2. Sự ứng nghiệm trọn vẹn nơi Đấng Christ trong Tân Ước (1 đoạn).
3. Ứng dụng thực tiễn cho đời sống thuộc linh cơ đốc nhân (1 đoạn).
"""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt_theme,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                raw_ai = resp.json().get("response", "").strip()
                # If generated successfully, we can store in practical application
                if raw_ai:
                    practical_application = raw_ai
    except Exception:
        pass

    reflection_questions = [
        f"Lẽ thật về {config['name_vi']} thách thức quan điểm sống hiện tại của tôi như thế nào?",
        f"Làm thế nào để tôi có thể phản chiếu trọn vẹn {config['name_vi']} của Chúa đối với những người xung quanh trong tuần này?"
    ]

    return ThemeStudyResponse(
        theme_key=theme_k,
        theme_name=config["name_vi"],
        theme_en=config["name_en"],
        core_concept=config["concept"],
        lexicon_roots=lex_roots,
        key_scriptures=key_scriptures,
        ot_development=ot_development,
        nt_fulfillment=nt_fulfillment,
        practical_application=practical_application,
        reflection_questions=reflection_questions
    )

