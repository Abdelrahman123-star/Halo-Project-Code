"""
Landmark-based body measurements, ported from the HALO Colab notebook
(`extract_body_features`, `get_feature_confidence`, `fuse_body_features`).

Input landmarks are a (33, 4) array of MediaPipe pose landmarks normalized to the
square analysis image: columns x, y, z, visibility.
"""

from __future__ import annotations

import numpy as np

from app.ai.avatar.preprocess import ContentBox
from app.ai.avatar.schemas import BodyLandmarkLengths, BodyLandmarkRatios, Landmark

# MediaPipe Pose landmark indices
NOSE = 0
L_SHOULDER, R_SHOULDER = 11, 12
L_ELBOW, R_ELBOW = 13, 14
L_WRIST, R_WRIST = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANKLE, R_ANKLE = 27, 28

POSE_LANDMARK_COUNT = 33

# Landmarks each ratio depends on (from the notebook); their mean visibility is the ratio's confidence.
RATIO_LANDMARKS: dict[str, tuple[int, ...]] = {
    "shoulder_to_height": (NOSE, L_SHOULDER, R_SHOULDER, L_ANKLE, R_ANKLE),
    "hip_to_height": (NOSE, L_HIP, R_HIP, L_ANKLE, R_ANKLE),
    "torso_to_height": (NOSE, L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, L_ANKLE, R_ANKLE),
    "upper_leg_to_height": (NOSE, L_HIP, R_HIP, L_KNEE, R_KNEE, L_ANKLE, R_ANKLE),
    "lower_leg_to_height": (NOSE, L_KNEE, R_KNEE, L_ANKLE, R_ANKLE),
    "upper_arm_to_height": (NOSE, L_SHOULDER, R_SHOULDER, L_ELBOW, R_ELBOW, L_ANKLE, R_ANKLE),
    "lower_arm_to_height": (NOSE, L_ELBOW, R_ELBOW, L_WRIST, R_WRIST, L_ANKLE, R_ANKLE),
}

# Below this mean visibility a ratio is reported as None rather than guessed.
MIN_RATIO_CONFIDENCE = 0.5

# Landmarks that must be visible and inside the photo for a usable full-body view.
# The nose is excluded because it is hidden in the back view.
FULL_BODY_LANDMARKS = (L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, L_KNEE, R_KNEE, L_ANKLE, R_ANKLE)
MIN_FRAMING_VISIBILITY = 0.5


def to_pixels(landmarks: np.ndarray, image_size: int) -> np.ndarray:
    """(33, 4) normalized → (33, 2) pixel coordinates on the square analysis image."""
    return landmarks[:, :2] * float(image_size)


def _distance(points: np.ndarray, a: int, b: int) -> float:
    return float(np.linalg.norm(points[a] - points[b]))


def _midpoint(points: np.ndarray, a: int, b: int) -> np.ndarray:
    return (points[a] + points[b]) / 2.0


def landmark_lengths(points: np.ndarray) -> BodyLandmarkLengths:
    """Segment lengths in pixels; left/right limbs are averaged as in the notebook."""
    torso_length = float(np.linalg.norm(_midpoint(points, L_SHOULDER, R_SHOULDER) - _midpoint(points, L_HIP, R_HIP)))
    visible_height = float(np.linalg.norm(points[NOSE] - _midpoint(points, L_ANKLE, R_ANKLE)))

    return BodyLandmarkLengths(
        shoulder_width_px=_distance(points, L_SHOULDER, R_SHOULDER),
        hip_width_px=_distance(points, L_HIP, R_HIP),
        torso_length_px=torso_length,
        upper_arm_length_px=(_distance(points, L_SHOULDER, L_ELBOW) + _distance(points, R_SHOULDER, R_ELBOW)) / 2,
        lower_arm_length_px=(_distance(points, L_ELBOW, L_WRIST) + _distance(points, R_ELBOW, R_WRIST)) / 2,
        upper_leg_length_px=(_distance(points, L_HIP, L_KNEE) + _distance(points, R_HIP, R_KNEE)) / 2,
        lower_leg_length_px=(_distance(points, L_KNEE, L_ANKLE) + _distance(points, R_KNEE, R_ANKLE)) / 2,
        visible_height_px=visible_height,
    )


def ratio_confidences(landmarks: np.ndarray) -> dict[str, float]:
    visibility = landmarks[:, 3]
    return {name: round(float(np.mean(visibility[list(ids)])), 4) for name, ids in RATIO_LANDMARKS.items()}


def raw_ratios(lengths: BodyLandmarkLengths) -> dict[str, float] | None:
    """All seven ratios, or None when the visible height is degenerate."""
    height = lengths.visible_height_px
    if height <= 1.0:
        return None
    return {
        "shoulder_to_height": lengths.shoulder_width_px / height,
        "hip_to_height": lengths.hip_width_px / height,
        "torso_to_height": lengths.torso_length_px / height,
        "upper_arm_to_height": lengths.upper_arm_length_px / height,
        "lower_arm_to_height": lengths.lower_arm_length_px / height,
        "upper_leg_to_height": lengths.upper_leg_length_px / height,
        "lower_leg_to_height": lengths.lower_leg_length_px / height,
    }


def confident_ratios(ratios: dict[str, float] | None, confidences: dict[str, float]) -> BodyLandmarkRatios:
    if ratios is None:
        return BodyLandmarkRatios()
    kept = {
        name: round(value, 4) for name, value in ratios.items() if confidences.get(name, 0.0) >= MIN_RATIO_CONFIDENCE
    }
    return BodyLandmarkRatios(**kept)


def fuse_ratios(views: list[tuple[dict[str, float] | None, dict[str, float]]]) -> BodyLandmarkRatios:
    """
    Visibility-weighted average across views (the notebook's fusion), skipping any view
    whose confidence for that ratio is below MIN_RATIO_CONFIDENCE.
    """
    fused: dict[str, float] = {}
    for name in RATIO_LANDMARKS:
        weighted_sum = 0.0
        total_weight = 0.0
        for ratios, confidences in views:
            if ratios is None:
                continue
            weight = confidences.get(name, 0.0)
            if weight < MIN_RATIO_CONFIDENCE:
                continue
            weighted_sum += ratios[name] * weight
            total_weight += weight
        if total_weight > 0:
            fused[name] = round(weighted_sum / total_weight, 4)
    return BodyLandmarkRatios(**fused)


def is_full_body_visible(landmarks: np.ndarray, content: ContentBox) -> bool:
    for index in FULL_BODY_LANDMARKS:
        x, y, _z, visibility = landmarks[index]
        if visibility < MIN_FRAMING_VISIBILITY or not content.contains(float(x), float(y)):
            return False
    return True


def landmarks_to_schema(landmarks: np.ndarray) -> list[Landmark]:
    has_visibility = landmarks.shape[1] >= 4
    return [
        Landmark(
            x=round(float(row[0]), 4),
            y=round(float(row[1]), 4),
            z=round(float(row[2]), 4),
            visibility=round(float(row[3]), 4) if has_visibility else None,
        )
        for row in landmarks
    ]
