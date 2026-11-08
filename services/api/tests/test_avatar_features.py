"""Unit tests for the pure avatar measurement modules (no MediaPipe)."""

from __future__ import annotations

import io

import numpy as np
import pytest
from PIL import Image

from app.ai.avatar import body_features as body
from app.ai.avatar import face_features as face
from app.ai.avatar import silhouette
from app.ai.avatar.image_io import ImageDecodeError, decode_rgb_image, detect_image_format
from app.ai.avatar.preprocess import ContentBox, resize_with_padding
from app.ai.avatar.quality import measure_quality, quality_issues
from app.ai.avatar.schemas import ImageQuality, TorsoProportions
from tests.avatar_fixtures import face_landmarks, jpeg_bytes, standing_pose, torso_mask

# ── image_io ──────────────────────────────────────────────────────────────────


def test_detects_formats_by_magic_bytes() -> None:
    assert detect_image_format(jpeg_bytes(64, 64)) == "jpeg"
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8)).save(buffer, format="PNG")
    assert detect_image_format(buffer.getvalue()) == "png"
    assert detect_image_format(b"RIFF\x00\x00\x00\x00WEBPVP8 ") == "webp"
    assert detect_image_format(b"%PDF-1.7 not an image") is None


def test_decode_rejects_non_images_and_truncated_files() -> None:
    with pytest.raises(ImageDecodeError):
        decode_rgb_image(b"GIF89a....")
    with pytest.raises(ImageDecodeError):
        decode_rgb_image(b"\xff\xd8\xff\xe0 truncated jpeg")


def test_decode_applies_exif_orientation() -> None:
    image = Image.new("RGB", (40, 20), (200, 10, 10))
    exif = Image.Exif()
    exif[0x0112] = 6  # rotate 90° on display
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", exif=exif)
    rgb = decode_rgb_image(buffer.getvalue())
    assert rgb.shape[:2] == (40, 20)  # height, width swapped → upright portrait


# ── quality ───────────────────────────────────────────────────────────────────


def test_quality_flags_low_resolution_as_error_and_dark_as_warning() -> None:
    quality = ImageQuality(width=300, height=400, aspect_ratio=1.33, brightness=20, sharpness=500)
    issues = {issue.code: issue.severity for issue in quality_issues("front", quality)}
    assert issues == {"resolution_too_low": "error", "too_dark": "warning"}


def test_quality_landscape_body_photo_is_warned_but_face_is_not() -> None:
    quality = ImageQuality(width=1600, height=900, aspect_ratio=0.56, brightness=120, sharpness=500)
    assert [i.code for i in quality_issues("back", quality)] == ["not_portrait"]
    assert quality_issues("face", quality) == []


def test_measure_quality_reports_blur_on_flat_image() -> None:
    flat = np.full((1000, 600, 3), 128, dtype=np.uint8)
    quality = measure_quality(flat)
    assert quality.sharpness < 1.0
    assert "blurry" in [i.code for i in quality_issues("front", quality)]


# ── preprocess ────────────────────────────────────────────────────────────────


def test_resize_with_padding_centres_portrait_photo() -> None:
    canvas, box = resize_with_padding(np.full((1000, 500, 3), 255, dtype=np.uint8))
    assert canvas.shape == (512, 512, 3)
    assert box.top == 0 and box.bottom == 1
    assert box.left == pytest.approx(0.25, abs=0.01)
    assert canvas[256, 10].sum() == 0  # padding is black
    assert canvas[256, 256].sum() == 765


# ── body landmarks ────────────────────────────────────────────────────────────


def test_landmark_lengths_and_ratios_match_hand_computed_values() -> None:
    points = body.to_pixels(standing_pose(), 512)
    lengths = body.landmark_lengths(points)
    assert lengths.shoulder_width_px == pytest.approx(80)
    assert lengths.hip_width_px == pytest.approx(50)
    assert lengths.torso_length_px == pytest.approx(140)
    assert lengths.visible_height_px == pytest.approx(400)

    ratios = body.raw_ratios(lengths)
    assert ratios is not None
    assert ratios["shoulder_to_height"] == pytest.approx(0.2)
    assert ratios["upper_leg_to_height"] == pytest.approx(0.25)


def test_low_visibility_ratios_are_none_not_guessed() -> None:
    landmarks = standing_pose()
    landmarks[[body.L_WRIST, body.R_WRIST, body.L_ELBOW, body.R_ELBOW], 3] = 0.0
    points = body.to_pixels(landmarks, 512)
    ratios = body.confident_ratios(body.raw_ratios(body.landmark_lengths(points)), body.ratio_confidences(landmarks))
    assert ratios.lower_arm_to_height is None
    assert ratios.shoulder_to_height == pytest.approx(0.2)


def test_fusion_weights_views_and_skips_low_confidence_view() -> None:
    front_conf = {name: 0.9 for name in body.RATIO_LANDMARKS}
    back_conf = {name: 0.3 for name in body.RATIO_LANDMARKS}
    front = {name: 0.2 for name in body.RATIO_LANDMARKS}
    back = {name: 0.4 for name in body.RATIO_LANDMARKS}
    assert body.fuse_ratios([(front, front_conf), (back, back_conf)]).hip_to_height == pytest.approx(0.2)

    equal_conf = {name: 0.8 for name in body.RATIO_LANDMARKS}
    assert body.fuse_ratios([(front, equal_conf), (back, equal_conf)]).hip_to_height == pytest.approx(0.3)


def test_fusion_returns_none_when_no_view_is_confident() -> None:
    low = {name: 0.1 for name in body.RATIO_LANDMARKS}
    ratios = {name: 0.2 for name in body.RATIO_LANDMARKS}
    assert body.fuse_ratios([(ratios, low)]).torso_to_height is None


def test_full_body_visibility_requires_ankles_inside_photo() -> None:
    full = ContentBox(0.0, 0.0, 1.0, 1.0)
    assert body.is_full_body_visible(standing_pose(), full)
    cropped_feet = ContentBox(0.0, 0.0, 1.0, 0.8)
    assert not body.is_full_body_visible(standing_pose(), cropped_feet)
    hidden = standing_pose()
    hidden[body.L_ANKLE, 3] = 0.1
    assert not body.is_full_body_visible(hidden, full)


# ── silhouette ────────────────────────────────────────────────────────────────


def test_torso_widths_ignore_arms_and_find_narrowest_waist() -> None:
    mask = silhouette.clean_silhouette(silhouette.binarize(torso_mask()))
    points = body.to_pixels(standing_pose(), 512)
    widths = silhouette.torso_widths(mask, points)
    assert widths.shoulder_width_px == 120  # shoulder row joins arms+torso (y=120)
    assert widths.waist_width_px == 60
    assert widths.hip_width_px == 70  # arms at hip height are separate segments → excluded
    proportions = silhouette.torso_proportions(widths)
    assert proportions.waist_to_hip == pytest.approx(60 / 70, abs=1e-4)


def test_clean_silhouette_keeps_largest_component_only() -> None:
    mask = np.zeros((100, 100), dtype=np.uint8)
    mask[10:90, 40:60] = 1
    mask[5:9, 5:9] = 1  # speck of background noise
    cleaned = silhouette.clean_silhouette(mask)
    assert cleaned[6, 6] == 0
    assert cleaned[50, 50] == 1


def test_central_segment_width_handles_empty_and_out_of_range_rows() -> None:
    mask = np.zeros((10, 10), dtype=np.uint8)
    assert silhouette.central_segment_width(mask, 5, 5.0) is None
    assert silhouette.central_segment_width(mask, 50, 5.0) is None


def test_mean_torso_proportions_skips_missing_values() -> None:
    fused = silhouette.mean_torso_proportions(
        [TorsoProportions(waist_to_hip=0.8), TorsoProportions(waist_to_hip=0.9, shoulder_to_hip=1.1)]
    )
    assert fused.waist_to_hip == pytest.approx(0.85)
    assert fused.shoulder_to_hip == pytest.approx(1.1)
    assert fused.waist_to_shoulder is None


# ── face ──────────────────────────────────────────────────────────────────────


def test_face_ratios_from_synthetic_oval() -> None:
    landmarks = face_landmarks()
    measurements = face.face_measurements(landmarks[:, :2] * 512)
    ratios = face.face_ratios(measurements)
    assert ratios.face_width_to_height is not None
    assert 0.6 < ratios.face_width_to_height < 0.9  # 200 wide x 260 tall oval
    assert face.face_symmetry(measurements).eye_width_difference_percent is not None
    assert face.face_size_ratio(landmarks, content_width=1.0) == pytest.approx(200 / 512, abs=0.01)
