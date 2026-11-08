"""
Resize-with-padding from the HALO Colab notebook.

Every photo is letterboxed onto a black square so landmark coordinates share one
scale on both axes (ratios stay valid) and all views are analysed at the same size.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

ANALYSIS_SIZE = 512


@dataclass(frozen=True)
class ContentBox:
    """Where the real photo sits inside the padded square, normalized 0…1."""

    left: float
    top: float
    right: float
    bottom: float

    def contains(self, x: float, y: float, margin: float = 0.0) -> bool:
        return self.left + margin <= x <= self.right - margin and self.top + margin <= y <= self.bottom - margin


def resize_with_padding(rgb: np.ndarray, target_size: int = ANALYSIS_SIZE) -> tuple[np.ndarray, ContentBox]:
    height, width = rgb.shape[:2]
    scale = target_size / max(height, width)
    new_width = max(1, int(width * scale))
    new_height = max(1, int(height * scale))

    resized = cv2.resize(rgb, (new_width, new_height), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((target_size, target_size, 3), dtype=np.uint8)

    x_offset = (target_size - new_width) // 2
    y_offset = (target_size - new_height) // 2
    canvas[y_offset : y_offset + new_height, x_offset : x_offset + new_width] = resized

    box = ContentBox(
        left=x_offset / target_size,
        top=y_offset / target_size,
        right=(x_offset + new_width) / target_size,
        bottom=(y_offset + new_height) / target_size,
    )
    return canvas, box
