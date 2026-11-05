"""
Unit tests for the garment post-processing module.
All in-memory — no disk I/O.
"""

import numpy as np
from PIL import Image
from app.ai.garment.postprocess import postprocess_garment_crop, _is_lower_body_garment


class TestIsLowerBodyGarment:
    def test_trousers(self) -> None:
        assert _is_lower_body_garment("trousers") is True

    def test_jeans(self) -> None:
        assert _is_lower_body_garment("long_sleeved_jeans") is True

    def test_shorts(self) -> None:
        assert _is_lower_body_garment("shorts") is True

    def test_skirt(self) -> None:
        assert _is_lower_body_garment("skirt") is True

    def test_shirt_is_upper(self) -> None:
        assert _is_lower_body_garment("short_sleeved_shirt") is False

    def test_outwear_is_upper(self) -> None:
        assert _is_lower_body_garment("long_sleeved_outwear") is False


class TestPostprocessGarmentCrop:
    def test_returns_pil_image(self, sample_pil_image: Image.Image) -> None:
        result = postprocess_garment_crop(sample_pil_image, category="shirt")
        assert isinstance(result, Image.Image)

    def test_mode_is_rgb(self, sample_pil_image: Image.Image) -> None:
        result = postprocess_garment_crop(sample_pil_image, category="shirt")
        assert result.mode == "RGB"

    def test_lower_body_no_hanger_removal(self, sample_pil_image: Image.Image) -> None:
        # Should complete without error for lower-body garments
        result = postprocess_garment_crop(sample_pil_image, category="trousers")
        assert isinstance(result, Image.Image)

    def test_all_white_image_returns_image(self) -> None:
        white = Image.new("RGB", (100, 100), (255, 255, 255))
        result = postprocess_garment_crop(white, category="shirt")
        assert isinstance(result, Image.Image)

