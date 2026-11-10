"""
Pydantic schemas for the avatar preprocessing pipeline (body + face profile).

Conventions:
- Ratios are the real measurements; `*_px` values are diagnostics measured on the
  512 px padded analysis image and depend on camera distance.
- A value that could not be measured with enough confidence is `None`, never guessed.
- "left"/"right" in face fields mean the side of the *image*, not the person.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

ViewName = Literal["front", "back", "face"]
BodyViewName = Literal["front", "back"]
Severity = Literal["error", "warning"]

PROFILE_VERSION = "1.0"
PIPELINE_VERSION = "avatar-preprocess-0.1"


# ── Validation ────────────────────────────────────────────────────────────────


class ValidationIssue(BaseModel):
    view: ViewName
    code: str
    severity: Severity
    message: str


class ImageQuality(BaseModel):
    width: int
    height: int
    # height / width, after EXIF orientation is applied
    aspect_ratio: float
    # mean grey level, 0 (black) … 255 (white)
    brightness: float
    # variance of the Laplacian on a downscaled grey image; higher = sharper
    sharpness: float


class ViewValidation(BaseModel):
    quality: ImageQuality
    person_detected: bool | None = None
    full_body_visible: bool | None = None
    face_detected: bool | None = None
    # face bounding-box width / image width
    face_size_ratio: float | None = None


class ValidationReport(BaseModel):
    passed: bool
    views: dict[ViewName, ViewValidation]
    issues: list[ValidationIssue]


# ── Landmarks ─────────────────────────────────────────────────────────────────


class Landmark(BaseModel):
    """Normalized to the padded analysis image: x, y in 0…1; z is MediaPipe's relative depth."""

    x: float
    y: float
    z: float
    visibility: float | None = None


# ── Body ──────────────────────────────────────────────────────────────────────


class BodyLandmarkRatios(BaseModel):
    """Segment lengths divided by the visible height (nose → ankle midpoint)."""

    shoulder_to_height: float | None = None
    hip_to_height: float | None = None
    torso_to_height: float | None = None
    upper_arm_to_height: float | None = None
    lower_arm_to_height: float | None = None
    upper_leg_to_height: float | None = None
    lower_leg_to_height: float | None = None


class BodyLandmarkLengths(BaseModel):
    shoulder_width_px: float
    hip_width_px: float
    torso_length_px: float
    upper_arm_length_px: float
    lower_arm_length_px: float
    upper_leg_length_px: float
    lower_leg_length_px: float
    visible_height_px: float


class TorsoWidths(BaseModel):
    """Silhouette widths of the torso-central segment at shoulder, narrowest-waist and hip rows."""

    shoulder_width_px: int | None = None
    waist_width_px: int | None = None
    hip_width_px: int | None = None
    # vertical position of the detected waist row, 0 (top) … 1 (bottom)
    waist_level: float | None = None


class TorsoProportions(BaseModel):
    waist_to_shoulder: float | None = None
    waist_to_hip: float | None = None
    shoulder_to_hip: float | None = None


class SilhouetteRow(BaseModel):
    # vertical position in the image, 0 (top) … 1 (bottom)
    position: float
    # silhouette width / image width
    width_ratio: float


class BodyViewMeasurements(BaseModel):
    mean_visibility: float
    lengths: BodyLandmarkLengths
    # per-view ratios; None where the landmarks involved were not visible enough
    ratios: BodyLandmarkRatios
    ratio_confidence: dict[str, float]
    torso_widths: TorsoWidths
    torso: TorsoProportions
    foreground_ratio: float
    silhouette_profile: list[SilhouetteRow]
    landmarks: list[Landmark] = Field(..., description="33 MediaPipe pose landmarks")


class BodyProfile(BaseModel):
    # front/back fused, weighted by landmark visibility
    landmark_ratios: BodyLandmarkRatios
    # mean of the views where the torso could be measured
    torso: TorsoProportions
    views: dict[BodyViewName, BodyViewMeasurements]


# ── Face ──────────────────────────────────────────────────────────────────────


class FaceMeasurements(BaseModel):
    face_width_px: float
    face_height_px: float
    left_eye_width_px: float
    right_eye_width_px: float
    eye_distance_px: float
    nose_width_px: float
    nose_height_px: float
    lip_width_px: float
    lip_height_px: float
    left_eyebrow_width_px: float
    left_eyebrow_height_px: float
    right_eyebrow_width_px: float
    right_eyebrow_height_px: float


class FaceRatios(BaseModel):
    face_width_to_height: float | None = None
    left_eye_to_face_width: float | None = None
    right_eye_to_face_width: float | None = None
    eye_distance_to_face_width: float | None = None
    nose_width_to_face_width: float | None = None
    nose_height_to_face_height: float | None = None
    lip_width_to_face_width: float | None = None
    lip_height_to_face_height: float | None = None
    left_eyebrow_width_to_face: float | None = None
    left_eyebrow_height_to_face: float | None = None
    right_eyebrow_width_to_face: float | None = None
    right_eyebrow_height_to_face: float | None = None


class FaceSymmetry(BaseModel):
    eye_width_difference_percent: float | None = None
    eyebrow_width_difference_percent: float | None = None
    eyebrow_height_difference_percent: float | None = None


class FaceProfile(BaseModel):
    ratios: FaceRatios
    measurements: FaceMeasurements
    symmetry: FaceSymmetry
    landmarks: list[Landmark] = Field(..., description="478 MediaPipe face landmarks")


# ── Unified profile ───────────────────────────────────────────────────────────


class AvatarProfile(BaseModel):
    profile_version: str = PROFILE_VERSION
    pipeline_version: str = PIPELINE_VERSION
    body: BodyProfile
    face: FaceProfile


class PipelineTimings(BaseModel):
    decode_ms: float = 0.0
    quality_ms: float = 0.0
    pose_ms: float = 0.0
    face_ms: float = 0.0
    features_ms: float = 0.0
    total_ms: float = 0.0


class PipelineResult(BaseModel):
    """Internal result: `profile` is None whenever the report has an error-severity issue."""

    report: ValidationReport
    profile: AvatarProfile | None
    timings: PipelineTimings
