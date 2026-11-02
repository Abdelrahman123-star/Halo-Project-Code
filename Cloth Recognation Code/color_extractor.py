"""
Fashion Color Extraction Module using K-Means and Human-Perception Color Space.
"""

import os
import warnings
os.environ["LOKY_MAX_CPU_COUNT"] = "4"
warnings.filterwarnings("ignore", category=UserWarning)

from typing import List, Dict, Tuple
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans

# Curated fashion color palette with perceptual RGB centroids
FASHION_PALETTE: Dict[str, Tuple[int, int, int]] = {
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


def match_color_name(rgb: Tuple[int, int, int]) -> str:
    """Finds closest fashion color name using human eye perception weights."""
    r, g, b = rgb
    best_name, min_dist = "Unknown", float("inf")
    for name, (cr, cg, cb) in FASHION_PALETTE.items():
        # Redmean color difference metric
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


def extract_garment_colors(
    image: Image.Image,
    bbox: Tuple[float, float, float, float],
    n_clusters: int = 3,
    crop_margin_pct: float = 0.15,
) -> List[Dict]:
    """
    Crops garment bounding box and clusters colors.
    crop_margin_pct zooms into center by 15% to avoid capturing background studio pixels.
    """
    x, y, w, h = bbox
    # Center crop with inward margin to sample fabric rather than background edges
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
    pixels = np.array(crop).reshape(-1, 3)

    if len(pixels) == 0:
        return []

    kmeans = KMeans(n_clusters=n_clusters, n_init=5, random_state=42).fit(pixels)
    counts = np.bincount(kmeans.labels_)
    sorted_indices = np.argsort(-counts)

    results = []
    total_pixels = len(pixels)
    for idx in sorted_indices:
        rgb = tuple(int(c) for c in kmeans.cluster_centers_[idx])
        hex_code = f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
        pct = float((counts[idx] / total_pixels) * 100)
        color_name = match_color_name(rgb)
        results.append({
            "color_name": color_name,
            "hex": hex_code,
            "rgb": [int(rgb[0]), int(rgb[1]), int(rgb[2])],
            "percentage": round(pct, 1),
        })

    return results
