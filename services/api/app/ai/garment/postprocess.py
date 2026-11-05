"""
Garment post-processing: background cleanup, hanger removal, deskew, and centering.
All operations are in-memory — accepts PIL.Image, returns PIL.Image, writes nothing to disk.
"""

import cv2
import numpy as np
from PIL import Image


def _is_lower_body_garment(category: str) -> bool:
    """Returns True if the category is a lower-body item (pants, shorts, skirts)."""
    # Use whole-word boundary patterns: "shorts" must not match "short_sleeved_shirt"
    lower_kw = ["trouser", "pant", "jean", "shorts", "skirt", "bottom"]
    cat = category.lower()
    return any(kw in cat for kw in lower_kw)


def _detect_deskew_angle(mask: np.ndarray, max_angle: float = 10.0, step: float = 0.25) -> float:
    """
    Finds the rotation angle that maximises left-right bilateral symmetry of the garment mask.
    Returns the best angle in degrees (0.0 if mask is empty).
    """
    if not np.any(mask):
        return 0.0

    h, w = mask.shape
    center = (w // 2, h // 2)
    best_angle = 0.0
    best_iou = -1.0

    for ang in np.arange(-max_angle, max_angle + step, step):
        M = cv2.getRotationMatrix2D(center, ang, 1.0)
        rotated = cv2.warpAffine(
            mask, M, (w, h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0
        )
        flipped = cv2.flip(rotated, 1)
        intersection = int(np.sum((rotated > 0) & (flipped > 0)))
        union = int(np.sum((rotated > 0) | (flipped > 0)))
        if union > 0:
            iou = intersection / union
            if iou > best_iou:
                best_iou = iou
                best_angle = float(ang)

    return best_angle


def _clean_hangers(img_bgr: np.ndarray, is_upper_body: bool) -> np.ndarray:
    """
    Removes hanger hooks and top-of-frame background bleeds for upper-body garments.
    No-op for lower-body items (trousers, shorts, skirts).
    """
    if not is_upper_body:
        return img_bgr

    h, w = img_bgr.shape[:2]
    result = img_bgr.copy()
    non_white = np.any(result < 245, axis=-1)

    if not np.any(non_white):
        return result

    top_y = np.full(w, h)
    for x in range(w):
        y_idx = np.where(non_white[:, x])[0]
        if len(y_idx) > 0:
            top_y[x] = int(y_idx[0])

    # Use shoulder region (15–85% width) to find collar line
    mid_left = range(int(w * 0.15), int(w * 0.45))
    mid_right = range(int(w * 0.55), int(w * 0.85))
    left_vals = [top_y[x] for x in mid_left if top_y[x] < h]
    right_vals = [top_y[x] for x in mid_right if top_y[x] < h]

    if left_vals and right_vals:
        sh_left_y = top_y[int(w * 0.25)] if top_y[int(w * 0.25)] < h else min(left_vals)
        sh_right_y = top_y[int(w * 0.75)] if top_y[int(w * 0.75)] < h else min(right_vals)
        shoulder_level = min(sh_left_y, sh_right_y)

        # Erase narrow center protrusions (hanger hooks) above shoulder line
        for x in range(int(w * 0.30), int(w * 0.70)):
            if top_y[x] < shoulder_level - 15:
                result[:shoulder_level, x] = 255

    # Soft feather edge
    mask = (np.any(result < 248, axis=-1)).astype(np.uint8) * 255
    feathered = cv2.GaussianBlur(mask, (3, 3), 1.0) / 255.0
    final = np.full_like(result, 255)
    for c in range(3):
        final[:, :, c] = (result[:, :, c] * feathered + 255 * (1.0 - feathered)).astype(np.uint8)

    return final


def _straighten_and_center(img_bgr: np.ndarray, pad_ratio: float = 0.05) -> np.ndarray:
    """Deskews the garment and centres it on a clean white canvas."""
    mask = (np.any(img_bgr < 248, axis=-1)).astype(np.uint8) * 255
    if not np.any(mask):
        return img_bgr

    angle = _detect_deskew_angle(mask, max_angle=10.0, step=0.25)

    if abs(angle) >= 0.2:
        pil_img = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
        rotated_pil = pil_img.rotate(angle, resample=Image.BICUBIC, expand=True, fillcolor=(255, 255, 255))
        rotated = cv2.cvtColor(np.array(rotated_pil), cv2.COLOR_RGB2BGR)
    else:
        rotated = img_bgr

    non_white = np.any(rotated < 248, axis=-1)
    if not np.any(non_white):
        return rotated

    y_idx, x_idx = np.where(non_white)
    y1, y2 = int(np.min(y_idx)), int(np.max(y_idx))
    x1, x2 = int(np.min(x_idx)), int(np.max(x_idx))
    garment = rotated[y1 : y2 + 1, x1 : x2 + 1]

    gw = x2 - x1 + 1
    gh = y2 - y1 + 1
    px = int(gw * pad_ratio)
    py = int(gh * pad_ratio)
    canvas = np.full((gh + 2 * py, gw + 2 * px, 3), 255, dtype=np.uint8)
    canvas[py : py + gh, px : px + gw] = garment
    return canvas


def postprocess_garment_crop(image: Image.Image, category: str = "item") -> Image.Image:
    """
    Full in-memory garment post-processing pipeline:
      1. Hanger/background cleanup (upper-body only)
      2. Bilateral-symmetry deskew
      3. Centering on white canvas
    Returns a clean PIL.Image — nothing written to disk.
    """
    img_bgr = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2BGR)
    is_upper = not _is_lower_body_garment(category)
    cleaned = _clean_hangers(img_bgr, is_upper_body=is_upper)
    final_bgr = _straighten_and_center(cleaned, pad_ratio=0.05)
    return Image.fromarray(cv2.cvtColor(final_bgr, cv2.COLOR_BGR2RGB))
