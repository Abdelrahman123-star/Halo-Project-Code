"""
Avatar preprocessing router: POST /v1/avatar/preprocess (authenticated).

Synchronous by decision (2026-11-08): the benchmark showed ~0.2 s per request on CPU.
See docs/DECISIONS/ADR-0006-avatar-preprocessing-sync.md.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel

from app.ai.avatar.landmarkers import ModelUnavailableError, get_detectors
from app.ai.avatar.pipeline import FaceDetector, InvalidUploadError, PoseDetector, run_avatar_preprocessing
from app.ai.avatar.schemas import AvatarProfile, PipelineTimings, ValidationReport, ViewName
from app.auth import CurrentUserId
from app.avatar_store import save_failed_scan, save_successful_scan
from app.config import Settings, get_settings
from app.errors import ApiError
from app.supabase_rest import SupabaseRest, SupabaseWriteError

router = APIRouter(prefix="/avatar", tags=["avatar"])

SettingsDep = Annotated[Settings, Depends(get_settings)]


class AvatarPreprocessResponse(BaseModel):
    # None when the server has no service-role key yet and could not save (`saved` is False).
    avatar_id: str | None
    scan_id: str | None
    saved: bool
    user_id: str
    status: Literal["ready"]
    created_at: str
    profile: AvatarProfile
    validation: ValidationReport
    timings: PipelineTimings


def get_avatar_detectors(settings: SettingsDep) -> tuple[PoseDetector, FaceDetector]:
    try:
        return get_detectors(settings.avatar_models_dir)
    except ModelUnavailableError as exc:
        raise ApiError(503, "model_unavailable", "Avatar analysis is not available on the server right now.") from exc


def get_supabase(settings: SettingsDep) -> SupabaseRest | None:
    """Database writer, or None while the service-role key is not configured (results are not saved)."""
    if not settings.supabase_configured:
        return None
    return SupabaseRest(settings.supabase_url, settings.supabase_service_role_key, settings.supabase_timeout_seconds)


def _read_upload(view: ViewName, upload: UploadFile | None, max_bytes: int) -> bytes:
    if upload is None:
        raise ApiError(422, "scan_incomplete", f"The {view} photo is missing.", {"view": view})
    # Read one byte past the limit so oversize files are rejected without reading them fully.
    data = upload.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise ApiError(
            413, "file_invalid", f"The {view} photo is larger than {max_bytes // 1_048_576} MB.", {"view": view}
        )
    if not data:
        raise ApiError(422, "scan_incomplete", f"The {view} photo is empty.", {"view": view})
    return data


@router.post(
    "/preprocess",
    response_model=AvatarPreprocessResponse,
    summary="Analyse front/back/face photos and save the user's avatar profile",
)
def preprocess_avatar(
    user_id: CurrentUserId,
    settings: SettingsDep,
    detectors: Annotated[tuple[PoseDetector, FaceDetector], Depends(get_avatar_detectors)],
    db: Annotated[SupabaseRest | None, Depends(get_supabase)],
    front: Annotated[UploadFile | None, File(description="Full-body front photo")] = None,
    back: Annotated[UploadFile | None, File(description="Full-body back photo")] = None,
    face: Annotated[UploadFile | None, File(description="Face close-up photo")] = None,
) -> AvatarPreprocessResponse:
    # Sync `def`: FastAPI runs it in a worker thread, so CPU-bound MediaPipe work doesn't block the event loop.
    images: dict[ViewName, bytes] = {
        "front": _read_upload("front", front, settings.max_upload_bytes),
        "back": _read_upload("back", back, settings.max_upload_bytes),
        "face": _read_upload("face", face, settings.max_upload_bytes),
    }

    pose_detector, face_detector = detectors
    try:
        result = run_avatar_preprocessing(images, pose_detector, face_detector)
    except InvalidUploadError as exc:
        raise ApiError(415, exc.code, exc.message, {"view": exc.view}) from exc
    finally:
        images.clear()  # drop our references to the photo bytes as soon as analysis ends

    if not result.report.passed or result.profile is None:
        scan_id = save_failed_scan(db, user_id, result) if db else None
        raise ApiError(
            422,
            "scan_invalid",
            "Some photos need to be retaken.",
            {
                "scan_id": scan_id,
                "validation": result.report.model_dump(mode="json"),
                "timings": result.timings.model_dump(),
            },
        )

    if db is None:
        return AvatarPreprocessResponse(
            avatar_id=None,
            scan_id=None,
            saved=False,
            user_id=user_id,
            status="ready",
            created_at=datetime.now(UTC).isoformat(),
            profile=result.profile,
            validation=result.report,
            timings=result.timings,
        )

    try:
        saved = save_successful_scan(db, user_id, result)
    except SupabaseWriteError as exc:
        raise ApiError(503, "save_failed", "Your avatar profile could not be saved. Please try again.") from exc

    return AvatarPreprocessResponse(
        avatar_id=saved.avatar_id,
        scan_id=saved.scan_id,
        saved=True,
        user_id=user_id,
        status="ready",
        created_at=saved.created_at,
        profile=result.profile,
        validation=result.report,
        timings=result.timings,
    )
