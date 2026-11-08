"""
Persists avatar preprocessing results (tables from supabase/migrations/0003_avatars.sql).

Only derived data is stored: the generated profile and the validation report. The
photos themselves are never written anywhere (decision 2026-11-08).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from app.ai.avatar.schemas import PIPELINE_VERSION, PipelineResult
from app.supabase_rest import SupabaseRest, SupabaseWriteError

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SavedAvatar:
    avatar_id: str
    scan_id: str
    created_at: str


def _scan_row(user_id: str, result: PipelineResult, avatar_id: str | None) -> dict[str, Any]:
    passed = result.report.passed
    return {
        "user_id": user_id,
        "avatar_id": avatar_id,
        "validation_status": "passed" if passed else "failed",
        "validation_report": result.report.model_dump(mode="json"),
        "processing_status": "ready" if passed else "failed",
        "processing_ms": round(result.timings.total_ms),
        "pipeline_version": PIPELINE_VERSION,
        "error": None if passed else "validation_failed",
    }


def save_successful_scan(db: SupabaseRest, user_id: str, result: PipelineResult) -> SavedAvatar:
    """Inserts the avatar, then the scan that produced it. Raises SupabaseWriteError."""
    if result.profile is None:
        raise ValueError("save_successful_scan needs a result with a profile")

    avatar = db.insert(
        "avatars",
        {"user_id": user_id, "status": "ready", "generated_params": result.profile.model_dump(mode="json")},
    )
    try:
        scan = db.insert("body_scans", _scan_row(user_id, result, avatar["id"]))
    except SupabaseWriteError:
        # No multi-statement transactions over PostgREST: undo the avatar so no orphan is left.
        try:
            db.delete_by_id("avatars", str(avatar["id"]))
        except SupabaseWriteError:
            logger.error("Could not remove avatar %s after the scan insert failed", avatar["id"])
        raise

    return SavedAvatar(avatar_id=str(avatar["id"]), scan_id=str(scan["id"]), created_at=str(avatar["created_at"]))


def save_failed_scan(db: SupabaseRest, user_id: str, result: PipelineResult) -> str | None:
    """Records a scan that failed validation. Best effort: returns None if the write fails."""
    try:
        return str(db.insert("body_scans", _scan_row(user_id, result, None))["id"])
    except SupabaseWriteError:
        logger.error("Could not record a failed body scan")
        return None
