"""
Roboflow DeepFashion2 serverless detection client.
Accepts raw image bytes; returns the prediction list from the API.
No files written to disk — image is passed via BytesIO.
"""

from __future__ import annotations

import base64
from io import BytesIO
from typing import Any

from PIL import Image


def detect_garments(
    image_bytes: bytes,
    api_key: str,
    model_id: str = "deepfashion2-m-10k/2",
) -> list[dict[str, Any]]:
    """
    Submits image_bytes to the Roboflow Serverless API and returns the raw
    predictions list.  Raises RuntimeError if inference fails.
    """
    from inference_sdk import InferenceHTTPClient, InferenceConfiguration  # type: ignore[import-untyped]

    client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key=api_key,
    ).configure(InferenceConfiguration(api_key_transport="header"))

    # Roboflow SDK accepts a PIL image directly (no temp file needed)
    pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")

    try:
        result: dict[str, Any] = client.infer(pil_image, model_id=model_id)
    except Exception as exc:
        raise RuntimeError(f"Roboflow inference failed: {exc}") from exc

    return result.get("predictions", [])


def crop_garment_in_memory(
    image: Image.Image,
    prediction: dict[str, Any],
    feather_radius: float = 1.5,
) -> Image.Image:
    """
    Crops a single garment from the full PIL image using the bounding box and
    polygon mask in the Roboflow prediction dict.
    Composites the garment onto a clean white background using the segmentation
    polygon — all in-memory, no disk I/O.
    """
    from PIL import ImageDraw, ImageFilter

    x, y, w, h = prediction["x"], prediction["y"], prediction["width"], prediction["height"]
    x1 = max(0, int(x - w / 2))
    y1 = max(0, int(y - h / 2))
    x2 = min(image.width, int(x + w / 2))
    y2 = min(image.height, int(y + h / 2))

    crop = image.crop((x1, y1, x2, y2))

    points = prediction.get("points", [])
    if not points or len(points) < 3:
        # No polygon — return the rectangular crop on white
        white_bg = Image.new("RGB", crop.size, (255, 255, 255))
        white_bg.paste(crop)
        return white_bg

    local_pts: list[tuple[float, float]] = []
    for p in points:
        if isinstance(p, dict):
            local_pts.append((p.get("x", 0) - x1, p.get("y", 0) - y1))
        elif isinstance(p, (list, tuple)) and len(p) >= 2:
            local_pts.append((float(p[0]) - x1, float(p[1]) - y1))

    if len(local_pts) < 3:
        white_bg = Image.new("RGB", crop.size, (255, 255, 255))
        white_bg.paste(crop)
        return white_bg

    mask = Image.new("L", crop.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(local_pts, fill=255)

    if feather_radius > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    white_bg = Image.new("RGB", crop.size, (255, 255, 255))
    white_bg.paste(crop, (0, 0), mask=mask)
    return white_bg


def pil_to_base64(image: Image.Image, format: str = "JPEG") -> str:
    """Encodes a PIL image to a base64 data URI string — no temp file."""
    buf = BytesIO()
    image.save(buf, format=format, quality=85)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    mime = "image/jpeg" if format.upper() == "JPEG" else "image/png"
    return f"data:{mime};base64,{b64}"

