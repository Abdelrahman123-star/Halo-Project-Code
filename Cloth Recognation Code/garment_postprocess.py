"""
Post-processing module for garment crops:
1. Background Refinement: Cleans up background remnants, wall bleeds, and hanger hooks at the top.
2. Auto-Straightening (Deskew): Aligns and levels the garment vertically using bilateral symmetry.
3. Centering & Padding: Centers the garment on a clean white e-commerce catalog canvas.
"""

import cv2
import numpy as np
from PIL import Image


def detect_deskew_angle(mask: np.ndarray, max_angle: float = 12.0, step: float = 0.25) -> float:
    """
    Finds the angle that maximizes left-right bilateral symmetry of the garment mask.
    Returns rotation angle in degrees.
    """
    h, w = mask.shape
    if not np.any(mask):
        return 0.0

    center = (w // 2, h // 2)
    best_angle = 0.0
    best_iou = -1.0

    angles = np.arange(-max_angle, max_angle + step, step)
    for ang in angles:
        M = cv2.getRotationMatrix2D(center, ang, 1.0)
        rot_mask = cv2.warpAffine(
            mask, M, (w, h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0
        )
        flipped = cv2.flip(rot_mask, 1)

        intersection = np.sum((rot_mask > 0) & (flipped > 0))
        union = np.sum((rot_mask > 0) | (flipped > 0))
        if union > 0:
            iou = intersection / union
            if iou > best_iou:
                best_iou = iou
                best_angle = ang

    return best_angle


def is_lower_body_garment(category: str) -> bool:
    """Checks if a garment category belongs to pants, trousers, jeans, shorts, or skirts."""
    cat = (category or "").lower()
    lower_body_keywords = ["trouser", "pant", "jean", "short", "skirt", "bottom"]
    return any(kw in cat for kw in lower_body_keywords)


def clean_top_hangers_and_background(img_bgr: np.ndarray, is_upper_body: bool = True) -> np.ndarray:
    """
    Detects and removes hanger hooks and top background bleeds above the neckline.
    Only applies to upper-body garments (tops, outwear, dresses).
    """
    if not is_upper_body:
        return img_bgr

    h, w = img_bgr.shape[:2]
    result = img_bgr.copy()
    non_white = np.any(result < 245, axis=-1)
    if not np.any(non_white):
        return result

    # Find the top y coordinate for each column
    top_y = np.full(w, h)
    for x in range(w):
        y_idx = np.where(non_white[:, x])[0]
        if len(y_idx) > 0:
            top_y[x] = y_idx[0]

    # Find garment shoulder / collar peaks (excluding extreme outer 15% edges)
    mid_left = range(int(w * 0.15), int(w * 0.45))
    mid_right = range(int(w * 0.55), int(w * 0.85))

    left_vals = [top_y[x] for x in mid_left if top_y[x] < h]
    right_vals = [top_y[x] for x in mid_right if top_y[x] < h]

    if left_vals and right_vals:
        sh_left_y = top_y[int(w * 0.25)] if top_y[int(w * 0.25)] < h else min(left_vals)
        sh_right_y = top_y[int(w * 0.75)] if top_y[int(w * 0.75)] < h else min(right_vals)
        shoulder_level = min(sh_left_y, sh_right_y)

        # Check center region (x in 0.30..0.70)
        # If there is a narrow protrusion sticking up significantly above the shoulder line, it's a hanger hook!
        for x in range(int(w * 0.30), int(w * 0.70)):
            if top_y[x] < shoulder_level - 15:
                result[:shoulder_level, x] = 255

    # Refine mask edges using a soft Gaussian feather
    mask = (np.any(result < 248, axis=-1)).astype(np.uint8) * 255
    feathered = cv2.GaussianBlur(mask, (3, 3), 1.0) / 255.0

    final = np.full_like(result, 255)
    for c in range(3):
        final[:, :, c] = (result[:, :, c] * feathered + 255 * (1.0 - feathered)).astype(np.uint8)

    return final


def straighten_and_center_garment(img_bgr: np.ndarray, pad_ratio: float = 0.05) -> np.ndarray:
    """
    Straightens the garment so it is upright, and centers it on a clean white canvas.
    """
    mask = (np.any(img_bgr < 248, axis=-1)).astype(np.uint8) * 255
    if not np.any(mask):
        return img_bgr

    # 1. Detect deskew angle
    deskew_angle = detect_deskew_angle(mask, max_angle=10.0, step=0.25)

    # 2. Rotate image if angle is significant (>= 0.2 degrees)
    if abs(deskew_angle) >= 0.2:
        pil_img = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
        rotated_pil = pil_img.rotate(
            deskew_angle, resample=Image.BICUBIC, expand=True, fillcolor=(255, 255, 255)
        )
        rotated_bgr = cv2.cvtColor(np.array(rotated_pil), cv2.COLOR_RGB2BGR)
    else:
        rotated_bgr = img_bgr

    # 3. Crop tightly to foreground
    non_white = np.any(rotated_bgr < 248, axis=-1)
    if not np.any(non_white):
        return rotated_bgr

    y_idx, x_idx = np.where(non_white)
    y1, y2 = np.min(y_idx), np.max(y_idx)
    x1, x2 = np.min(x_idx), np.max(x_idx)

    gw = x2 - x1 + 1
    gh = y2 - y1 + 1
    garment = rotated_bgr[y1:y2 + 1, x1:x2 + 1]

    # 4. Add balanced uniform padding
    pad_x = int(gw * pad_ratio)
    pad_y = int(gh * pad_ratio)

    canvas = np.full((gh + 2 * pad_y, gw + 2 * pad_x, 3), 255, dtype=np.uint8)
    canvas[pad_y:pad_y + gh, pad_x:pad_x + gw] = garment
    return canvas


def postprocess_garment_crop(image_input, category: str = "item") -> Image.Image:
    """
    Full pipeline to clean background artifacts, straighten, and center a garment crop.
    Accepts PIL.Image or filepath, returns clean straightened PIL.Image.
    """
    if isinstance(image_input, Image.Image):
        img_bgr = cv2.cvtColor(np.array(image_input.convert("RGB")), cv2.COLOR_RGB2BGR)
    else:
        img_bgr = cv2.imread(str(image_input))
        if img_bgr is None:
            raise ValueError(f"Could not load image from {image_input}")

    is_upper = not is_lower_body_garment(category)

    # 1. Remove background artifacts & hanger hook (if upper-body)
    cleaned = clean_top_hangers_and_background(img_bgr, is_upper_body=is_upper)

    # 2. Straighten and center on white canvas
    final_bgr = straighten_and_center_garment(cleaned, pad_ratio=0.05)

    return Image.fromarray(cv2.cvtColor(final_bgr, cv2.COLOR_BGR2RGB))
