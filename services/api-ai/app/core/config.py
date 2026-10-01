from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "BibleKnowledge AI Engine"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "postgresql://postgres:bible_secure_pass_2026@postgres:5432/bible_knowledge"

    # Ollama
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://web:3000"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
