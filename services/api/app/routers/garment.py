"""
Garment analysis router.
Provides POST /v1/garment/analyze-test — developer test endpoint.
No auth required (test-only), no DB writes.
"""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.ai.garment.pipeline import run_garment_analysis
from app.ai.garment.schemas import ErrorDetail, ErrorResponse, GarmentAnalysisResponse
from app.config import get_settings

router = APIRouter(prefix="/garment", tags=["garment"])

# Accepted MIME types validated by content-type header
_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}


@router.post(
    "/analyze-test",
    response_model=GarmentAnalysisResponse,
    summary="[DEV] Analyze a garment image — no auth, no DB",
    responses={
        415: {"model": ErrorResponse, "description": "Unsupported media type"},
        413: {"model": ErrorResponse, "description": "File too large"},
        503: {"model": ErrorResponse, "description": "Roboflow API unavailable"},
        500: {"model": ErrorResponse, "description": "Processing failed"},
    },
)
async def analyze_garment_test(
    file: UploadFile = File(..., description="JPEG / PNG / WEBP image of the garment"),
) -> GarmentAnalysisResponse:
    """
    Accepts a garment photo upload and returns the full analysis payload:
    detected categories, confidence scores, fabric/pattern/subtype attributes,
    dominant color swatches, and base64-encoded cleaned crop previews.
    """
    settings = get_settings()

    # --- Validate MIME type ---
    if file.content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=ErrorDetail(
                code="file_invalid",
                message=f"Only JPEG, PNG, or WEBP images are accepted. Got: {file.content_type}",
            ).model_dump(),
        )

    image_bytes = await file.read()

    # --- Validate file size ---
    if len(image_bytes) > settings.max_upload_bytes:
        max_mb = settings.max_upload_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=ErrorDetail(
                code="file_invalid",
                message=f"Image exceeds the {max_mb} MB size limit.",
            ).model_dump(),
        )

    # --- Guard: Roboflow key must be configured ---
    if not settings.roboflow_api_key or settings.roboflow_api_key.startswith("your_"):
        raise HTTPException(
            status_code=503,
            detail=ErrorDetail(
                code="model_unavailable",
                message="ROBOFLOW_API_KEY is not configured on the server.",
            ).model_dump(),
        )

    try:
        result = run_garment_analysis(
            image_bytes=image_bytes,
            roboflow_api_key=settings.roboflow_api_key,
            roboflow_model_id=settings.roboflow_model_id,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=ErrorDetail(
                code="model_unavailable",
                message=str(exc),
            ).model_dump(),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=ErrorDetail(
                code="processing_failed",
                message=f"Garment analysis failed unexpectedly: {exc}",
            ).model_dump(),
        ) from exc

    return result

