"""
Garment analysis & wardrobe persistence router.
- POST /v1/garment/analyze: Authenticated production endpoint (Bearer JWT, magic bytes,
  size & dimension checks, CV pipeline, and RLS-forwarded wardrobe_items persistence).
"""

from __future__ import annotations

from io import BytesIO

import httpx
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from PIL import Image, UnidentifiedImageError

from app.ai.garment.pipeline import run_garment_analysis
from app.ai.garment.schemas import (
    DetectedGarment,
    ErrorDetail,
    ErrorResponse,
    GarmentAnalysisResponse,
    GarmentAnalyzeAndSaveResponse,
    SavedWardrobeRow,
)
from app.config import Settings, get_settings
from app.dependencies import AuthUserDep

router = APIRouter(prefix="/garment", tags=["garment"])

_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
_MIN_DIMENSION = 32
_MAX_DIMENSION = 8192


def _has_valid_magic_bytes(data: bytes) -> bool:
    if len(data) < 12:
        return False
    if data[:3] == b"\xff\xd8\xff":
        return True
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    return data[:4] == b"RIFF" and data[8:12] == b"WEBP"


def _validate_image_upload(content_type: str | None, image_bytes: bytes, max_bytes: int) -> None:
    if content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=ErrorDetail(
                code="file_invalid",
                message=f"Only JPEG, PNG, or WEBP images are accepted. Got: {content_type}",
            ).model_dump(),
        )

    if len(image_bytes) > max_bytes:
        max_mb = max_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=ErrorDetail(
                code="file_invalid",
                message=f"Image exceeds the {max_mb} MB size limit.",
            ).model_dump(),
        )

    if not _has_valid_magic_bytes(image_bytes):
        raise HTTPException(
            status_code=415,
            detail=ErrorDetail(
                code="file_invalid",
                message="File header magic bytes do not match JPEG, PNG, or WEBP.",
            ).model_dump(),
        )

    try:
        with Image.open(BytesIO(image_bytes)) as img:
            width, height = img.size
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(
            status_code=415,
            detail=ErrorDetail(code="file_invalid", message="Corrupted image payload.").model_dump(),
        ) from exc

    if not (_MIN_DIMENSION <= width <= _MAX_DIMENSION and _MIN_DIMENSION <= height <= _MAX_DIMENSION):
        raise HTTPException(
            status_code=422,
            detail=ErrorDetail(
                code="validation_error",
                message=f"Image dimensions ({width}x{height}) must be {_MIN_DIMENSION}–{_MAX_DIMENSION}px.",
            ).model_dump(),
        )


def _execute_pipeline(image_bytes: bytes, settings: Settings) -> GarmentAnalysisResponse:
    if not settings.roboflow_api_key or settings.roboflow_api_key.startswith("your_"):
        raise HTTPException(
            status_code=503,
            detail=ErrorDetail(
                code="model_unavailable",
                message="ROBOFLOW_API_KEY is not configured on the server.",
            ).model_dump(),
        )

    try:
        return run_garment_analysis(
            image_bytes=image_bytes,
            roboflow_api_key=settings.roboflow_api_key,
            roboflow_model_id=settings.roboflow_model_id,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=ErrorDetail(code="model_unavailable", message=str(exc)).model_dump(),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=ErrorDetail(
                code="processing_failed",
                message=f"Garment analysis failed unexpectedly: {exc}",
            ).model_dump(),
        ) from exc


async def _persist_detected_garments(
    garments: list[DetectedGarment],
    user_id: str,
    access_token: str,
    settings: Settings,
) -> list[SavedWardrobeRow]:
    base_url = settings.supabase_url.strip().rstrip("/")
    anon_key = settings.supabase_anon_key.strip()
    if not base_url or not anon_key or not garments:
        return []

    rows_payload = []
    for g in garments:
        subtype = g.attributes.subtype.predicted
        raw_name = subtype or g.category.replace("_", " ")
        name = raw_name[:1].upper() + raw_name[1:] if raw_name else "Garment"
        attrs_dict = g.attributes.model_dump()
        attrs_dict["ai_original"] = {
            "category": g.category,
            "subtype": g.attributes.subtype.predicted,
            "fabric": g.attributes.fabric.predicted,
            "pattern": g.attributes.pattern.predicted,
        }
        rows_payload.append(
            {
                "user_id": user_id,
                "name": name,
                "category": g.category,
                "confidence": g.confidence,
                "crop_base64": g.crop_base64,
                "colors": [c.model_dump() for c in g.colors],
                "attributes": attrs_dict,
            }
        )

    async with httpx.AsyncClient(timeout=12.0) as client:
        resp = await client.post(
            f"{base_url}/rest/v1/wardrobe_items",
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=rows_payload,
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=ErrorDetail(
                code="processing_failed",
                message="Failed to persist detected garments to wardrobe database.",
            ).model_dump(),
        )

    data = resp.json()
    return [SavedWardrobeRow.model_validate(row) for row in data] if isinstance(data, list) else []


@router.post(
    "/analyze",
    response_model=GarmentAnalyzeAndSaveResponse,
    summary="Analyze a garment photo and save detected items to user's wardrobe",
    responses={
        401: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def analyze_and_save_garment(
    user: AuthUserDep,
    file: UploadFile = File(..., description="JPEG / PNG / WEBP image of the garment"),
    persist: bool = Query(True, description="Persist detected garments to wardrobe_items"),
) -> GarmentAnalyzeAndSaveResponse:
    settings = get_settings()
    image_bytes = await file.read()
    _validate_image_upload(file.content_type, image_bytes, settings.max_upload_bytes)
    analysis = _execute_pipeline(image_bytes, settings)
    saved_items = (
        await _persist_detected_garments(analysis.garments, user.id, user.access_token, settings)
        if persist and analysis.garments
        else []
    )
    return GarmentAnalyzeAndSaveResponse(
        analysis=analysis,
        saved_items=saved_items,
        persisted=bool(saved_items),
    )
