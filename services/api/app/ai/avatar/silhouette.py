"""
Silhouette measurements from the MediaPipe person-segmentation mask, ported from the
HALO Colab notebook (`clean_silhouette`, `extract_silhouette_features`, refined waist search).

Change vs the notebook: shoulder and hip widths use the *torso-central* foreground
segment (as the waist already did). The full row width at hip height usually
includes the hands/arms, which inflated the hip width.
"""

from __future__ import annotations

import cv2
import numpy as np

from app.ai.avatar.body_features import L_HIP, L_SHOULDER, R_HIP, R_SHOULDER
from app.ai.avatar.schemas import SilhouetteRow, TorsoProportions, TorsoWidths

MASK_THRESHOLD = 0.5
PROFILE_ROWS = 20
# Waist search window between shoulder and hip rows (notebook values).
WAIST_SEARCH_START = 0.15
WAIST_SEARCH_END = 0.85


def binarize(mask: np.ndarray, threshold: float = MASK_THRESHOLD) -> np.ndarray:
    """Probability mask (H, W) or (H, W, 1) → uint8 0/1 mask."""
    if mask.ndim == 3:
        mask = mask[:, :, 0]
    return (mask > threshold).astype(np.uint8)


def clean_silhouette(binary_mask: np.ndarray) -> np.ndarray:
    """Morphological open/close, then keep only the largest connected component."""
    mask = (binary_mask * 255).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    label_count, labels, stats, _centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if label_count <= 1:
        return (mask > 0).astype(np.uint8)
    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return (labels == largest).astype(np.uint8)


def central_segment_width(mask: np.ndarray, y: int, center_x: float) -> int | None:
    """Width of the contiguous foreground run in row `y` closest to `center_x`."""
    if not 0 <= y < mask.shape[0]:
        return None
    foreground = np.where(mask[y, :] > 0)[0]
    if foreground.size == 0:
        return None
    segments = np.split(foreground, np.where(np.diff(foreground) > 1)[0] + 1)
    closest = min(segments, key=lambda segment: abs(float(np.mean(segment)) - center_x))
    return int(closest[-1] - closest[0] + 1)


def find_waist(mask: np.ndarray, shoulder_y: int, hip_y: int, center_x: float) -> tuple[int, int] | None:
    """Narrowest torso row between shoulders and hips → (y, width_px)."""
    span = hip_y - shoulder_y
    if span <= 2:
        return None
    start = int(shoulder_y + WAIST_SEARCH_START * span)
    end = int(shoulder_y + WAIST_SEARCH_END * span)

    candidates: list[tuple[int, int]] = []
    for y in range(start, end + 1):
        width = central_segment_width(mask, y, center_x)
        if width is not None:
            candidates.append((y, width))
    if not candidates:
        return None
    return min(candidates, key=lambda item: item[1])


def torso_widths(mask: np.ndarray, points: np.ndarray) -> TorsoWidths:
    """`points` are (33, 2) pixel landmarks on the same image as `mask`."""
    shoulder_y = round((points[L_SHOULDER, 1] + points[R_SHOULDER, 1]) / 2)
    hip_y = round((points[L_HIP, 1] + points[R_HIP, 1]) / 2)
    center_x = float(np.mean(points[[L_SHOULDER, R_SHOULDER, L_HIP, R_HIP], 0]))

    waist = find_waist(mask, shoulder_y, hip_y, center_x)
    return TorsoWidths(
        shoulder_width_px=central_segment_width(mask, shoulder_y, center_x),
        waist_width_px=waist[1] if waist else None,
        hip_width_px=central_segment_width(mask, hip_y, center_x),
        waist_level=round(waist[0] / mask.shape[0], 4) if waist else None,
    )


def _safe_ratio(numerator: int | None, denominator: int | None) -> float | None:
    if numerator is None or denominator is None or denominator == 0:
        return None
    return round(numerator / denominator, 4)


def torso_proportions(widths: TorsoWidths) -> TorsoProportions:
    return TorsoProportions(
        waist_to_shoulder=_safe_ratio(widths.waist_width_px, widths.shoulder_width_px),
        waist_to_hip=_safe_ratio(widths.waist_width_px, widths.hip_width_px),
        shoulder_to_hip=_safe_ratio(widths.shoulder_width_px, widths.hip_width_px),
    )


def mean_torso_proportions(views: list[TorsoProportions]) -> TorsoProportions:
    """Per-field mean over the views that measured it (the notebook averaged front and back)."""
    fused: dict[str, float] = {}
    for field in TorsoProportions.model_fields:
        values = [getattr(view, field) for view in views if getattr(view, field) is not None]
        if values:
            fused[field] = round(sum(values) / len(values), 4)
    return TorsoProportions(**fused)


def silhouette_profile(mask: np.ndarray, rows: int = PROFILE_ROWS) -> list[SilhouetteRow]:
    """Full-row silhouette width at evenly spaced heights (10 % … 95 %), as in the notebook."""
    height, width = mask.shape
    profile: list[SilhouetteRow] = []
    for position in np.linspace(0.10, 0.95, rows):
        y = min(height - 1, int(position * height))
        foreground = np.where(mask[y, :] > 0)[0]
        if foreground.size == 0:
            continue
        row_width = int(foreground.max() - foreground.min() + 1)
        profile.append(SilhouetteRow(position=round(float(position), 4), width_ratio=round(row_width / width, 4)))
    return profile


def foreground_ratio(mask: np.ndarray) -> float:
    return round(float(mask.mean()), 4)
