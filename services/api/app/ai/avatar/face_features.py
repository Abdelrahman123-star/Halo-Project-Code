"""
Facial measurements from MediaPipe Face Landmarker output, ported from the HALO
Colab notebook (FACE_REGIONS, region extents, normalized ratios, symmetry).

Input: (478, 3) landmarks normalized to the square analysis image (x, y, z).
"left"/"right" are image sides; with a mirrored selfie they may be swapped, which
does not change any ratio or symmetry value.
"""

from __future__ import annotations

import numpy as np

from app.ai.avatar.schemas import FaceMeasurements, FaceRatios, FaceSymmetry

FACE_LANDMARK_COUNT = 478

FACE_REGIONS: dict[str, tuple[int, ...]] = {
    "face_outline": (
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
        400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
        54, 103, 67, 109,
    ),
    "left_eye": (33, 133, 159, 145, 160, 144, 158, 153),
    "right_eye": (362, 263, 386, 374, 387, 373, 385, 380),
    "left_eyebrow": (70, 63, 105, 66, 107),
    "right_eyebrow": (336, 296, 334, 293, 300),
    "nose": (1, 2, 98, 327, 168, 6, 197, 195, 5, 4, 45, 275, 440, 344),
    "lips": (
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402,
        317, 14, 87, 178, 88, 95,
    ),
}  # fmt: skip


def _region(points: np.ndarray, name: str) -> np.ndarray:
    return points[list(FACE_REGIONS[name])]


def _extent(region: np.ndarray) -> tuple[float, float]:
    """(width, height) of the region's bounding box."""
    return float(np.ptp(region[:, 0])), float(np.ptp(region[:, 1]))


def face_measurements(points: np.ndarray) -> FaceMeasurements:
    """`points` are (478, 2) pixel coordinates."""
    face_w, face_h = _extent(_region(points, "face_outline"))
    left_eye = _region(points, "left_eye")
    right_eye = _region(points, "right_eye")
    nose_w, nose_h = _extent(_region(points, "nose"))
    lip_w, lip_h = _extent(_region(points, "lips"))
    left_brow_w, left_brow_h = _extent(_region(points, "left_eyebrow"))
    right_brow_w, right_brow_h = _extent(_region(points, "right_eyebrow"))

    return FaceMeasurements(
        face_width_px=round(face_w, 2),
        face_height_px=round(face_h, 2),
        left_eye_width_px=round(_extent(left_eye)[0], 2),
        right_eye_width_px=round(_extent(right_eye)[0], 2),
        eye_distance_px=round(float(np.linalg.norm(right_eye.mean(axis=0) - left_eye.mean(axis=0))), 2),
        nose_width_px=round(nose_w, 2),
        nose_height_px=round(nose_h, 2),
        lip_width_px=round(lip_w, 2),
        lip_height_px=round(lip_h, 2),
        left_eyebrow_width_px=round(left_brow_w, 2),
        left_eyebrow_height_px=round(left_brow_h, 2),
        right_eyebrow_width_px=round(right_brow_w, 2),
        right_eyebrow_height_px=round(right_brow_h, 2),
    )


def _ratio(numerator: float, denominator: float) -> float | None:
    if denominator <= 0:
        return None
    return round(numerator / denominator, 4)


def face_ratios(m: FaceMeasurements) -> FaceRatios:
    return FaceRatios(
        face_width_to_height=_ratio(m.face_width_px, m.face_height_px),
        left_eye_to_face_width=_ratio(m.left_eye_width_px, m.face_width_px),
        right_eye_to_face_width=_ratio(m.right_eye_width_px, m.face_width_px),
        eye_distance_to_face_width=_ratio(m.eye_distance_px, m.face_width_px),
        nose_width_to_face_width=_ratio(m.nose_width_px, m.face_width_px),
        nose_height_to_face_height=_ratio(m.nose_height_px, m.face_height_px),
        lip_width_to_face_width=_ratio(m.lip_width_px, m.face_width_px),
        lip_height_to_face_height=_ratio(m.lip_height_px, m.face_height_px),
        left_eyebrow_width_to_face=_ratio(m.left_eyebrow_width_px, m.face_width_px),
        left_eyebrow_height_to_face=_ratio(m.left_eyebrow_height_px, m.face_height_px),
        right_eyebrow_width_to_face=_ratio(m.right_eyebrow_width_px, m.face_width_px),
        right_eyebrow_height_to_face=_ratio(m.right_eyebrow_height_px, m.face_height_px),
    )


def _difference_percent(left: float, right: float) -> float | None:
    average = (left + right) / 2
    if average <= 0:
        return None
    return round(abs(left - right) / average * 100, 2)


def face_symmetry(m: FaceMeasurements) -> FaceSymmetry:
    return FaceSymmetry(
        eye_width_difference_percent=_difference_percent(m.left_eye_width_px, m.right_eye_width_px),
        eyebrow_width_difference_percent=_difference_percent(m.left_eyebrow_width_px, m.right_eyebrow_width_px),
        eyebrow_height_difference_percent=_difference_percent(m.left_eyebrow_height_px, m.right_eyebrow_height_px),
    )


def face_size_ratio(landmarks: np.ndarray, content_width: float) -> float:
    """Face bounding-box width relative to the photo's width (not the padded square)."""
    outline = landmarks[list(FACE_REGIONS["face_outline"]), 0]
    return round(float(np.ptp(outline)) / max(content_width, 1e-6), 4)
