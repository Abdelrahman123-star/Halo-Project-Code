"""
In-memory garment analysis pipeline orchestrator.
Accepts raw image bytes, returns a GarmentAnalysisResponse.
Writes nothing to disk at any stage.
"""

from __future__ import annotations

from io import BytesIO

from PIL import Image

from app.ai.garment.classifier import get_classifier
from app.ai.garment.color_extractor import extract_garment_colors
from app.ai.garment.detector import crop_garment_in_memory, detect_garments, pil_to_base64
from app.ai.garment.postprocess import postprocess_garment_crop
from app.ai.garment.schemas import (
    DetectedGarment,
    GarmentAnalysisResponse,
    GarmentAttributes,
)


def run_garment_analysis(
    image_bytes: bytes,
    roboflow_api_key: str,
    roboflow_model_id: str = "deepfashion2-m-10k/2",
) -> GarmentAnalysisResponse:
    """
    Full in-memory garment pipeline:
      1. Roboflow DeepFashion2 detection (cloud API)
      2. Polygon crop + white background compositing
      3. OpenCV post-processing (hanger cleanup + deskew)
      4. Fashion-CLIP fabric / pattern / subtype classification
      5. K-Means color extraction with redmean perceptual naming

    Returns a GarmentAnalysisResponse with base64 crop previews — 0 disk writes.
    """
    pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    predictions = detect_garments(image_bytes, roboflow_api_key, roboflow_model_id)

    classifier = get_classifier()
    garments: list[DetectedGarment] = []

    for idx, pred in enumerate(predictions, start=1):
        category = pred.get("class", "unknown")
        confidence = float(pred.get("confidence", 0.0))
        bbox = (
            float(pred.get("x", 0)),
            float(pred.get("y", 0)),
            float(pred.get("width", 0)),
            float(pred.get("height", 0)),
        )

        # Step 1: Crop garment with polygon segmentation mask
        crop_raw = crop_garment_in_memory(pil_image, pred)

        # Step 2: Post-process (clean background, deskew, center)
        crop_clean = postprocess_garment_crop(crop_raw, category=category)

        # Step 3: Classify fabric, pattern, subtype
        attribute_groups = classifier.classify_garment(crop_clean, broad_category=category)

        # Step 4: Extract colors from original image using bbox
        colors = extract_garment_colors(pil_image, bbox, n_clusters=3)

        # Step 5: Encode crop to base64 data URI (no file written)
        crop_b64 = pil_to_base64(crop_clean, format="JPEG")

        garments.append(
            DetectedGarment(
                item_number=idx,
                category=category,
                confidence=round(confidence, 4),
                crop_base64=crop_b64,
                colors=colors,
                attributes=GarmentAttributes(
                    fabric=attribute_groups["fabric"],
                    pattern=attribute_groups["pattern"],
                    subtype=attribute_groups["subtype"],
                ),
            )
        )

    return GarmentAnalysisResponse(
        image_width=pil_image.width,
        image_height=pil_image.height,
        total_garments=len(garments),
        garments=garments,
    )

