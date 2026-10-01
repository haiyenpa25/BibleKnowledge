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
