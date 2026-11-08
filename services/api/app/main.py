"""
HALO FastAPI application entry point.
Registers routers, the API error shape, and CORS.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.formparsers import MultiPartParser

from app.config import get_settings
from app.errors import register_error_handlers
from app.routers import avatar, garment

settings = get_settings()

# Starlette spools uploads larger than 1 MB to a temporary file on disk. Avatar photos
# must stay in memory only (privacy decision 2026-11-08), so the spool threshold is
# raised above the per-file upload limit.
MultiPartParser.spool_max_size = settings.max_upload_bytes + 1024 * 1024

app = FastAPI(
    title="HALO API",
    version="0.2.0",
    description="Backend for HALO garment analysis and avatar preprocessing.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(garment.router, prefix="/v1")
app.include_router(avatar.router, prefix="/v1")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Liveness check — no auth required."""
    return {"status": "ok"}
