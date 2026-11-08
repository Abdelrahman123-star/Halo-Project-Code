# API Contract (FastAPI)

> Status: **Partially implemented.** Garment test endpoint and avatar preprocessing are live.
> Live OpenAPI docs served at `/docs` when backend is running. Auth, profile and simple CRUD go through Supabase
> directly (see [ARCHITECTURE.md](ARCHITECTURE.md)); FastAPI is only for server work.

**Auth:** `Authorization: Bearer <Supabase access token>` on every route except `/health` and `/v1/garment/analyze-test`.
Verified server-side via Supabase `GET /auth/v1/user` (`app/auth.py`).  
**Prefix:** `/v1`.

## Error format (all errors)
```json
{ "error": { "code": "scan_incomplete", "message": "Back image is missing.", "details": {} } }
```
Codes: `unauthorized` 401 · `forbidden` 403 · `not_found` 404 · `validation_error` 422 ·
`scan_incomplete` 422 · `scan_invalid` 422 · `file_invalid` 415/413 · `model_unavailable` 503 ·
`server_not_configured` 503 · `auth_unavailable` 503 · `save_failed` 503 · `processing_failed` 500.
Raised via `app/errors.py::ApiError`. Exception: the older dev route `/v1/garment/analyze-test` still
returns FastAPI's `{"detail": {...}}` shape (unchanged to keep its tests/clients working).

## Processing status enum
`queued → processing → ready | failed` (persisted in DB; client polls).

## Implemented Endpoints

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /health` | None | Liveness check |
| `POST /v1/garment/analyze-test` | None (dev test only) | Garment detection + attribute analysis |
| `POST /v1/avatar/preprocess` | Bearer | Front/back/face photos → validation + body/face profile, saved for the user |

### POST /v1/garment/analyze-test

**Request:** `multipart/form-data` with field `file` (JPEG / PNG / WEBP, max 10 MB).

**Success response (200):**
```json
{
  "image_width": 1080,
  "image_height": 1440,
  "total_garments": 2,
  "garments": [
    {
      "item_number": 1,
      "category": "trousers",
      "confidence": 0.94,
      "crop_base64": "data:image/jpeg;base64,/9j/4AA...",
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

**Error responses:** 415 (wrong MIME type) · 413 (file too large) · 503 (Roboflow key missing / API down) · 500 (pipeline crash).

> [!NOTE]
> This endpoint has no auth and makes no DB writes. It is a developer test endpoint only.
> When production wardrobe persistence is added, a separate authenticated `POST /v1/wardrobe/{item_id}/analyze` endpoint will be created.

### POST /v1/avatar/preprocess

**Request:** `multipart/form-data` with fields `front`, `back`, `face` (JPEG / PNG / WEBP by magic bytes,
max 10 MB each, max 50 MP). Synchronous (ADR-0006). Photos are analysed in memory and discarded.

**200:** profile returned. `saved: true` → stored (`avatars` + `body_scans`, migration 0003). `saved: false`
(and `avatar_id`/`scan_id` null) when the server has no `SUPABASE_SERVICE_ROLE_KEY`; it then verifies the
login with `SUPABASE_ANON_KEY` and stores nothing.
```json
{
  "avatar_id": "uuid", "scan_id": "uuid", "user_id": "uuid", "status": "ready",
  "created_at": "2026-11-08T12:00:00+00:00",
  "profile": {
    "profile_version": "1.0", "pipeline_version": "avatar-preprocess-0.1",
    "body": {
      "landmark_ratios": { "shoulder_to_height": 0.24, "hip_to_height": 0.15, "torso_to_height": 0.33,
        "upper_arm_to_height": 0.18, "lower_arm_to_height": null, "upper_leg_to_height": 0.27, "lower_leg_to_height": 0.25 },
      "torso": { "waist_to_shoulder": 0.80, "waist_to_hip": 0.86, "shoulder_to_hip": 1.07 },
      "views": { "front": { "mean_visibility": 0.93, "lengths": {...}, "ratios": {...}, "ratio_confidence": {...},
                            "torso_widths": {...}, "torso": {...}, "foreground_ratio": 0.21,
                            "silhouette_profile": [{ "position": 0.1, "width_ratio": 0.08 }], "landmarks": [/* 33 */] },
                 "back": { ... } }
    },
    "face": { "ratios": { "face_width_to_height": 0.78, ... }, "measurements": { "face_width_px": 210.4, ... },
              "symmetry": { "eye_width_difference_percent": 3.1, ... }, "landmarks": [/* 478 × {x,y,z} */] }
  },
  "validation": { "passed": true, "views": { "front": {...}, "back": {...}, "face": {...} },
                  "issues": [{ "view": "back", "code": "blurry", "severity": "warning", "message": "..." }] },
  "timings": { "decode_ms": 46, "quality_ms": 15, "pose_ms": 105, "face_ms": 17, "features_ms": 15, "total_ms": 198 }
}
```
Ratios are the measurements; `*_px` values are diagnostics on the 512 px analysis image. `null` = not
measured confidently (mean landmark visibility < 0.5). Landmarks are normalized to the padded square image.

**Errors:** 401 `unauthorized` · 413/415 `file_invalid` (`details.view`) · 422 `scan_incomplete`
(missing/empty photo) · 422 `scan_invalid` (validation failed; `details.validation` = report,
`details.scan_id` = recorded failed scan or null) · 503 `model_unavailable` / `server_not_configured` /
`auth_unavailable` / `save_failed`.

Validation codes: errors `resolution_too_low`, `person_not_detected`, `body_incomplete` (front),
`face_not_detected`; warnings `not_portrait`, `too_dark`, `too_bright`, `blurry`, `body_incomplete`
(back), `face_too_small`.

## Planned Endpoints (not yet implemented)
| Method & path | Purpose |
|---|---|
| `POST /v1/wardrobe/{item_id}/analyze` | segmentation + attribute analysis + template mapping → `202` |
| `POST /v1/wardrobe/{item_id}/retry` | re-run failed processing |
| `GET /v1/garment-templates` | available templates / compatible categories |
| `DELETE /v1/wardrobe/{item_id}` | delete item + files |

**Via Supabase directly (RLS):** profile get/update, avatar read / appearance update / delete (implemented: delete), wardrobe
list/filter/edit, outfits CRUD, apply/remove garment (outfit_items).

## Validation report schema (scan)
Implemented — see `ValidationReport` in `services/api/app/ai/avatar/schemas.py` and the example above.
