"""
Basic photo-quality heuristics (resolution, aspect, brightness, blur).

These are simple OpenCV measurements with hand-picked thresholds, not a learned
quality model. Only resolution is blocking; the rest are warnings so a slightly
dim photo does not stop the user.
"""

from __future__ import annotations

import cv2
import numpy as np

from app.ai.avatar.schemas import ImageQuality, ValidationIssue, ViewName

MIN_SHORT_SIDE_PX = 480
# Body photos should be portrait; a landscape full-body shot leaves the person tiny.
MIN_BODY_ASPECT = 1.2
TOO_DARK_BELOW = 50.0
TOO_BRIGHT_ABOVE = 215.0
# Laplacian variance measured on a 512 px (long side) grey copy.
BLURRY_BELOW = 40.0
_SHARPNESS_LONG_SIDE = 512


def measure_quality(rgb: np.ndarray) -> ImageQuality:
    height, width = rgb.shape[:2]
    grey = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

    # Measuring sharpness at a fixed size keeps the threshold independent of camera resolution.
    scale = _SHARPNESS_LONG_SIDE / max(height, width)
    grey_small = cv2.resize(grey, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) if scale < 1.0 else grey

    return ImageQuality(
        width=width,
        height=height,
        aspect_ratio=round(height / width, 4),
        brightness=round(float(grey.mean()), 2),
        sharpness=round(float(cv2.Laplacian(grey_small, cv2.CV_64F).var()), 2),
    )


def quality_issues(view: ViewName, quality: ImageQuality) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []

    if min(quality.width, quality.height) < MIN_SHORT_SIDE_PX:
        issues.append(
            ValidationIssue(
                view=view,
                code="resolution_too_low",
                severity="error",
                message=f"The photo is too small (at least {MIN_SHORT_SIDE_PX} px on the short side is needed).",
            )
        )

    if view != "face" and quality.aspect_ratio < MIN_BODY_ASPECT:
        issues.append(
            ValidationIssue(
                view=view,
                code="not_portrait",
                severity="warning",
                message="Hold the phone upright (portrait) for full-body photos.",
            )
        )

    if quality.brightness < TOO_DARK_BELOW:
        issues.append(
            ValidationIssue(view=view, code="too_dark", severity="warning", message="The photo looks too dark.")
        )
    elif quality.brightness > TOO_BRIGHT_ABOVE:
        issues.append(
            ValidationIssue(view=view, code="too_bright", severity="warning", message="The photo looks overexposed.")
        )

    if quality.sharpness < BLURRY_BELOW:
        issues.append(ValidationIssue(view=view, code="blurry", severity="warning", message="The photo looks blurry."))

    return issues
