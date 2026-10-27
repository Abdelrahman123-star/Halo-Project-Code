# AI Models & Modules

> Every row is **⬜ Not integrated** until verified in Spike B / its phase. Licences below
> are *initial expectations that must be re-checked* against the exact model/package
> version before use, and recorded here.

## Interface principle
Each module is a Python `Protocol` in `services/api/app/ai/<module>/interface.py`, with
one implementation file. The API depends on the interface only, so models are swappable.
Output is validated by Pydantic; failures raise `ModelUnavailable` / `ProcessingFailed`.

| Module | Task | Candidate | Expected licence (verify) | Runs | Status |
|---|---|---|---|---|---|
| A1 `body.PoseAnalyzer` | person + 33 body landmarks, full-body visibility, proportions | MediaPipe Pose Landmarker | Apache-2.0 | CPU, backend | ⬜ |
| A2 `body.FaceAnalyzer` | face detection, size ratio | MediaPipe Face Detector | Apache-2.0 | CPU | ⬜ |
| A3 `quality.ImageQuality` | brightness, blur (Laplacian variance), resolution | OpenCV (classical) | Apache-2.0 | CPU | ⬜ |
| A4 `body.AppearanceSuggester` | skin/hair/eye colour suggestion from face crop | classical colour sampling; **approximate** | n/a | CPU | ⬜ |
| B1 `garment.Segmenter` | foreground mask | rembg (U²-Net) ; fallback GrabCut | MIT / Apache | CPU | ⬜ |
| B2 `garment.Classifier` | category, sleeve, neckline, length, pattern, style | CLIP zero-shot (open_clip) with text prompts | MIT (weights: check) | CPU | ⬜ |
| B3 `garment.ColorExtractor` | dominant + secondary colours | k-means on masked pixels (classical) | n/a | CPU | ⬜ |
| C1 `asset.TemplateMapper` | category/attributes → template + material params | rule-based (deterministic, not ML) | n/a | CPU | ⬜ |

## Honest limits
- Landmarks ≠ 3D reconstruction. Avatar = rigged base + parametric body/appearance values.
- Zero-shot CLIP is approximate; every attribute has a confidence and a low-confidence
  threshold below which the value is stored as `null` ("unknown").
- Fabric composition is **never** inferred.
- Hair style/colour and eye colour from a single selfie are suggestions, user-editable.
- No image leaves the server except to external APIs with explicit consent (none used).

## Output contract (garment `ai_output`)
```json
{ "model_versions": {"segmenter":"…","classifier":"…"},
  "category": {"value":"tshirt","confidence":0.82},
  "pattern": {"value":"striped","confidence":0.64},
  "colors": [{"hex":"#2b3a55","ratio":0.71}],
  "sleeve_length": {"value":null,"confidence":0.31}, "segmentation": "ok|fallback|failed" }
```

## Spike B results
_Not yet run._ (Record versions, wheels, latency, sample outputs here.)
