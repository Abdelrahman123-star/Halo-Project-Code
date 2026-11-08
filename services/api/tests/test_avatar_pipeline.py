"""Pipeline orchestration tests with fake detectors (tests only — no MediaPipe, no network)."""

from __future__ import annotations

import pytest

from app.ai.avatar.pipeline import InvalidUploadError, run_avatar_preprocessing
from tests.avatar_fixtures import (
    FakeFaceDetector,
    FakePoseDetector,
    face_landmarks,
    jpeg_bytes,
    standing_pose,
    torso_mask,
)


def _images() -> dict[str, bytes]:
    return {"front": jpeg_bytes(), "back": jpeg_bytes(), "face": jpeg_bytes(900, 1200)}


def test_successful_run_builds_profile_from_detected_landmarks() -> None:
    pose = FakePoseDetector(standing_pose(), torso_mask())
    result = run_avatar_preprocessing(_images(), pose, FakeFaceDetector(face_landmarks()))

    assert result.report.passed, result.report.issues
    assert result.profile is not None
    assert pose.calls == 2
    assert result.profile.body.landmark_ratios.shoulder_to_height == pytest.approx(0.2, abs=1e-3)
    assert result.profile.body.torso.waist_to_hip == pytest.approx(60 / 70, abs=1e-3)
    assert len(result.profile.body.views["front"].landmarks) == 33
    assert len(result.profile.face.landmarks) == 478
    assert result.timings.total_ms > 0


def test_no_person_detected_fails_validation_without_profile() -> None:
    result = run_avatar_preprocessing(_images(), FakePoseDetector(None), FakeFaceDetector(face_landmarks()))
    assert not result.report.passed
    assert result.profile is None
    codes = {(i.view, i.code) for i in result.report.issues}
    assert ("front", "person_not_detected") in codes
    assert ("back", "person_not_detected") in codes
    assert result.report.views["front"].person_detected is False


def test_no_face_detected_fails_validation() -> None:
    pose = FakePoseDetector(standing_pose(), torso_mask())
    result = run_avatar_preprocessing(_images(), pose, FakeFaceDetector(None))
    assert not result.report.passed
    assert result.profile is None
    assert [i.code for i in result.report.issues if i.view == "face"] == ["face_not_detected"]


def test_missing_mask_still_produces_landmark_profile_with_null_widths() -> None:
    result = run_avatar_preprocessing(
        _images(), FakePoseDetector(standing_pose(), mask=None), FakeFaceDetector(face_landmarks())
    )
    assert result.profile is not None
    assert result.profile.body.torso.waist_to_hip is None
    assert result.profile.body.landmark_ratios.hip_to_height is not None


def test_low_resolution_photo_blocks_profile() -> None:
    images = _images()
    images["face"] = jpeg_bytes(300, 400)
    result = run_avatar_preprocessing(
        images, FakePoseDetector(standing_pose(), torso_mask()), FakeFaceDetector(face_landmarks())
    )
    assert not result.report.passed
    assert ("face", "resolution_too_low") in {(i.view, i.code) for i in result.report.issues}


def test_invalid_file_raises_with_view_name() -> None:
    images = _images()
    images["back"] = b"not an image"
    with pytest.raises(InvalidUploadError) as caught:
        run_avatar_preprocessing(images, FakePoseDetector(standing_pose()), FakeFaceDetector(face_landmarks()))
    assert caught.value.view == "back"
    assert caught.value.code == "file_invalid"
