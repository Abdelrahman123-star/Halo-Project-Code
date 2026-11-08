# AI Models & Modules

> Status: Garment Recognition pipeline (DeepFashion2 + Fashion-CLIP + K-Means + Bilateral Deskew) is **integrated and tested in `services/api`**.
> Avatar preprocessing (MediaPipe Pose + Face Landmarker + OpenCV) is **implemented and unit-tested; accuracy on real photos not yet evaluated**.

## Interface principle
Each module lives in `services/api/app/ai/<module>/`, operating in-memory with zero disk persistence.
Output is validated by Pydantic; failures raise standard HTTP exceptions matching `docs/API.md`.

| Module | Task | Model / Technique | Expected licence | Runs | Status |
|---|---|---|---|---|---|
| A1 `avatar.landmarkers` (pose) + `body_features` + `silhouette` | 33 body landmarks, person mask, full-body framing, proportions | MediaPipe Pose Landmarker `pose_landmarker_full` float16 v1 | Apache-2.0 | CPU, backend | ✅ Implemented (real-photo eval pending) |
| A2 `avatar.landmarkers` (face) + `face_features` | 478 face landmarks, face size, face ratios, symmetry | MediaPipe Face Landmarker `face_landmarker` float16 v1 | Apache-2.0 | CPU, backend | ✅ Implemented (real-photo eval pending) |
| A3 `avatar.quality` | brightness, blur (Laplacian variance), resolution, aspect | OpenCV (classical heuristics) | Apache-2.0 | CPU, backend | ✅ Implemented |
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


## Avatar preprocessing (`services/api/app/ai/avatar/`)
Source: the HALO Colab notebook (`services/api/notebooks/halo_avatar_preprocessing.py`, reference only).
Flow: decode (magic bytes, EXIF orientation) → quality heuristics → resize-with-padding to 512² →
Pose Landmarker (+ segmentation mask) on front and back → Face Landmarker on the close-up → features →
unified profile. Models load once per process from `services/api/models/` (`scripts/download_models.py`).

**Kept from the notebook:** resize-with-padding; landmark segment lengths and ratios to visible height;
visibility-weighted front/back fusion; silhouette cleaning (open/close + largest component); narrowest
torso row as waist (15–85 % of shoulder→hip); 20-row silhouette profile; face regions, ratios, symmetry.

**Changed (and why):**
- Hardcoded values from the test run (`shoulder_width = 103`, `hip_width = 112`, the pasted
  `fused_body_features` dict) are gone; everything is computed per user.
- Ratios whose landmarks have mean visibility < 0.5 are `null`, and fusion skips such views (the notebook
  averaged everything). Back-view ratios that include the hidden nose therefore usually come from the front.
- Shoulder and hip silhouette widths use the torso-central segment like the waist did; the notebook's
  full-row width at hip height included the hands.
- No person / no face → typed validation errors instead of an `IndexError`.
- Quality checks (brightness, blur, aspect, resolution, face size, full-body framing) are **new
  heuristics**, not in the notebook. Thresholds: short side ≥ 480 px (error); body aspect h/w ≥ 1.2,
  brightness 50–215, Laplacian variance ≥ 40 on a 512 px copy, face width ≥ 25 % of photo (warnings);
  shoulders/hips/knees/ankles visibility ≥ 0.5 and inside the photo (error on front, warning on back).
- `mp.solutions` drawing (removed in recent MediaPipe) and all plotting are dropped.

**Measured:** median 198 ms / max 251 ms per request on the dev PC CPU (5 runs, Google's public
`pose.jpg` / `portrait.jpg` test images), cold model load 0.35–0.7 s. The real detectors returned 33 pose
landmarks + a person mask and 478 face landmarks on those images.

**Honest limits:** 2D landmark proportions from phone photos are approximate — this is **not 3D body
reconstruction** and not tape-measure accuracy. Pixel widths depend on camera distance (only ratios are
meaningful). MediaPipe's left/right labels are unreliable in the back view (left/right are averaged).
Not yet evaluated on real photos of standing people; thresholds are untuned first guesses.
Face landmarks are biometric-like data (see SECURITY_AND_PRIVACY.md).

## Prototype placeholders in the app (not models)
- **Preview avatar** (`src/features/avatar/previewAvatar.ts`, `assets/avatar-preview.png`): after the
  Create Avatar flow every user still sees the same fixed sample avatar image, labelled "Preview avatar".
  The photos now produce a real saved body/face **profile**, but no 3D avatar is generated from it yet.
