"""
HALO FastAPI application entry point.
Registers routers and configures CORS.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import garment

settings = get_settings()

app = FastAPI(
    title="HALO API",
    version="0.1.0",
    description="Backend for the HALO AI garment analysis pipeline.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(garment.router, prefix="/v1")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Liveness check — no auth required."""
    return {"status": "ok"}

