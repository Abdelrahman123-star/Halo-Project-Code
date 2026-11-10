"""
Safe in-memory image decoding for avatar photos.

The file type is decided by magic bytes, not by the client's Content-Type header.
EXIF orientation is applied so phone photos are analysed upright. Nothing touches disk.
"""

from __future__ import annotations

from io import BytesIO
from typing import Literal

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

ImageFormat = Literal["jpeg", "png", "webp"]

# Refuse to decode anything bigger than this; phone cameras are well below it.
MAX_PIXELS = 50_000_000


class ImageDecodeError(ValueError):
    """The bytes are not a supported, decodable image. `code` maps to the API error code."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def detect_image_format(data: bytes) -> ImageFormat | None:
    if data.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def decode_rgb_image(data: bytes) -> np.ndarray:
    """Returns an upright RGB uint8 array of shape (H, W, 3) or raises ImageDecodeError."""
    if detect_image_format(data) is None:
        raise ImageDecodeError("file_invalid", "Only JPEG, PNG or WEBP images are accepted.")

    try:
        image = Image.open(BytesIO(data))
        # Header-only size check before the full decode, as a decompression-bomb guard.
        width, height = image.size
        if width * height > MAX_PIXELS:
            raise ImageDecodeError("file_invalid", "Image resolution is too large.")
        image = ImageOps.exif_transpose(image)
        rgb = image.convert("RGB")
    except ImageDecodeError:
        raise
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise ImageDecodeError("file_invalid", "The image could not be read.") from exc

    return np.asarray(rgb, dtype=np.uint8)
