"""
Integration tests for the garment router using httpx TestClient.
The Roboflow API and CLIP model are mocked — no network calls in tests.
"""

from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)

# ── Helpers ──────────────────────────────────────────────────────────────────


def _make_jpeg_bytes(color: tuple[int, int, int] = (55, 85, 130)) -> bytes:
    img = Image.new("RGB", (200, 200), color=color)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


# ── Health check ──────────────────────────────────────────────────────────────


def test_health() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ── File validation ───────────────────────────────────────────────────────────


def test_rejects_non_image_mime() -> None:
    resp = client.post(
        "/v1/garment/analyze-test",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert resp.status_code == 415
    body = resp.json()
    assert body["detail"]["code"] == "file_invalid"


def test_rejects_oversized_file() -> None:
    # 11 MB of zeros (limit is 10 MB)
    big_bytes = b"\x00" * (11 * 1024 * 1024)
    resp = client.post(
        "/v1/garment/analyze-test",
        files={"file": ("big.jpg", big_bytes, "image/jpeg")},
    )
    assert resp.status_code == 413
    assert resp.json()["detail"]["code"] == "file_invalid"


def test_returns_503_when_no_api_key() -> None:
    """Without a real ROBOFLOW_API_KEY the endpoint should return 503."""
    with patch("app.routers.garment.get_settings") as mock_settings:
        settings = MagicMock()
        settings.roboflow_api_key = ""
        settings.max_upload_bytes = 10 * 1024 * 1024
        mock_settings.return_value = settings

        resp = client.post(
            "/v1/garment/analyze-test",
            files={"file": ("test.jpg", _make_jpeg_bytes(), "image/jpeg")},
        )
    assert resp.status_code == 503
    assert resp.json()["detail"]["code"] == "model_unavailable"


def test_analyze_returns_structured_response() -> None:
    """
    Mocks the full pipeline to verify the router returns a valid
    GarmentAnalysisResponse shape without hitting any real AI service.
    """
    from app.ai.garment.schemas import (
        AttributeCandidate,
        AttributeGroup,
        ColorResult,
        DetectedGarment,
        GarmentAnalysisResponse,
        GarmentAttributes,
    )

    mock_response = GarmentAnalysisResponse(
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

    with patch("app.routers.garment.get_settings") as mock_settings, \
         patch("app.routers.garment.run_garment_analysis", return_value=mock_response):

        settings = MagicMock()
        settings.roboflow_api_key = "fake_key_for_test"
        settings.max_upload_bytes = 10 * 1024 * 1024
        settings.roboflow_model_id = "deepfashion2-m-10k/2"
        mock_settings.return_value = settings

        resp = client.post(
            "/v1/garment/analyze-test",
            files={"file": ("test.jpg", _make_jpeg_bytes(), "image/jpeg")},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["total_garments"] == 1
    assert data["garments"][0]["category"] == "trousers"
    assert data["garments"][0]["crop_base64"].startswith("data:image/jpeg")
    assert len(data["garments"][0]["colors"]) == 1
    assert data["garments"][0]["attributes"]["fabric"]["predicted"] == "denim"

