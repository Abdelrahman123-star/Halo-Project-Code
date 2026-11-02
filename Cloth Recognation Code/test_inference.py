"""
Test inference script for Roboflow 'deepfashion2-m-10k/2' model.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

DEFAULT_IMAGE_PATH = "sample_fashion.jpg"


def annotate_and_save_image(image_source: str, predictions: list, output_filename: str = "annotated_result.jpg"):
    """Annotates bounding boxes and labels on the image and saves it."""
    try:
        from PIL import Image, ImageDraw
        import requests
        from io import BytesIO

        if image_source.startswith("http://") or image_source.startswith("https://"):
            response = requests.get(image_source, timeout=15)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content)).convert("RGB")
        else:
            img = Image.open(image_source).convert("RGB")

        draw = ImageDraw.Draw(img)

        # Palette for bounding boxes
        palette = [
            (255, 56, 56),
            (46, 147, 250),
            (102, 218, 38),
            (233, 30, 99),
            (255, 152, 0),
            (156, 39, 176),
            (0, 188, 212),
        ]

        for idx, pred in enumerate(predictions):
            color = palette[idx % len(palette)]
            x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
            x1 = x - w / 2
            y1 = y - h / 2
            x2 = x + w / 2
            y2 = y + h / 2

            # Bounding box
            draw.rectangle([x1, y1, x2, y2], outline=color, width=4)

            # Label banner
            label = f"{pred.get('class', 'item')} {pred.get('confidence', 0):.0%}"
            text_bbox = draw.textbbox((x1, max(0, y1 - 20)), label)
            draw.rectangle(
                [text_bbox[0] - 2, text_bbox[1] - 2, text_bbox[2] + 2, text_bbox[3] + 2],
                fill=color,
            )
            draw.text((x1, max(0, y1 - 20)), label, fill=(255, 255, 255))

        img.save(output_filename)
        print(f"[+] Visual annotated image saved to: {output_filename}")
    except Exception as e:
        print(f"[!] Note: Could not create visual annotation ({e})")


def run_inference(image_path: str, api_key: str | None = None, model_id: str = "deepfashion2-m-10k/2"):
    """Runs inference using Roboflow Serverless Cloud API with header-based auth."""
    # Resolve API Key
    api_key = api_key or os.getenv("ROBOFLOW_API_KEY")

    if not api_key or not api_key.strip() or "your_" in api_key.lower():
        print("\n" + "=" * 60)
        print("[!] ERROR: Roboflow API key not configured!")
        print("=" * 60)
        print("To run inference, please provide your Roboflow API key:")
        print("  1. Edit .env and set: ROBOFLOW_API_KEY=your_key_here")
        print("  2. Or set environment variable:")
        print("       PowerShell:  $env:ROBOFLOW_API_KEY=\"your_key_here\"")
        print("       CMD:         set ROBOFLOW_API_KEY=your_key_here")
        print("  3. Or pass via flag: python test_inference.py --image <path> --api-key <key>")
        print("\nGet your API key at: https://app.roboflow.com/settings/api")
        print("=" * 60)
        sys.exit(1)

    # Validate image file exists if it's a local path
    if not (image_path.startswith("http://") or image_path.startswith("https://")):
        if not Path(image_path).exists():
            print(f"\n[!] ERROR: Image file '{image_path}' not found!")
            sys.exit(1)

    print(f"[*] Initializing Roboflow Inference Client...")
    print(f"[*] Model ID:    {model_id}")
    print(f"[*] Input Image: {image_path}")

    from inference_sdk import InferenceHTTPClient, InferenceConfiguration

    # Client setup as specified in requirements
    client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key=api_key,
    ).configure(
        InferenceConfiguration(
            api_key_transport="header"  # header-based auth (inference v1.5.0+)
        )
    )

    print("[*] Running inference via Serverless API...")
    try:
        result = client.infer(image_path, model_id=model_id)
    except Exception as err:
        print(f"\n[!] Inference request failed:\n{err}")
        sys.exit(1)

    print("\n[+] Inference completed successfully!")

    # Save full JSON output
    json_output_file = "result.json"
    with open(json_output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"[+] Full JSON results saved to: {json_output_file}")

    # Display detections
    predictions = result.get("predictions", [])
    print(f"\n" + "=" * 65)
    print(f" Detections & Garment Analysis: {len(predictions)} items")
    print("=" * 65)

    from color_extractor import extract_garment_colors
    from PIL import Image
    try:
        pil_img = Image.open(image_path).convert("RGB")
    except Exception:
        pil_img = None

    if not predictions:
        print(" No fashion garments detected.")
    else:
        for idx, pred in enumerate(predictions, 1):
            cls_name = pred.get("class", "unknown")
            conf = pred.get("confidence", 0.0)
            x, y = pred.get("x", 0), pred.get("y", 0)
            w, h = pred.get("width", 0), pred.get("height", 0)

            # Extract color breakdown if PIL image is loaded
            color_summary = ""
            if pil_img:
                colors = extract_garment_colors(pil_img, (x, y, w, h), n_clusters=3)
                pred["colors"] = colors
                if colors:
                    dominant = colors[0]
                    color_summary = f" | Color: {dominant['color_name']} ({dominant['hex']})"

            print(f" {idx:2d}. [{cls_name.upper()}] Conf: {conf:5.1%}{color_summary}")
            if pil_img and "colors" in pred:
                for c in pred["colors"][:2]:
                    print(f"     -> {c['color_name']:<18} ({c['hex']}) - {c['percentage']:.1f}% of garment")

    print("=" * 65 + "\n")

    # Update result.json with color info
    with open(json_output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    # Save visual result
    if predictions:
        annotate_and_save_image(image_path, predictions)

    return result


def main():
    parser = argparse.ArgumentParser(description="Test Roboflow DeepFashion2 model inference")
    parser.add_argument(
        "--image",
        "-i",
        type=str,
        default=DEFAULT_IMAGE_PATH,
        help=f"Path or URL of the image to analyze (default: {DEFAULT_IMAGE_PATH})",
    )
    parser.add_argument(
        "--api-key",
        "-k",
        type=str,
        default=None,
        help="Roboflow API key (optional; defaults to ROBOFLOW_API_KEY environment variable)",
    )
    parser.add_argument(
        "--model",
        "-m",
        type=str,
        default="deepfashion2-m-10k/2",
        help="Roboflow model ID (default: deepfashion2-m-10k/2)",
    )

    args = parser.parse_args()
    run_inference(image_path=args.image, api_key=args.api_key, model_id=args.model)


if __name__ == "__main__":
    main()
