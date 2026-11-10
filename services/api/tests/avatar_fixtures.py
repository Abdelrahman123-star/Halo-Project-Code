"""
Synthetic inputs for avatar pipeline tests (tests only — never used by the app).

`standing_pose()` is a hand-placed symmetric figure on the 512 px analysis square
so expected lengths and ratios can be computed by hand.
"""

from __future__ import annotations

import io

import numpy as np
from PIL import Image

from app.ai.avatar.pipeline import FaceDetection, PoseDetection

SIZE = 512.0


def standing_pose(visibility: float = 0.95) -> np.ndarray:
    """(33, 4) normalized landmarks. Pixel layout (x, y) on the 512 square."""
    pixels = {
        0: (256, 60),  # nose
        11: (216, 120),  # left shoulder
        12: (296, 120),  # right shoulder (shoulder width 80)
        13: (206, 190),  # elbows
        14: (306, 190),
        15: (200, 250),  # wrists
        16: (312, 250),
        23: (231, 260),  # hips (hip width 50)
        24: (281, 260),
        25: (231, 360),  # knees
        26: (281, 360),
        27: (231, 460),  # ankles → visible height 400
        28: (281, 460),
    }
    landmarks = np.zeros((33, 4), dtype=np.float64)
    landmarks[:, 0] = 0.5
    landmarks[:, 1] = 0.5
    landmarks[:, 3] = visibility
    for index, (x, y) in pixels.items():
        landmarks[index, 0] = x / SIZE
        landmarks[index, 1] = y / SIZE
    return landmarks


def torso_mask() -> np.ndarray:
    """512² person mask: torso 80 px at shoulders, 60 px waist, 70 px hips; arms as separate bars."""
    mask = np.zeros((512, 512), dtype=np.float32)
    # Starts above / ends below the landmark rows so morphology does not trim the measured rows.
    for y in range(110, 281):
        if y < 180:
            half = 40
        elif y < 220:
            half = 30
        else:
            half = 35
        mask[y, 256 - half : 256 + half] = 1.0
    # Arms hang next to the torso with a gap, reaching below hip level.
    mask[110:300, 196:206] = 1.0
    mask[110:300, 306:316] = 1.0
    # Legs and head so the largest component is one person.
    mask[260:460, 226:286] = 1.0
    mask[40:110, 236:276] = 1.0
    mask[110:130, 196:316] = 1.0  # shoulders join the arms to the torso
    return mask


def face_landmarks() -> np.ndarray:
    """(478, 3) normalized face landmarks spread over a 200x260 px oval centred on the square."""
    angles = np.linspace(0, 2 * np.pi, 478, endpoint=False)
    landmarks = np.zeros((478, 3), dtype=np.float64)
    landmarks[:, 0] = (256 + 100 * np.cos(angles)) / SIZE
    landmarks[:, 1] = (256 + 130 * np.sin(angles)) / SIZE
    return landmarks


def jpeg_bytes(width: int = 900, height: int = 1600, color: tuple[int, int, int] = (120, 110, 100)) -> bytes:
    rng = np.random.default_rng(0)
    # Noise keeps the Laplacian sharpness above the blur threshold.
    noise = rng.integers(-40, 40, size=(height, width, 3))
    pixels = np.clip(np.array(color) + noise, 0, 255).astype(np.uint8)
    buffer = io.BytesIO()
    Image.fromarray(pixels).save(buffer, format="JPEG", quality=90)
    return buffer.getvalue()


class FakePoseDetector:
    def __init__(self, landmarks: np.ndarray | None, mask: np.ndarray | None = None) -> None:
        self._result = PoseDetection(landmarks=landmarks, mask=mask)
        self.calls = 0

    def detect(self, rgb: np.ndarray) -> PoseDetection:
        self.calls += 1
        return self._result


class FakeFaceDetector:
    def __init__(self, landmarks: np.ndarray | None) -> None:
        self._result = FaceDetection(landmarks=landmarks)

    def detect(self, rgb: np.ndarray) -> FaceDetection:
        return self._result
