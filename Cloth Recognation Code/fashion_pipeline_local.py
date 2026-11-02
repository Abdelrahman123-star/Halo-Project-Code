"""
End-to-End Local Fashion Intelligence Pipeline
Step 1: Roboflow DeepFashion2 API (Detection & Localization)
Step 2: Fashion-CLIP (Offline Local Zero-Shot Fabric & Pattern Classifier)
Step 3: Color Extractor (Local K-Means Color Quantization & Perceptual Matching)
"""

import os
import sys
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFilter

load_dotenv()

from color_extractor import extract_garment_colors


def crop_garment(
    img: Image.Image,
    pred: dict,
    margin_ratio: float = 0.05,
    white_background: bool = True,
    feather_radius: float = 1.5,
) -> Image.Image:
    """
    Crops the garment from the image using the predicted bounding box.
    If white_background is True and polygon points exist, masks out the background
    and composites the garment onto a clean, solid white background.
    """
    x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
    x1 = max(0, int(x - (w / 2) * (1.0 + margin_ratio)))
    y1 = max(0, int(y - (h / 2) * (1.0 + margin_ratio)))
    x2 = min(img.width, int(x + (w / 2) * (1.0 + margin_ratio)))
    y2 = min(img.height, int(y + (h / 2) * (1.0 + margin_ratio)))

    crop = img.crop((x1, y1, x2, y2))

    if not white_background:
        return crop

    points = pred.get("points", [])
    if not points or len(points) < 3:
        return crop

    # Map global polygon coordinates to local crop coordinates
    local_pts = []
    for p in points:
        if isinstance(p, dict):
            local_pts.append((p.get("x", 0) - x1, p.get("y", 0) - y1))
        elif isinstance(p, (list, tuple)) and len(p) >= 2:
            local_pts.append((p[0] - x1, p[1] - y1))

    if len(local_pts) < 3:
        return crop

    # Create grayscale alpha mask
    mask = Image.new("L", crop.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(local_pts, fill=255)

    # Soften edges with Gaussian blur for a clean anti-aliased look
    if feather_radius > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    # Composite onto solid pure white background
    white_bg = Image.new("RGB", crop.size, (255, 255, 255))
    white_bg.paste(crop, (0, 0), mask=mask)
    return white_bg


def load_pil_image(image_source: str) -> Image.Image:
    """Loads an image from a local file path or web URL."""
    if image_source.startswith("http://") or image_source.startswith("https://"):
        import requests
        from io import BytesIO
        resp = requests.get(image_source, timeout=15)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content)).convert("RGB")
    return Image.open(image_source).convert("RGB")


def draw_rich_annotations(image_source: str, garments: list, output_filename: str = "annotated_local_result.jpg"):
    """Draws rich bounding boxes, labels, fabric tags, and color badges on the image."""
    try:
        img = load_pil_image(image_source)
        draw = ImageDraw.Draw(img)

        palette = [
            (255, 56, 56),
            (46, 147, 250),
            (102, 218, 38),
            (233, 30, 99),
            (255, 152, 0),
            (156, 39, 176),
        ]

        for idx, g in enumerate(garments):
            color = palette[idx % len(palette)]
            pred = g["detection"]
            x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
            x1 = x - w / 2
            y1 = y - h / 2
            x2 = x + w / 2
            y2 = y + h / 2

            # Bounding box
            draw.rectangle([x1, y1, x2, y2], outline=color, width=4)

            # Compose detailed tag
            subtype = g["attributes"]["subtype"]["predicted"].title()
            fabric = g["attributes"]["fabric"]["predicted"].title()
            primary_color = g["colors"][0]["color_name"] if g["colors"] else "N/A"
            conf = pred.get("confidence", 0.0)

            label_line1 = f" {subtype} ({conf:.0%}) "
            label_line2 = f" Fabric: {fabric} | Color: {primary_color} "

            bbox1 = draw.textbbox((x1, max(0, y1 - 42)), label_line1)
            bbox2 = draw.textbbox((x1, max(0, y1 - 20)), label_line2)

            box_x2 = max(bbox1[2], bbox2[2]) + 4
            draw.rectangle([x1, max(0, y1 - 44), box_x2, max(0, y1)], fill=color)
            draw.text((x1 + 2, max(0, y1 - 42)), label_line1, fill=(255, 255, 255))
            draw.text((x1 + 2, max(0, y1 - 20)), label_line2, fill=(255, 255, 255))

        img.save(output_filename)
        print(f"[+] Rich visual annotation saved to: {output_filename}")
    except Exception as e:
        print(f"[!] Warning: Could not create rich visual annotation: {e}")


def run_local_fashion_pipeline(
    image_path: str = "sample_fashion.jpg",
    api_key: str | None = None,
    white_background: bool = True,
):
    """Executes the complete local fashion intelligence pipeline."""
    print("=" * 72)
    print("      LOCAL FASHION INTELLIGENCE PIPELINE (Roboflow + Fashion-CLIP)     ")
    print("=" * 72)

    # ---------------------------------------------------------
    # STEP 1: Detection via Roboflow DeepFashion2
    # ---------------------------------------------------------
    print("\n[STEP 1/3] Running Roboflow DeepFashion2 API for garment detection...")
    from test_inference import run_inference
    detection_res = run_inference(image_path, api_key=api_key)
    predictions = detection_res.get("predictions", [])

    if not predictions:
        print("[!] No clothing items detected. Exiting pipeline.")
        return

    # ---------------------------------------------------------
    # STEP 2: Initialize Local Fashion-CLIP
    # ---------------------------------------------------------
    print("\n[STEP 2/3] Initializing Local Fashion-CLIP Zero-Shot Classifier...")
    from fashion_clip_classifier import get_fashion_clip_classifier
    classifier = get_fashion_clip_classifier()

    # ---------------------------------------------------------
    # STEP 3: Crop, Color Analysis, and Fabric Classification
    # ---------------------------------------------------------
    print(f"\n[STEP 3/3] Cropping garments (white_bg={white_background}), extracting colors, and classifying fabrics...")
    img = load_pil_image(image_path)
    crops_dir = Path("garment_crops")
    crops_dir.mkdir(exist_ok=True)

    enriched_items = []
    for idx, pred in enumerate(predictions, 1):
        cls_name = pred.get("class", "item")
        bbox = (pred["x"], pred["y"], pred["width"], pred["height"])

        # 1. Crop garment with clean white background and auto-straightening
        crop = crop_garment(img, pred, white_background=white_background)
        if white_background:
            from garment_postprocess import postprocess_garment_crop
            try:
                crop = postprocess_garment_crop(crop, category=cls_name)
            except Exception as e:
                print(f" [!] Note: Auto-straighten warning ({e})")

        crop_path = crops_dir / f"crop_{idx}_{cls_name}.jpg"
        crop.save(crop_path, quality=95)

        # 2. Extract colors (local K-Means)
        colors = extract_garment_colors(img, bbox, n_clusters=3)

        # 3. Classify fabric, pattern, and subtype with Fashion-CLIP
        clip_attrs = classifier.classify_garment(crop, broad_category=cls_name)

        item_data = {
            "item_id": idx,
            "category": cls_name,
            "confidence": pred.get("confidence", 0.0),
            "crop_path": str(crop_path),
            "colors": colors,
            "attributes": clip_attrs,
            "detection": pred,
        }
        enriched_items.append(item_data)

    # ---------------------------------------------------------
    # Save structured JSON
    # ---------------------------------------------------------
    output_json = "local_fashion_report.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump({
            "source_image": image_path,
            "garments_count": len(enriched_items),
            "garments": enriched_items,
        }, f, indent=2)

    # Generate rich annotated image
    draw_rich_annotations(image_path, enriched_items)

    # ---------------------------------------------------------
    # Print formatted summary table
    # ---------------------------------------------------------
    print("\n" + "=" * 72)
    print("                    ENRICHED FASHION REPORT (LOCAL)                     ")
    print("=" * 72)
    for g in enriched_items:
        attrs = g["attributes"]
        subtype = attrs["subtype"]["predicted"].title()
        subtype_conf = attrs["subtype"]["confidence"]
        fabric = attrs["fabric"]["predicted"].title()
        fabric_conf = attrs["fabric"]["confidence"]
        pattern = attrs["pattern"]["predicted"].title()
        pattern_conf = attrs["pattern"]["confidence"]

        primary_color = g["colors"][0]["color_name"] if g["colors"] else "N/A"
        color_hex = g["colors"][0]["hex"] if g["colors"] else "N/A"
        color_pct = g["colors"][0]["percentage"] if g["colors"] else 0

        print(f"\nItem #{g['item_id']}: {subtype.upper()}")
        print(f"  • Roboflow Class: {g['category']} ({g['confidence']:.1%})")
        print(f"  • CLIP Subtype:   {subtype} ({subtype_conf}%)")
        print(f"  • Fabric / Weave: {fabric} ({fabric_conf}%)")
        print(f"  • Pattern:        {pattern} ({pattern_conf}%)")
        print(f"  • Dominant Color: {primary_color} ({color_hex}) ~ {color_pct}%")
        if len(g["colors"]) > 1:
            sec = g["colors"][1]
            print(f"  • Accent Color:   {sec['color_name']} ({sec['hex']}) ~ {sec['percentage']}%")
        print(f"  • Cropped Patch:  {g['crop_path']}")

    print("\n" + "=" * 72)
    print(f"[+] Complete JSON saved to: {output_json}")
    print("=" * 72 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Run local fashion pipeline (Roboflow + Fashion-CLIP)")
    parser.add_argument("--image", "-i", type=str, default="sample_fashion.jpg", help="Image path or URL")
    parser.add_argument("--api-key", "-k", type=str, default=None, help="Roboflow API key override")
    parser.add_argument(
        "--no-white-bg",
        action="store_true",
        help="Keep original raw image background instead of white background",
    )
    args = parser.parse_args()
    run_local_fashion_pipeline(
        image_path=args.image,
        api_key=args.api_key,
        white_background=not args.no_white_bg,
    )


if __name__ == "__main__":
    main()
