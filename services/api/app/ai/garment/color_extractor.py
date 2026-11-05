"""
Fashion Color Extraction — K-Means clustering with human-perception redmean metric.
Operates entirely in-memory on PIL Images using pure NumPy; zero disk writes.
"""

from typing import cast
from PIL import Image
import numpy as np

from app.ai.garment.schemas import ColorResult

# Curated fashion color palette with perceptual RGB centroids
_FASHION_PALETTE: dict[str, tuple[int, int, int]] = {
    "Black": (20, 20, 20),
    "White": (245, 245, 245),
    "Off-White / Cream": (240, 235, 220),
    "Charcoal": (55, 55, 55),
    "Gray": (130, 130, 130),
    "Light Gray": (195, 195, 195),
    "Navy Blue": (25, 35, 65),
    "Denim Blue": (55, 85, 130),
    "Light Denim Blue": (120, 155, 190),
    "Royal Blue": (30, 80, 200),
    "Sky Blue": (135, 206, 235),
    "Baby Blue / Pastel Blue": (180, 215, 238),
    "Powder Blue": (165, 210, 230),
    "Cyan / Turquoise": (0, 185, 205),
    "Olive Green": (75, 85, 45),
    "Military Khaki": (115, 115, 85),
    "Forest Green": (35, 75, 45),
    "Emerald Green": (40, 140, 75),
    "Beige": (225, 210, 180),
    "Camel / Tan": (185, 140, 90),
    "Brown": (100, 60, 35),
    "Burgundy / Wine": (110, 25, 45),
    "Red": (205, 35, 35),
    "Coral / Peach": (240, 130, 110),
    "Pink / Pastel Pink": (235, 180, 190),
    "Hot Pink / Magenta": (215, 45, 120),
    "Lavender / Lilac": (190, 170, 220),
    "Purple": (115, 45, 130),
    "Mustard Yellow": (210, 160, 40),
    "Yellow": (250, 220, 50),
    "Orange": (230, 105, 30),
    "Rust": (160, 65, 35),
}


def _match_color_name(rgb: tuple[int, int, int]) -> str:
    """Finds the closest fashion color name using the redmean perceptual metric."""
    r, g, b = rgb
    best_name = "Unknown"
    min_dist = float("inf")

    for name, (cr, cg, cb) in _FASHION_PALETTE.items():
        r_bar = 0.5 * (r + cr)
        delta_r = r - cr
        delta_g = g - cg
        delta_b = b - cb
        dist = (
            (2 + r_bar / 256) * (delta_r**2)
            + 4 * (delta_g**2)
            + (2 + (255 - r_bar) / 256) * (delta_b**2)
        ) ** 0.5
        if dist < min_dist:
            min_dist = dist
            best_name = name

    return best_name


def _numpy_kmeans(
    pixels: np.ndarray, k: int, max_iter: int = 25
) -> tuple[np.ndarray, np.ndarray]:
    """Deterministic K-Means clustering on (N, 3) RGB pixels using pure NumPy."""
    n = len(pixels)
    k = min(k, n)
    rng = np.random.default_rng(42)
    indices = rng.choice(n, size=k, replace=False)
    centroids = pixels[indices].astype(np.float64)
    labels = np.full(n, -1, dtype=np.int64)
    pts = pixels.astype(np.float64)

    for _ in range(max_iter):
        dists = np.sum((pts[:, None, :] - centroids[None, :, :]) ** 2, axis=2)
        new_labels = np.argmin(dists, axis=1)
        if np.array_equal(new_labels, labels):
            break
        labels = new_labels
        for j in range(k):
            mask = labels == j
            if np.any(mask):
                centroids[j] = pts[mask].mean(axis=0)

    return centroids, labels


def extract_garment_colors(
    image: Image.Image,
    bbox: tuple[float, float, float, float],
    n_clusters: int = 3,
    crop_margin_pct: float = 0.15,
) -> list[ColorResult]:
    """
    Center-crops the bounding box with an inward margin to avoid capturing background
    pixels, then clusters garment pixels with K-Means.
    Returns a list of ColorResult models sorted by dominance.
    """
    x, y, w, h = bbox
    eff_w = w * (1.0 - crop_margin_pct)
    eff_h = h * (1.0 - crop_margin_pct)

    x1 = max(0, int(x - eff_w / 2))
    y1 = max(0, int(y - eff_h / 2))
    x2 = min(image.width, int(x + eff_w / 2))
    y2 = min(image.height, int(y + eff_h / 2))

    if x2 <= x1 or y2 <= y1:
        return []

    crop = image.crop((x1, y1, x2, y2))
    crop.thumbnail((120, 120))
    pixels = np.array(crop.convert("RGB")).reshape(-1, 3)

    if len(pixels) == 0:
        return []

    centroids, labels = _numpy_kmeans(pixels, k=n_clusters)
    counts = np.bincount(labels, minlength=len(centroids))
    sorted_indices = np.argsort(-counts)

    results: list[ColorResult] = []
    total = len(pixels)

    for idx in sorted_indices:
        if counts[idx] == 0:
            continue
        center = centroids[idx]
        rgb = cast(tuple[int, int, int], tuple(int(round(c)) for c in center))
        hex_code = f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
        pct = float((counts[idx] / total) * 100)

        results.append(
            ColorResult(
                color_name=_match_color_name(rgb),
                hex=hex_code,
                rgb=list(rgb),
                percentage=round(pct, 1),
            )
        )

    return results
