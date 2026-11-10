"""
Router tests for POST /v1/avatar/preprocess.
Detectors, Supabase and auth are replaced via dependency overrides (tests only).
"""

from __future__ import annotations

from collections.abc import Iterator
from typing import Any
from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from starlette.formparsers import MultiPartParser

from app.auth import get_current_user_id
from app.config import Settings, get_settings
from app.main import app
from app.routers.avatar import get_avatar_detectors, get_supabase
from app.supabase_rest import SupabaseWriteError
from tests.avatar_fixtures import (
    FakeFaceDetector,
    FakePoseDetector,
    face_landmarks,
    jpeg_bytes,
    standing_pose,
    torso_mask,
)

USER_ID = "4f1c2b8e-1d2a-4c3b-9a8e-111111111111"


class FakeDb:
    def __init__(self, fail_on: str | None = None) -> None:
        self.inserts: list[tuple[str, dict[str, Any]]] = []
        self.deleted: list[tuple[str, str]] = []
        self.fail_on = fail_on

    def insert(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        if table == self.fail_on:
            raise SupabaseWriteError("boom")
        self.inserts.append((table, row))
        return {**row, "id": f"{table}-id", "created_at": "2026-11-08T12:00:00+00:00"}

    def delete_by_id(self, table: str, row_id: str) -> None:
        self.deleted.append((table, row_id))


@pytest.fixture()
def db() -> Iterator[FakeDb]:
    fake = FakeDb()
    app.dependency_overrides[get_current_user_id] = lambda: USER_ID
    app.dependency_overrides[get_supabase] = lambda: fake
    app.dependency_overrides[get_avatar_detectors] = lambda: (
        FakePoseDetector(standing_pose(), torso_mask()),
        FakeFaceDetector(face_landmarks()),
    )
    yield fake
    app.dependency_overrides.clear()


client = TestClient(app)


def _files(**overrides: bytes) -> dict[str, tuple[str, bytes, str]]:
    images = {"front": jpeg_bytes(), "back": jpeg_bytes(), "face": jpeg_bytes(900, 1200), **overrides}
    return {view: (f"{view}.jpg", data, "image/jpeg") for view, data in images.items()}


def test_success_saves_avatar_and_scan_and_returns_profile(db: FakeDb) -> None:
    response = client.post("/v1/avatar/preprocess", files=_files())
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["avatar_id"] == "avatars-id"
    assert body["saved"] is True
    assert body["user_id"] == USER_ID
    assert body["validation"]["passed"] is True
    assert body["profile"]["body"]["landmark_ratios"]["shoulder_to_height"] == pytest.approx(0.2, abs=1e-3)

    tables = [table for table, _ in db.inserts]
    assert tables == ["avatars", "body_scans"]
    avatar_row = db.inserts[0][1]
    scan_row = db.inserts[1][1]
    assert avatar_row["user_id"] == USER_ID
    assert "landmarks" in avatar_row["generated_params"]["face"]
    assert scan_row["avatar_id"] == "avatars-id"
    assert scan_row["validation_status"] == "passed"
    # No photo data is ever persisted.
    assert "base64" not in str(db.inserts).lower()


def test_missing_photo_returns_scan_incomplete(db: FakeDb) -> None:
    files = _files()
    del files["back"]
    response = client.post("/v1/avatar/preprocess", files=files)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "scan_incomplete"
    assert response.json()["error"]["details"]["view"] == "back"
    assert db.inserts == []


def test_non_image_upload_returns_file_invalid(db: FakeDb) -> None:
    response = client.post("/v1/avatar/preprocess", files=_files(face=b"%PDF-1.7 nope"))
    assert response.status_code == 415
    assert response.json()["error"] == {
        "code": "file_invalid",
        "message": "Face photo: Only JPEG, PNG or WEBP images are accepted.",
        "details": {"view": "face"},
    }


def test_oversize_upload_returns_413(db: FakeDb) -> None:
    app.dependency_overrides[get_settings] = lambda: Settings(max_upload_bytes=1000)
    response = client.post("/v1/avatar/preprocess", files=_files())
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "file_invalid"


def test_failed_validation_records_scan_and_returns_report(db: FakeDb) -> None:
    app.dependency_overrides[get_avatar_detectors] = lambda: (
        FakePoseDetector(None),
        FakeFaceDetector(face_landmarks()),
    )
    response = client.post("/v1/avatar/preprocess", files=_files())
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "scan_invalid"
    assert error["details"]["validation"]["passed"] is False
    assert error["details"]["scan_id"] == "body_scans-id"
    assert [table for table, _ in db.inserts] == ["body_scans"]
    assert db.inserts[0][1]["validation_status"] == "failed"


def test_scan_insert_failure_rolls_back_avatar(db: FakeDb) -> None:
    db.fail_on = "body_scans"
    response = client.post("/v1/avatar/preprocess", files=_files())
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "save_failed"
    assert db.deleted == [("avatars", "avatars-id")]


def test_upload_spool_threshold_keeps_photos_in_memory() -> None:
    assert MultiPartParser.spool_max_size > get_settings().max_upload_bytes


# ── Auth dependency (Supabase /auth/v1/user is mocked) ────────────────────────

CONFIGURED = Settings(supabase_url="https://abc.supabase.co", supabase_service_role_key="service-key")


def test_auth_requires_bearer_token() -> None:
    response = client.post("/v1/avatar/preprocess", files=_files())
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_without_service_key_returns_profile_unsaved() -> None:
    app.dependency_overrides[get_current_user_id] = lambda: USER_ID
    app.dependency_overrides[get_supabase] = lambda: None
    app.dependency_overrides[get_avatar_detectors] = lambda: (
        FakePoseDetector(standing_pose(), torso_mask()),
        FakeFaceDetector(face_landmarks()),
    )
    try:
        response = client.post("/v1/avatar/preprocess", files=_files())
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["saved"] is False
    assert body["avatar_id"] is None
    assert body["profile"]["body"]["landmark_ratios"]["shoulder_to_height"] is not None


def test_get_supabase_is_none_without_service_key() -> None:
    anon_only = Settings(supabase_url="https://abc.supabase.co", supabase_service_role_key="", supabase_anon_key="anon")
    assert get_supabase(anon_only) is None
    assert anon_only.supabase_auth_key == "anon"


def test_auth_reports_unconfigured_server() -> None:
    app.dependency_overrides[get_settings] = lambda: Settings(
        supabase_url="", supabase_service_role_key="", supabase_anon_key=""
    )
    try:
        response = client.post("/v1/avatar/preprocess", files=_files(), headers={"Authorization": "Bearer t"})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "server_not_configured"


@pytest.mark.parametrize(
    ("supabase_status", "expected_status", "expected_code"),
    [(401, 401, "unauthorized"), (500, 503, "auth_unavailable")],
)
def test_auth_maps_supabase_rejections(supabase_status: int, expected_status: int, expected_code: str) -> None:
    fake_response = MagicMock(status_code=supabase_status)
    with patch("app.auth.httpx.get", return_value=fake_response), pytest.raises(Exception) as caught:
        get_current_user_id(CONFIGURED, "Bearer token")
    assert getattr(caught.value, "status_code", None) == expected_status
    assert getattr(caught.value, "code", None) == expected_code


def test_auth_network_error_is_503() -> None:
    with patch("app.auth.httpx.get", side_effect=httpx.ConnectError("down")), pytest.raises(Exception) as caught:
        get_current_user_id(CONFIGURED, "Bearer token")
    assert getattr(caught.value, "code", None) == "auth_unavailable"


def test_auth_returns_user_id_from_supabase() -> None:
    fake_response = MagicMock(status_code=200)
    fake_response.json.return_value = {"id": USER_ID}
    with patch("app.auth.httpx.get", return_value=fake_response) as mocked:
        assert get_current_user_id(CONFIGURED, "Bearer token") == USER_ID
    assert mocked.call_args.kwargs["headers"]["Authorization"] == "Bearer token"
