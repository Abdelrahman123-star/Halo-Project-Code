"""
Standalone script to generate white-background garment crops from inference results.
Can be run on cached result.json or on new images to produce clean catalog photos.
"""

import json
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter


def crop_garment_white_bg(
    img: Image.Image,
    pred: dict,
    margin_ratio: float = 0.05,
    feather_radius: float = 1.5,
) -> Image.Image:
    """
    Crops the garment from the image using predicted bounding box.
    Masks out the background using segmentation points and composites onto pure white.
    """
    x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
    x1 = max(0, int(x - (w / 2) * (1.0 + margin_ratio)))
    y1 = max(0, int(y - (h / 2) * (1.0 + margin_ratio)))
    x2 = min(img.width, int(x + (w / 2) * (1.0 + margin_ratio)))
    y2 = min(img.height, int(y + (h / 2) * (1.0 + margin_ratio)))

    crop = img.crop((x1, y1, x2, y2))
    points = pred.get("points", [])

    if not points or len(points) < 3:
        return crop

    local_pts = []
    for p in points:
        if isinstance(p, dict):
            local_pts.append((p.get("x", 0) - x1, p.get("y", 0) - y1))
        elif isinstance(p, (list, tuple)) and len(p) >= 2:
            local_pts.append((p[0] - x1, p[1] - y1))

    if len(local_pts) < 3:
        return crop

    mask = Image.new("L", crop.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(local_pts, fill=255)

    if feather_radius > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    white_bg = Image.new("RGB", crop.size, (255, 255, 255))
    white_bg.paste(crop, (0, 0), mask=mask)
    return white_bg


def process_saved_results(
    image_path: str = "sample_fashion.jpg",
    results_json: str = "result.json",
    output_dir: str = "garment_crops",
    feather: float = 1.5,
):
    """Processes existing results JSON and generates white background crops."""
    img_path = Path(image_path)
    res_path = Path(results_json)
    out_dir = Path(output_dir)
    out_dir.mkdir(exist_ok=True)

    if not img_path.exists():
        print(f"[!] Error: Image file '{image_path}' not found.")
        return

    if not res_path.exists():
        print(f"[!] Error: Results file '{results_json}' not found.")
        return

    img = Image.open(img_path).convert("RGB")
    with open(res_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Support either Roboflow result format or local report format
    if "predictions" in data:
        predictions = data["predictions"]
    elif "garments" in data:
        predictions = [g.get("detection", g) for g in data["garments"]]
    else:
        predictions = []

    if not predictions:
        print("[!] No garment predictions found in JSON.")
        return

    print("=" * 65)
    print(f" Processing {len(predictions)} garments with pure white background")
    print(f" Source Image: {image_path}")
    print(f" Output Dir:   {output_dir}/")
    print("=" * 65)

    from garment_postprocess import postprocess_garment_crop

    for idx, pred in enumerate(predictions, 1):
        cls_name = pred.get("class") or pred.get("category", "item")
        crop = crop_garment_white_bg(img, pred, feather_radius=feather)
        try:
            crop = postprocess_garment_crop(crop, category=cls_name)
        except Exception as e:
            print(f" [!] Note: Auto-straighten warning ({e})")
        
        out_filename = out_dir / f"crop_{idx}_{cls_name}.jpg"
        crop.save(out_filename, quality=95)
        print(f" [+] Saved: {out_filename} ({crop.width}x{crop.height})")

    print("\n[+] All garment crops updated with clean white background and straight alignment!")


def main():
    parser = argparse.ArgumentParser(description="Generate white-background crops from detection results")
    parser.add_argument("--image", "-i", type=str, default="sample_fashion.jpg", help="Source image path")
    parser.add_argument("--json", "-j", type=str, default="result.json", help="Roboflow result.json path")
    parser.add_argument("--output-dir", "-o", type=str, default="garment_crops", help="Output directory")
    parser.add_argument("--feather", "-f", type=float, default=1.5, help="Edge feather blur radius (default: 1.5)")
    args = parser.parse_args()

    process_saved_results(
        image_path=args.image,
        results_json=args.json,
        output_dir=args.output_dir,
        feather=args.feather,
    )


if __name__ == "__main__":
    main()
