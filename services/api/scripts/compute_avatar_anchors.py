"""
Computes where body parts are on the app's static preview avatar image, so the app can
pin the user's measurements to the right spots. Runs the same MediaPipe models as the
preprocessing pipeline on the avatar picture itself (not on user photos).

Usage (from services/api):
    python scripts/compute_avatar_anchors.py [--preview OUT.png]

Prints normalized (0…1) anchor coordinates to paste into
apps/mobile/src/features/avatar/avatarAnchors.ts. Re-run if the avatar image changes.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT))

from app.ai.avatar.body_features import (
    L_ANKLE,
    L_ELBOW,
    L_HIP,
    L_KNEE,
    L_SHOULDER,
    L_WRIST,
    NOSE,
    R_HIP,
    R_SHOULDER,
)
from app.ai.avatar.face_features import FACE_REGIONS
from app.ai.avatar.landmarkers import get_detectors
from app.config import get_settings

AVATAR_PATH = API_ROOT.parent.parent / "apps" / "mobile" / "assets" / "avatar-preview.png"
# The asset is small (179 x 610); upscaling gives the models more pixels to work with.
UPSCALE = 4


def _pad_square(rgb: np.ndarray) -> tuple[np.ndarray, int, int]:
    h, w = rgb.shape[:2]
    side = max(h, w)
    canvas = np.full((side, side, 3), 255, dtype=np.uint8)
    x0, y0 = (side - w) // 2, (side - h) // 2
    canvas[y0 : y0 + h, x0 : x0 + w] = rgb
    return canvas, x0, y0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preview", type=Path, help="write a PNG with the anchors drawn on the avatar")
    args = parser.parse_args()

    image = Image.open(AVATAR_PATH).convert("RGBA")
    big = image.resize((image.width * UPSCALE, image.height * UPSCALE), Image.LANCZOS)
    rgba = np.asarray(big).astype(np.float32)
    alpha = rgba[:, :, 3:4] / 255.0
    rgb = (rgba[:, :, :3] * alpha + 255 * (1 - alpha)).astype(np.uint8)
    h, w = rgb.shape[:2]

    pose, face = get_detectors(get_settings().avatar_models_dir)

    square, x0, y0 = _pad_square(rgb)
    side = square.shape[0]
    detection = pose.detect(square)
    if detection.landmarks is None:
        print("Pose not detected on the avatar image.")
        return 1
    # Back to pixel coordinates on the (upscaled) avatar image.
    points = np.column_stack([detection.landmarks[:, 0] * side - x0, detection.landmarks[:, 1] * side - y0])
    visibility = detection.landmarks[:, 3]

    def at(index: int) -> tuple[float, float]:
        return (float(points[index, 0]), float(points[index, 1]))

    # Image-left / image-right joints. The avatar's own left side is on the image's right.
    anchors: dict[str, tuple[float, float]] = {
        "shoulder_a": at(R_SHOULDER),
        "shoulder_b": at(L_SHOULDER),
        "hip_a": at(R_HIP),
        "hip_b": at(L_HIP),
        # The hanging arm and the straighter leg are on the image's right.
        "elbow": at(L_ELBOW),
        "wrist": at(L_WRIST),
        "knee": at(L_KNEE),
        "ankle": at(L_ANKLE),
        "nose": at(NOSE),
    }
    shoulder_mid = (
        (anchors["shoulder_a"][0] + anchors["shoulder_b"][0]) / 2,
        (anchors["shoulder_a"][1] + anchors["shoulder_b"][1]) / 2,
    )
    hip_mid = ((anchors["hip_a"][0] + anchors["hip_b"][0]) / 2, (anchors["hip_a"][1] + anchors["hip_b"][1]) / 2)
    anchors["shoulder_mid"] = shoulder_mid
    anchors["hip_mid"] = hip_mid
    # On this picture hair and the raised arm touch the torso, so the silhouette waist search is
    # unreliable; use the notebook's anatomical estimate (65 % from shoulder line to hip line).
    anchors["waist"] = (
        shoulder_mid[0] + 0.65 * (hip_mid[0] - shoulder_mid[0]),
        shoulder_mid[1] + 0.65 * (hip_mid[1] - shoulder_mid[1]),
    )

    # Face: crop around the head and run the Face Landmarker on it.
    nose_x, nose_y = anchors["nose"]
    half = int((points[L_SHOULDER, 0] - points[R_SHOULDER, 0]) * 0.55)
    left, top = max(0, int(nose_x - half)), max(0, int(nose_y - half * 1.1))
    crop = rgb[top : int(nose_y + half * 0.9), left : int(nose_x + half)]
    crop_sq, cx0, cy0 = _pad_square(crop)
    face_detection = face.detect(np.asarray(Image.fromarray(crop_sq).resize((512, 512), Image.LANCZOS)))
    if face_detection.landmarks is not None:
        scale = crop_sq.shape[0]
        fp = np.column_stack(
            [
                face_detection.landmarks[:, 0] * scale - cx0 + left,
                face_detection.landmarks[:, 1] * scale - cy0 + top,
            ]
        )
        for region in ("left_eye", "right_eye", "nose", "lips"):
            ids = list(FACE_REGIONS[region])
            anchors[f"face_{region}"] = (float(fp[ids, 0].mean()), float(fp[ids, 1].mean()))
        outline = fp[list(FACE_REGIONS["face_outline"])]
        anchors["face_center"] = (float(outline[:, 0].mean()), float(outline[:, 1].mean()))
    else:
        print("# Face Landmarker found no face on the avatar crop; face anchors fall back to the nose.")

    print(
        f"# avatar {image.width}x{image.height}, pose visibility min {visibility[[11, 12, 23, 24, 25, 26, 27, 28]].min():.2f}"
    )
    for name, (x, y) in anchors.items():
        print(f"  {name}: {{ x: {x / w:.3f}, y: {y / h:.3f} }},")

    if args.preview:
        preview = big.copy()
        draw = ImageDraw.Draw(preview)
        for name, (x, y) in anchors.items():
            r = 10
            draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 40, 120, 255), outline=(255, 255, 255, 255), width=3)
            draw.text((x + 14, y - 8), name, fill=(20, 20, 20, 255))
        segments = [
            ("shoulder_a", "shoulder_b"),
            ("hip_a", "hip_b"),
            ("shoulder_mid", "hip_mid"),
            ("shoulder_b", "elbow"),
            ("elbow", "wrist"),
            ("hip_b", "knee"),
            ("knee", "ankle"),
        ]
        if "face_left_eye" in anchors:
            segments.append(("face_left_eye", "face_right_eye"))
        for a, b in segments:
            draw.line([anchors[a], anchors[b]], fill=(0, 160, 255, 255), width=5)
        preview.save(args.preview)
        print(f"# preview written to {args.preview}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
