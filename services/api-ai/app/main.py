from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import health, ai, bible, rag, learn, graph, study

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BibleKnowledge AI & RAG Engine powering theological research and semantic exploration."
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(bible.router, prefix=settings.API_PREFIX)
app.include_router(rag.router, prefix=settings.API_PREFIX)
app.include_router(learn.router, prefix=settings.API_PREFIX)
app.include_router(graph.router, prefix=settings.API_PREFIX)
app.include_router(study.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to BibleKnowledge AI Engine API",
        "docs_url": "/docs",
        "health_url": "/health"
    }
