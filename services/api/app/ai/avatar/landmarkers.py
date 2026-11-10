"""
MediaPipe Pose Landmarker and Face Landmarker wrappers (Apache-2.0 models).

Models are loaded once per process from local `.task` files (see
`scripts/download_models.py`); nothing is fetched at request time. Each wrapper
serializes `detect` with a lock because FastAPI runs sync endpoints in a thread pool
and a MediaPipe task instance must not be used concurrently.
"""

from __future__ import annotations

import threading
from functools import lru_cache
from pathlib import Path

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

from app.ai.avatar.pipeline import FaceDetection, PoseDetection

# Same pinned model versions as the HALO Colab notebook.
POSE_MODEL_FILE = "pose_landmarker_full.task"
FACE_MODEL_FILE = "face_landmarker.task"
MODEL_URLS: dict[str, str] = {
    POSE_MODEL_FILE: (
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
        "pose_landmarker_full/float16/1/pose_landmarker_full.task"
    ),
    FACE_MODEL_FILE: (
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    ),
}


class ModelUnavailableError(RuntimeError):
    """A model file is missing or could not be loaded."""


def _read_model(models_dir: Path, filename: str) -> bytes:
    path = models_dir / filename
    if not path.is_file():
        raise ModelUnavailableError(
            f"Model file {filename} is missing in {models_dir}. Run `python scripts/download_models.py`."
        )
    # Loading from a buffer avoids MediaPipe path-handling issues on Windows.
    return path.read_bytes()


def _to_mp_image(rgb: np.ndarray) -> mp.Image:
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb, dtype=np.uint8))


class MediaPipePoseDetector:
    def __init__(self, model_bytes: bytes) -> None:
        options = vision.PoseLandmarkerOptions(
            base_options=BaseOptions(model_asset_buffer=model_bytes),
            running_mode=vision.RunningMode.IMAGE,
            num_poses=1,
            output_segmentation_masks=True,
        )
        self._landmarker = vision.PoseLandmarker.create_from_options(options)
        self._lock = threading.Lock()

    def detect(self, rgb: np.ndarray) -> PoseDetection:
        with self._lock:
            result = self._landmarker.detect(_to_mp_image(rgb))
        if not result.pose_landmarks:
            return PoseDetection(landmarks=None, mask=None)

        landmarks = np.array(
            [[p.x, p.y, p.z, p.visibility if p.visibility is not None else 0.0] for p in result.pose_landmarks[0]],
            dtype=np.float64,
        )
        mask = None
        if result.segmentation_masks:
            # Copy: the view's memory belongs to MediaPipe's result object.
            mask = np.array(result.segmentation_masks[0].numpy_view(), dtype=np.float32)
        return PoseDetection(landmarks=landmarks, mask=mask)


class MediaPipeFaceDetector:
    def __init__(self, model_bytes: bytes) -> None:
        options = vision.FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_buffer=model_bytes),
            running_mode=vision.RunningMode.IMAGE,
            num_faces=1,
        )
        self._landmarker = vision.FaceLandmarker.create_from_options(options)
        self._lock = threading.Lock()

    def detect(self, rgb: np.ndarray) -> FaceDetection:
        with self._lock:
            result = self._landmarker.detect(_to_mp_image(rgb))
        if not result.face_landmarks:
            return FaceDetection(landmarks=None)
        landmarks = np.array([[p.x, p.y, p.z] for p in result.face_landmarks[0]], dtype=np.float64)
        return FaceDetection(landmarks=landmarks)


@lru_cache(maxsize=1)
def get_detectors(models_dir: str) -> tuple[MediaPipePoseDetector, MediaPipeFaceDetector]:
    """Loads both models once per process. Raises ModelUnavailableError if they cannot be loaded."""
    directory = Path(models_dir)
    pose_bytes = _read_model(directory, POSE_MODEL_FILE)
    face_bytes = _read_model(directory, FACE_MODEL_FILE)
    try:
        return MediaPipePoseDetector(pose_bytes), MediaPipeFaceDetector(face_bytes)
    except (RuntimeError, ValueError) as exc:
        raise ModelUnavailableError(f"MediaPipe could not load the avatar models: {exc}") from exc
