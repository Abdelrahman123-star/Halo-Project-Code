# AI Models & Modules

> Status: Garment Recognition pipeline (DeepFashion2 + Fashion-CLIP + K-Means + Bilateral Deskew) is **integrated and tested in `services/api`**.

## Interface principle
Each module lives in `services/api/app/ai/<module>/`, operating in-memory with zero disk persistence.
Output is validated by Pydantic; failures raise standard HTTP exceptions matching `docs/API.md`.

| Module | Task | Model / Technique | Expected licence | Runs | Status |
|---|---|---|---|---|---|
| A1 `body.PoseAnalyzer` | person + 33 body landmarks, full-body visibility, proportions | MediaPipe Pose Landmarker | Apache-2.0 | CPU, backend | ⬜ |
| A2 `body.FaceAnalyzer` | face detection, size ratio | MediaPipe Face Detector | Apache-2.0 | CPU | ⬜ |
| A3 `quality.ImageQuality` | brightness, blur (Laplacian variance), resolution | OpenCV (classical) | Apache-2.0 | CPU | ⬜ |
| A4 `body.AppearanceSuggester` | skin/hair/eye colour suggestion from face crop | classical colour sampling | n/a | CPU | ⬜ |
| B1 `garment.Detector` | garment detection, category, segmentation polygon | Roboflow `deepfashion2-m-10k/2` | Commercial / Cloud API | Serverless Cloud | ✅ Integrated |
| B2 `garment.Classifier` | fabric, pattern, and subtype zero-shot classification | Fashion-CLIP (`open_clip_torch`, ViT-B-32) | MIT / OpenAI | CPU / CUDA, backend | ✅ Integrated |
| B3 `garment.ColorExtractor` | dominant colors, HEX, RGB, human perception names | K-Means (scikit-learn) + redmean metric | BSD-3-Clause | CPU, backend | ✅ Integrated |
| B4 `garment.Postprocessor` | hanger removal, bilateral deskew, white canvas compositing | OpenCV bilateral symmetry + Gaussian feather | Apache-2.0 | CPU, backend | ✅ Integrated |
| C1 `asset.TemplateMapper` | category/attributes → template + material params | rule-based (deterministic, not ML) | n/a | CPU | ⬜ |

## Honest limits
- Zero-shot CLIP (`services/api`) and on-device attribute heuristics (`apps/mobile/src/features/garment/api/attributeClassifier.ts`) are approximate; predicted attributes include confidence scores and top candidates.
- On-device mobile pipeline executes Roboflow `deepfashion2-m-10k/2` cloud detection over HTTPS, real in-memory JPEG pixel decoding (`jpeg-js`), polygon mask isolation onto a white background, and real K-Means pixel clustering (`colorExtractor.ts`), while using deterministic category + color distribution rules for fabric/pattern/subtype so the mobile app runs standalone without a local PC server.
- Unknown / low-confidence values are `null`, never guessed.
- Crop handling is 100% in-memory via `Uint8Array` / `io.BytesIO` and base64 data URIs; no images are written to local disk.
- Database persistence is deferred until user-requested; results currently stream directly to the mobile view.

## Output contract (GarmentAnalysisResponse)
```json
{
  "image_width": 1080,
  "image_height": 1440,
  "total_garments": 1,
  "garments": [
    {
      "item_number": 1,
      "category": "trousers",
      "confidence": 0.94,
      "crop_base64": "data:image/jpeg;base64,...",
      "colors": [
        { "color_name": "Denim Blue", "hex": "#3755a0", "rgb": [55, 85, 160], "percentage": 72.3 }
      ],
      "attributes": {
        "fabric": { "predicted": "denim", "confidence": 81.2, "top_candidates": [...] },
        "pattern": { "predicted": "solid plain", "confidence": 91.0, "top_candidates": [...] },
        "subtype": { "predicted": "straight-leg denim jeans", "confidence": 67.4, "top_candidates": [...] }
      }
    }
  ]
}
```
