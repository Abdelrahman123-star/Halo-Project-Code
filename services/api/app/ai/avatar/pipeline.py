"""
Avatar preprocessing orchestrator: three photos (bytes) → validation report + profile.

Detectors are passed in (dependency injection) so the pipeline is testable without
MediaPipe and the model wrappers stay replaceable. Everything runs in memory; the
photos are not written anywhere and are dropped when this function returns.
"""

from __future__ import annotations

import time
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Protocol

import numpy as np

from app.ai.avatar import body_features as body
from app.ai.avatar import face_features as face
from app.ai.avatar import silhouette
from app.ai.avatar.image_io import ImageDecodeError, decode_rgb_image
from app.ai.avatar.preprocess import ANALYSIS_SIZE, resize_with_padding
from app.ai.avatar.quality import measure_quality, quality_issues
from app.ai.avatar.schemas import (
    AvatarProfile,
    BodyProfile,
    BodyViewMeasurements,
    BodyViewName,
    FaceProfile,
    PipelineResult,
    PipelineTimings,
    TorsoWidths,
    ValidationIssue,
    ValidationReport,
    ViewName,
    ViewValidation,
)

VIEWS: tuple[ViewName, ...] = ("front", "back", "face")
BODY_VIEWS: tuple[BodyViewName, ...] = ("front", "back")
# Face bounding box narrower than this share of the photo → "come closer" warning.
MIN_FACE_SIZE_RATIO = 0.25


@dataclass(frozen=True)
class PoseDetection:
    landmarks: np.ndarray | None  # (33, 4): x, y, z, visibility — normalized
    mask: np.ndarray | None  # (H, W) person probability, same size as the input


@dataclass(frozen=True)
class FaceDetection:
    landmarks: np.ndarray | None  # (478, 3): x, y, z — normalized


class PoseDetector(Protocol):
    def detect(self, rgb: np.ndarray) -> PoseDetection: ...


class FaceDetector(Protocol):
    def detect(self, rgb: np.ndarray) -> FaceDetection: ...


class InvalidUploadError(Exception):
    """One of the uploads is not a usable image file (maps to HTTP 415/413)."""

    def __init__(self, view: ViewName, code: str, message: str) -> None:
        super().__init__(message)
        self.view = view
        self.code = code
        self.message = message


def _ms(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 1)


def measure_body_view(landmarks: np.ndarray, mask: np.ndarray | None) -> BodyViewMeasurements:
    points = body.to_pixels(landmarks, ANALYSIS_SIZE)
    lengths = body.landmark_lengths(points)
    confidences = body.ratio_confidences(landmarks)

    if mask is not None:
        clean = silhouette.clean_silhouette(silhouette.binarize(mask))
        widths = silhouette.torso_widths(clean, points)
        profile = silhouette.silhouette_profile(clean)
        foreground = silhouette.foreground_ratio(clean)
    else:
        widths, profile, foreground = TorsoWidths(), [], 0.0

    return BodyViewMeasurements(
        mean_visibility=round(float(np.mean(landmarks[:, 3])), 4),
        lengths=lengths,
        ratios=body.confident_ratios(body.raw_ratios(lengths), confidences),
        ratio_confidence=confidences,
        torso_widths=widths,
        torso=silhouette.torso_proportions(widths),
        foreground_ratio=foreground,
        silhouette_profile=profile,
        landmarks=body.landmarks_to_schema(landmarks),
    )


def run_avatar_preprocessing(
    images: Mapping[ViewName, bytes],
    pose_detector: PoseDetector,
    face_detector: FaceDetector,
) -> PipelineResult:
    total_start = time.perf_counter()
    timings = PipelineTimings()

    # 1. Decode (raises on a bad file — that is a client error, not a validation issue)
    start = time.perf_counter()
    decoded: dict[ViewName, np.ndarray] = {}
    for view in VIEWS:
        try:
            decoded[view] = decode_rgb_image(images[view])
        except ImageDecodeError as exc:
            raise InvalidUploadError(view, exc.code, f"{view.capitalize()} photo: {exc.message}") from exc
    timings.decode_ms = _ms(start)

    # 2. Quality heuristics
    start = time.perf_counter()
    issues: list[ValidationIssue] = []
    validations: dict[ViewName, ViewValidation] = {}
    for view in VIEWS:
        quality = measure_quality(decoded[view])
        validations[view] = ViewValidation(quality=quality)
        issues.extend(quality_issues(view, quality))
    timings.quality_ms = _ms(start)

    # 3. Body landmarks + segmentation
    start = time.perf_counter()
    body_detections: dict[BodyViewName, PoseDetection] = {}
    for view in BODY_VIEWS:
        padded, content = resize_with_padding(decoded[view])
        detection = pose_detector.detect(padded)
        validation = validations[view]
        validation.person_detected = detection.landmarks is not None
        if detection.landmarks is None:
            issues.append(
                ValidationIssue(
                    view=view,
                    code="person_not_detected",
                    severity="error",
                    message=f"We couldn't find a person in the {view} photo.",
                )
            )
            continue
        body_detections[view] = detection
        validation.full_body_visible = body.is_full_body_visible(detection.landmarks, content)
        if not validation.full_body_visible:
            # The front view drives the measurements; a partial back view only lowers fusion weight.
            issues.append(
                ValidationIssue(
                    view=view,
                    code="body_incomplete",
                    severity="error" if view == "front" else "warning",
                    message=f"Make sure your whole body, head to feet, is inside the {view} photo.",
                )
            )
    timings.pose_ms = _ms(start)

    # 4. Face landmarks
    start = time.perf_counter()
    face_padded, face_content = resize_with_padding(decoded["face"])
    face_detection = face_detector.detect(face_padded)
    face_validation = validations["face"]
    face_validation.face_detected = face_detection.landmarks is not None
    if face_detection.landmarks is None:
        issues.append(
            ValidationIssue(
                view="face",
                code="face_not_detected",
                severity="error",
                message="We couldn't find a face in the close-up photo.",
            )
        )
    else:
        size_ratio = face.face_size_ratio(face_detection.landmarks, face_content.right - face_content.left)
        face_validation.face_size_ratio = size_ratio
        if size_ratio < MIN_FACE_SIZE_RATIO:
            issues.append(
                ValidationIssue(
                    view="face",
                    code="face_too_small",
                    severity="warning",
                    message="Bring the camera closer so your face fills the oval.",
                )
            )
    timings.face_ms = _ms(start)

    passed = not any(issue.severity == "error" for issue in issues)
    report = ValidationReport(passed=passed, views=validations, issues=issues)

    profile: AvatarProfile | None = None
    if passed and face_detection.landmarks is not None:
        start = time.perf_counter()
        profile = _build_profile(body_detections, face_detection.landmarks)
        timings.features_ms = _ms(start)

    timings.total_ms = _ms(total_start)
    return PipelineResult(report=report, profile=profile, timings=timings)


def _build_profile(detections: Mapping[BodyViewName, PoseDetection], face_landmarks: np.ndarray) -> AvatarProfile:
    views: dict[BodyViewName, BodyViewMeasurements] = {}
    fusion_inputs: list[tuple[dict[str, float] | None, dict[str, float]]] = []
    for view, detection in detections.items():
        if detection.landmarks is None:
            continue
        views[view] = measure_body_view(detection.landmarks, detection.mask)
        fusion_inputs.append((body.raw_ratios(views[view].lengths), views[view].ratio_confidence))

    face_points = face_landmarks[:, :2] * float(ANALYSIS_SIZE)
    measurements = face.face_measurements(face_points)

    return AvatarProfile(
        body=BodyProfile(
            landmark_ratios=body.fuse_ratios(fusion_inputs),
            torso=silhouette.mean_torso_proportions([v.torso for v in views.values()]),
            views=views,
        ),
        face=FaceProfile(
            ratios=face.face_ratios(measurements),
            measurements=measurements,
            symmetry=face.face_symmetry(measurements),
            landmarks=body.landmarks_to_schema(face_landmarks),
        ),
    )
