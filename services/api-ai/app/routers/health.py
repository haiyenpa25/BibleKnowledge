from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check checking API, PostgreSQL + pgvector, and Ollama."""
    health_status = {
        "status": "healthy",
        "api": "online",
        "database": "unknown",
        "pgvector": "unknown",
        "ollama": "unknown"
    }

    # 1. Check PostgreSQL & pgvector
    try:
        db.execute(text("SELECT 1"))
        health_status["database"] = "connected"

        # Check pgvector extension
        vec_check = db.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'")).fetchone()
        health_status["pgvector"] = "installed" if vec_check else "not_installed"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["database"] = f"error: {str(e)}"

    # 2. Check Ollama API
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/version")
            if resp.status_code == 200:
                health_status["ollama"] = f"connected (v{resp.json().get('version')})"
            else:
                health_status["ollama"] = f"unexpected_status: {resp.status_code}"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["ollama"] = f"unreachable: {str(e)}"

    return health_status


@router.get("/ready")
async def readiness_check():
    """Simple readiness probe."""
    return {"status": "ready"}
