"""
Integration tests for the garment router using httpx TestClient.
The Roboflow API, CLIP model, and Supabase Auth/REST are mocked — no network calls in tests.
"""

from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.ai.garment.schemas import (
    AttributeCandidate,
    AttributeGroup,
    ColorResult,
    DetectedGarment,
    GarmentAnalysisResponse,
    GarmentAttributes,
    SavedWardrobeRow,
)
from app.dependencies import AuthenticatedUser, verify_bearer_token
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def default_auth():
    app.dependency_overrides[verify_bearer_token] = lambda: AuthenticatedUser(
        id="b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        email="user@halo.app",
        access_token="fake-jwt",
    )
    yield
    app.dependency_overrides.clear()


def _make_jpeg_bytes(
    color: tuple[int, int, int] = (55, 85, 130),
    size: tuple[int, int] = (200, 200),
) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _sample_analysis_response() -> GarmentAnalysisResponse:
    return GarmentAnalysisResponse(
        image_width=200,
        image_height=200,
        total_garments=1,
        garments=[
            DetectedGarment(
                item_number=1,
                category="trousers",
                confidence=0.94,
                crop_base64="data:image/jpeg;base64,abc",
                colors=[
                    ColorResult(
                        color_name="Denim Blue",
                        hex="#3755a0",
                        rgb=[55, 85, 160],
                        percentage=100.0,
                    )
                ],
                attributes=GarmentAttributes(
                    fabric=AttributeGroup(
                        predicted="denim",
                        confidence=81.0,
                        top_candidates=[AttributeCandidate(label="denim", confidence=81.0)],
                    ),
                    pattern=AttributeGroup(
                        predicted="solid plain",
                        confidence=91.0,
                        top_candidates=[AttributeCandidate(label="solid plain", confidence=91.0)],
                    ),
                    subtype=AttributeGroup(
                        predicted="straight-leg denim jeans",
                        confidence=67.0,
                        top_candidates=[
                            AttributeCandidate(label="straight-leg denim jeans", confidence=67.0)
                        ],
                    ),
                ),
            )
        ],
    )


def test_health() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_rejects_non_image_mime() -> None:
    resp = client.post(
        "/v1/garment/analyze",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert resp.status_code == 415
    assert resp.json()["detail"]["code"] == "file_invalid"


def test_rejects_spoofed_magic_bytes() -> None:
    resp = client.post(
        "/v1/garment/analyze",
        files={"file": ("spoof.jpg", b"not_jpeg_magic_header_bytes", "image/jpeg")},
    )
    assert resp.status_code == 415
    assert resp.json()["detail"]["code"] == "file_invalid"


def test_rejects_tiny_dimensions() -> None:
    resp = client.post(
        "/v1/garment/analyze",
        files={"file": ("tiny.jpg", _make_jpeg_bytes(size=(16, 16)), "image/jpeg")},
    )
    assert resp.status_code == 422
    assert resp.json()["detail"]["code"] == "validation_error"


def test_rejects_oversized_file() -> None:
    big_bytes = b"\x00" * (11 * 1024 * 1024)
    resp = client.post(
        "/v1/garment/analyze",
        files={"file": ("big.jpg", big_bytes, "image/jpeg")},
    )
    assert resp.status_code == 413
    assert resp.json()["detail"]["code"] == "file_invalid"


def test_returns_503_when_no_api_key() -> None:
    with patch("app.routers.garment.get_settings") as mock_settings:
        settings = MagicMock()
        settings.roboflow_api_key = ""
        settings.max_upload_bytes = 10 * 1024 * 1024
        mock_settings.return_value = settings

        resp = client.post(
            "/v1/garment/analyze",
            files={"file": ("test.jpg", _make_jpeg_bytes(), "image/jpeg")},
        )
    assert resp.status_code == 503
    assert resp.json()["detail"]["code"] == "model_unavailable"


def test_analyze_returns_structured_response() -> None:
    mock_response = _sample_analysis_response()
    with patch("app.routers.garment.get_settings") as mock_settings, \
         patch("app.routers.garment.run_garment_analysis", return_value=mock_response):
        settings = MagicMock()
        settings.roboflow_api_key = "fake_key_for_test"
        settings.max_upload_bytes = 10 * 1024 * 1024
        settings.roboflow_model_id = "deepfashion2-m-10k/2"
        mock_settings.return_value = settings

        resp = client.post(
            "/v1/garment/analyze?persist=false",
            files={"file": ("test.jpg", _make_jpeg_bytes(), "image/jpeg")},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["persisted"] is False
    assert data["analysis"]["total_garments"] == 1
    assert data["analysis"]["garments"][0]["category"] == "trousers"
    assert data["analysis"]["garments"][0]["attributes"]["fabric"]["predicted"] == "denim"


def test_authenticated_analyze_rejects_missing_token() -> None:
    app.dependency_overrides.clear()
    resp = client.post(
        "/v1/garment/analyze",
        files={"file": ("test.jpg", _make_jpeg_bytes(), "image/jpeg")},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"]["code"] == "unauthorized"


def test_authenticated_analyze_and_persist() -> None:
    mock_response = _sample_analysis_response()
    saved_row = SavedWardrobeRow(
        id="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        user_id="b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        name="Straight-leg denim jeans",
        category="trousers",
        confidence=0.94,
        crop_base64="data:image/jpeg;base64,abc",
        colors=mock_response.garments[0].colors,
        attributes={"ai_original": {"category": "trousers"}},
        created_at="2026-11-07T12:00:00Z",
        updated_at="2026-11-07T12:00:00Z",
    )

    with patch("app.routers.garment.get_settings") as mock_settings, \
         patch("app.routers.garment.run_garment_analysis", return_value=mock_response), \
         patch("app.routers.garment._persist_detected_garments", return_value=[saved_row]):
        settings = MagicMock()
        settings.roboflow_api_key = "fake_key"
        settings.max_upload_bytes = 10 * 1024 * 1024
        settings.roboflow_model_id = "deepfashion2-m-10k/2"
        mock_settings.return_value = settings

        resp = client.post(
            "/v1/garment/analyze",
            files={"file": ("test.jpg", _make_jpeg_bytes(), "image/jpeg")},
        )

    assert resp.status_code == 200
    payload = resp.json()
    assert payload["persisted"] is True
    assert len(payload["saved_items"]) == 1
    assert payload["saved_items"][0]["name"] == "Straight-leg denim jeans"
