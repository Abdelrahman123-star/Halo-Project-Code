# Fashion AI Pipeline: Roboflow DeepFashion2 + Local Fashion-CLIP

An end-to-end computer vision and fashion intelligence system:
- **Step 1 (Eyes)**: Roboflow `deepfashion2-m-10k/2` Serverless API detects each garment and isolates its bounding box.
- **Step 2 (Fabric & Style)**: Local **Fashion-CLIP** (OpenCLIP ViT-B/32) classifies fabric, weave, pattern, and detailed garment subtype (100% offline & free).
- **Step 3 (Color)**: K-Means Color Extractor computes perceptual fashion color names, percentages, and exact HEX codes.

---

## 1. Setup

### Dependencies
```bash
pip install -r requirements.txt
```

### Configure Roboflow API Key
Ensure `.env` contains your key:
```env
ROBOFLOW_API_KEY=your_key_here
```

---

## 2. Usage

### Run Full Local Fashion Intelligence Pipeline
Runs detection + local Fashion-CLIP fabric classification + color extraction:
```bash
python fashion_pipeline_local.py --image sample_fashion.jpg
```

**Custom image path or URL:**
```bash
python fashion_pipeline_local.py --image "path/to/outfit.jpg"
```

### Run Quick Roboflow-Only Test
```bash
python test_inference.py --image sample_fashion.jpg
```

---

## 3. Generated Outputs

- **`local_fashion_report.json`**: Complete structured JSON containing bounding boxes, detected categories, predicted fabrics with top candidates, pattern, and color breakdown.
- **`annotated_local_result.jpg`**: Visual image annotated with bounding boxes, fabric names, and dominant color badges.
- **`garment_crops/`**: Isolated image crops of each detected clothing item for inspection or downstream processing.
