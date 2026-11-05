"""
Unit tests for Pydantic output schemas.
Validates schema construction, field types, and edge-case nullability.
"""

from app.ai.garment.schemas import (
    AttributeCandidate,
    AttributeGroup,
    ColorResult,
    DetectedGarment,
    GarmentAnalysisResponse,
    GarmentAttributes,
)


class TestColorResult:
    def test_valid(self) -> None:
        c = ColorResult(color_name="Denim Blue", hex="#3755a0", rgb=[55, 85, 160], percentage=72.3)
        assert c.hex == "#3755a0"
        assert c.percentage == 72.3

    def test_rgb_length_validated(self) -> None:
        import pytest
        with pytest.raises(Exception):
            ColorResult(color_name="X", hex="#000000", rgb=[0, 0], percentage=100.0)


class TestAttributeGroup:
    def test_nullable_predicted(self) -> None:
        ag = AttributeGroup(predicted=None, confidence=None, top_candidates=[])
        assert ag.predicted is None
        assert ag.confidence is None

    def test_with_candidates(self) -> None:
        candidate = AttributeCandidate(label="denim", confidence=81.2)
        ag = AttributeGroup(predicted="denim", confidence=81.2, top_candidates=[candidate])
        assert ag.top_candidates[0].label == "denim"


class TestGarmentAnalysisResponse:
    def test_empty_garments(self) -> None:
        resp = GarmentAnalysisResponse(
            image_width=1080, image_height=1440, total_garments=0, garments=[]
        )
        assert resp.total_garments == 0
        assert resp.garments == []

    def test_full_garment(self) -> None:
        candidate = AttributeCandidate(label="denim", confidence=81.2)
        ag = AttributeGroup(predicted="denim", confidence=81.2, top_candidates=[candidate])
        attrs = GarmentAttributes(fabric=ag, pattern=ag, subtype=ag)
        color = ColorResult(color_name="Black", hex="#111111", rgb=[17, 17, 17], percentage=100.0)
        garment = DetectedGarment(
            item_number=1,
            category="trousers",
            confidence=0.94,
            crop_base64="data:image/jpeg;base64,abc123",
            colors=[color],
            attributes=attrs,
        )
        resp = GarmentAnalysisResponse(
            image_width=800, image_height=600, total_garments=1, garments=[garment]
        )
        assert resp.garments[0].category == "trousers"
        assert resp.garments[0].crop_base64 is not None

