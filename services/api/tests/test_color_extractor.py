"""
Unit tests for the color extractor module.
All tests are pure Python — no network, no disk.
"""

from PIL import Image
from app.ai.garment.color_extractor import extract_garment_colors, _match_color_name


class TestMatchColorName:
    def test_pure_black_maps_to_black(self) -> None:
        assert _match_color_name((10, 10, 10)) == "Black"

    def test_pure_white_maps_to_white(self) -> None:
        name = _match_color_name((250, 250, 250))
        assert "White" in name

    def test_denim_blue_ish(self) -> None:
        # (55, 85, 130) is the centroid for "Denim Blue" in the palette
        assert _match_color_name((55, 85, 130)) == "Denim Blue"

    def test_returns_string(self) -> None:
        result = _match_color_name((200, 100, 50))
        assert isinstance(result, str) and len(result) > 0


class TestExtractGarmentColors:
    def test_returns_list(self, sample_pil_image: Image.Image) -> None:
        bbox = (150.0, 200.0, 300.0, 400.0)
        result = extract_garment_colors(sample_pil_image, bbox, n_clusters=2)
        assert isinstance(result, list)

    def test_result_count_leq_n_clusters(self, sample_pil_image: Image.Image) -> None:
        bbox = (150.0, 200.0, 300.0, 400.0)
        result = extract_garment_colors(sample_pil_image, bbox, n_clusters=3)
        assert len(result) <= 3

    def test_percentages_sum_to_100(self, sample_pil_image: Image.Image) -> None:
        bbox = (150.0, 200.0, 300.0, 400.0)
        result = extract_garment_colors(sample_pil_image, bbox, n_clusters=3)
        if result:
            total = sum(c.percentage for c in result)
            assert abs(total - 100.0) < 2.0

    def test_empty_bbox_returns_empty(self, sample_pil_image: Image.Image) -> None:
        # x2 <= x1 → should return []
        result = extract_garment_colors(sample_pil_image, (0.0, 0.0, 0.0, 0.0))
        assert result == []

    def test_hex_format(self, sample_pil_image: Image.Image) -> None:
        bbox = (150.0, 200.0, 300.0, 400.0)
        result = extract_garment_colors(sample_pil_image, bbox, n_clusters=1)
        if result:
            assert result[0].hex.startswith("#")
            assert len(result[0].hex) == 7

    def test_rgb_has_three_ints(self, sample_pil_image: Image.Image) -> None:
        bbox = (150.0, 200.0, 300.0, 400.0)
        result = extract_garment_colors(sample_pil_image, bbox, n_clusters=1)
        if result:
            assert len(result[0].rgb) == 3
            assert all(isinstance(v, int) for v in result[0].rgb)

