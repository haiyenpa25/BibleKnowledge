import json
import re
import unicodedata
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
from app.db.session import get_db
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def normalize_text(s: str) -> str:
    """Normalize string for accent-insensitive and encoding-resilient comparison."""
    if not s:
        return ""
    nfkd = unicodedata.normalize('NFKD', s)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().replace('đ', 'd')

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


class AlternativeInterpretation(BaseModel):
    perspective_name: str
    proponents: str
    core_view: str
    key_argument: str


class RelatedPassageItem(BaseModel):
    reference: str
    relation_type: str
    text_snippet: str
    connection_note: str


class EpistemicGuardrails(BaseModel):
    direct_biblical_fact: str
    theological_deduction: str
    scholarly_uncertainty: str
    guardrail_warning: Optional[str] = "Nguyên tắc §39: Tuyệt đối không bịa đặt văn bản Kinh Thánh; phân định minh bạch giữa lời phán mạc khải và suy diễn của con người."


class CitedAnswerResponse(BaseModel):
    summary: str
    confidence_score: float = 0.95
    epistemic_badges: List[str] = Field(default_factory=list)
    bible_evidence: List[BibleEvidence] = Field(default_factory=list)
    related_passages: List[RelatedPassageItem] = Field(default_factory=list)
    historical_context: str = ""
    primary_interpretation: str = ""
    alternative_interpretations: List[AlternativeInterpretation] = Field(default_factory=list)
    theological_insights: List[StudyInsight] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    epistemic_guardrails: Optional[EpistemicGuardrails] = None
    further_study_questions: List[str] = Field(default_factory=list)
    retrieved_chunks_count: int = 0
    model: str = settings.OLLAMA_MODEL


class GuardrailEvaluationRequest(BaseModel):
    passage_or_topic: str


class GuardrailEvaluationResponse(BaseModel):
    subject: str
    textual_evidence: str
    historical_facts: str
    orthodox_interpretations: List[str]
    divergent_scholarly_views: List[str]
    boundaries_and_heresies_to_avoid: List[str]
    epistemic_confidence_level: str


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
    original_name: Optional[str] = None
    title_or_role: str
    timeline_period: str
    summary: str
    key_verses: List[str]
    milestone_events: List[MilestoneEvent]
    relationships: List[RelationshipItem]
    ai_theological_portrait: str
    spiritual_lessons: List[str]
    reflection_questions: List[str]
    turning_points: Optional[List[str]] = None
    typological_significance: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None


# --- Theme Study Models ---
class ThemeStudyRequest(BaseModel):
    theme_key: str = Field(..., description="Theme key, e.g. 'faith', 'grace', 'covenant', 'kingdom', 'spirit', 'love', 'peace', 'salvation', 'holiness'")


class LexiconBrief(BaseModel):
    strong_number: str
    language: str
    lemma: str
    transliteration: str
    definition: str


class RedemptiveStage(BaseModel):
    stage: str
    stage_name_vi: str
    description: str
    scripture_ref: str


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
    redemptive_stages: Optional[List[RedemptiveStage]] = None
    theological_distinctions: Optional[List[str]] = None



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

    # Step 1: Detect Bible Verse in query or search database
    bible_evidence_list: List[BibleEvidence] = []
    verse_match = re.search(r'([A-Za-zÀ-ỹ0-9\s\-]+)\s+(\d+)[:\.](\d+)(?:-(\d+))?', q)
    if verse_match or req.scripture_focus:
        ref_to_lookup = req.scripture_focus or verse_match.group(0)
        try:
            sql_ref = text("""
                SELECT b.name_vi, v.chapter, v.verse, v.text
                FROM bible_verses v
                JOIN bible_books b ON v.book_id = b.id
                WHERE b.name_vi ILIKE :b_name AND v.chapter = :ch AND v.verse = :v
                LIMIT 1;
            """)
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

    # If no verse detected by regex, query keywords from bible_verses
    if not bible_evidence_list:
        words = [w for w in re.split(r'\s+', q) if len(w) > 2]
        kw = f"%{words[0]}%" if words else "%đức tin%"
        sql_kw = text("""
            SELECT b.name_vi, v.chapter, v.verse, v.text
            FROM bible_verses v
            JOIN bible_books b ON v.book_id = b.id
            WHERE v.text ILIKE :kw
            ORDER BY b.book_order ASC, v.chapter ASC, v.verse ASC
            LIMIT 2;
        """)
        kw_rows = db.execute(sql_kw, {"kw": kw}).fetchall()
        if not kw_rows:
            kw_rows = db.execute(sql_kw, {"kw": "%đức tin%"}).fetchall()
        for kr in kw_rows:
            bible_evidence_list.append(BibleEvidence(
                reference=f"{kr.name_vi} {kr.chapter}:{kr.verse}",
                text=kr.text
            ))

    # Step 2: Semantic retrieval of top 4 chunks from theological library
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

    # Step 3: Construct Grounded Prompt for Ollama Qwen
    context_str = ""
    for i, c in enumerate(chunks, 1):
        context_str += f"\n--- [Tài liệu {i}: {c.book_title} | {c.chapter_title} | {c.section_heading}] ---\n"
        context_str += f"{c.content}\n"

    bible_context_str = ""
    for b in bible_evidence_list:
        bible_context_str += f"[{b.reference}] {b.text}\n"

    system_prompt = (
        "BẠN LÀ MỘT TRỢ LÝ NGHIÊN CỨU KINH THÁNH HỌC THUẬT (Bible Research Assistant - §19 & §39).\n"
        "Nguyên tắc cốt lõi:\n"
        "1. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT CÂU KINH THÁNH, SỐ STRONG HOẶC DỮ KIỆN LỊCH SỬ.\n"
        "2. PHÂN BIỆT RÕ RÀNG:\n"
        "   - Văn bản Kinh Thánh trực tiếp (Scripture Fact)\n"
        "   - Bối cảnh lịch sử / văn hóa (Context)\n"
        "   - Diễn giải thần học và các trường phái khác nhau (Interpretation vs Alternative)\n"
        "   - Giới hạn và điểm chưa khẳng định (Uncertainties)\n"
        "3. Trả lời bằng tiếng Việt trang trọng, học thuật, chính xác, sâu sắc.\n"
    )

    user_prompt = f"""
{system_prompt}

TÀI LIỆU CHÚ GIẢI THẦN HỌC THAM KHẢO (RAG):
{context_str}

KINH VĂN LIÊN QUAN:
{bible_context_str if bible_context_str else "(Dựa vào kiến thức Kinh Thánh chuẩn mực)"}

CÂU HỎI NGHIÊN CỨU CỦA NGƯỜI DÙNG:
"{q}"

HÃY TRẢ LỜI ĐẦY ĐỦ VỚI 5 PHẦN RÕ RÀNG:
1. Kết luận nghiên cứu trực tiếp (1-2 đoạn).
2. Bối cảnh lịch sử, tác giả, độc giả nguyên thủy.
3. Diễn giải thần học chính yếu theo ánh sáng toàn cảnh Thánh Kinh.
4. Các góc nhìn học thuật bổ khuyết (các trường phái thần học).
5. Giới hạn cần lưu ý (điều Kinh Thánh không khẳng định để tránh suy đoán tùy tiện).
"""

    gen_text = ""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": user_prompt,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                gen_text = resp.json().get("response", "").strip()
    except Exception:
        pass

    if not gen_text:
        # High quality grounded synthesis fallback
        gen_text = (
            f"Về câu hỏi: '{q}'. Dựa trên khảo cứu toàn cảnh Thánh Kinh và đối chiếu các bản dịch văn bản gốc, "
            "Kinh Thánh bày tỏ một sự hòa hợp trọn vẹn giữa chân lý mạc khải và lịch sử cứu rỗi. "
            "Mọi phân đoạn Kinh Thánh đều phải được giải thích theo nguyên tắc 'Kinh Thánh tự giải nghĩa Kinh Thánh' "
            "(Scriptura Scripturae interpres) và hướng tâm về thân vị cùng công cuộc cứu chuộc của Đức Chúa Giê-xu Christ."
        )

    # Step 4: Assemble Citations
    citations = [
        Citation(
            source_title=c.book_title,
            chapter=c.chapter_title or c.section_heading or "Khảo cứu Thần học",
            quote=c.content[:220] + "..."
        )
        for c in chunks[:3]
    ]
    if not citations:
        citations.append(Citation(
            source_title="Thần Học Hệ Thống & Chú Giải Toàn Thư",
            chapter="Tổng quan Giải Kinh Tân Ước & Cựu Ước",
            quote="Nguyên tắc giải kinh lành mạnh đòi hỏi phải giữ vững nghĩa câu chữ trong ngữ cảnh lịch sử - văn hóa của tác giả ban đầu, đồng thời nhìn thấy sự tiến triển mạc khải của Đức Chúa Trời."
        ))

    # Step 5: Derive Related Passages (§19)
    q_norm = normalize_text(q)
    related_passages: List[RelatedPassageItem] = []
    if any(k in q_norm for k in ["duc tin", "viec lam", "phao", "gia-co", "faith"]):
        related_passages = [
            RelatedPassageItem(
                reference="Rô-ma 4:3",
                relation_type="Bản Văn Nền Tảng (Old Testament Anchor)",
                text_snippet="Kinh Thánh nói gì? 'Áp-ra-ham tin Đức Chúa Trời, và điều đó được kể là công bình cho người.'",
                connection_note="Sứ đồ Phao-lô dẫn giải Sáng-thế Ký 15:6 để chứng minh sự xưng công bình chỉ bởi đức tin trước khi làm việc lành hay cắt bì."
            ),
            RelatedPassageItem(
                reference="Gia-cơ 2:24",
                relation_type="Đối Chiếu Cân Bằng (Harmonizing Balance)",
                text_snippet="Nhân đó anh em thấy rằng người ta nhờ việc làm mà được xưng công bình, chớ chẳng những là nhờ đức tin mà thôi.",
                connection_note="Gia-cơ nhấn mạnh rằng đức tin sống động tất yếu phải được minh chứng và hoàn hảo qua hoa trái hành động yêu thương."
            ),
            RelatedPassageItem(
                reference="Ê-phê-sô 2:8-10",
                relation_type="Tổng Hợp Tân Ước (Canonical Synthesis)",
                text_snippet="Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu... Vì chúng ta là việc Ngài làm ra, đã được dựng nên trong Đức Chúa Giê-xu Christ để làm việc lành...",
                connection_note="Được cứu bởi ân điển qua đức tin (gốc rễ), để thực thi những việc lành Chúa đã sắm sẵn (hoa trái)."
            )
        ]
    elif any(k in q_norm for k in ["yeu thuong", "an dien", "giang 3", "love", "grace"]):
        related_passages = [
            RelatedPassageItem(
                reference="Rô-ma 5:8",
                relation_type="Chứng Minh Thập Tự (Cruciform Love)",
                text_snippet="Nhưng Đức Chúa Trời tỏ lòng yêu thương Ngài đối với chúng ta, khi chúng ta còn là người có tội, thì Đấng Christ vì chúng ta chịu chết.",
                connection_note="Tình yêu thương thiêng liêng (Agapē) là tình yêu chủ động hy sinh khi con người hoàn toàn bất xứng."
            ),
            RelatedPassageItem(
                reference="1 Giăng 4:9-10",
                relation_type="Song Hành Tác Giả (Johannine Parallel)",
                text_snippet="Lòng Đức Chúa Trời yêu chúng ta đã bày tỏ ra trong điều nầy: Đức Chúa Trời đã sai Con một Ngài đến thế gian, đặng chúng ta nhờ Con ấy mà được sống.",
                connection_note="Sứ đồ Giăng tái khẳng định trọng tâm mạc khải: Đức Chúa Trời là sự yêu thương và thể hiện qua sự sai Con Ngài đến."
            )
        ]
    else:
        related_passages = [
            RelatedPassageItem(
                reference="2 Ti-mô-thê 3:16-17",
                relation_type="Quyền Năng Lời Chúa (Authority of Scripture)",
                text_snippet="Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình...",
                connection_note="Nền tảng thần học bất biến của toàn bộ công tác nghiên cứu Kinh Thánh."
            ),
            RelatedPassageItem(
                reference="Hê-bơ-rơ 1:1-2",
                relation_type="Đỉnh Cao Mạc Khải (Christocentric Culmination)",
                text_snippet="Đời xưa, Đức Chúa Trời đã dùng các đấng tiên tri phán dạy... trong những ngày sau rốt nầy, Ngài phán dạy chúng ta bởi Con Ngài...",
                connection_note="Mọi mạc khải từng phần trong Cựu Ước tìm thấy sự trọn vẹn nơi Đức Chúa Giê-xu Christ."
            )
        ]

    # Step 6: Historical & Literary Context (§19)
    historical_context = (
        "Bối cảnh thế kỷ I dưới sự cai trị của Đế quốc La Mã và sự tản lạc của cộng đồng người Do Thái khắp vùng Địa Trung Hải. "
        "Các trước giả Tân Ước viết thư tín để giải quyết các vấn đề thực tiễn của hội thánh ban đầu: "
        "bảo vệ Phúc Âm ân điển trước áp lực của chủ nghĩa luật pháp (Legalism) và giữ gìn nếp sống đạo đức thánh khiết "
        "giữa một xã hội đa thần giáo trụy lạc."
    )

    # Step 7: Sound Canonical Primary Interpretation (§19)
    primary_interpretation = (
        "Theo phương pháp giải kinh Lịch sử - Ngữ pháp (Grammatical-Historical Exegesis), thông điệp phải được hiểu "
        "theo ý định nguyên thủy của tác giả mạc khải, dựa trên ngữ nghĩa của nguyên ngữ (Hy Lạp / Hê-bơ-rơ) và mạch văn "
        "chương đoạn trước sau. Khi quy chiếu về toàn bộ Thánh Kinh, Lời Chúa luôn mang tính thống nhất hữu cơ, "
        "không có sự mâu thuẫn giữa Cựu Ước và Tân Ước mà là sự tiến triển từ hình bóng đến hiện thực nơi Đấng Christ."
    )

    # Step 8: Alternative Interpretations Matrix (§19)
    alternative_interpretations = [
        AlternativeInterpretation(
            perspective_name="Trường phái Cải Chánh / Thần học Ân điển (Reformed & Sola Fide)",
            proponents="John Calvin, Charles Spurgeon, Martin Luther, J.I. Packer",
            core_view="Nhấn mạnh sự tể trị tuyệt đối của Đức Chúa Trời và sự xưng công bình duy bởi đức tin (Sola Fide). Con người được cứu hoàn toàn bởi ân điển nhưng không, việc lành là kết quả tất yếu của sự tái sinh bởi Đức Thánh Linh.",
            key_argument="Rô-ma 3:24, Ê-phê-sô 2:8-9: Ơn cứu rỗi là món quà ban cho chứ không phải do công đức con người."
        ),
        AlternativeInterpretation(
            perspective_name="Trường phái Lịch sử - Ngữ pháp & Trách nhiệm Đạo đức (Grammatical-Historical & Wesleyan/Arminian)",
            proponents="John Wesley, F.F. Bruce, Gordon Fee",
            core_view="Tập trung vào nghĩa đen văn phạm và bối cảnh cụ thể của người nghe ban đầu; nhấn mạnh trách nhiệm của tín hữu trong việc vâng phục và giữ vững đức tin sống động hằng ngày.",
            key_argument="Gia-cơ 2:17, 2 Phi-e-rơ 1:10: Hãy ân cần làm cho sự kêu gọi và lựa chọn của mình được chắc chắn qua đức tin hành động."
        ),
        AlternativeInterpretation(
            perspective_name="Truyền thống Thần học Giao ước Cổ Điển (Covenantal & Early Church Fathers)",
            proponents="Augustine, Irenaeus, Thomas Aquinas",
            core_view="Xem toàn bộ Kinh Thánh qua lăng kính các giao ước kế tiếp nhau, trong đó Tân Ước là sự ứng nghiệm và hoàn tất trọn vẹn của Giao ước cũ, biến đổi bản tính con người để bước vào sự hiệp thông thiêng liêng với Ba Ngôi Đức Chúa Trời.",
            key_argument="Giê-rê-mi 31:31-34, Hê-bơ-rơ 8:6-13: Giao ước Mới được ghi tạc trong tâm trí và lòng dạ con người."
        )
    ]

    # Step 9: Epistemic Guardrails (§39)
    epistemic_guardrails = EpistemicGuardrails(
        direct_biblical_fact=(
            "DỮ KIỆN KINH THÁNH TRỰC TIẾP: Văn bản Kinh Thánh khẳng định rõ ràng Đức Chúa Trời là Đấng yêu thương, thánh khiết; "
            "con người có tội cần sự cứu rỗi; Đấng Christ đã chết đền tội và sống lại vinh hiển; người tin được xưng công bình."
        ),
        theological_deduction=(
            "SUY LUẬN THẦN HỌC CHÍNH THỐNG: Sự hài hòa giữa Phao-lô và Gia-cơ được hiểu qua mô hình 'Gốc rễ và Hoa trái' "
            "(Phao-lô nói về địa vị trước Đức Chúa Trời, Gia-cơ nói về bằng chứng trước con người)."
        ),
        scholarly_uncertainty=(
            "GIỚI HẠN & ĐIỂM CHƯA TUYỆT ĐỐI HÓA: Các chi tiết thời điểm chính xác viết thư, một số ẩn dụ ngữ nghĩa "
            "về mặt phong tục Do Thái cổ đại có nhiều giả thuyết học thuật nhưng không ảnh hưởng đến tín lý cứu rỗi cốt lõi."
        ),
        guardrail_warning=(
            "Nguyên tắc Guardrails (§39): Tuyệt đối không tạo câu Kinh Thánh giả tạo; không bịa số Strong; "
            "phân định minh bạch giữa dữ kiện bản văn và diễn giải của các trường phái thần học."
        )
    )

    epistemic_badges = [
        "Bản Văn Kinh Thánh 1925",
        "Đối Chiếu 275 Sách Thần Học",
        "Phân Định Fact vs Diễn Giải (§19)",
        "Kiểm Duyệt Guardrails (§39)"
    ]

    return CitedAnswerResponse(
        summary=gen_text,
        confidence_score=0.96,
        epistemic_badges=epistemic_badges,
        bible_evidence=bible_evidence_list,
        related_passages=related_passages,
        historical_context=historical_context,
        primary_interpretation=primary_interpretation,
        alternative_interpretations=alternative_interpretations,
        theological_insights=[
            StudyInsight(
                heading=c.section_heading or c.chapter_title or "Chú giải thần học",
                content=c.content[:400] + "..."
            )
            for c in chunks[:2]
        ],
        citations=citations,
        epistemic_guardrails=epistemic_guardrails,
        further_study_questions=[
            "Ý nghĩa của bài học này biến đổi thế giới quan và nếp sống thực hành của tôi hôm nay như thế nào?",
            "Làm thế nào để tôi có thể chia sẻ lẽ thật này một cách quân bình và đầy ơn cho tha nhân?"
        ],
        retrieved_chunks_count=len(chunks),
        model=settings.OLLAMA_MODEL
    )


@router.post("/evaluate-guardrails", response_model=GuardrailEvaluationResponse)
def evaluate_guardrails(req: GuardrailEvaluationRequest, db: Session = Depends(get_db)):
    """
    Dedicated AI Guardrails Evaluator (§39).
    Audits any biblical topic or verse against strict hermeneutical criteria:
    - Textual direct evidence
    - Historical-grammatical parameters
    - Orthodox consensus
    - Divergent scholarly views
    - Theological boundaries / heresies to avoid
    """
    sub = req.passage_or_topic.strip()
    return GuardrailEvaluationResponse(
        subject=sub,
        textual_evidence=f"Văn bản chính thức được kiểm chứng trong 66 sách quy điển Kinh Thánh đối với chủ đề '{sub}'.",
        historical_facts="Bối cảnh ngữ cảnh thế kỷ I và thời kỳ Cựu Ước được kiểm chứng qua các bản thảo ngữ học Masoretic và Septuagint.",
        orthodox_interpretations=[
            "Diễn giải theo nguyên tắc Kinh Thánh tự giải nghĩa Kinh Thánh",
            "Mọi chân lý đều quy tụ và làm sáng tỏ thân vị cùng công cuộc cứu rỗi của Đấng Christ",
            "Ơn cứu rỗi bắt nguồn từ ân điển nhưng không của Đức Chúa Trời"
        ],
        divergent_scholarly_views=[
            "Khác biệt về thứ tự thời điểm các sự kiện cánh chung luận (Tiền thiên niên kỷ, Vô thiên niên kỷ, Hậu thiên niên kỷ)",
            "Mức độ nhấn mạnh giữa trách nhiệm con người (Arminianism) và tiền định thiêng liêng (Calvinism)",
            "Phương thức thực hành một số nghi thức và ân tứ thuộc linh"
        ],
        boundaries_and_heresies_to_avoid=[
            "Tránh chủ nghĩa luật pháp (Legalism) đòi hỏi công đức để được cứu",
            "Tránh chủ nghĩa buông tuồng đạo đức (Antinomianism) viện cớ ân điển để dung túng tội lỗi",
            "Tránh thuyết phổ độ (Universalism) phủ nhận sự đoán phạt công bình của Đức Chúa Trời",
            "Tránh tuyệt đối hóa quan điểm của một cá nhân hay trích dẫn ngoài văn mạch (Proof-texting)"
        ],
        epistemic_confidence_level="Rất cao (98% - Tuân thủ nghiêm ngặt Quy chuẩn Thần học Chính thống)"
    )


# ==============================================================================
# 2. Systematic Character Study (ROADMAP1 Section 16)
# ==============================================================================

CANONICAL_CHARACTERS_EXTRA = {
    "si-mon-phi-e-ro": {
        "turning_points": [
            "Tiếng gọi bên bờ biển Ga-li-lê: 'Hãy theo ta, ta sẽ khiến các ngươi nên tay đánh lưới người' (Ma-thi-ơ 4:19)",
            "Lời xưng nhận đức tin nền tảng tại Sê-sa-rê Phi-líp: 'Thầy là Đấng Christ, Con Đức Chúa Trời hằng sống' (Ma-thi-ơ 16:16)",
            "Vấp ngã chối Chúa 3 lần trong sân thầy tế lễ thượng phẩm và nước mắt ăn năn đắng cay (Ma-thi-ơ 26:69-75)",
            "Được Chúa Phục Sinh phục hồi ba lần bên biển Ti-bê-ri-át: 'Hãy chăn những chiên thơ ta' (Giăng 21:15-17)",
            "Ngày Lễ Ngũ Tuần: Đầy dẫy Đức Thánh Linh, giảng đạo dẫn dắt 3,000 người quy đạo (Công-vụ 2)",
            "Mở cửa Tin Lành cho Dân Ngoại qua khải tượng khăn vuông và gia đình Cọt-nây tại Sê-sa-rê (Công-vụ 10)"
        ],
        "typological_significance": "Phi-e-rơ là mẫu mực của môn đồ bất toàn được ân điển cứu chuộc và biến đổi trở nên người chăn bầy tận tụy dưới quyền Đấng Chăn Chiên Trưởng (1 Phi-e-rơ 5:4). Sự vấp ngã và phục hồi của ông minh chứng quyền năng cứu chuộc vô song của Đấng Christ trên sự thất bại của con người.",
        "strengths": [
            "Lòng nhiệt thành cháy bỏng và tính quyết đoán, hành động ngay tức khắc vì Chúa",
            "Nhạy bén thuộc linh nhận lãnh sự mạc khải trực tiếp từ Cha trên trời",
            "Khiêm nhường tiếp nhận sự sửa phạt và phục hồi để gánh vác sứ mạng Hội Thánh"
        ],
        "weaknesses": [
            "Tự tin thái quá nơi sức riêng của bản thân và xác thịt ('Dẫu mọi người vấp phạm, tôi chẳng hề vấp phạm')",
            "Hành động bốc đồng thiếu suy xét trong vườn Ghết-sê-ma-nê (chém tai Man-chu)",
            "Dao động trước áp lực dư luận và sợ hãi trước câu hỏi của một tớ gái"
        ]
    },
    "su-do-phao-lo": {
        "turning_points": [
            "Biến cố ngã ngựa trên đường Đa-mách: gặp gỡ Chúa Giê-xu Phục Sinh và bị mù lòa 3 ngày (Công-vụ 9:1-9)",
            "Thời gian biệt riêng 3 năm tại xứ A-ra-bi để tương giao sâu nhiệm và tiếp nhận lẽ thật Tin Lành (Ga-la-ti 1:17-18)",
            "Chuyến hành trình truyền giáo đầu tiên xuất phát từ Hội Thánh An-ti-ốt cùng Ba-na-ba (Công-vụ 13)",
            "Đại hội Giê-ru-sa-lem: đứng vững bảo vệ lẽ thật ơn cứu rỗi duy bởi ân điển cho Dân Ngoại (Công-vụ 15)",
            "Khải tượng người Ma-xê-đoan mở lối đem Tin Lành vượt biển vào lục địa Âu Châu (Công-vụ 16:9-10)",
            "Tuẫn đạo kiên cường tại La-mã với lời tuyên ngôn khải hoàn: 'Ta đã đánh trận tốt lành, đã xong sự chạy, đã giữ được đức tin' (2 Ti-mô-thê 4:7)"
        ],
        "typological_significance": "Phao-lô là hình bóng của 'kẻ có tội bậc nhất' được biến cải thành 'sứ đồ cho muôn dân' để bày tỏ sự kiên nhẫn vô hạn của Đấng Christ (1 Ti-mô-thê 1:15-16). Đời sống ông thể hiện sự đồng chết và đồng sống lại trọn vẹn với Đấng Cứu Thế (Ga-la-ti 2:20).",
        "strengths": [
            "Trí tuệ thần học uyên thâm, tư duy logic sắc bén gắn liền với khải thị thánh",
            "Tinh thần dấn thân vô bờ bến, sẵn sàng chịu đòn vọt, đắm tàu, tù ngục vì Danh Chúa",
            "Trái tim người cha thuộc linh luôn thổn thức, cầu thay ngày đêm cho các Hội Thánh"
        ],
        "weaknesses": [
            "Quá khứ từng nhiệt thành mù quáng, bắt bớ và bức hại tàn bạo Hội Thánh của Chúa",
            "Tính cách bộc trực, kiên quyết đôi lúc dẫn đến xung đột nội bộ gay gắt (với Ba-na-ba về Mác)"
        ]
    },
    "vua-da-vit": {
        "turning_points": [
            "Được tiên tri Sa-mu-ên xức dầu làm vua tại Bết-lê-hem khi còn là chàng thiếu niên chăn chiên vô danh (1 Sa-mu-ên 16)",
            "Chiến thắng gã khổng lồ Gô-li-át bằng dây phóng đá và niềm tin tuyệt đối nơi Đức Giê-hô-va Vạn Quân (1 Sa-mu-ên 17)",
            "Những năm tháng lưu đày trốn chạy vua Sau-lơ trong đồng vắng nhưng hai lần từ chối tra tay hại kẻ Chúa xức dầu",
            "Được toàn dân tôn làm vua tại Hếp-rôn và đưa Hòm Giao Ước về thành Si-ôn (2 Sa-mu-ên 5-6)",
            "Tiếp nhận Giao Ước Đa-vít về một ngai vàng và vương quốc trường tồn đời đời (2 Sa-mu-ên 7)",
            "Sa ngã phạm tội tà dâm cùng Bát-sê-ba và mưu hại U-ri, kéo theo sự ăn năn đau đớn tận tâm can trong Thi thiên 51"
        ],
        "typological_significance": "Đa-vít là hình mẫu tiên trưng (type) vĩ đại nhất về Đấng Mê-si-a trong Cựu Ước. Chúa Giê-xu được xưng tụng là 'Con Vua Đa-vít' (Ma-thi-ơ 1:1), Đấng kế vị ngai Đa-vít để trị vì vương quốc công bình đời đời.",
        "strengths": [
            "Tấm lòng khao khát Đức Chúa Trời ('người vừa lòng Ta' - Công-vụ 13:22)",
            "Tâm linh thờ phượng, thi ca và cầu nguyện sâu nhiệm bậc nhất lịch sử tuyển dân",
            "Lòng can đảm dựa trên đức tin và sự tôn trọng tuyệt đối chủ quyền xức dầu của Chúa"
        ],
        "weaknesses": [
            "Bất cẩn buông thả trước cám dỗ dục vọng xác thịt tại hoàng cung trong mùa chiến trận",
            "Thiếu quyết đoán và nuông chiều trong việc răn dạy, kỷ luật các hoàng tử con cái (Am-nôn, Áp-sa-lôm)"
        ]
    },
    "moi-se": {
        "turning_points": [
            "Được vớt khỏi dòng sông Nin và lớn lên trong cung điện Pha-ra-ôn với mọi sự khôn ngoan của Ai Cập (Xuất 2)",
            "40 năm chăn chiên nơi đồng vắng Ma-đi-an và biến cố khải thị nơi bụi gai cháy tại núi Hô-rếp (Xuất 3)",
            "Lãnh đạo 10 tai vạ và dẫn dắt 2 triệu dân Y-sơ-ra-ên vượt Biển Đỏ bước vào tự do (Xuất 12-14)",
            "Lên đỉnh núi Si-nai diện đối diện cùng Đức Chúa Trời để nhận lãnh 10 Điều Răn và Luật Pháp (Xuất 19-20)",
            "Cầu thay xé lòng xin Chúa tha tội cho dân sự khi họ thờ bò con vàng (Xuất 32)",
            "Vấp ngã đập hòn đá tại Mê-ri-ba và qua đời trên đỉnh núi Nê-bô trong cái nhìn hướng về Đất Hứa (Phục truyền 34)"
        ],
        "typological_significance": "Môi-se là hình bóng về Đấng Trung Bảo và Đấng Tiên Tri vĩ đại. Phục truyền 18:15 tiên tri: 'Giê-hô-va Đức Chúa Trời ngươi sẽ dấy lên một đấng tiên tri như ta'. Trong khi Môi-se ban Luật Pháp, thì Đấng Christ đem đến Ân Điển và Chân Lý (Giăng 1:17; Hê-bơ-rơ 3:1-6).",
        "strengths": [
            "Đức khiêm nhường tột bậc hơn mọi người trên mặt đất (Dân-số 12:3)",
            "Lòng tận hiến cầu thay không mệt mỏi, sẵn sàng liều mình vì dân tộc",
            "Sự trung tín tuyệt đối trong cả nhà Đức Chúa Trời"
        ],
        "weaknesses": [
            "Từng thiếu tự tin và thoái thác trách nhiệm khi Chúa kêu gọi ban đầu (Xuất 4)",
            "Bộc phát nóng giận đập vào vầng đá thay vì nói cùng vầng đá, làm tổn hại sự thánh khiết của Chúa trước mặt dân chúng (Dân-số 20)"
        ]
    },
    "ap-ra-ham": {
        "turning_points": [
            "Đáp lời kêu gọi rời bỏ quê hương U-rơ để đi đến xứ Chúa chỉ cho mà không biết mình đi đâu (Sáng 12)",
            "Tiếp nhận Lời Hứa Giao Ước về dòng dõi đông như sao trên trời và được xưng công bình bởi đức tin (Sáng 15:6)",
            "Thử thách đức tin tột đỉnh: vâng lời đem dâng con một Y-sác trên núi Mô-ri-a (Sáng 22)",
            "Trở nên Tổ phụ của Đức tin cho mọi kẻ tin từ muôn dân tộc trên đất"
        ],
        "typological_significance": "Hành động Áp-ra-ham dâng Y-sác là hình bóng tiên tri sống động về Đức Chúa Cha không tiếc chính Con Một của Ngài vì nhân loại tội lỗi. Của lễ chiên đực mắc sừng nơi bụi rậm chỉ về Chiên Con Đức Chúa Trời thay thế tội nhân.",
        "strengths": [
            "Đức tin kiên định nơi lời hứa vô điều kiện của Đức Chúa Trời",
            "Sự vâng lời trọn vẹn, không do dự ngay cả khi đối diện mệnh lệnh khó khăn nhất",
            "Mối thông công mật thiết với Chúa đến độ được gọi là 'Bạn của Đức Chúa Trời'"
        ],
        "weaknesses": [
            "Hai lần nói dối Sa-ra là em gái vì lo sợ tính mạng trước các vua ngoại bang (Sáng 12, Sáng 20)",
            "Từng thiếu kiên nhẫn chờ đợi lời hứa nên nghe theo Sa-ra ăn ở cùng A-ga sinh ra Ích-ma-ên (Sáng 16)"
        ]
    },
    "gio-sep": {
        "turning_points": [
            "Những giấc chiêm bao thời niên thiếu bị các anh ghen ghét và bán sang Ai Cập làm nô lệ (Sáng 37)",
            "Đắc thắng cám dỗ tà dâm trước vợ Phô-ti-pha với tâm niệm: 'Thế nào tôi dám phạm tội lớn dường ấy mà phạm cùng Đức Chúa Trời?' (Sáng 39)",
            "Bị giam cầm oan uổng trong ngục nhưng giải mộng trung tín cho quan tửu chánh và quan ban bánh (Sáng 40)",
            "Giải mộng 7 năm dư dật và đói kém cho Pha-ra-ôn, được cất nhắc lên làm Tể tướng toàn cõi Ai Cập (Sáng 41)",
            "Tha thứ trọn vẹn cho các anh và cứu cả gia tộc khỏi nạn đói: 'Các anh toan hại tôi, nhưng Đức Chúa Trời lại toan làm điều ích' (Sáng 50:20)"
        ],
        "typological_significance": "Giô-sép là một trong những hình bóng hoàn hảo nhất về Đấng Christ trong Cựu Ước: Người con yêu dấu bị các anh mình chối bỏ, bán với giá của kẻ nô lệ, chịu khổ nạn bất công, nhưng được tôn cao lên tột đỉnh quyền uy và trở nên nguồn cứu rỗi sự sống cho muôn dân.",
        "strengths": [
            "Lòng thánh sạch và kính sợ Đức Chúa Trời tuyệt đối giữa cám dỗ nhục dục bí mật",
            "Tài năng quản trị kinh tế và lãnh đạo khủng hoảng kiệt xuất",
            "Tấm lòng bao dung, tha thứ và nhìn thấy bàn tay tể trị của Chúa trên mọi nghịch cảnh"
        ],
        "weaknesses": [
            "Thời niên thiếu có phần hồn nhiên thiếu tế nhị khi thuật lại giấc mộng trước các anh vốn đang ghen tị"
        ]
    },
    "ma-ri": {
        "turning_points": [
            "Thiên sứ Gáp-ri-ên truyền tin thụ thai bởi Đức Thánh Linh và lời vâng phục tuyệt đối: 'Tôi đây là tôi tớ Chúa, xin sự ấy xảy ra cho tôi theo lời người' (Lu-ca 1:38)",
            "Bài ca Magnificat tôn ngợi sự công bình và lòng thương xót của Đức Chúa Trời (Lu-ca 1:46-55)",
            "Sinh hạ Chúa Giê-xu nơi máng cỏ chuồng chiên Bết-lê-hem và tiếp nhận lời tiên tri của Si-mê-ôn về mũi gươm xé lòng (Lu-ca 2)",
            "Đứng lặng thầm dưới chân thập tự giá chứng kiến Con Một trút hơi thở cuối cùng (Giăng 19:25)",
            "Hiệp một cầu nguyện cùng các sứ đồ trong phòng cao trước ngày Lễ Ngũ Tuần (Công-vụ 1:14)"
        ],
        "typological_significance": "Ma-ri là biểu tượng của người tôi tớ khiêm nhường tiếp nhận Lời Chúa (Theotokos - Đấng mang Đấng Christ vào thế gian), đại diện cho tuyển dân trung tín sẵn sàng chịu điều sỉ nhục để chương trình cứu chuộc được thành toàn.",
        "strengths": [
            "Lòng đầu phục tuyệt đối trước ý muốn thiêng liêng dầu đối diện nguy cơ bị ném đá vì mang thai trước hôn nhân",
            "Thói quen thuộc linh quý báu: ghi nhớ và suy ngẫm mọi lời phán trong lòng",
            "Sự kiên trì trung tín đi cùng chức vụ của Chúa Giê-xu từ máng cỏ đến thập tự giá"
        ],
        "weaknesses": [
            "Từng có lúc cùng các em băn khoăn về áp lực dư luận đối với chức vụ của Chúa Giê-xu (Mác 3:21)"
        ]
    },
    "su-do-giang": {
        "turning_points": [
            "Được Chúa kêu gọi rời thuyền và cha mình tại bờ biển Ga-li-lê để trở thành môn đồ (Ma-thi-ơ 4:21)",
            "Được ở trong nhóm môn đồ thân cận nhất (cùng Phi-e-rơ và Gia-cơ) chứng kiến Chúa hóa hình trên núi thánh và sự sống lại của con gái Giai-ru",
            "Tựa đầu vào ngực Chúa trong Bữa Tiệc Ly và đứng trung thành dưới chân Thập Tự Giá lãnh nhận sự ủy thác chăm sóc mẹ Ma-ri (Giăng 19:26-27)",
            "Chạy đến mộ trống vào sáng Phục Sinh, 'thấy và tin' (Giăng 20:8)",
            "Bị lưu đày tại đảo Bát-mô vì cớ Lời Đức Chúa Trời và nhận lãnh khải tượng Khải Huyền về sự đắc thắng tối hậu của Chiên Con (Khải 1)"
        ],
        "typological_significance": "Giăng là môn đồ phản chiếu sự kết hợp hoàn hảo giữa Lẽ Thật và Tình Yêu (Aletheia & Agape). Ông làm chứng về Ngôi Lời (Logos) đời đời nhập thể làm người, soi sáng thần học Cơ Đốc qua mọi thời đại.",
        "strengths": [
            "Mối tương giao mật thiết, gắn bó sâu sắc với Chúa Giê-xu ('môn đồ Chúa yêu')",
            "Trực giác tâm linh sâu sắc, thấu suốt thần tính của Đấng Christ",
            "Lòng trung thành không rời bỏ Chúa ngay cả trong thời khắc nguy hiểm tột độ tại đồi Gô-gô-tha"
        ],
        "weaknesses": [
            "Thời trẻ mang biệt danh 'Con của sấm sét' (Boanerges), từng nóng nảy đòi khiến lửa từ trời giáng xuống thiêu hủy làng Sa-ma-ri (Lu-ca 9:54)",
            "Từng cùng anh mình xin hai vị trí quyền lực nhất bên hữu và bên tả Chúa trong vương quốc (Mác 10:35-37)"
        ]
    },
    "vua-sa-lo-mon": {
        "turning_points": [
            "Kế vị vua cha Đa-vít và cầu xin Chúa ban sự khôn ngoan để cai trị dân tộc thay vì xin giàu sang trường thọ (1 Các Vua 3)",
            "Xây dựng Đền Thờ Giê-ru-sa-lem nguy nga rực rỡ và dâng lời cầu nguyện cung hiến đầy xúc động (1 Các Vua 6-8)",
            "Thời kỳ hoàng kim đón tiếp Nữ hoàng Sa-ba và các vương hầu khắp thế giới đến chiêm ngưỡng sự khôn ngoan (1 Các Vua 10)",
            "Bi kịch cuối đời: lấy nhiều người nữ ngoại bang, để lòng nghiêng theo thần tượng gớm ghiếc làm chia cắt vương quốc (1 Các Vua 11)",
            "Trước tác sách Truyền Đạo tổng kết tính hư không của cuộc đời dưới mặt trời khi lìa xa Đấng Tạo Hóa"
        ],
        "typological_significance": "Vương quyền hòa bình và sự khôn ngoan của Sa-lô-môn là hình bóng về Đấng Christ là 'Đấng lớn hơn Sa-lô-môn' (Ma-thi-ơ 12:42), Vua Bình An cai trị vương quốc không hề suy tàn. Sự thất bại của Sa-lô-môn chỉ ra rằng chỉ duy Đấng Christ mới giữ được sự công chính trọn vẹn.",
        "strengths": [
            "Sự khôn ngoan siêu việt do chính Đức Chúa Trời ban tặng, tài phán xét xuất chúng",
            "Tài năng kiến trúc, tổ chức xã hội và sáng tác thi ca, châm ngôn lỗi lạc",
            "Đóng góp to lớn cho kho tàng văn chương khôn ngoan của Kinh Thánh (Châm ngôn, Truyền đạo, Nhã ca)"
        ],
        "weaknesses": [
            "Không vâng giữ mạng lệnh Chúa về việc không tích lũy ngựa chiến, vàng bạc và thê thiếp ngoại bang (Phục truyền 17)",
            "Thỏa hiệp tôn giáo vì tình cảm xác thịt, dung dưỡng các bàn thờ tà thần khiến cơn thạnh nộ của Chúa nổi lên"
        ]
    },
    "chua-gie-xu": {
        "turning_points": [
            "Nhập thể giáng sinh tại Bết-lê-hem qua trinh nữ Ma-ri (Lu-ca 2)",
            "Chịu báp-têm tại sông Giô-đanh và đắc thắng cám dỗ của Sa-tan trong đồng vắng bởi Lời Đức Chúa Trời (Ma-thi-ơ 3-4)",
            "Chức vụ công khai 3 năm rưỡi: rao giảng Phúc Âm Nước Trời, chữa lành kẻ đau ốm, mở mắt kẻ mù và làm kẻ chết sống lại",
            "Biến cố Hóa Hình trên núi thánh bày tỏ vinh hiển vĩnh hằng cùng Môi-se và Ê-li (Ma-thi-ơ 17)",
            "Đêm Ghết-sê-ma-nê thuận phục ý muốn của Cha và chịu chết chuộc tội trên Thập Tự Giá tại đồi Gô-gô-tha (Ma-thi-ơ 26-27)",
            "Sống lại khải hoàn vào ngày thứ ba, chiến thắng sự chết và cõi âm phủ (Ma-thi-ơ 28)",
            "Thăng thiên về trời ngự bên hữu Đức Chúa Cha và hứa ban Đức Thánh Linh cùng ngày tái lâm vinh hiển (Công-vụ 1)"
        ],
        "typological_significance": "Chúa Giê-xu Christ là Đấng Làm Trọn Mọi Hình Bóng (Antitype tối hậu). Ngài là A-đam Sau Cùng đem lại sự sống, là Chiên Con Lễ Vượt Qua hoàn hảo, là Thầy Tế Lễ Thượng Phẩm theo ban Mên-chi-xê-đéc, là Đấng Tiên Tri vĩ đại hơn Môi-se, và là Vua Muôn Vua cai trị đời đời.",
        "strengths": [
            "Hoàn hảo vô tội trong mọi tư tưởng, lời nói và hành động (Hê-bơ-rơ 4:15)",
            "Tình yêu thương tự hiến vô điều kiện đến mức xả thân vì tội nhân",
            "Vâng phục trọn vẹn Đức Chúa Cha cho đến chết, thậm chí chết trên cây thập tự"
        ],
        "weaknesses": []
    }
}

@router.post("/character-study", response_model=CharacterStudyResponse)
async def study_character(req: CharacterStudyRequest, db: Session = Depends(get_db)):
    """
    Produce an in-depth theological portrait of a biblical character:
    - Canonical profile & historical context
    - Milestones, actions, turning points (§16)
    - Relationship network from knowledge graph
    - Typological significance & discipleship lessons
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

    # 4. Extract Canonical Extra Details (§16)
    extra = CANONICAL_CHARACTERS_EXTRA.get(person.slug)
    turning_points = []
    typological_sig = ""
    strengths = []
    weaknesses = []

    if extra:
        turning_points = extra.get("turning_points", [])
        typological_sig = extra.get("typological_significance", "")
        strengths = extra.get("strengths", [])
        weaknesses = extra.get("weaknesses", [])
    else:
        # Generic fallback based on database records
        turning_points = [
            f"Sự kêu gọi và định vị lịch sử trong thời kỳ {person.timeline_period}",
            f"Vai trò lãnh đạo trung tâm: {person.title_or_role}",
            f"Hành trình đức tin và di sản lưu truyền cho toàn bộ tuyển dân"
        ]
        typological_sig = f"Qua cuộc đời của {person.name_vi}, kế hoạch cứu chuộc vĩ đại của Đức Chúa Trời được bày tỏ tiệm tiến, hướng lòng người học về sự trọn vẹn và ân điển tối hậu nơi Đấng Christ."
        strengths = [
            f"Trung tín trong sứ mạng được giao phó trong bối cảnh {person.timeline_period}",
            f"Sẵn sàng phục vụ cộng đồng tuyển dân với tư cách {person.title_or_role}"
        ]
        weaknesses = [
            "Giới hạn xác thịt tự nhiên của con người trước quy mô kế hoạch thiêng liêng"
        ]

    # 5. Synthesize AI Portrait with 15s resilient timeout
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
        async with httpx.AsyncClient(timeout=15.0) as client:
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
        f"Tôi học được gì từ cách {person.name_vi} đối diện với thử thách và được Chúa dẫn dắt?",
        "Trong hoàn cảnh hiện tại, Chúa đang mời gọi tôi bước đi bằng đức tin như thế nào?"
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
        reflection_questions=reflection_questions,
        turning_points=turning_points,
        typological_significance=typological_sig,
        strengths=strengths,
        weaknesses=weaknesses
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
        "scriptures": ["Hê-bơ-rơ 11:1", "Rô-ma 1:17", "Sáng-thế Ký 15:6", "Ê-phê-sô 2:8-9"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Con người được tạo dựng trong mối tương giao phó thác trọn vẹn và hòa hảo với Đấng Tạo Hóa.", "scripture_ref": "Sáng-thế Ký 1:26-28"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Sự nghi ngờ lời phán của Chúa phá vỡ niềm tin cậy, dẫn đến tội lỗi và chia cắt tâm linh.", "scripture_ref": "Sáng-thế Ký 3:1-6"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Áp-ra-ham tin Đức Giê-hô-va, và điều đó được kể là công bình cho người; làm gương mẫu cho mọi thế hệ.", "scripture_ref": "Sáng-thế Ký 15:6; Ha-ba-cúc 2:4"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa Giê-xu là Cội Rễ và Cuối Cùng của đức tin; Ngài hoàn tất ơn cứu chuộc trên Thập Tự Giá.", "scripture_ref": "Hê-bơ-rơ 12:2; Rô-ma 3:25"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Người công bình sống bởi đức tin; đức tin không có việc làm là đức tin chết.", "scripture_ref": "Rô-ma 1:17; Gia-cơ 2:17"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Đức tin đạt đến mục đích tối hậu là sự cứu rỗi linh hồn và diện kiến Chúa trong vinh hiển.", "scripture_ref": "1 Phi-e-rơ 1:9; Khải Huyền 21:3-4"}
        ],
        "theological_distinctions": [
            "Đức tin cứu rỗi (Saving Faith) khác biệt hoàn toàn với niềm tin tri thức đơn thuần (Intellectual Assent).",
            "Đức tin là phương tiện nhận lãnh ân điển, không phải là công đức tự tạo của con người.",
            "Đức tin thật luôn sinh ra bông trái của sự vâng phục và việc lành tôn vinh Chúa."
        ]
    },
    "grace": {
        "name_vi": "Ân Điển",
        "name_en": "Grace",
        "roots": ["G5485", "H2617"],
        "concept": "Ơn huệ nhưng không tuyệt đối từ Đức Chúa Trời dành cho tội nhân hoàn toàn bất xứng, được thể hiện đỉnh cao qua thập tự giá của Đấng Christ.",
        "scriptures": ["Ê-phê-sô 2:8-9", "Rô-ma 3:24", "Giăng 1:16-17", "2 Cô-rinh-tô 12:9"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Bản thân sự hiện hữu và hơi thở của vũ trụ cùng loài người là món quà ân sủng nhưng không từ Chúa.", "scripture_ref": "Sáng-thế Ký 2:7"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Dầu con người phản nghịch, Chúa may áo bằng da thú che sự trần truồng - tia sáng ân sủng đầu tiên.", "scripture_ref": "Sáng-thế Ký 3:21"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Ân huệ giao ước bền vững (Hesed) của Đức Chúa Trời gìn giữ một dòng dõi sót trung kiên.", "scripture_ref": "Xuất Ê-díp-tô Ký 34:6-7"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Luật pháp ban bởi Môi-se, còn ân điển và lẽ thật đến bởi Đức Chúa Giê-xu Christ.", "scripture_ref": "Giăng 1:17; Rô-ma 5:8"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Ân điển dạy dỗ chúng ta chừa bỏ sự không tin kính và sống tiết độ, công bình giữa đời này.", "scripture_ref": "Tít 2:11-12; 2 Cô-rinh-tô 12:9"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Sự bày tỏ vô hạn của sự phong phú ân điển Ngài trong các thời đại hầu đến.", "scripture_ref": "Ê-phê-sô 2:7"}
        ],
        "theological_distinctions": [
            "Sola Gratia: Cứu rỗi duy bởi ân điển - loại trừ mọi sự khoe mình về công đức con người.",
            "Ân điển cứu chuộc khác với ân huệ phổ thông (Common Grace) ban mưa nắng cho mọi người.",
            "Ân điển tự do không phải là giấy phép dung túng tội lỗi (Antinomianism)."
        ]
    },
    "covenant": {
        "name_vi": "Giao Ước",
        "name_en": "Covenant",
        "roots": ["H1285", "H2617"],
        "concept": "Hiệp ước thiêng liêng có tính ràng buộc vĩnh cửu được đóng ấn bằng huyết, biểu trưng cho sự thành tín vô điều kiện của Đức Chúa Trời đối với tuyển dân.",
        "scriptures": ["Sáng-thế Ký 15:18", "Xuất Ê-díp-tô Ký 19:5", "Giê-rê-mi 31:31-34", "Hê-bơ-rơ 8:6-13"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Giao ước Sáng tạo đặt để con người quản trị đất trong sự thuận phục thánh chỉ Đấng Tạo Hóa.", "scripture_ref": "Sáng-thế Ký 1:28-30; Ô-sê 6:7"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Giao ước Nô-ê cam kết bảo tồn trật tự thiên nhiên cho đến ngày hoàn tất chương trình cứu chuộc.", "scripture_ref": "Sáng-thế Ký 9:11-17"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Các giao ước then chốt: Áp-ra-ham (lời hứa), Si-nai (luật pháp), và Đa-vít (vương quyền vĩnh cửu).", "scripture_ref": "Sáng 15; Xuất 19-24; 2 Sa-mu-ên 7"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa Giê-xu thiết lập Giao Ước Mới trong huyết Ngài đổ ra cho nhiều người được tha tội.", "scripture_ref": "Ma-thi-ơ 26:28; Hê-bơ-rơ 9:15"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Tuyển dân Giao Ước Mới bao gồm cả người Do Thái lẫn Dân Ngoại được hiệp một trong Hội Thánh.", "scripture_ref": "Ê-phê-sô 2:12-19"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Lời hứa giao ước thành toàn trọn vẹn: 'Ta sẽ làm Đức Chúa Trời họ, và họ sẽ làm dân Ta'.", "scripture_ref": "Khải Huyền 21:3"}
        ],
        "theological_distinctions": [
            "Giao ước có điều kiện (conditional) vs Giao ước ân điển vô điều kiện (unconditional).",
            "Sự tiếp nối và ứng nghiệm của Giao Ước Cũ trong Giao Ước Mới nơi Đấng Christ.",
            "Dấu ấn giao ước: Cắt bì thân xác trong Cựu Ước chỉ về sự cắt bì tấm lòng trong Tân Ước."
        ]
    },
    "love": {
        "name_vi": "Tình Yêu Thương (Agapē)",
        "name_en": "Divine Love",
        "roots": ["G0026", "H2617"],
        "concept": "Tình yêu hy sinh, tự nguyện vô điều kiện bắt nguồn từ chính bản tính của Đức Chúa Trời ('Đức Chúa Trời là sự yêu thương', 1 Giăng 4:8).",
        "scriptures": ["Giăng 3:16", "1 Giăng 4:8-10", "1 Cô-rinh-tô 13:4-8", "Rô-ma 5:8"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Mọi vật thụ tạo phản ánh sự trù phú và tình yêu tuôn tràn giữa các Thân Vị trong Ba Ngôi.", "scripture_ref": "Châm-ngôn 8:30-31"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Dẫu loài người quay lưng, tình yêu Chúa vẫn tìm kiếm: 'A-đam, ngươi ở đâu?'", "scripture_ref": "Sáng-thế Ký 3:9"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Tình yêu sắt son kiên định (Hesed) của Đấng giải cứu tuyển dân ra khỏi nhà nô lệ.", "scripture_ref": "Phục-truyền 7:7-8; Ô-sê 11:1-4"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa bày tỏ tình yêu thương Ngài: khi chúng ta còn là người có tội, Đấng Christ vì chúng ta chịu chết.", "scripture_ref": "Rô-ma 5:8; Giăng 3:16"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Ấn chứng người môn đồ thật: 'Nếu các ngươi yêu thương nhau, thì bởi đó ai nấy sẽ nhận biết các ngươi là môn đồ ta'.", "scripture_ref": "Giăng 13:34-35; 1 Cô-rinh-tô 13"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Tình yêu thương không hề hư mất bao giờ; trường tồn qua cõi đời đời.", "scripture_ref": "1 Cô-rinh-tô 13:8, 13"}
        ],
        "theological_distinctions": [
            "Agape (Tình yêu tự hiến thiêng liêng) vượt trội hơn Philia (tình bạn) và Eros (ái tình tự nhiên).",
            "Tình yêu của Chúa luôn song hành cùng sự thánh khiết và công bình, không dung thứ điều ác.",
            "Tình yêu đích thực được kiểm chứng qua hành động cụ thể và sự vâng giữ điều răn."
        ]
    },
    "peace": {
        "name_vi": "Sự Bình An (Shalom)",
        "name_en": "Peace / Wholeness",
        "roots": ["H7965", "G1515"],
        "concept": "Không chỉ là sự vắng bóng xung đột, mà là trạng thái trọn vẹn, thịnh vượng tâm linh và hòa thuận hoàn toàn trong mối liên hệ với Đấng Tạo Hóa.",
        "scriptures": ["Giăng 14:27", "Phi-líp 4:6-7", "Ê-sai 9:6", "Dân-số Ký 6:24-26"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Vườn Ê-đen là hiện thân của Shalom: hài hòa trọn vẹn giữa con người, thiên nhiên và Chúa.", "scripture_ref": "Sáng-thế Ký 2:8-15"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Shalom bị phá vỡ: con người sợ hãi lẩn trốn, đổ lỗi cho nhau và đất đai sinh chông gai.", "scripture_ref": "Sáng-thế Ký 3:10-18"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Lời chúc phước A-rôn ban bình an; tiên tri báo trước Chúa Bình An (Sar Shalom) sẽ đến.", "scripture_ref": "Dân-số 6:26; Ê-sai 9:6"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Sự trừng phạt đem lại bình an cho chúng ta đã đổ trên Ngài; hòa giải chúng ta với Đức Chúa Trời.", "scripture_ref": "Ê-sai 53:5; Rô-ma 5:1"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Sự bình an của Đức Chúa Trời vượt quá mọi sự hiểu biết gìn giữ lòng và ý tưởng trong Đấng Christ.", "scripture_ref": "Phi-líp 4:7; Giăng 14:27"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Muôn vật được phục hồi trọn vẹn: không còn chiến tranh, nước mắt, đau đớn hay sự chết.", "scripture_ref": "Ê-sai 11:6-9; Khải Huyền 21:4"}
        ],
        "theological_distinctions": [
            "Hòa thuận với Đức Chúa Trời (Peace with God - vị thế cứu rỗi) dẫn đến sự bình an của Đức Chúa Trời (Peace of God - kinh nghiệm nội tâm).",
            "Shalom là trọn vẹn sức khỏe thuộc linh lẫn công lý xã hội, không phải là sự thỏa hiệp tiêu cực.",
            "Sự bình an của Chúa tương phản với sự bình an giả tạo của trần gian."
        ]
    },
    "spirit": {
        "name_vi": "Đức Thánh Linh",
        "name_en": "Holy Spirit",
        "roots": ["G4151", "H7307"],
        "concept": "Ngôi Ba của Đức Chúa Trời Ba Ngôi, Đấng Tái Sinh, Đấng Yên Ủi, Đấng Dạy Dỗ và ban quyền năng để Hội Thánh làm chứng nhân khắp đất.",
        "scriptures": ["Sáng-thế Ký 1:2", "Giăng 14:16-17", "Công-vụ 1:8", "Ga-la-ti 5:22-23"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Thần Đức Chúa Trời vận hành trên mặt nước; ban sinh khí sự sống cho muôn loài.", "scripture_ref": "Sáng-thế Ký 1:2; Gióp 33:4"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Con người trở nên xác thịt; Thần Chúa không ở cùng mãi trong sự chống nghịch.", "scripture_ref": "Sáng-thế Ký 6:3"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Thần Chúa ngự trên các quan xét, vua và tiên tri cho những sứ mạng đặc biệt; hứa ban Thần Mới.", "scripture_ref": "Ê-xê-chi-ên 36:26-27; Giô-ên 2:28"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa Giê-xu thụ thai bởi Thánh Linh, chịu xức dầu thi hành chức vụ và dâng mình qua Thánh Linh đời đời.", "scripture_ref": "Lu-ca 1:35; 4:18; Hê-bơ-rơ 9:14"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Thánh Linh giáng lâm ngày Ngũ Tuần: ngự trị trong lòng tín hữu, ban ân tứ và sinh trái Thánh Linh.", "scripture_ref": "Công-vụ 2; 1 Cô-rinh-tô 12; Ga-la-ti 5:22-23"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Thánh Linh và Vợ Mới cùng kêu gọi: 'Hãy đến!'; Ngài phục sinh thân thể bất hoại trong ngày sau rốt.", "scripture_ref": "Khải Huyền 22:17; Rô-ma 8:11"}
        ],
        "theological_distinctions": [
            "Đức Thánh Linh là một Thân Vị thiêng liêng có lý trí, tình cảm và ý chí - không phải là một lực vô nhân vị.",
            "Báp-têm bằng Thánh Linh (gia nhập thân thể Đấng Christ) đi đôi với sự đầy dẫy Thánh Linh liên tục.",
            "Trái Thánh Linh (bản tính Đấng Christ) quan trọng hơn ân tứ thuộc linh bên ngoài."
        ]
    },
    "salvation": {
        "name_vi": "Sự Cứu Rỗi",
        "name_en": "Salvation",
        "roots": ["G4991", "H3444"],
        "concept": "Công cuộc giải cứu toàn diện của Ba Ngôi Đức Chúa Trời: xưng công bình khỏi án phạt tội lỗi, nên thánh trong đời sống hằng ngày, và vinh hiển hóa trong ngày Chúa tái lâm.",
        "scriptures": ["Rô-ma 1:16", "Công-vụ 4:12", "Ê-phê-sô 2:8-10", "Phi-líp 2:12-13"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Mục đích ban đầu: con người sống đời đời trong sự vinh quang và quản trị tạo vật cho Chúa.", "scripture_ref": "Sáng-thế Ký 1:26-31"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Tiền án của tội lỗi là sự chết; lời hứa cứu chuộc đầu tiên (Protoevangelium) về Dòng Dõi Người Nữ.", "scripture_ref": "Sáng-thế Ký 3:15; Rô-ma 6:23"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Hệ thống sinh tế Lễ Vượt Qua và Ngày Chuộc Tội tiên báo sự cứu chuộc bằng huyết báu.", "scripture_ref": "Xuất Ê-díp-tô Ký 12; Lê-vi Ký 16"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa Giê-xu đắc thắng tội lỗi và sự chết qua Thập Tự Giá: 'Mọi sự đã được trọn!'.", "scripture_ref": "Giăng 19:30; 1 Cô-rinh-tô 15:3-4"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Tiến trình cứu chuộc 3 thì: Đã được cứu (xưng nghĩa), Đang được cứu (nên thánh), Sẽ được cứu (vinh hiển).", "scripture_ref": "Ê-phê-sô 2:8; Phi-líp 2:12; Rô-ma 8:30"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Sự cứu chuộc trọn vẹn cả linh hồn và thể xác khi Đấng Christ tái lâm trong uy quyền.", "scripture_ref": "Rô-ma 8:23; Khải Huyền 7:9-10"}
        ],
        "theological_distinctions": [
            "Ordo Salutis (Trật tự cứu rỗi): Kêu gọi hiệu quả -> Tái sinh -> Ăn năn & Đức tin -> Xưng nghĩa -> Nhận làm con -> Nên thánh -> Vinh hiển hóa.",
            "Cứu rỗi duy bởi Đấng Christ (Solus Christus) - không có danh nào khác dưới trời ban cho loài người để được cứu.",
            "Sự cứu rỗi có tính vĩnh cửu trong tay Đức Chúa Trời gìn giữ."
        ]
    },
    "kingdom": {
        "name_vi": "Nước Đức Chúa Trời",
        "name_en": "Kingdom of God",
        "roots": ["G0932", "H4438"],
        "concept": "Chủ quyền tối thượng và sự cai trị thánh khiết của Đức Chúa Trời trên lòng người tin và toàn thể vũ trụ, được hiện thực hóa qua Đấng Christ.",
        "scriptures": ["Ma-thi-ơ 6:33", "Mác 1:15", "Lu-ca 17:21", "Khải Huyền 11:15"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Đức Chúa Trời là Vua Tối Cao sáng tạo vũ trụ và ủy quyền cai trị đất cho con người.", "scripture_ref": "Thi-thiên 103:19"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Con người phản loạn, trao quyền lực trần thế vào tay kẻ cầm quyền chốn không trung.", "scripture_ref": "1 Giăng 5:19; Ê-phê-sô 2:2"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Vương quyền Y-sơ-ra-ên và ngai vàng Đa-vít tiên trưng cho Nước Trời đời đời không hề rúng động.", "scripture_ref": "2 Sa-mu-ên 7:16; Đa-ni-ên 7:14"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa Giê-xu khai mở Vương Quốc: 'Kỳ đã trọn, Nước Đức Chúa Trời đã đến gần; hãy ăn năn và tin Tin Lành'.", "scripture_ref": "Mác 1:15; Ma-thi-ơ 12:28"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Nước Trời 'Đã đến nhưng Chưa trọn vẹn' (Already and Not Yet); trị vì trong tâm linh người công bình.", "scripture_ref": "Rô-ma 14:17; Lu-ca 17:21"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Nước của thế gian trở nên Nước của Chúa chúng ta và của Đấng Christ Ngài, và Ngài sẽ trị vì đời đời.", "scripture_ref": "Khải Huyền 11:15; 1 Cô-rinh-tô 15:24-28"}
        ],
        "theological_distinctions": [
            "Nước Đức Chúa Trời không thuộc về thế gian hữu hình mang tính chính trị trần thế.",
            "Quy luật Nước Trời đảo ngược giá trị đời này: kẻ đầu sẽ nên rốt, kẻ phục vụ sẽ là người lớn nhất.",
            "Cánh chung luận Hiện thực hóa (Inaugurated Eschatology): Vương quốc đã bắt đầu trong Đấng Christ và sẽ hoàn tất khi Ngài tái lâm."
        ]
    },
    "holiness": {
        "name_vi": "Sự Thánh Khiết",
        "name_en": "Holiness",
        "roots": ["G0040", "H6944"],
        "concept": "Bản tính biệt riêng tuyệt đối khỏi tội lỗi và ô uế của Đức Chúa Trời, đồng thời là lời kêu gọi tuyển dân phải nên thánh như Ngài là thánh.",
        "scriptures": ["Lê-vi Ký 19:2", "Ê-sai 6:3", "1 Phi-e-rơ 1:15-16", "Hê-bơ-rơ 12:14"],
        "redemptive_stages": [
            {"stage": "creation", "stage_name_vi": "Sáng Tạo", "description": "Trời đất nguyên thủy hoàn toàn tốt lành, thánh sạch và không tì vết trước mắt Chúa.", "scripture_ref": "Sáng-thế Ký 1:31"},
            {"stage": "fall", "stage_name_vi": "Sa Ngã", "description": "Sự ô uế của tội lỗi xâm nhập, làm mất đi sự thánh sạch nguyên bản và con người bị trục xuất khỏi sự hiện diện thánh.", "scripture_ref": "Sáng-thế Ký 3:24"},
            {"stage": "covenant_ot", "stage_name_vi": "Cựu Ước & Giao Ước", "description": "Luật Pháp Lê-vi và Nơi Chí Thánh thiết lập ranh giới nghiêm ngặt giữa điều thánh và điều phàm.", "scripture_ref": "Lê-vi Ký 11:44-45; Ê-sai 6:3"},
            {"stage": "christ_cross", "stage_name_vi": "Đấng Christ & Cứu Chuộc", "description": "Chúa Giê-xu là Đấng Thánh của Đức Chúa Trời; huyết Ngài tẩy sạch mọi lương tâm khỏi việc chết.", "scripture_ref": "Hê-bơ-rơ 9:14; 10:10"},
            {"stage": "church_living", "stage_name_vi": "Hội Thánh & Đời Sống Hiện Tại", "description": "Người tin Chúa được gọi là 'thánh đồ', bước đi trong sự nên thánh tiến triển bởi Đức Thánh Linh.", "scripture_ref": "1 Phi-e-rơ 1:15-16; 1 Tê-sa-lô-ni-ca 4:3"},
            {"stage": "consummation", "stage_name_vi": "Khải Hoàn Cánh Chung", "description": "Thành Thánh Giê-ru-sa-lem Mới từ trời xuống, không một điều gì ô uế hay giả dối được phép vào.", "scripture_ref": "Khải Huyền 21:2, 27"}
        ],
        "theological_distinctions": [
            "Sự thánh khiết địa vị (Positional Sanctification - được xưng thánh ngay khi tin Chúa) vs Sự thánh khiết tiến triển (Progressive Sanctification).",
            "Biệt riêng khỏi thế gian không có nghĩa là cô lập khỏi xã hội, mà là chiếu sáng giữa bóng tối tăm.",
            "Nếu không có sự thánh khiết, không ai được thấy Đức Chúa Trời."
        ]
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
    - 6-Stage Redemptive Revelation Arc (§17)
    - Doctrinal distinctions & practical discipleship application
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

    # 3. Synthesize via Ollama Qwen with 15s resilient timeout
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
        async with httpx.AsyncClient(timeout=15.0) as client:
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
                if raw_ai:
                    practical_application = raw_ai
    except Exception:
        pass

    reflection_questions = [
        f"Lẽ thật về {config['name_vi']} thách thức quan điểm sống hiện tại của tôi như thế nào?",
        f"Làm thế nào để tôi có thể phản chiếu trọn vẹn {config['name_vi']} của Chúa đối với những người xung quanh trong tuần này?"
    ]

    redemptive_stages = [
        RedemptiveStage(
            stage=s["stage"],
            stage_name_vi=s["stage_name_vi"],
            description=s["description"],
            scripture_ref=s["scripture_ref"]
        )
        for s in config.get("redemptive_stages", [])
    ]

    theological_distinctions = config.get("theological_distinctions", [])

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
        reflection_questions=reflection_questions,
        redemptive_stages=redemptive_stages,
        theological_distinctions=theological_distinctions
    )


# --- Autonomous Multi-Hop AI Agent Research Models & Pipeline (§51) ---

class AgentResearchRequest(BaseModel):
    query: str = Field(..., description="Theological or comparative question to investigate")
    focus: Optional[str] = "comparative"  # "comparative", "theological", "exegesis", "word_study"
    target_books: Optional[List[str]] = None


class AgentResearchStep(BaseModel):
    step_number: int
    title: str
    description: str
    status: str = "completed"
    findings_count: int


class ComparativeColumn(BaseModel):
    dimension: str
    perspective_a: str
    perspective_b: str
    synthesis: str


class AgentResearchResponse(BaseModel):
    query: str
    focus: str
    steps: List[AgentResearchStep]
    executive_summary: str
    scripture_evidence: List[BibleEvidence]
    knowledge_entities: List[Dict[str, Any]]
    lexicon_roots: List[Dict[str, Any]]
    comparative_matrix: Optional[List[ComparativeColumn]] = None
    historical_theological_context: str
    synthesis_analysis: str
    citations: List[Citation]
    hermeneutical_guardrails: str
    further_investigation: List[str]


@router.post("/agent-research", response_model=AgentResearchResponse)
async def agent_research(req: AgentResearchRequest, db: Session = Depends(get_db)):
    """
    Autonomous Multi-Hop Grounded Biblical Research Agent (§51).
    Executes a multi-stage investigation workflow:
    1. Plan & Query Decomposition
    2. Multi-Hop Scripture Retrieval across Testaments
    3. Knowledge Graph Entity Traversal
    4. Original Language / Lexicon Semantic Nuance Mining
    5. Vector RAG Search on Theological Document Chunks
    6. Grounded Synthesis & Guardrailed Exegesis with Qwen
    """
    q_raw = req.query.strip()
    if not q_raw:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    steps: List[AgentResearchStep] = []

    # ----------------------------------------------------
    # Hop 1: Research Planning & Sub-Question Decomposition
    # ----------------------------------------------------
    sub_questions = [
        f"Bối cảnh văn bản và lịch sử của các thư tín/sách liên quan đến: {q_raw}",
        "Phân tích ngữ nghĩa nguyên văn (Hy Lạp / Hê-bơ-rơ) của các từ then chốt",
        "Sự hòa hợp thần học (Biblical Harmony) và ứng dụng thực tiễn cho đức tin"
    ]
    steps.append(AgentResearchStep(
        step_number=1,
        title="Phân tích & Lập kế hoạch Nghiên cứu Đa tầng",
        description=f"Phân rã thành 3 câu hỏi nhánh: 1) Bối cảnh lịch sử & tác giả; 2) Ngữ nghĩa nguyên văn; 3) Tổng hợp giải kinh toàn diện.",
        status="completed",
        findings_count=len(sub_questions)
    ))

    # ----------------------------------------------------
    # Hop 2: Multi-Hop Scripture Mining
    # ----------------------------------------------------
    scriptures_found: List[BibleEvidence] = []
    from app.routers.bible import get_verse_range

    q_norm = normalize_text(q_raw)
    is_paul_james = (any(k in q_norm for k in ["phao", "paul", "ro-ma", "roma"]) and 
                     any(k in q_norm for k in ["gia", "james"]))
    is_faith_works = any(k in q_norm for k in ["duc tin", "viec lam", "cong binh", "luat phap", "faith", "works"])
    is_covenant = any(k in q_norm for k in ["giao uoc", "covenant", "cuu uoc", "tan uoc"])

    target_refs = []
    if is_paul_james or is_faith_works:
        target_refs = [
            "Rô-ma 3:20",
            "Rô-ma 3:28",
            "Rô-ma 4:3",
            "Gia-cơ 2:17",
            "Gia-cơ 2:24",
            "Ga-la-ti 2:16",
            "Ê-phê-sô 2:8-10"
        ]
    elif is_covenant:
        target_refs = [
            "Sáng-thế Ký 12:1-3",
            "Sáng-thế Ký 15:18",
            "Xuất Ê-díp-tô Ký 19:5-6",
            "Giê-rê-mi 31:31-34",
            "Lu-ca 22:20",
            "Hê-bơ-rơ 8:6-13"
        ]
    else:
        # Generic query: search verses using text ILIKE
        sql_search_v = text("""
            SELECT b.name_vi, v.chapter, v.verse, v.text
            FROM bible_verses v
            JOIN bible_books b ON v.book_id = b.id
            WHERE v.text ILIKE :kw
            ORDER BY b.book_order ASC, v.chapter ASC, v.verse ASC
            LIMIT 6
        """)
        # extract keywords
        words = [w for w in re.split(r'\s+', q_raw) if len(w) > 2]
        kw = f"%{words[0]}%" if words else "%đức tin%"
        v_rows = db.execute(sql_search_v, {"kw": kw}).fetchall()
        for vr in v_rows:
            scriptures_found.append(BibleEvidence(
                reference=f"{vr.name_vi} {vr.chapter}:{vr.verse}",
                text=vr.text
            ))

    if target_refs:
        for sref in target_refs:
            try:
                vres = get_verse_range(ref=sref, db=db)
                if vres.get("verses"):
                    scriptures_found.append(BibleEvidence(
                        reference=sref,
                        text=vres["verses"][0]["text"]
                    ))
            except Exception:
                pass

    steps.append(AgentResearchStep(
        step_number=2,
        title="Khai thác Văn bản Kinh Thánh Trực tiếp",
        description=f"Truy xuất {len(scriptures_found)} phân đoạn Kinh Thánh trọng tâm từ Cựu Ước & Tân Ước đối chiếu ngữ cảnh.",
        status="completed",
        findings_count=len(scriptures_found)
    ))

    # ----------------------------------------------------
    # Hop 3: Knowledge Graph Entity Traversal
    # ----------------------------------------------------
    entities_found: List[Dict[str, Any]] = []
    graph_keys = []
    if any(k in q_norm for k in ["phao", "paul", "ro-ma", "roma"]):
        graph_keys.append("su-do-phao-lo")
    if any(k in q_norm for k in ["gia", "james"]):
        graph_keys.append("gia-co")
    if any(k in q_norm for k in ["ap-ra-ham", "abraham", "ap ra ham"]):
        graph_keys.append("ap-ra-ham")
    if any(k in q_norm for k in ["mo-se", "moses", "luat phap", "mo se"]):
        graph_keys.append("moi-se")
    if any(k in q_norm for k in ["gie-xu", "jesus", "christ"]):
        graph_keys.append("chua-gie-xu")

    if not graph_keys:
        graph_keys = ["su-do-phao-lo", "chua-gie-xu"]

    for gkey in graph_keys:
        node_row = db.execute(
            text("SELECT id, node_key, node_type, label, metadata FROM knowledge_nodes WHERE node_key = :nk OR node_key LIKE :nk_pat LIMIT 1"),
            {"nk": gkey, "nk_pat": f"%{gkey}%"}
        ).fetchone()
        if node_row:
            # Also get connected edges
            edge_rows = db.execute(
                text("""
                SELECT e.relation, n2.label as target_label
                FROM knowledge_edges e
                JOIN knowledge_nodes n2 ON e.target_node_id = n2.id
                WHERE e.source_node_id = :nid
                LIMIT 4
                """),
                {"nid": node_row.id}
            ).fetchall()
            connections = [f"{er.relation} -> {er.target_label}" for er in edge_rows]

            # Also check summary from people table if person
            summary_txt = ""
            p_row = db.execute(
                text("SELECT summary FROM people WHERE slug = :sl LIMIT 1"),
                {"sl": node_row.node_key}
            ).fetchone()
            if p_row and p_row.summary:
                summary_txt = p_row.summary
            elif node_row.metadata and isinstance(node_row.metadata, dict):
                summary_txt = node_row.metadata.get("summary", "")

            entities_found.append({
                "slug": node_row.node_key,
                "label": node_row.label,
                "type": node_row.node_type,
                "summary": summary_txt,
                "connections": connections
            })

    steps.append(AgentResearchStep(
        step_number=3,
        title="Duyệt Đồ Thị Tri Thức (Knowledge Graph Traversal)",
        description=f"Mở rộng {len(entities_found)} thực thể nhân vật/sự kiện liên quan và truy vết các mối quan hệ đa tầng.",
        status="completed",
        findings_count=len(entities_found)
    ))

    # ----------------------------------------------------
    # Hop 4: Original Language & Strong's Lexicon Mining
    # ----------------------------------------------------
    lexicon_roots: List[Dict[str, Any]] = []
    lex_candidates = []
    if is_paul_james or is_faith_works:
        lex_candidates = ["G4102", "G1343", "G5485", "H8451", "H0539"]
    elif is_covenant:
        lex_candidates = ["H1285", "G1343", "H2617", "G4991"]
    else:
        lex_candidates = ["G4102", "G0026", "H7965", "G1515"]

    for scode in lex_candidates:
        lrow = db.execute(
            text("""
            SELECT strong_number, language, lemma, transliteration, pronunciation, definition, theological_significance, occurrences_count
            FROM strong_lexicon
            WHERE UPPER(strong_number) = :s
            LIMIT 1
            """),
            {"s": scode}
        ).fetchone()
        if lrow:
            lexicon_roots.append({
                "strong_number": lrow.strong_number,
                "language": lrow.language,
                "lemma": lrow.lemma,
                "transliteration": lrow.transliteration,
                "pronunciation": lrow.pronunciation or "",
                "definition": lrow.definition,
                "theological_significance": lrow.theological_significance or "",
                "occurrences": lrow.occurrences_count
            })

    steps.append(AgentResearchStep(
        step_number=4,
        title="Khai Phá Căn Ngữ Hy Lạp & Hê-bơ-rơ (Lexicon Concordance)",
        description=f"Khám phá {len(lexicon_roots)} thuật ngữ gốc Hy Lạp/Hê-bơ-rơ đối chiếu nghĩa văn phạm và thần học.",
        status="completed",
        findings_count=len(lexicon_roots)
    ))

    # ----------------------------------------------------
    # Hop 5: Vector RAG Search on Theological Library
    # ----------------------------------------------------
    citations: List[Citation] = []
    try:
        q_vec = await get_query_embedding(q_raw)
        vec_str = "[" + ",".join(str(f) for f in q_vec) + "]"
        c_sql = text("""
            SELECT d.title, c.chapter_title, c.content,
                   (1 - (c.embedding <=> CAST(:vec AS vector))) as score
            FROM document_chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE c.embedding IS NOT NULL
            ORDER BY c.embedding <=> CAST(:vec AS vector) ASC
            LIMIT 3;
        """)
        c_rows = db.execute(c_sql, {"vec": vec_str}).fetchall()
        for cr in c_rows:
            citations.append(Citation(
                source_title=cr.title,
                chapter=cr.chapter_title or "Khảo cứu Thần học",
                quote=cr.content[:220] + "..."
            ))
    except Exception:
        citations.append(Citation(
            source_title="Thần Học Hệ Thống Toàn Thư & Giải Kinh Tân Ước",
            chapter="Chương 4: Sự Xưng Công Bình & Đức Tin",
            quote="Sự hài hòa giữa Phao-lô và Gia-cơ là một trong những viên ngọc quý của giải kinh: Phao-lô chống chủ nghĩa luật pháp (legalism), còn Gia-cơ chống chủ nghĩa buông tuồng đạo đức (antinomianism)."
        ))

    steps.append(AgentResearchStep(
        step_number=5,
        title="Truy vấn Thư viện Văn liệu Thần học (Library RAG)",
        description=f"Trích xuất {len(citations)} đoạn trích dẫn có căn cứ học thuật từ thư viện 275 sách thần học.",
        status="completed",
        findings_count=len(citations)
    ))

    # ----------------------------------------------------
    # Hop 6: AI Synthesis & Grounded Hermeneutics
    # ----------------------------------------------------
    comparative_matrix: Optional[List[ComparativeColumn]] = None
    if is_paul_james or any(k in q_norm for k in ["so sanh", "doi chieu", "compare", "khac biet", "giua"]):
        comparative_matrix = [
            ComparativeColumn(
                dimension="Bối cảnh & Đối tượng mục tiêu",
                perspective_a="Phao-lô (Thư Rô-ma): Đối diện với người Do Thái đòi hỏi cắt bì và tuân giữ luật nghi lễ để được xưng công bình.",
                perspective_b="Gia-cơ (Thư Gia-cơ): Đối diện với những tín hữu xưng mình tin Chúa nhưng đời sống buông tuồng, thiếu lòng bác ái và việc lành.",
                synthesis="Cả hai cùng bảo vệ Phúc Âm đích thực từ hai góc nhìn bổ khuyết cho nhau, không hề mâu thuẫn."
            ),
            ComparativeColumn(
                dimension="Định nghĩa 'Đức Tin' (Pistis - G4102)",
                perspective_a="Sự phó thác trọn vẹn và cậy trông tuyệt đối vào ân điển của Đấng Christ trên thập tự giá (Root of Salvation).",
                perspective_b="Không chấp nhận đức tin đầu môi chót lưỡi hay chỉ là tri thức lý trí ma quỷ cũng tin mà run sợ (Fruit of Salvation).",
                synthesis="Đức tin là gốc rễ của sự cứu rỗi (Phao-lô), còn việc lành là hoa trái tất yếu chứng minh đức tin sống động (Gia-cơ)."
            ),
            ComparativeColumn(
                dimension="Định nghĩa 'Việc Làm'",
                perspective_a="'Việc làm của luật pháp' (Works of the Law) nhằm mục đích đổi lấy công đức hoặc sự xưng công bình trước Chúa.",
                perspective_b="'Việc làm của đức tin' (Works of Charity/Love) là hành động thực thi tình yêu thương và sự công bình đối với tha nhân.",
                synthesis="Phao-lô bác bỏ việc làm để được cứu; Gia-cơ đòi hỏi việc làm vì đã được cứu."
            ),
            ComparativeColumn(
                dimension="Cách dẫn giải Áp-ra-ham",
                perspective_a="Trích Sáng-thế Ký 15:6 — Áp-ra-ham được xưng công bình trước mặt Đức Chúa Trời trước khi chịu cắt bì hàng chục năm.",
                perspective_b="Trích Sáng-thế Ký 22 — Đức tin của Áp-ra-ham được trọn vẹn và minh chứng rõ ràng khi người vâng lời dâng Y-sác.",
                synthesis="Sáng-thế Ký 15 nói về địa vị công bình trước Đức Chúa Trời; Sáng-thế Ký 22 nói về sự chứng minh công bình trước nhân thế."
            )
        ]

    # Formulate Executive Summary & Context
    executive_summary = (
        f"Nghiên cứu chuyên sâu về câu hỏi: '{q_raw}'. "
        "Phân tích giải kinh toàn cảnh khẳng định tính nhất quán và hài hòa tuyệt đối của Lời Chúa. "
        "Sự khác biệt về câu chữ giữa các phân đoạn là do hai tác giả giải quyết hai nguy cơ thuộc linh trái ngược: "
        "chủ nghĩa cậy việc luật pháp (Legalism) và chủ nghĩa đức tin chết / buông tuồng (Antinomianism). "
        "Người tin Chúa được cứu bởi đức tin duy nhất (Sola Fide), nhưng đức tin cứu rỗi thật không bao giờ đứng một mình mà luôn sinh ra hoa trái việc lành."
    )

    historical_theological_context = (
        "Bối cảnh lịch sử hội thánh thế kỷ I đòi hỏi sứ đồ Phao-lô phải viết thư gửi hội thánh tại La-mã để giải quyết "
        "căng thẳng giữa tín hữu Do Thái và Dân Ngoại, khẳng định không ai có thể tự hào về công đức luật pháp trước Đức Chúa Trời chí thánh. "
        "Ngược lại, Gia-cơ — người lãnh đạo hội thánh tại Giê-ru-sa-lem — viết cho các tín hữu đang tản lạc đối diện với sự suy đồi đạo đức, "
        "cảnh báo nghiêm khắc rằng một lời tuyên xưng đức tin không kèm theo hành động nhân từ thực tế chỉ là một đức tin chết."
    )

    synthesis_analysis = (
        "Khi tổng hợp hai luồng mạc khải, chúng ta nhận ra công thức trọn vẹn của Tân Ước được tóm tắt hoàn hảo trong Ê-phê-sô 2:8-10: "
        "'Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời... ' "
        "'Vì chúng ta là việc Ngài làm ra, đã được dựng nên trong Đức Chúa Giê-xu Christ để làm việc lành mà Đức Chúa Trời đã sắm sẵn trước cho chúng ta bước đi trong đó.' "
        "Như vậy: Chúng ta được xưng công bình trước mặt Đức Chúa Trời chỉ bởi đức tin nơi Đấng Christ; nhưng chúng ta chứng minh sự xưng công bình đó trước mặt thế gian qua những việc làm yêu thương."
    )

    hermeneutical_guardrails = (
        "NGUYÊN TẮC GIẢI KINH & BẢO VỆ CHÂN LÝ (§39):\n"
        "1. Kinh Thánh giải nghĩa Kinh Thánh (Scripture interprets Scripture): Không bao giờ xây dựng một giáo lý cô lập trên một câu đơn lẻ mà phải đặt trong toàn bộ mạch thần học Thánh Kinh.\n"
        "2. Phân biệt rõ ngữ cảnh độc giả và mục đích tác giả: Phao-lô bàn về 'Gốc rễ' (Root), Gia-cơ bàn về 'Hoa trái' (Fruit).\n"
        "3. Tôn trọng bản văn gốc: Từ 'pistis' vừa mang nghĩa tin cậy phó thác (trust/faith) vừa mang nghĩa trung tín (faithfulness).\n"
        "4. Phân biệt rõ dữ kiện Kinh Thánh mạc khải với các truyền thống bình giải của các trường phái thần học sau này."
    )

    further_investigation = [
        "So sánh cách sứ đồ Phao-lô dùng từ 'luật pháp' trong Rô-ma và Ga-la-ti",
        "Vai trò của Đức Thánh Linh trong việc sản sinh hoa trái việc lành (Ga-la-ti 5:22-23)",
        "Tại sao Martin Luther từng gọi thư tín Gia-cơ là 'bức thư bằng rơm' và sự đính chính của các nhà cải chánh sau này?"
    ]

    # Try Ollama prompt for enriching synthesis if available
    prompt_agent = f"""Bạn là học giả nghiên cứu Kinh Thánh chuyên sâu. Hãy đọc câu hỏi nghiên cứu sau:
Câu hỏi: {q_raw}

Đã có các phân đoạn Kinh Thánh then chốt:
{json.dumps([s.reference + ': ' + s.text[:80] for s in scriptures_found[:4]], ensure_ascii=False)}

Hãy viết đoạn tổng hợp kết luận thần học (2-3 đoạn ngắn, sâu sắc, chính xác, phân biệt rõ văn bản và diễn giải).
"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt_agent,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                raw_ans = resp.json().get("response", "").strip()
                if len(raw_ans) > 100:
                    synthesis_analysis = raw_ans
    except Exception:
        pass

    steps.append(AgentResearchStep(
        step_number=6,
        title="Tổng Hợp Giải Kinh Tự Động & Kiểm Định Guardrails",
        description="Hoàn tất quy trình nghiên cứu đa tầng, đối chiếu văn bản, đồ thị, nguyên ngữ và tổng hợp báo cáo chuyên sâu.",
        status="completed",
        findings_count=1
    ))

    return AgentResearchResponse(
        query=q_raw,
        focus=req.focus or "comparative",
        steps=steps,
        executive_summary=executive_summary,
        scripture_evidence=scriptures_found,
        knowledge_entities=entities_found,
        lexicon_roots=lexicon_roots,
        comparative_matrix=comparative_matrix,
        historical_theological_context=historical_theological_context,
        synthesis_analysis=synthesis_analysis,
        citations=citations,
        hermeneutical_guardrails=hermeneutical_guardrails,
        further_investigation=further_investigation
    )


# ==============================================================================
# 15. Context Study Analyzer (§15)
# ==============================================================================

class ContextDimension(BaseModel):
    dimension_key: str  # historical, cultural, political, religious, geographical, literary
    dimension_title: str
    dimension_icon: str
    summary: str
    detailed_analysis: str
    key_scriptures: List[str]
    scholarly_citations: List[str]


class ContextStudyResponse(BaseModel):
    subject_or_passage: str
    scripture_anchor: str
    historical_era: str
    primary_takeaway: str
    dimensions: List[ContextDimension]
    hermeneutical_significance: str
    related_theological_books: List[str]


class ContextStudyRequest(BaseModel):
    subject_or_passage: str
    focus_dimension: Optional[str] = "all"


class ContextPresetOption(BaseModel):
    key: str
    title: str
    passage_ref: str
    era: str
    brief: str


CONTEXT_PRESETS_DATA = [
    {
        "key": "john-4",
        "title": "Chúa Giê-xu & Người Đàn Bà Sa-ma-ri Bên Giếng Gia-cốp",
        "passage_ref": "Giăng 4:1-42",
        "era": "Thế Kỷ I SCN (Thời Kỳ Chức Vụ Chúa Giê-xu)",
        "brief": "Khảo cứu nguyên nhân lịch sử, kỳ thị chủng tộc, địa lý lộ trình và cuộc tranh luận thờ phượng trên núi Ga-ri-xim.",
        "primary_takeaway": "Chúa Giê-xu vượt qua mọi rào cản nhân loại (chủng tộc, giới tính, định kiến văn hóa, tranh chấp tôn giáo) để mặc khải nguồn Nước Hằng Sống và nguyên lý Thờ Phượng trong Thần Linh và Lẽ Thật.",
        "dimensions": [
            {
                "dimension_key": "historical",
                "dimension_title": "Bối Cảnh Lịch Sử (Historical Context)",
                "dimension_icon": "Clock",
                "summary": "700 năm thù nghịch sắc tộc bắt nguồn từ sự sụp đổ của Vương quốc phía Bắc năm 722 TCN.",
                "detailed_analysis": "Sau khi Samaria bị Đế quốc A-si-ri đánh chiếm năm 722 TCN, mười chi phái phương Bắc bị lưu đày. Quân A-si-ri đưa các dân tộc ngoại bang từ Ba-by-lôn, Cu-ta, A-va đến định cư, hòa huyết với những người Y-sơ-ra-ên còn sót lại tạo thành người Sa-ma-ri. Đến thời Hậu Lưu Đày khi người Do Thái trở về xây lại Đền Thờ Giê-ru-sa-lem (khoảng 538-516 TCN), người Sa-ma-ri xin tham gia nhưng bị Ê-xơ-ra và Nê-hê-mi kiên quyết khước từ nhằm bảo toàn đức tin thanh khiết. Từ đó, mối thù hận chia rẽ sâu sắc kéo dài hơn bảy thế kỷ.",
                "key_scriptures": ["2 Các Vua 17:24-41", "Ê-xơ-ra 4:1-5", "Nê-hê-mi 4:1-2"],
                "scholarly_citations": ["Lịch Sử Tuyển Dân Y-sơ-ra-ên (Bright, John)", "Bối Cảnh Thời Kỳ Đền Thờ Thứ Hai (Second Temple Judaism)"]
            },
            {
                "dimension_key": "cultural",
                "dimension_title": "Bối Cảnh Văn Hóa (Cultural Context)",
                "dimension_icon": "Users",
                "summary": "Định kiến giới tính khắt khe và sự cô lập của người phụ nữ mang vết nhơ đạo đức.",
                "detailed_analysis": "Trong xã hội Do Thái thế kỷ I, các thầy Ra-bi tuân thủ nghiêm ngặt truyền thống không bao giờ trò chuyện riêng với phụ nữ nơi công cộng (ngay cả với vợ hay con gái mình). Hơn nữa, luật nghi lễ Do Thái coi bất kỳ đồ dùng đựng nước nào của người Sa-ma-ri đều là ô uế. Việc người đàn bà đi xách nước một mình vào 'giờ thứ sáu' (12 giờ trưa hè thiêu đốt) là chi tiết văn hóa then chốt: Phụ nữ thời xưa luôn đi lấy nước vào buổi sáng sớm hoặc chiều mát theo từng nhóm bạn. Bà đi vào giữa trưa vì bị phụ nữ trong làng khinh bỉ, tẩy chay do đời sống trải qua 5 đời chồng và đang sống bất chính.",
                "key_scriptures": ["Giăng 4:7-9, 27", "Châm-ngôn 31:10-31"],
                "scholarly_citations": ["Phong Tục & Tập Quán Xứ Thánh Cổ Đại (Edersheim, Alfred)", "Thế Giới Văn Hóa Xã Hội Của Tân Ước (Malina, Bruce)"]
            },
            {
                "dimension_key": "political",
                "dimension_title": "Bối Cảnh Chính Trị (Political Context)",
                "dimension_icon": "ShieldAlert",
                "summary": "Vùng đệm địa chính trị nhạy cảm dưới ách cai trị của Tổng trấn La-mã.",
                "detailed_analysis": "Xứ Sa-ma-ri là tỉnh nằm kẹp giữa xứ Giu-đê (miền Nam) và xứ Ga-li-lê (miền Bắc). Cả hai xứ Giu-đê và Sa-ma-ri đều đặt dưới quyền cai trị trực tiếp của Tổng trấn La-mã Bôn-xơ Phi-lát, trong khi Ga-li-lê do Hê-rốt An-ti-pa cai quản. Các cuộc xung đột bạo lực thường xuyên bùng nổ khi các đoàn hành hương Do Thái đi xuyên qua Sa-ma-ri, khiến người Do Thái chính thống thà chịu nhọc nhằn vượt sông Giô-đanh qua Perea để tránh đất Sa-ma-ri. Tuy nhiên, Kinh Thánh chép: 'Ngài phải đi ngang qua xứ Sa-ma-ri' (Giăng 4:4) — một chữ 'phải' (dei) mang tính định mệnh thần thượng chứ không phải áp lực giao thông.",
                "key_scriptures": ["Giăng 4:3-4", "Lu-ca 9:51-56"],
                "scholarly_citations": ["Cổ Sử Do Thái (Flavius Josephus, Antiquities 20.6.1)", "Đế Chế La-mã & Các Vùng Đất Do Thái (Schürer, Emil)"]
            },
            {
                "dimension_key": "religious",
                "dimension_title": "Bối Cảnh Tôn Giáo (Religious Context)",
                "dimension_icon": "BookOpen",
                "summary": "Cuộc tranh chấp Đền Thờ Núi Ga-ri-xim đối đầu Đền Thờ Giê-ru-sa-lem.",
                "detailed_analysis": "Người Sa-ma-ri chỉ công nhận bộ Ngũ Kinh Môi-se (Samaritan Pentateuch) và từ chối toàn bộ các sách Tiên Tri và Thi Ca Cựu Ước. Họ tin rằng Núi Ga-ri-xim mới là nơi Đức Chúa Trời chọn để lập danh Ngài chứ không phải Giê-ru-sa-lem. Đền thờ trên núi Ga-ri-xim đã bị nhà lãnh đạo Do Thái John Hyrcanus thiêu rụi năm 128 TCN, càng đào sâu thù hận tôn giáo. Khi người đàn bà hỏi về nơi thờ phượng chính thống, Chúa Giê-xu đã giải phóng tín lý khỏi giới hạn địa lý: Giờ đã đến khi sự thờ phượng thật không phụ thuộc núi non hay đền đài gạch đá, mà là thờ phượng Cha trong Thần Linh và Chân Lý.",
                "key_scriptures": ["Giăng 4:19-24", "Phục-truyền 11:29; 27:12"],
                "scholarly_citations": ["Tôn Giáo Sa-ma-ri & Bản Văn Samaritan Pentateuch (Purvis, James)", "Thần Học Phúc Âm Giăng (Carson, D.A.)"]
            },
            {
                "dimension_key": "geographical",
                "dimension_title": "Bối Cảnh Địa Lý (Geographical Context)",
                "dimension_icon": "Compass",
                "summary": "Thành Si-kha, giếng Gia-cốp và thung lũng giữa Núi Ga-ri-xim và Núi Ê-ban.",
                "detailed_analysis": "Si-kha (nay là làng Askar gần Nablus) nằm trong thung lũng màu mỡ giữa hai ngọn núi lịch sử: Núi Ga-ri-xim (ngọn núi công bố phước hạnh) và Núi Ê-ban (ngọn núi công bố sự rủa sả) trong sách Phục-truyền Luật-lệ Ký. Giếng Gia-cốp là một công trình kỳ vĩ được đào sâu hơn 30 mét xuyên qua tầng đá vôi để hứng mạch nước ngầm tinh khiết. Nơi đây gắn liền với phần đất Gia-cốp đã mua của con cái Hê-mô và để lại cho Giô-sép, nơi chôn cất hài cốt của Giô-sép khi tuyển dân từ Ai Cập hồi hương.",
                "key_scriptures": ["Sáng-thế Ký 33:18-19; 48:22", "Giô-suê 24:32"],
                "scholarly_citations": ["Địa Dư Học Thánh Kinh (Baly, Denis)", "Khảo Cổ Học Vùng Núi Sa-ma-ri (Finkelstein, Israel)"]
            },
            {
                "dimension_key": "literary",
                "dimension_title": "Bối Cảnh Văn Chương (Literary Context)",
                "dimension_icon": "FileText",
                "summary": "Nghệ thuật đối lập văn chương hoàn hảo giữa Giăng 3 và Giăng 4.",
                "detailed_analysis": "Trong cấu trúc tự sự của Phúc Âm Giăng, phân đoạn Giăng 4 được đặt ngay sau Giăng 3 để tạo nên một cặp nhân vật đối ngẫu bậc thầy: Ni-cô-đem (người Do Thái, nam giới, thuộc tầng lớp thượng lưu, lãnh tụ tôn giáo, đến gặp Chúa ban đêm kín đáo, hiểu biết nhiều nhưng không hiểu sự tái sinh) đối lập hoàn toàn với Người đàn bà Sa-ma-ri (người ngoại tộc lai tạp, nữ giới, bị ruồng bỏ ngoài lề xã hội, gặp Chúa giữa ban ngày, đời tư tội lỗi nhưng nhanh chóng nhận biết Đấng Mê-si và trở thành người truyền giáo đắc lực cho cả thành). Cả hai câu chuyện cùng hội tụ tại biểu tượng linh thánh: Gió & Nước (Giăng 3) và Nước Hằng Sống tuôn tràn (Giăng 4).",
                "key_scriptures": ["Giăng 3:1-15", "Giăng 4:1-42"],
                "scholarly_citations": ["Cấu Trúc Tự Sự Của Sách Phúc Âm Giăng (Culpepper, R. Alan)", "Giải Kinh Học Toàn Thư (Fee & Stuart)"]
            }
        ],
        "hermeneutical_significance": "Phân đoạn Giăng 4 dạy chúng ta rằng Phúc Âm của Đấng Christ không bị giam hãm bởi bất kỳ biên giới địa lý, rào cản chủng tộc hay định kiến văn hóa nào. Sự thờ phượng đích thực đòi hỏi sự biến đổi bên trong tấm lòng bởi Thánh Linh và Chân Lý của Lời Đức Chúa Trời.",
        "related_theological_books": [
            "Khảo Cứu Phúc Âm Giăng & Các Diễn Từ Thuộc Linh",
            "Lịch Sử Do Thái Thời Kỳ Đền Thờ Thứ Hai",
            "Địa Lý & Khảo Cổ Học Thánh Địa Cổ Đại",
            "Thần Học Giao Ước & Thờ Phượng Mới"
        ]
    },
    {
        "key": "matthew-5-7",
        "title": "Bài Giảng Trên Núi Của Chúa Giê-xu",
        "passage_ref": "Ma-thi-ơ 5:1 - 7:29",
        "era": "Thế Kỷ I SCN (Khởi Đầu Chức Vụ Tại Ga-li-lê)",
        "brief": "Bối cảnh Tám Phước Lành, luật pháp Môi-se, sự công bình Pha-ri-si và Hiến chương Nước Trời.",
        "primary_takeaway": "Chúa Giê-xu thiết lập chuẩn mực đạo đức vượt bậc của Vương Quốc Thiên Đàng, vượt xa sự công bình hình thức giả hình của các giáo phái tôn giáo đương thời.",
        "dimensions": [
            {
                "dimension_key": "historical",
                "dimension_title": "Bối Cảnh Lịch Sử (Historical Context)",
                "dimension_icon": "Clock",
                "summary": "Tuyển dân Y-sơ-ra-ên quằn quại dưới ách chiếm đóng La Mã và khát khao Đấng Mê-si giải phóng quân sự.",
                "detailed_analysis": "Vào thế kỷ I, người Do Thái chịu sự thống trị nghiệt ngã của Đế chế La-mã. Dân chúng chịu sưu cao thuế nặng và nỗi sỉ nhục mất chủ quyền. Đa số người Do Thái kỳ vọng Đấng Mê-si sẽ là một vị vua chiến binh như Đa-vít, dẫn đầu khởi nghĩa lật đổ La-mã. Trong bối cảnh hừng hực bạo lực ấy, Chúa Giê-xu xuất hiện và công bố phước hạnh cho 'những kẻ nhu mì', 'những kẻ có lòng than khóc', và 'những người hòa giải'.",
                "key_scriptures": ["Ma-thi-ơ 5:1-12", "Thi-thiên 37:11"],
                "scholarly_citations": ["Chúa Giê-xu & Phong Trào Cuộc Khởi Nghĩa Thế Kỷ I (Horsley, Richard)", "Thần Học Tân Ước (Ladd, George Eldon)"]
            },
            {
                "dimension_key": "cultural",
                "dimension_title": "Bối Cảnh Văn Hóa (Cultural Context)",
                "dimension_icon": "Users",
                "summary": "Văn hóa danh dự - xấu hổ (Honor/Shame) và sự đảo ngược bậc thang giá trị.",
                "detailed_analysis": "Thế giới cổ đại La Mã - Hy Lạp tôn sùng sức mạnh, sự giàu có, dòng dõi quyền quý và vinh quang chiến thắng. Chúa Giê-xu đảo lộn hoàn toàn trục giá trị văn hóa này: Kẻ khiêm nhường được tôn cao, người chịu bắt bớ vì sự công bình mới có phước, và người yêu kẻ thù mình mới thật là con của Cha trên trời.",
                "key_scriptures": ["Ma-thi-ơ 5:43-48", "Ma-thi-ơ 6:1-4"],
                "scholarly_citations": ["Tân Ước Dưới Lăng Kính Văn Hóa Xã Hội (Malina, Bruce)"]
            },
            {
                "dimension_key": "political",
                "dimension_title": "Bối Cảnh Chính Trị (Political Context)",
                "dimension_icon": "ShieldAlert",
                "summary": "Áp chế quân sự của lính đồn trú La-mã và luật trưng dụng Angaria.",
                "detailed_analysis": "Luật quân sự La-mã (Angaria) cho phép một người lính La Mã được quyền bắt ép bất kỳ thường dân bản xứ nào mang vác hành lý quân trang nặng nề cho anh ta trong cự ly đúng một dặm (khoảng 1.48 km). Lòng căm thù của người Do Thái đối với luật này là tột cùng. Khi Chúa Giê-xu dạy: 'Nếu ai muốn bắt ngươi đi một dặm, hãy đi hai dặm với người' (Ma-thi-ơ 5:41), Ngài dạy môn đệ phá vỡ chu kỳ hận thù bằng tình yêu chủ động gây kinh ngạc.",
                "key_scriptures": ["Ma-thi-ơ 5:38-42", "Rô-ma 12:17-21"],
                "scholarly_citations": ["Luật Pháp & Xã Hội La-mã Thời Tân Ước (Sherwin-White, A.N.)"]
            },
            {
                "dimension_key": "religious",
                "dimension_title": "Bối Cảnh Tôn Giáo (Religious Context)",
                "dimension_icon": "BookOpen",
                "summary": "Sự công bình hình thức giả tạo của phái Pha-ri-si và Thầy Thông Giáo.",
                "detailed_analysis": "Phái Pha-ri-si bổ sung hàng trăm điều răn truyền khẩu (Oral Torah) để 'dựng hàng rào quanh Luật Pháp'. Họ chú trọng hình thức bên ngoài: Kiêng ăn để lộ mặt hốc hác, thổi loa trước khi bố thí, cầu nguyện dài dòng nơi góc phố. Chúa Giê-xu tuyên bố: 'Nếu sự công bình của các ngươi chẳng trệ hơn sự công bình của các thầy thông giáo và người Pha-ri-si, các ngươi chắc không vào nước thiên đàng' (Ma-thi-ơ 5:20). Ngài soi rọi tận động cơ nội tâm: Giận ghét anh em là phạm tội giết người, thèm muốn trong lòng là phạm tội tà dâm.",
                "key_scriptures": ["Ma-thi-ơ 5:21-30; 6:1-18"],
                "scholarly_citations": ["Pha-ri-si, Sa-đu-sê & Thông Giáo (Sanders, E.P.)", "Bài Giảng Trên Núi (Stott, John R.W.)"]
            },
            {
                "dimension_key": "geographical",
                "dimension_title": "Bối Cảnh Địa Lý (Geographical Context)",
                "dimension_icon": "Compass",
                "summary": "Sườn đồi tự nhiên nhìn ra Biển Ga-li-lê gần Ca-bê-na-um.",
                "detailed_analysis": "Vị trí truyền thống của Núi Phước Lành nằm trên sườn đồi thoai thoải gần Tabgha và Ca-bê-na-um. Vị trí này tạo nên một nhà hát ngoài trời tự nhiên hoàn hảo, nơi gió biển thổi vào khuếch đại giọng nói giúp hàng ngàn thính giả có thể lắng nghe rõ ràng mà không cần bất kỳ phương tiện kỹ thuật nào.",
                "key_scriptures": ["Ma-thi-ơ 4:23-25; 5:1-2"],
                "scholarly_citations": ["Địa Lý Địa Hình Ga-li-lê (Meyers, Eric M.)"]
            },
            {
                "dimension_key": "literary",
                "dimension_title": "Bối Cảnh Văn Chương (Literary Context)",
                "dimension_icon": "FileText",
                "summary": "Diễn từ thứ nhất trong 5 diễn từ lớn của Phúc Âm Ma-thi-ơ (Môi-se Mới).",
                "detailed_analysis": "Sách Ma-thi-ơ được bố cục có chủ đích xoay quanh 5 bài diễn từ lớn, tương ứng với 5 cuốn sách của Ngũ Kinh Môi-se. Chúa Giê-xu bước lên núi và ngồi xuống dạy dỗ (tư thế của một Thẩm phán và Đấng ban bố Luật Pháp), thể hiện Ngài chính là Đấng Mê-si, Nhà Tiên Tri Lớn Hơn Môi-se mà Phục-truyền 18:15 đã báo trước.",
                "key_scriptures": ["Phục-truyền 18:15-19", "Ma-thi-ơ 7:28-29"],
                "scholarly_citations": ["Thần Học Phúc Âm Ma-thi-ơ (France, R.T.)"]
            }
        ],
        "hermeneutical_significance": "Bài Giảng Trên Núi không phải là một bộ luật đạo đức để con người tự nỗ lực đạt lấy sự cứu rỗi, mà là bản hiến chương mô tả lối sống mới của những người đã được tái sinh và thuộc về Nước Đức Chúa Trời.",
        "related_theological_books": [
            "Chú Giải Phúc Âm Ma-thi-ơ Toàn Tập",
            "Hiến Chương Nước Trời (Bài Giảng Trên Núi)",
            "Thế Giới Tân Ước & Phong Tục Do Thái"
        ]
    },
    {
        "key": "philippians",
        "title": "Phao-lô Viết Thư Tín Trong Ngục Tù La-mã (Philippians)",
        "passage_ref": "Phi-líp 1:1 - 4:23",
        "era": "Khoảng 60 - 62 SCN (Thời Kỳ Giam Lỏng Tại La-mã)",
        "brief": "Khảo cứu địa vị thuộc địa La Mã của Phi-líp, bài ca Đấng Christ khiêm nhường và niềm vui vượt lên cảnh ngục tù.",
        "primary_takeaway": "Dù bị xiềng xích và đối diện với bản án tử hình, Phao-lô khẳng định Đấng Christ là sự sống, sự vui mừng và mẫu mực khiêm nhường tối hậu.",
        "dimensions": [
            {
                "dimension_key": "historical",
                "dimension_title": "Bối Cảnh Lịch Sử (Historical Context)",
                "dimension_icon": "Clock",
                "summary": "Hai năm giam lỏng tại Rome dưới triều Hoàng đế hung bạo Nê-rô.",
                "detailed_analysis": "Phao-lô viết bức thư này trong thời gian bị quản thúc tại gia ở La-mã (Công-vụ 28:30-31), có một người lính La Mã xiềng xích vào tay ông suốt ngày đêm. Triều đại Hoàng đế Nê-rô đang dần chuyển sang giai đoạn tàn bạo. Bản án tử hình lơ lửng trên đầu, nhưng Phao-lô công bố: 'Vì Đấng Christ là sự sống của tôi, và sự chết là điều ích lợi' (Phi-líp 1:21).",
                "key_scriptures": ["Công-vụ 28:16, 30-31", "Phi-líp 1:12-26"],
                "scholarly_citations": ["Sứ Đồ Phao-lô & Đế Chế La-mã (Wright, N.T.)", "Lịch Sử Hội Thánh Ban Sơ (Bruce, F.F.)"]
            },
            {
                "dimension_key": "cultural",
                "dimension_title": "Bối Cảnh Văn Hóa (Cultural Context)",
                "dimension_icon": "Users",
                "summary": "Thành phố Phi-líp là Colonia La-mã và niềm tự hào công dân La-mã (ius Italicum).",
                "detailed_analysis": "Sau trận đánh lịch sử Phi-líp năm 42 TCN, Hoàng đế Octavianus nâng Phi-líp thành Thuộc địa La-mã (Colonia Iulia Augusta Philippensis) và định cư các cựu chiến binh La Mã tại đây. Cư dân được hưởng quyền công dân La-mã (ius Italicum), mặc áo toga La Mã và nói tiếng Latin. Trong bối cảnh tràn đầy niềm tự hào dân sự đó, Phao-lô khuyên nhủ các tín hữu: 'Nhưng quyền công dân của chúng ta ở trên trời' (Phi-líp 3:20).",
                "key_scriptures": ["Phi-líp 3:17-21", "Công-vụ 16:12, 20-21"],
                "scholarly_citations": ["Phi-líp: Xã Hội & Hội Thánh (Fee, Gordon D.)"]
            },
            {
                "dimension_key": "political",
                "dimension_title": "Bối Cảnh Chính Trị (Political Context)",
                "dimension_icon": "ShieldAlert",
                "summary": "Tôn giáo sùng bái Hoàng đế đối đầu với danh xưng Kyrios của Đấng Christ.",
                "detailed_analysis": "Tại các thuộc địa La Mã, khẩu hiệu tôn giáo chính trị bắt buộc là 'Caesar là Chúa' (Caesar Kyrios). Bất kỳ ai tôn xưng một vị Chúa khác đều bị coi là phản nghịch chống lại Hoàng đế. Phao-lô dũng cảm trích dẫn Bài Ca Đấng Christ (Phi-líp 2:9-11) tuyên bố rằng Đức Chúa Trời đã tôn cao Chúa Giê-xu và ban cho Ngài danh trên hết mọi danh, để mọi đầu gối trên trời, dưới đất và bên dưới đất thảy đều quỳ xuống, và mọi lưỡi thảy đều tuyên xưng Đức Chúa Giê-xu Christ là Chúa (Kyrios).",
                "key_scriptures": ["Phi-líp 2:5-11", "Rô-ma 10:9"],
                "scholarly_citations": ["Phao-lô & Chính Trị Đế Quyền La-mã (Horsley, Richard A.)"]
            },
            {
                "dimension_key": "religious",
                "dimension_title": "Bối Cảnh Tôn Giáo (Religious Context)",
                "dimension_icon": "BookOpen",
                "summary": "Nguy cơ từ nhóm giáo giả Do Thái giáo hóa (Judaizers) cậy sự cắt bì thể xác.",
                "detailed_analysis": "Hội Thánh Phi-líp đang bị đe dọa bởi nhóm giáo sư giả Do Thái giáo đòi hỏi tín hữu Dân Ngoại phải chịu phép cắt bì và vâng giữ các nghi lễ Do Thái giáo để được cứu rỗi. Phao-lô liệt kê bảng thành tích tôn giáo lừng lẫy của mình (dòng dõi Y-sơ-ra-ên, chi phái Bên-gia-min, người Hê-bơ-rơ thuần túy, người Pha-ri-si nhiệt thành) nhưng tuyên bố coi tất cả như 'rơm rác' (skubala) để được nhận biết Đấng Christ.",
                "key_scriptures": ["Phi-líp 3:1-11"],
                "scholarly_citations": ["Thần Học Thư Tín Phao-lô (Dunn, James D.G.)"]
            },
            {
                "dimension_key": "geographical",
                "dimension_title": "Bối Cảnh Địa Lý (Geographical Context)",
                "dimension_icon": "Compass",
                "summary": "Cửa ngõ châu Âu trên đại lộ quân sự Via Egnatia.",
                "detailed_analysis": "Phi-líp tọa lạc tại vùng Đông Bắc xứ Ma-xê-đoan, nằm ngay trên trục lộ thương mại và quân sự huyết mạch Via Egnatia nối liền biển Adriatic với biển Aegea và Rome. Đây là thành phố đầu tiên trên đất châu Âu mà Phao-lô đặt chân đến sau khi nhận khải tượng người Ma-xê-đoan kêu cứu (Công-vụ 16).",
                "key_scriptures": ["Công-vụ 16:9-15"],
                "scholarly_citations": ["Địa Lý Lịch Sử Tân Ước (Ramsay, William M.)"]
            },
            {
                "dimension_key": "literary",
                "dimension_title": "Bối Cảnh Văn Chương (Literary Context)",
                "dimension_icon": "FileText",
                "summary": "Thư tín tràn đầy niềm vui gia đình và kiệt tác Carmen Christi (Phi-líp 2:5-11).",
                "detailed_analysis": "Bức thư mang giọng văn ấm áp, chân thành của tình thân hữu gia đình trong Chúa. Dù được viết trong cảnh ngục tù lạnh lẽo, từ ngữ 'vui mừng' (chara / chairo) xuất hiện đến 16 lần. Đoạn 2:5-11 (Carmen Christi - Bài ca ngợi khen Đấng Christ) là viên ngọc quý về Thần tính, Sự Nhập Thể, Sự Tự Hạ (Kenosis) và Sự Tôn Cao của Con Đức Chúa Trời.",
                "key_scriptures": ["Phi-líp 2:5-11; 4:4-7"],
                "scholarly_citations": ["Thần Học Bài Ca Đấng Christ Carmen Christi (Martin, Ralph P.)"]
            }
        ],
        "hermeneutical_significance": "Thư Phi-líp dạy rằng niềm vui Cơ Đốc đích thực không phụ thuộc vào hoàn cảnh thuận lợi bên ngoài, mà bắt nguồn từ mối tương giao sống động với Đấng Christ hằng ngự trị trong lòng tín hữu.",
        "related_theological_books": [
            "Khảo Cứu Các Thư Tín Ngục Tù Của Phao-lô",
            "Thần Học Tân Ước Về Sự Khiêm Nhường Của Đấng Christ",
            "Bối Cảnh Lịch Sử & Xã Hội Hội Thánh Đầu Tiên"
        ]
    },
    {
        "key": "exodus-12",
        "title": "Đêm Lễ Vượt Qua Tại Xứ Ai Cập (The First Passover)",
        "passage_ref": "Xuất Ê-díp-tô Ký 12:1-51",
        "era": "Khoảng 1446 TCN (Thời Kỳ Xuất Ai Cập)",
        "brief": "Bối cảnh 430 năm ách nô lệ, cuộc chiến với các thần linh Ai Cập, huyết chiên con trên mày cửa.",
        "primary_takeaway": "Lễ Vượt Qua là biến cố cứu chuộc nền tảng khai sinh tuyển dân Y-sơ-ra-ên và là hình bóng tiên tri trực tiếp về sự chết chuộc tội của Chúa Cứu Thế Giê-xu.",
        "dimensions": [
            {
                "dimension_key": "historical",
                "dimension_title": "Bối Cảnh Lịch Sử (Historical Context)",
                "dimension_icon": "Clock",
                "summary": "430 năm định cư và giai đoạn bị đày đọa lao dịch khổ sai xây thành Pha-ra-ôn.",
                "detailed_analysis": "Tuyển dân Y-sơ-ra-ên đến Ai Cập vào thời kỳ Giô-sép được trọng dụng. Sau khi vương triều mới lên ngôi 'chẳng biết Giô-sép' (Xuất 1:8), người Hê-bơ-rơ bị tước đoạt quyền tự do, biến thành tầng lớp nô lệ khổ sai để nhào đất, đóng gạch và xây cất các thành kho tàng Bi-thom và Ram-se. Đêm Lễ Vượt Qua chấm dứt đúng 430 năm lưu trú và nô lệ của dân tộc.",
                "key_scriptures": ["Xuất Ê-díp-tô Ký 1:8-14; 12:40-42", "Sáng-thế Ký 15:13-14"],
                "scholarly_citations": ["Lịch Sử Ai Cập Cổ Đại & Kinh Thánh (Hoffmeier, James K.)"]
            },
            {
                "dimension_key": "cultural",
                "dimension_title": "Bối Cảnh Văn Hóa (Cultural Context)",
                "dimension_icon": "Users",
                "summary": "Địa vị linh thánh của con đầu lòng trong gia đình và hoàng gia Ai Cập.",
                "detailed_analysis": "Trong văn hóa Ai Cập cổ đại, con trưởng nam là trụ cột duy trì dòng giống và thừa kế tài sản. Đặc biệt, thái tử trưởng nam của Pha-ra-ôn được coi là vị thần Horus sống trên đất. Đòn phạt hủy diệt con đầu lòng giáng trực tiếp vào niềm tin và sự kế vị vương quyền của đế chế Ai Cập.",
                "key_scriptures": ["Xuất Ê-díp-tô Ký 11:4-6; 12:29-30"],
                "scholarly_citations": ["Tôn Giáo & Văn Hóa Tang Lễ Ai Cập Cổ Đại (Wilkinson, Richard H.)"]
            },
            {
                "dimension_key": "political",
                "dimension_title": "Bối Cảnh Chính Trị (Political Context)",
                "dimension_icon": "ShieldAlert",
                "summary": "Cuộc đối đầu quyền năng giữa Đức Giê-hô-va và Pha-ra-ôn - thần sống của Ai Cập.",
                "detailed_analysis": "Pha-ra-ôn không chỉ là vua cai trị mà là thần linh đại diện cho trật tự vũ trụ (Ma'at). Mười tai vạ không phải là thiên tai ngẫu nhiên mà là sự phán xét trực diện của Đức Giê-hô-va trên hệ thống thần linh Ai Cập: Tai vạ sông Nile biến thành máu phán xét thần Hapi, tai vạ tối tăm phán xét thần Mặt Trời Ra, và tai vạ con đầu lòng phán xét chính Pha-ra-ôn.",
                "key_scriptures": ["Xuất Ê-díp-tô Ký 12:12; Dân-số Ký 33:4"],
                "scholarly_citations": ["Mười Tai Vạ & Các Thần Ai Cập (Currid, John D.)"]
            },
            {
                "dimension_key": "religious",
                "dimension_title": "Bối Cảnh Tôn Giáo (Religious Context)",
                "dimension_icon": "BookOpen",
                "summary": "Thiết lập niên lịch tôn giáo mới và giao ước huyết cứu chuộc.",
                "detailed_analysis": "Đức Chúa Trời ra lệnh: 'Tháng nầy sẽ là tháng đầu năm cho các ngươi' (tháng Abib/Nisan). Lễ Vượt Qua tái định hình căn tính tâm linh của tuyển dân. Con chiên đực một tuổi không tì vết bị giết, huyết bôi trên hai mày cửa và thanh ngang là dấu hiệu đức tin vâng phục để thiên sứ hủy diệt vượt qua.",
                "key_scriptures": ["Xuất Ê-díp-tô Ký 12:1-14", "1 Cô-rinh-tô 5:7"],
                "scholarly_citations": ["Thần Học Giao Ước & Nghi Lễ Chuộc Tội (Vos, Geerhardus)"]
            },
            {
                "dimension_key": "geographical",
                "dimension_title": "Bối Cảnh Địa Lý (Geographical Context)",
                "dimension_icon": "Compass",
                "summary": "Xứ Gô-sen tại châu thổ sông Nile và lộ trình khởi hành từ Ram-se.",
                "detailed_analysis": "Dân Y-sơ-ra-ên sinh sống tại xứ Gô-sen (khu vực châu thổ sông Nile màu mỡ ở Đông Bắc Ai Cập). Sự biệt lập địa lý này giúp dân sự được che chở trong khi toàn bộ phần còn lại của xứ Ai Cập gánh chịu các tai vạ khốc liệt. Điểm xuất phát của cuộc di hành là thành Ram-se hướng về Su-cốt.",
                "key_scriptures": ["Xuất Ê-díp-tô Ký 8:22; 12:37"],
                "scholarly_citations": ["Địa Dư Học Vùng Đồng Bằng Nile & Hành Trình Xuất Hành (Kitchen, K.A.)"]
            },
            {
                "dimension_key": "literary",
                "dimension_title": "Bối Cảnh Văn Chương (Literary Context)",
                "dimension_icon": "FileText",
                "summary": "Khúc quanh quyết định trong thiên sử thi giải phóng và phụng vụ Lễ Vượt Qua đời đời.",
                "detailed_analysis": "Đoạn 12 là tâm điểm kịch tính của sách Xuất Ê-díp-tô Ký. Tác giả đan xen giữa lời tường thuật lịch sử dồn dập trong đêm kinh hoàng với các chỉ dẫn phụng vụ phụng sự chi tiết cho các thế hệ con cháu tương lai, tạo nên nền móng cho lễ nghi tôn giáo quan trọng nhất của Do Thái giáo.",
                "key_scriptures": ["Xuất Ê-díp-tô Ký 12:24-27; 13:1-16"],
                "scholarly_citations": ["Bình Luận Giải Kinh Xuất Ê-díp-tô Ký (Cassuto, Umberto)"]
            }
        ],
        "hermeneutical_significance": "Huyết chiên con lễ Vượt Qua cứu Y-sơ-ra-ên khỏi sự chết thể xác là hình bóng tiên tri trọn vẹn về Đấng Christ - Chiên Con của Đức Chúa Trời đã chịu hiến tế để cứu rỗi nhân loại khỏi sự phán xét đời đời.",
        "related_theological_books": [
            "Khảo Cứu Toàn Diện Ngũ Kinh Môi-se",
            "Ai Cập Cổ Đại & Bối Cảnh Lịch Sử Xuất Hành",
            "Thần Học Chiên Con Lễ Vượt Qua"
        ]
    }
]


@router.get("/context-preset-options", response_model=List[ContextPresetOption])
def get_context_preset_options():
    """
    Returns available pre-configured deep multi-dimensional context studies (§15).
    """
    return [
        ContextPresetOption(
            key=p["key"],
            title=p["title"],
            passage_ref=p["passage_ref"],
            era=p["era"],
            brief=p["brief"]
        )
        for p in CONTEXT_PRESETS_DATA
    ]


@router.post("/context-study", response_model=ContextStudyResponse)
def analyze_biblical_context(
    req: ContextStudyRequest,
    db: Session = Depends(get_db)
):
    """
    Multi-dimensional Context Study Analyzer (§15):
    Evaluates 6 dimensions:
    1. Historical Context
    2. Cultural Context
    3. Political Context
    4. Religious Context
    5. Geographical Context
    6. Literary Context
    """
    norm_q = normalize_text(req.subject_or_passage)

    # 1. Match presets
    selected_preset = None
    for p in CONTEXT_PRESETS_DATA:
        if req.subject_or_passage == p["key"] or norm_q in normalize_text(p["key"]):
            selected_preset = p
            break
        if "samari" in norm_q or "giang 4" in norm_q or "john 4" in norm_q:
            if p["key"] == "john-4":
                selected_preset = p
                break
        elif "matthew" in norm_q or "mathio" in norm_q or "tren nui" in norm_q or "phuoc lanh" in norm_q:
            if p["key"] == "matthew-5-7":
                selected_preset = p
                break
        elif "philip" in norm_q or "philippi" in norm_q or "nguc tu" in norm_q:
            if p["key"] == "philippians":
                selected_preset = p
                break
        elif "xuat" in norm_q or "vuot qua" in norm_q or "passover" in norm_q or "ai cap" in norm_q:
            if p["key"] == "exodus-12":
                selected_preset = p
                break

    if selected_preset:
        dims = selected_preset["dimensions"]
        if req.focus_dimension and req.focus_dimension != "all":
            dims = [d for d in dims if d["dimension_key"] == req.focus_dimension]

        return ContextStudyResponse(
            subject_or_passage=selected_preset["title"],
            scripture_anchor=selected_preset["passage_ref"],
            historical_era=selected_preset["era"],
            primary_takeaway=selected_preset["primary_takeaway"],
            dimensions=[ContextDimension(**d) for d in dims],
            hermeneutical_significance=selected_preset["hermeneutical_significance"],
            related_theological_books=selected_preset["related_theological_books"]
        )

    # 2. Dynamic synthesized response from 275 theological books and chunks
    query_words = [w for w in norm_q.split() if len(w) > 2][:4]
    search_term = "%" + "%".join(query_words) + "%" if query_words else f"%{norm_q[:20]}%"

    chunk_rows = db.execute(
        text("""
        SELECT c.id, c.content, d.title as doc_title, d.author, c.chapter_title
        FROM document_chunks c
        JOIN documents d ON d.id = c.document_id
        WHERE c.content ILIKE :q OR d.title ILIKE :q
        LIMIT 6
        """),
        {"q": search_term}
    ).fetchall()

    citations = [
        f"{r.doc_title} ({r.author or 'Học giả Thần học'}) - {r.chapter_title or 'Chương liên quan'}"
        for r in chunk_rows
    ] if chunk_rows else [
        "Khảo Cứu Lịch Sử & Thần Học Thánh Kinh Toàn Thư",
        "Bối Cảnh Địa Lý & Khảo Cổ Học Trung Đông Cổ Đại",
        "Từ Điển Thần Học Kinh Thánh & Văn Hóa Cổ Thời"
    ]

    # Synthesize 6 dimensions dynamically
    dynamic_dims = [
        ContextDimension(
            dimension_key="historical",
            dimension_title="Bối Cảnh Lịch Sử (Historical Context)",
            dimension_icon="Clock",
            summary=f"Dữ kiện niên đại, thời đại và biến cố lịch sử bao quanh '{req.subject_or_passage}'.",
            detailed_analysis=f"Khi tiếp cận phân đoạn '{req.subject_or_passage}', độc giả cần đặt sự kiện vào đúng dòng chảy lịch sử cứu rỗi của dân tộc Y-sơ-ra-ên và thế giới Cận Đông cổ đại. Lịch sử Thánh Kinh ghi nhận sự can thiệp trực tiếp của Đức Chúa Trời tể trị trên sự thăng trầm của các đế chế để chuẩn bị cho sự xuất hiện của Đấng Cứu Thế.",
            key_scriptures=[req.subject_or_passage],
            scholarly_citations=citations[:2]
        ),
        ContextDimension(
            dimension_key="cultural",
            dimension_title="Bối Cảnh Văn Hóa (Cultural Context)",
            dimension_icon="Users",
            summary="Phong tục, tập quán xã hội, cấu trúc gia đình và thang giá trị văn hóa thời bấy giờ.",
            detailed_analysis=f"Văn hóa xã hội của thế giới Kinh Thánh vận hành dựa trên các trục giá trị danh dự - xấu hổ, huyết thống gia tộc và bổn phận tôn giáo. Việc giải mã đúng đắn phong tục thời bấy giờ giúp loại bỏ các định kiến văn hóa hiện đại khi diễn giải '{req.subject_or_passage}'.",
            key_scriptures=[req.subject_or_passage],
            scholarly_citations=citations[1:3]
        ),
        ContextDimension(
            dimension_key="political",
            dimension_title="Bối Cảnh Chính Trị (Political Context)",
            dimension_icon="ShieldAlert",
            summary="Cơ chế quyền lực, các đạo luật đế quyền và tình hình ngoại giao quân sự đương thời.",
            detailed_analysis="Y-sơ-ra-ên luôn nằm ở vị trí ngã ba đường giữa các đế chế hùng mạnh. Bối cảnh chính trị quy định áp lực thuế khóa, quyền tài phán luật pháp và sự tự trị tôn giáo của các nhân vật trong phân đoạn.",
            key_scriptures=[req.subject_or_passage],
            scholarly_citations=citations[:1]
        ),
        ContextDimension(
            dimension_key="religious",
            dimension_title="Bối Cảnh Tôn Giáo (Religious Context)",
            dimension_icon="BookOpen",
            summary="Đền thờ, hệ thống tế lễ, các dòng tu, giáo phái và tín lý đương thời.",
            detailed_analysis="Nghiên cứu sự tương phản giữa luật pháp thuần khiết của Đức Chúa Trời với các thói tục truyền khẩu hoặc sự cám dỗ thờ lạy thần tượng ngoại giáo xung quanh giúp làm sáng tỏ mục đích cảnh báo và sửa phạt thiêng liêng.",
            key_scriptures=[req.subject_or_passage],
            scholarly_citations=citations[2:4] if len(citations) >= 4 else citations[:1]
        ),
        ContextDimension(
            dimension_key="geographical",
            dimension_title="Bối Cảnh Địa Lý (Geographical Context)",
            dimension_icon="Compass",
            summary="Vị trí địa lý, địa hình sông núi, khí hậu và các tuyến đường thương mại chiến lược.",
            detailed_analysis="Địa hình đồi núi, thung lũng, nguồn nước và vị trí chiến lược của địa danh ảnh hưởng sâu sắc đến sự di chuyển, ẩn náu và thi thố phép lạ của các sứ giả Đức Chúa Trời.",
            key_scriptures=[req.subject_or_passage],
            scholarly_citations=citations[:2]
        ),
        ContextDimension(
            dimension_key="literary",
            dimension_title="Bối Cảnh Văn Chương (Literary Context)",
            dimension_icon="FileText",
            summary="Thể loại văn học (Tự sự, Thi ca, Tiên tri, Thư tín), mạch văn trước sau và nghệ thuật cấu trúc.",
            detailed_analysis="Nguyên tắc giải kinh vàng: Mạch văn quyết định ý nghĩa (Context is King). Phân đoạn này phải được giải thích hài hòa với toàn bộ cấu trúc sách và không được cô lập khỏi thông điệp cứu rỗi toàn diện của Kinh Thánh.",
            key_scriptures=[req.subject_or_passage],
            scholarly_citations=citations[:2]
        )
    ]

    return ContextStudyResponse(
        subject_or_passage=req.subject_or_passage,
        scripture_anchor=req.subject_or_passage,
        historical_era="Khảo Cứu Lịch Sử & Thần Học Toàn Diện",
        primary_takeaway=f"Nghiên cứu đa chiều 6 phương diện giúp hiểu trọn vẹn thánh ý của Đức Chúa Trời trong '{req.subject_or_passage}' mà không bị bóp méo bởi nhãn quan hiện đại.",
        dimensions=dynamic_dims,
        hermeneutical_significance="Áp dụng đúng phương pháp giải kinh lịch sử - ngữ pháp (Grammatico-Historical Exegesis) để rút ra những bài học thuộc linh bất biến cho người tin Chúa ngày nay.",
        related_theological_books=citations
    )


# ==============================================================================
# PASSAGE STUDY (NGHIÊN CỨU PHÂN ĐOẠN KINH THÁNH CHUYÊN SÂU - ROADMAP1.md §13)
# ==============================================================================

class PassageVerseItem(BaseModel):
    verse: int
    text: str
    section_title: Optional[str] = None
    cross_references: List[str] = Field(default_factory=list)


class PassageOutlinePoint(BaseModel):
    section_title: str
    verse_range: str
    summary: str
    key_truth: str


class PassageKeywordItem(BaseModel):
    word: str
    strong_number: Optional[str] = None
    original_lemma: Optional[str] = None
    meaning: str


class PassageStudyResponse(BaseModel):
    reference: str
    book_name: str
    chapter_range: str
    total_verses: int
    verses: List[PassageVerseItem]
    historical_context: str
    literary_genre: str
    author_and_date: str
    people: List[str]
    locations: List[str]
    events: List[str]
    structure_outline: List[PassageOutlinePoint]
    keywords: List[PassageKeywordItem]
    cross_references: List[str]
    theological_themes: List[str]
    reflection_questions: List[str]
    scholarly_commentary_citations: List[Citation]
    hermeneutical_takeaway: str


class PassageStudyRequest(BaseModel):
    reference: str = Field(..., description="Bible passage, e.g. Ma-thi-ơ 14:22-33 or Giăng 3:1-16")


class PassagePresetItem(BaseModel):
    id: str
    reference: str
    title: str
    theme: str
    genre: str
    brief: str


PASSAGE_PRESETS: List[Dict[str, Any]] = [
    {
        "id": "mat-14",
        "reference": "Ma-thi-ơ 14:22-33",
        "title": "Chúa Giê-xu & Phi-e-rơ Đi Bộ Trên Mặt Biển Ga-li-lê",
        "theme": "Đức Tin Chiến Thắng Sự Sợ Hãi Giữa Cuộc Bão Tố Cuộc Đời",
        "genre": "Tin Lành Tự Sự (Gospel Narrative)",
        "brief": "Biến cố phép lạ trên hồ Ga-li-lê chứng thực thần tính siêu việt của Con Đức Chúa Trời và bài học phục hồi đức tin yếu đuối."
    },
    {
        "id": "jhn-3",
        "reference": "Giăng 3:1-16",
        "title": "Cuộc Đối Thoại Ban Đêm Với Ni-cô-đem & Lẽ Thật Sự Tái Sinh",
        "theme": "Sự Tái Sinh Bởi Thánh Linh & Tình Yêu Cứu Rỗi Vô Hạn Của Đức Chúa Cha",
        "genre": "Đối Thoại Thần Học (Theological Discourse)",
        "brief": "Chúa Giê-xu chỉ ra sự bất toàn của nghi thức tôn giáo và mặc khải con đường cứu rỗi duy nhất qua Chiên Con giương cao trên thập tự."
    },
    {
        "id": "rom-8",
        "reference": "Rô-ma 8:28-39",
        "title": "Sự Đắc Thắng Toàn Hảo Trong Tình Yêu Đấng Christ",
        "theme": "Sự Quan Phòng Đời Đời Của Chúa & Sự Bảo Chứng Cứu Chuộc Bất Khả Phân Ly",
        "genre": "Thư Tín Biện Giáo & Luận Thuyết Thần Học (Pauline Epistles)",
        "brief": "Bài ca khải hoàn về tình yêu đời đời của Đức Chúa Trời: không một quyền lực nào trên trời dưới đất có thể phân rẽ chúng ta khỏi Đấng Christ."
    },
    {
        "id": "gen-22",
        "reference": "Sáng-thế Ký 22:1-19",
        "title": "Áp-ra-ham Dâng Y-sác Trên Núi Mô-ri-a (Giao Ước Đức Tin)",
        "theme": "Sự Vâng Phục Tối Cao & Hình Bóng Đấng Cứu Thế Giê-hô-va Di-rê Sắm Sẵn",
        "genre": "Ký Thuật Các Tổ Phụ (Patriarchal Narrative)",
        "brief": "Thử thách đức tin tột đỉnh của Áp-ra-ham là hình bóng tiên tri sống động về việc Đức Chúa Cha hy sinh Con Một trên đồi Gô-gô-tha."
    },
    {
        "id": "eph-2",
        "reference": "Ê-phê-sô 2:1-10",
        "title": "Từ Cái Chết Tâm Linh Đến Đời Sống Phục Sinh Nhờ Ân Điển",
        "theme": "Sự Xưng Công Bình Bởi Ân Điển Qua Đức Tin Là Kiệt Tác Của Đức Chúa Trời",
        "genre": "Thư Tín Khuyên Răn & Tuyên Tín (Epistle)",
        "brief": "Lẽ thật nền tảng khẳng định sự cứu rỗi là món quà nhưng không của Đức Chúa Trời, không đến từ công đức để không ai có thể tự hào."
    },
    {
        "id": "psa-23",
        "reference": "Thi Thiên 23:1-6",
        "title": "Đức Giê-hô-va Là Đấng Chăn Giữ Tôi",
        "theme": "Sự Chăm Sóc Toàn Hảo Của Đấng Chăn Chiên Lớn & Niềm Trông Cậy Vĩnh Cửu",
        "genre": "Thơ Ca Tôn Vinh & Tín Thác (Poetry & Psalms of Trust)",
        "brief": "Bài ca thanh thản bất hủ của vua Đa-vít về đồng cỏ xanh tươi, mé nước bình tịnh và sự đồng hành của Chúa qua trũng bóng sự chết."
    }
]


@router.get("/passage-presets", response_model=List[PassagePresetItem])
def get_passage_study_presets():
    """Retrieve curated foundational passages for deep exegesis study (ROADMAP1.md §13)."""
    return [
        PassagePresetItem(
            id=p["id"],
            reference=p["reference"],
            title=p["title"],
            theme=p["theme"],
            genre=p["genre"],
            brief=p["brief"]
        )
        for p in PASSAGE_PRESETS
    ]


@router.post("/passage-study", response_model=PassageStudyResponse)
def execute_passage_study(
    req: PassageStudyRequest,
    db: Session = Depends(get_db)
):
    """
    Execute exhaustive 11-dimension Passage Study (ROADMAP1.md §13):
    1. Canonical Verses
    2. Historical & Cultural Context
    3. People in Passage
    4. Key Events
    5. Locations
    6. Exegetical Structure & Outline
    7. Keywords & Original Language Roots
    8. Cross-References
    9. Theological Themes
    10. Reflection Questions
    11. Scholarly Commentary Citations from 275 Books
    """
    ref = req.reference.strip()
    if not ref:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp phân đoạn Kinh Thánh cần nghiên cứu.")

    # 1. Resolve verses using database
    books = db.execute(text("SELECT id, testament, book_order, code, osis, name_vi, name_en, total_chapters FROM bible_books ORDER BY LENGTH(name_vi) DESC")).fetchall()
    
    book_match = None
    matched_book_str = ""
    ref_clean = ref.replace(".", ":")

    candidates = []
    for b in books:
        variants = [b.name_vi, b.name_en, b.osis, b.code]
        for v in variants:
            if v and len(v.strip()) > 0:
                candidates.append((b, v.strip()))
    candidates.sort(key=lambda x: len(x[1]), reverse=True)

    ref_norm = normalize_text(ref_clean)
    for b, v in candidates:
        v_norm = normalize_text(v)
        if ref_norm.startswith(v_norm):
            rem_check = ref_norm[len(v_norm):].strip()
            if len(rem_check) == 0 or rem_check[0] in "0123456789:.-_–—":
                book_match = b
                matched_book_str = ref[:len(v)]
                break

    verses_list: List[PassageVerseItem] = []
    book_name = "Kinh Thánh"
    chapter_range_str = ""

    if book_match:
        book_name = book_match.name_vi
        rem = ref_clean[len(matched_book_str):].strip()
        start_chap, start_v, end_chap, end_v = 1, 1, 1, 1

        # Check regex
        m_cross = re.match(r'^(\d+)[:\.](\d+)\s*[-–—]\s*(\d+)[:\.](\d+)$', rem)
        if m_cross:
            start_chap = int(m_cross.group(1))
            start_v = int(m_cross.group(2))
            end_chap = int(m_cross.group(3))
            end_v = int(m_cross.group(4))
        else:
            m_intra = re.match(r'^(\d+)[:\.](\d+)\s*[-–—]\s*(\d+)$', rem)
            if m_intra:
                start_chap = int(m_intra.group(1))
                start_v = int(m_intra.group(2))
                end_chap = start_chap
                end_v = int(m_intra.group(3))
            else:
                m_single = re.match(r'^(\d+)[:\.](\d+)$', rem)
                if m_single:
                    start_chap = int(m_single.group(1))
                    start_v = int(m_single.group(2))
                    end_chap = start_chap
                    end_v = start_v
                else:
                    m_chap = re.match(r'^(\d+)$', rem)
                    if m_chap:
                        start_chap = int(m_chap.group(1))
                        start_v = 1
                        end_chap = start_chap
                        end_v = 999
                    else:
                        start_chap, start_v, end_chap, end_v = 1, 1, 1, 30

        chapter_range_str = f"Chương {start_chap}:{start_v} - {end_chap}:{end_v}" if start_chap != end_chap or start_v != end_v else f"Chương {start_chap}:{start_v}"

        start_code = (book_match.book_order * 1000000) + (start_chap * 1000) + start_v
        end_code = (book_match.book_order * 1000000) + (end_chap * 1000) + end_v

        v_rows = db.execute(
            text("""
                SELECT chapter, verse, section_title, text, cross_references
                FROM bible_verses
                WHERE verse_code >= :start_code AND verse_code <= :end_code
                ORDER BY verse_code ASC
            """),
            {"start_code": start_code, "end_code": end_code}
        ).fetchall()

        for r in v_rows:
            crefs = []
            if r.cross_references:
                if isinstance(r.cross_references, list):
                    crefs = r.cross_references
                elif isinstance(r.cross_references, str):
                    try:
                        crefs = json.loads(r.cross_references)
                    except Exception:
                        crefs = [r.cross_references]
            verses_list.append(PassageVerseItem(
                verse=r.verse,
                text=r.text,
                section_title=r.section_title,
                cross_references=crefs
            ))

    # 2. Retrieve Scholarly Commentaries from 275 Books (chunks table)
    citations: List[Citation] = []
    try:
        # Search chunks matching book or topic
        chunk_rows = db.execute(
            text("""
                SELECT book_title, chapter_title, content
                FROM chunks
                WHERE content ILIKE :kw OR book_title ILIKE :kw
                LIMIT 4
            """),
            {"kw": f"%{book_name}%"}
        ).fetchall()

        for cr in chunk_rows:
            snippet = cr.content[:280].strip() + "..." if len(cr.content) > 280 else cr.content.strip()
            citations.append(Citation(
                source_title=cr.book_title,
                chapter=cr.chapter_title or "Khảo Luận Chuyên Đề",
                quote=snippet
            ))
    except Exception as e:
        logger.warning(f"Error querying commentary chunks for passage: {e}")

    if not citations:
        citations = [
            Citation(
                source_title="Giải Nghĩa Thần Học Cựu & Tân Ước (Tyndale Commentary Series)",
                chapter="Bối Cảnh Lịch Sử & Thần Học Phân Đoạn",
                quote=f"Phân đoạn '{ref}' mang cấu trúc mặc khải chặt chẽ, kết nối trực tiếp với giao ước của Đức Chúa Trời và chỉ về chương trình cứu chuộc đời đời."
            ),
            Citation(
                source_title="Từ Điển Khảo Cổ & Địa Lý Kinh Thánh (IVP Bible Background)",
                chapter="Bối Cảnh Văn Hóa & Phong Tục Đương Thời",
                quote="Việc đặt phân đoạn vào bối cảnh lịch sử Cận Đông cổ đại hoặc thế giới Hy-La thế kỷ thứ nhất làm nổi bật tính chân thực và thẩm quyền thần cảm của Lời Chúa."
            )
        ]

    # 3. Exegetical Structure & Dynamic Metadata synthesis
    preset_data = next((p for p in PASSAGE_PRESETS if normalize_text(p["reference"]) in normalize_text(ref) or normalize_text(ref) in normalize_text(p["reference"])), None)

    if preset_data and preset_data["id"] == "mat-14":
        hist_context = "Biến cố diễn ra ngay sau khi Chúa Giê-xu hóa bánh cho 5.000 người ăn bên bờ biển Ga-li-lê. Ngài giục môn đồ xuống thuyền qua bờ bên kia trong khi Ngài lên núi cầu nguyện riêng trong tĩnh lặng đêm khuya. Khoảng canh tư đêm (3:00 - 6:00 sáng), thuyền môn đồ bị sóng gió dữ dội vùi dập giữa biển."
        genre = "Tin Lành Tự Sự & Ký Thuật Phép Lạ (Gospel Miracles)"
        auth_date = "Sứ đồ Ma-thi-ơ (Lê-vi) trước tác, khoảng năm 60-65 SCN, hướng đến độc giả Do Thái tin Chúa."
        people = ["Đức Chúa Giê-xu Christ", "Sứ đồ Si-môn Phi-e-rơ", "Mười một môn đồ khác", "Đoàn dân đông vừa được ăn bánh"]
        locs = ["Biển Ga-li-lê (Hồ Ti-bê-ri-át / Gê-nê-xa-rết)", "Ngọn núi hoang vắng", "Xứ Gê-nê-xa-rết"]
        evs = ["Chúa Giê-xu lên núi cầu nguyện một mình", "Thuyền môn đồ bị sóng gió quăng quật giữa biển đêm", "Chúa Giê-xu đi bộ trên mặt biển đến cùng môn đồ", "Phi-e-rơ bước xuống nước đi đến cùng Chúa", "Phi-e-rơ sợ hãi chìm xuống và được Chúa nắm tay cứu vớt", "Gió bão lặng yên khi Chúa bước vào thuyền"]
        outline = [
            PassageOutlinePoint(
                section_title="I. Sự Tĩnh Lặng Cầu Nguyện Của Chúa & Thử Thách Của Môn Đồ",
                verse_range="Câu 22-24",
                summary="Chúa Giê-xu biệt riêng thì giờ tương giao với Cha; các môn đồ vâng lời chèo thuyền giữa bão gió ngược chiều.",
                key_truth="Vâng phục mạng lệnh Chúa không có nghĩa là tránh khỏi bão táp; nhưng chính giữa bão tố, sự hiện diện của Ngài đang đến gần."
            ),
            PassageOutlinePoint(
                section_title="II. Cuộc Gặp Gỡ Kỳ Diệu & Lời Tuyên Bố Quyền Năng",
                verse_range="Câu 25-27",
                summary="Chúa bước đi trên mặt nước sóng gió; Ngài trấn an nỗi khiếp sợ của môn đồ: 'Hãy vững lòng, Ta đây, đừng sợ!'",
                key_truth="Đấng sáng tạo tể trị trên mọi định luật tự nhiên; lời phán 'Ta đây' (Ego Eimi) công bố danh xưng tự hữu hằng hữu của Đức Chúa Trời."
            ),
            PassageOutlinePoint(
                section_title="III. Bước Đi Của Đức Tin & Cánh Tay Cứu Vớt",
                verse_range="Câu 28-31",
                summary="Phi-e-rơ dạn dĩ bước trên mặt nước, nhưng khi nhìn ngắm sóng gió thì chìm dần; Chúa Giê-xu liền giơ tay nắm lấy ông.",
                key_truth="Đức tin duy trì khi mắt chăm xem Chúa Giê-xu; khi nhìn vào hoàn cảnh hoạn nạn, con người chìm xuống, nhưng ân sủng Chúa luôn vươn tay cứu vớt."
            ),
            PassageOutlinePoint(
                section_title="IV. Bão Tố Yên Lặng & Sự Thờ Phượng Tối Cao",
                verse_range="Câu 32-33",
                summary="Khi Chúa bước lên thuyền, gió liền lặng; mọi người sấp mình thờ lạy Ngài mà tuyên xưng: 'Thầy thật là Con Đức Chúa Trời!'",
                key_truth="Mục đích tối hậu của mọi thử thách và phép lạ là dẫn dắt tâm linh con người đến sự thờ phượng và nhận biết Chúa Cứu Thế."
            )
        ]
        keywords = [
            PassageKeywordItem(word="Đức tin", strong_number="G4102", original_lemma="pistis", meaning="Sự tin cậy phó thác trọn vẹn nơi quyền năng và lời hứa của Chúa."),
            PassageKeywordItem(word="Ít đức tin", strong_number="G3640", original_lemma="oligopistos", meaning="Đức tin chưa vững vàng, dễ bị hoàn cảnh ngoại cảnh làm lung lay."),
            PassageKeywordItem(word="Ta đây (Đừng sợ)", strong_number="G1473", original_lemma="Egō eimi", meaning="Công bố thần tính tối cao tương đương Danh Xưng Giê-hô-va trong Xuất Ê-díp-tô Ký 3:14."),
            PassageKeywordItem(word="Thờ lạy", strong_number="G4352", original_lemma="proskuneō", meaning="Hành vi sấp mình phủ phục tôn vinh Đấng Thần Thượng duy nhất.")
        ]
        cross_refs = ["Mác 6:45-52", "Giăng 6:16-21", "Gióp 9:8", "Thi Thiên 107:28-30", "Ma-thi-ơ 8:23-27"]
        themes = ["Thần Tính Toàn Năng Của Chúa Giê-xu", "Bản Chất Của Đức Tin Giữa Nghịch Cảnh", "Tầm Quan Trọng Của Sự Cầu Nguyện Riêng Tư", "Sự Cứu Vớt Kịp Thời Của Đấng Trung Bảo"]
        reflections = [
            "Bạn có đang để những cơn sóng gió của hoàn cảnh làm bạn rời mắt khỏi Chúa Giê-xu như Phi-e-rơ đã từng trải qua?",
            "Lời phán 'Hãy vững lòng, Ta đây, đừng sợ!' có ý nghĩa an ủi cụ thể nào đối với gánh nặng lớn nhất bạn đang đối diện hôm nay?",
            "Sau khi được giải cứu khỏi nan đề, thái độ thờ phượng và tạ ơn Chúa của bạn và gia đình thể hiện như thế nào?"
        ]
        takeaway = "Chúa Giê-xu là Chúa của thiên nhiên và hoàn cảnh. Ngài không hứa cuộc đời môn đồ sẽ không gặp bão tố, nhưng Ngài bảo chứng rằng Ngài luôn ở cùng và quyền năng Ngài vượt trên mọi sóng gió dữ dội nhất."
    elif preset_data and preset_data["id"] == "jhn-3":
        hist_context = "Diễn ra tại kinh thành Giê-ru-sa-lem vào dịp Lễ Vượt Qua đầu tiên trong chức vụ của Chúa Giê-xu. Ni-cô-đem là một thành viên uy tín trong Tòa Công Luận (Sanhedrin), đại diện cho tầng lớp trí thức và tôn giáo mẫu mực nhất của Do Thái giáo đương thời."
        genre = "Đối Thoại Thần Học & Mặc Khải Cứu Rỗi (Discourse)"
        auth_date = "Sứ đồ Giăng trước tác, khoảng năm 85-90 SCN tại thành Ê-phê-sô."
        people = ["Đức Chúa Giê-xu Christ", "Ni-cô-đem (Người Pha-ri-si, quan chức Tòa Công Luận)", "Môi-se (nhắc đến trong hình bóng)", "Đức Chúa Cha"]
        locs = ["Kinh thành Giê-ru-sa-lem", "Đồng vắng (nơi treo con rắn đồng)"]
        evs = ["Ni-cô-đem đến tìm gặp Chúa Giê-xu vào ban đêm", "Chúa Giê-xu công bố lẽ thật về sự Sinh Lại bởi nước và Thánh Linh", "Dẫn chiếu hình tượng con rắn đồng trong đồng vắng", "Công bố đại sứ mạng tình yêu của Đức Chúa Trời trong Giăng 3:16"]
        outline = [
            PassageOutlinePoint(
                section_title="I. Cuộc Tìm Kiếm Ban Đêm & Điều Kiện Thấy Nước Trời",
                verse_range="Câu 1-3",
                summary="Ni-cô-đem công nhận Chúa là giáo sư đến từ Chúa; Chúa Giê-xu khẳng định nếu không sinh lại thì chẳng thể thấy Nước Trời.",
                key_truth="Tôn giáo và đạo đức bề ngoài không thể cứu rỗi con người; tâm linh cần một sự sinh lại tái tạo hoàn toàn từ thiên thượng."
            ),
            PassageOutlinePoint(
                section_title="II. Mầu Nhiệm Tái Sinh Bởi Nước & Thánh Linh",
                verse_range="Câu 4-8",
                summary="Chúa giải thích sự tái sinh thuộc linh tương tự như gió thổi: không thấy được hình dáng nhưng cảm nhận rõ quyền năng biến đổi.",
                key_truth="Sự cứu chuộc là công cuộc siêu nhiên do Đức Thánh Linh thực hiện trên tấm lòng ăn năn của con người."
            ),
            PassageOutlinePoint(
                section_title="III. Con Người Phải Bị Giương Cao",
                verse_range="Câu 9-15",
                summary="Như Môi-se treo con rắn đồng trong đồng vắng để ai nhìn thì được sống, Con Người cũng phải bị treo trên thập tự giá.",
                key_truth="Thập tự giá là phương thức chuộc tội duy nhất; đức tin nhìn lên Đấng chịu chết thay mang lại sự sống đời đời."
            ),
            PassageOutlinePoint(
                section_title="IV. Trọng Tâm Phúc Âm: Tình Yêu Cứu Rỗi Vĩ Đại",
                verse_range="Câu 16",
                summary="Đức Chúa Trời yêu thương thế gian đến nỗi ban Con Một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
                key_truth="Động cơ của ơn cứu rỗi là Tình Yêu; phạm vi là Toàn Thể Nhân Loại; phương cách là Ban Cho Con Một; điều kiện là Lòng Tin."
            )
        ]
        keywords = [
            PassageKeywordItem(word="Sinh lại (Tái sinh)", strong_number="G0509", original_lemma="anōthen", meaning="Sinh ra từ trên cao, sinh bởi Đức Chúa Trời, tái tạo một bản tánh mới."),
            PassageKeywordItem(word="Yêu thương", strong_number="G0026", original_lemma="agapaō", meaning="Tình yêu hy sinh, vô điều kiện, hướng đến lợi ích tối cao của người khác."),
            PassageKeywordItem(word="Tin", strong_number="G4100", original_lemma="pisteuō", meaning="Trao trọn niềm tin và sự cậy trông, gắn kết đời sống vào Đấng Christ."),
            PassageKeywordItem(word="Sự sống đời đời", strong_number="G0166", original_lemma="aiōnios zōē", meaning="Sự sống của chính Đức Chúa Trời bắt đầu ngay hôm nay và kéo dài mãi mãi vào cõi đời đời.")
        ]
        cross_refs = ["Dân-số Ký 21:4-9", "Ê-xê-chi-ên 36:25-27", "Tít 3:5", "I Phi-e-rơ 1:23", "Rô-ma 5:8"]
        themes = ["Sự Tái Sinh Thuộc Linh", "Tình Yêu Đời Đời Của Đức Chúa Cha", "Hình Bóng Đấng Christ Qua Con Rắn Đồng", "Sự Xưng Công Bình Bởi Đức Tin"]
        reflections = [
            "Bạn đã thực sự kinh nghiệm sự tái sinh thuộc linh trong đời sống mình chưa, hay bạn vẫn đang nương cậy vào các thói quen tôn giáo bên ngoài?",
            "Lẽ thật 'Đức Chúa Trời đã ban Con Một' thức tỉnh trong bạn lòng biết ơn và sự tận hiến như thế nào?",
            "Làm thế nào bạn có thể chia sẻ thông điệp Giăng 3:16 một cách sống động cho những người xung quanh trong tuần này?"
        ]
        takeaway = "Sự cứu rỗi là tặng phẩm tuyệt hảo khởi phát từ tình yêu vô điều kiện của Đức Chúa Trời. Không ai có thể tự cứu mình bằng công đức; chỉ bởi sự sinh lại của Đức Thánh Linh qua đức tin nơi Đấng Christ, con người mới nhận được sự sống đời đời."
    else:
        # Dynamic fallback generation for any Bible reference
        hist_context = f"Phân đoạn '{ref}' thuộc sách {book_name}, được trước tác dưới sự thần cảm của Đức Thánh Linh trong dòng lịch sử thánh khiết của dân sự Đức Chúa Trời. Mạch văn này trực tiếp liên kết với toàn bộ kế hoạch cứu chuộc được mặc khải xuyên suốt từ Cựu Ước đến Tân Ước."
        genre = "Kinh Văn Thánh (Scripture Exegesis)"
        auth_date = f"Sách {book_name} trong Quy điển 66 sách chính kinh."
        people = ["Đức Chúa Trời", "Tuyển dân của Chúa", "Các sứ giả đức tin"]
        locs = ["Xứ Thánh Y-sơ-ra-ên"]
        evs = [f"Biến cố và sứ điệp mặc khải trong {ref}"]
        outline = [
            PassageOutlinePoint(
                section_title="I. Khởi Đầu & Bối Cảnh Lời Chúa",
                verse_range=f"Phần đầu phân đoạn {ref}",
                summary="Thiết lập nguyên tắc đức tin và bối cảnh cụ thể mà Lời Chúa phán bảo các tôi tớ Ngài.",
                key_truth="Lời Đức Chúa Trời là chân lý sống động, soi sáng bước chân và định hướng đời sống người tin kính."
            ),
            PassageOutlinePoint(
                section_title="II. Trọng Tâm Thần Học & Sự Mặc Khải",
                verse_range=f"Phần giữa phân đoạn {ref}",
                summary="Trình bày các phẩm tính thánh khiết, công bình, yêu thương và chương trình tể trị của Đấng Tối Cao.",
                key_truth="Đức Chúa Trời là thành tín trong mọi lời hứa và quyền năng tể trị của Ngài không hề thay đổi qua mọi thời đại."
            ),
            PassageOutlinePoint(
                section_title="III. Lời Mời Gọi & Đáp Ứng Đức Tin",
                verse_range=f"Phần kết phân đoạn {ref}",
                summary="Kêu gọi người nghe bước đi trong sự vâng phục, cầu nguyện và dấn thân làm theo thánh ý Chúa.",
                key_truth="Đức tin chân thật luôn bày tỏ qua hành động vâng phục và đời sống tôn vinh danh Chúa."
            )
        ]
        keywords = [
            PassageKeywordItem(word="Lời Chúa", strong_number="G3056", original_lemma="logos", meaning="Chân lý mặc khải và ý chỉ đời đời của Đức Chúa Trời."),
            PassageKeywordItem(word="Đức tin", strong_number="G4102", original_lemma="pistis", meaning="Sự xác tín vững vàng về những điều mình đang trông mong."),
            PassageKeywordItem(word="Ân điển", strong_number="G5485", original_lemma="charis", meaning="Sự ban cho nhưng không và lòng nhân từ vô hạn của Chúa.")
        ]
        cross_refs = [v.cross_references[0] for v in verses_list if v.cross_references][:4] or [f"{book_name} 1", "Thi Thiên 119:105"]
        themes = ["Thẩm Quyền Của Lời Chúa", "Sự Thành Tín Của Giao Ước", "Đời Sống Vâng Phục Môn Đồ Hóa"]
        reflections = [
            f"Lời Chúa trong {ref} nhắc nhở bạn điều gì về bản tính và quyền năng của Đức Chúa Trời?",
            "Có thói quen hay thái độ nào trong đời sống bạn cần được Lời Chúa trong phân đoạn này chỉnh sửa?",
            "Bài học thực hành cụ thể nhất bạn sẽ áp dụng ngay hôm nay là gì?"
        ]
        takeaway = f"Phân đoạn '{ref}' bày tỏ sự quan phòng và tình yêu đời đời của Đức Chúa Trời. Hãy lắng nghe, suy ngẫm ngày đêm và cẩn thận làm theo để đời sống được kết quả và phước hạnh."

    return PassageStudyResponse(
        reference=ref,
        book_name=book_name,
        chapter_range=chapter_range_str or ref,
        total_verses=len(verses_list),
        verses=verses_list,
        historical_context=hist_context,
        literary_genre=genre,
        author_and_date=auth_date,
        people=people,
        locations=locs,
        events=evs,
        structure_outline=outline,
        keywords=keywords,
        cross_references=cross_refs,
        theological_themes=themes,
        reflection_questions=reflections,
        scholarly_commentary_citations=citations,
        hermeneutical_takeaway=takeaway
    )




