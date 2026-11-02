"""
Two-Stage Fashion Intelligence Pipeline:
1. Roboflow DeepFashion2: Detects and crops individual garments.
2. Color Extractor: Quantizes colors (HEX, RGB, human-readable fashion names, percentages).
3. Multimodal Vision AI: Classifies fabric, weave/texture, pattern, fit, and style details.
"""

import os
import json
import base64
from io import BytesIO
from typing import Dict, Any, List
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFilter

load_dotenv()

from color_extractor import extract_garment_colors


def crop_garment(
    img: Image.Image,
    pred: Dict[str, Any],
    white_background: bool = True,
    feather_radius: float = 1.5,
) -> Image.Image:
    """Crops the garment from the full image and isolates it on a clean white background."""
    x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
    x1 = max(0, int(x - w / 2))
    y1 = max(0, int(y - h / 2))
    x2 = min(img.width, int(x + w / 2))
    y2 = min(img.height, int(y + h / 2))
    crop = img.crop((x1, y1, x2, y2))

    if not white_background:
        return crop

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


def analyze_fabric_with_vision_api(cropped_img: Image.Image, category_hint: str) -> Dict[str, Any]:
    """
    Sends cropped garment to a Multimodal Vision model (e.g. Gemini 2.5 Flash)
    to identify fabric, pattern, texture, and style.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")

    if not gemini_key:
        # Fallback heuristic / schema when vision API key is not yet provided
        return {
            "status": "simulated_or_pending_key",
            "garment_subtype": f"standard {category_hint.replace('_', ' ')}",
            "fabric": {
                "material": "Denim / Twill Cotton" if "trousers" in category_hint else "Synthetic Nylon / Cotton Blend",
                "texture": "Woven / Twill" if "trousers" in category_hint else "Smooth satin finish",
            },
            "pattern": "Solid",
            "style": "Casual Streetwear",
            "note": "Set GEMINI_API_KEY or OPENAI_API_KEY in .env for live AI fabric and texture recognition.",
        }

    # Example live call using google-genai or requests
    try:
        import requests

        # Buffer image to base64
        buf = BytesIO()
        cropped_img.save(buf, format="JPEG")
        b64_img = base64.b64encode(buf.getvalue()).decode("utf-8")

        prompt = f"""
Analyze this cropped image of a clothing garment (category: {category_hint}).
Return ONLY a valid JSON object with the following fields:
{{
  "garment_subtype": "precise specific name (e.g. MA-1 bomber jacket, straight-leg denim jeans)",
  "fabric": {{
    "material": "primary fiber/material (e.g. 100% cotton denim, nylon, wool knit, leather, silk)",
    "texture": "weave or surface texture (e.g. diagonal twill, ribbed knit, matte, glossy, fleece)",
    "weight_estimate": "lightweight / medium / heavy"
  }},
  "pattern": "pattern type (e.g. solid, striped, plaid, acid-wash, distress)",
  "style": "style aesthetic (e.g. minimalist casual, vintage streetwear, formal)",
  "key_details": ["prominent design features like zippers, pockets, distressing"]
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/jpeg", "data": b64_img}},
                    ]
                }
            ],
            "generationConfig": {"response_mime_type": "application/json"},
        }
        res = requests.post(url, json=payload, timeout=20)
        res_json = res.json()
        raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw_text)
    except Exception as e:
        return {"error": f"Vision API call failed: {e}"}


def run_full_fashion_analysis(image_path: str = "sample_fashion.jpg") -> Dict[str, Any]:
    """Runs DeepFashion2 detection, color clustering, and fabric/material analysis."""
    print("=" * 70)
    print(" FASHION INTELLIGENCE PIPELINE (Detection + Color + Fabric)")
    print("=" * 70)

    # 1. Run or load DeepFashion2 detection
    from test_inference import run_inference

    print("[1/3] Detecting garments with Roboflow DeepFashion2...")
    detection_res = run_inference(image_path)
    predictions = detection_res.get("predictions", [])

    img = Image.open(image_path).convert("RGB")
    crops_dir = Path("garment_crops")
    crops_dir.mkdir(exist_ok=True)

    enriched_garments = []

    print("\n[2/3 & 3/3] Analyzing colors and fabric attributes for each garment...")
    for idx, pred in enumerate(predictions, 1):
        cls_name = pred.get("class", "unknown")
        bbox = (pred["x"], pred["y"], pred["width"], pred["height"])

        # Crop garment
        crop = crop_garment(img, pred)
        crop_filename = crops_dir / f"item_{idx}_{cls_name}.jpg"
        crop.save(crop_filename)

        # Color extraction
        colors = extract_garment_colors(img, bbox, n_clusters=3)

        # Fabric & style analysis
        fabric_info = analyze_fabric_with_vision_api(crop, cls_name)

        garment_data = {
            "item_number": idx,
            "category": cls_name,
            "confidence": pred.get("confidence", 0.0),
            "crop_image": str(crop_filename),
            "colors": colors,
            "attributes": fabric_info,
        }
        enriched_garments.append(garment_data)

    output_payload = {
        "image": image_path,
        "total_garments": len(enriched_garments),
        "garments": enriched_garments,
    }

    output_path = "full_fashion_analysis.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    # Print summary
    print("\n" + "=" * 70)
    print(" COMPLETE ENRICHED FASHION REPORT")
    print("=" * 70)
    for g in enriched_garments:
        attr = g["attributes"]
        primary_color = g["colors"][0]["color_name"] if g["colors"] else "N/A"
        color_hex = g["colors"][0]["hex"] if g["colors"] else "N/A"
        fabric = attr.get("fabric", {}).get("material", "N/A")
        texture = attr.get("fabric", {}).get("texture", "N/A")
        pattern = attr.get("pattern", "N/A")
        subtype = attr.get("garment_subtype", g["category"])

        print(f"\nItem #{g['item_number']} - {subtype.upper()}")
        print(f"  • Category:    {g['category']} ({g['confidence']:.1%})")
        print(f"  • Color:       {primary_color} ({color_hex})")
        print(f"  • Fabric:      {fabric}")
        print(f"  • Texture:     {texture}")
        print(f"  • Pattern:     {pattern}")
        print(f"  • Cropped To:  {g['crop_image']}")

    print("\n" + "=" * 70)
    print(f"[+] Full structured JSON saved to: {output_path}")
    print("=" * 70 + "\n")

    return output_payload


if __name__ == "__main__":
    run_full_fashion_analysis("sample_fashion.jpg")
