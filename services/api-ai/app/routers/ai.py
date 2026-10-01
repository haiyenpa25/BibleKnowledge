from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Engine"])


class PromptRequest(BaseModel):
    prompt: str = "Giới thiệu ngắn gọn về Kinh Thánh Tân Ước bằng tiếng Việt trong 2 câu."
    model: str = settings.OLLAMA_MODEL


class PromptResponse(BaseModel):
    model: str
    response: str
    done: bool


@router.post("/test-llm", response_model=PromptResponse)
async def test_llm(req: PromptRequest):
    """Test connection to Ollama LLM by generating a completion."""
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": req.model,
                    "prompt": req.prompt,
                    "stream": False
                }
            )

            if resp.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Ollama returned error {resp.status_code}: {resp.text}"
                )

            data = resp.json()
            return PromptResponse(
                model=data.get("model", req.model),
                response=data.get("response", ""),
                done=data.get("done", True)
            )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot reach Ollama at {settings.OLLAMA_BASE_URL}. Ensure Ollama container is running."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ExplainVerseRequest(BaseModel):
    verse_ref: str
    verse_text: str
    context: str = ""
    question: str = ""


class ExplainVerseResponse(BaseModel):
    verse_ref: str
    explanation: str
    model: str


@router.post("/explain-verse", response_model=ExplainVerseResponse)
async def explain_verse(req: ExplainVerseRequest):
    """
    Explain theological context, historical setting, and core message of a Bible verse.
    Enforces factual accuracy and avoids theological hallucination.
    """
    system_instruction = (
        "Bạn là trợ lý nghiên cứu Kinh Thánh thông thái, khách quan và chuẩn mực. "
        "Nhiệm vụ của bạn là giải thích bối cảnh lịch sử, ý nghĩa văn hóa và bài học thuộc linh cốt lõi "
        "của câu Kinh Thánh được cung cấp. Phân biệt rõ dữ kiện bản văn và giải nghĩa thần học. "
        "Trả lời bằng tiếng Việt gãy gọn, có cấu trúc rõ ràng: "
        "1. Bối cảnh lịch sử & văn cảnh; 2. Ý nghĩa cốt lõi; 3. Ứng dụng thực tế. Không tự suy diễn ngoài bản văn."
    )

    prompt = f"{system_instruction}\n\n"
    prompt += f"Câu Kinh Thánh: [{req.verse_ref}]\n"
    if req.context:
        prompt += f"Tiểu đoạn / Bối cảnh: {req.context}\n"
    prompt += f"Kinh văn: \"{req.verse_text}\"\n"
    if req.question:
        prompt += f"Câu hỏi của người học: {req.question}\n"
    prompt += "\nTrả lời chi tiết, súc tích:"

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                }
            )

            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Ollama error: {resp.text}")

            data = resp.json()
            return ExplainVerseResponse(
                verse_ref=req.verse_ref,
                explanation=data.get("response", "").strip(),
                model=data.get("model", settings.OLLAMA_MODEL)
            )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Ollama service unreachable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
