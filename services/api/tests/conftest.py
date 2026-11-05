"""
Pytest fixtures shared across the test suite.
"""

import io
import pytest
from PIL import Image


@pytest.fixture()
def sample_rgb_image_bytes() -> bytes:
    """Returns JPEG bytes of a solid-colour 200×200 test image."""
    img = Image.new("RGB", (200, 200), color=(55, 85, 130))  # Denim Blue-ish
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture()
def sample_pil_image() -> Image.Image:
    """Returns a small solid-colour PIL image for unit tests."""
    return Image.new("RGB", (300, 400), color=(55, 85, 130))

