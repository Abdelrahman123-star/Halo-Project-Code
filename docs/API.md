# API Contract (FastAPI)

> Status: **Partially implemented.** Garment test endpoint is live.
> Live OpenAPI docs served at `/docs` when backend is running. Auth, profile and simple CRUD go through Supabase
> directly (see [ARCHITECTURE.md](ARCHITECTURE.md)); FastAPI is only for server work.

**Auth:** `Authorization: Bearer <Supabase access token>` on every route except `/health` and `/v1/garment/analyze-test`.  
**Prefix:** `/v1`.

## Error format (all errors)
```json
{ "error": { "code": "scan_incomplete", "message": "Back image is missing.", "details": {} } }
```
Codes: `unauthorized` 401 · `forbidden` 403 · `not_found` 404 · `validation_error` 422 ·
`file_invalid` 415/413 · `model_unavailable` 503 · `processing_failed` 500.

## Processing status enum
`queued → processing → ready | failed` (persisted in DB; client polls).

## Implemented Endpoints

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /health` | None | Liveness check |
| `POST /v1/garment/analyze` | `Bearer <Supabase JWT>` | Authenticated garment CV analysis, server validation (magic bytes, size, dimensions), and RLS-forwarded persistence to `wardrobe_items` |
| `POST /v1/garment/analyze-test` | None (dev test only) | Garment detection + attribute analysis (no auth, no DB writes) |

### POST /v1/garment/analyze

**Auth:** `Authorization: Bearer <Supabase access token>` (verified against Supabase `/auth/v1/user`).  
**Query params:** `persist=true` (default `true`; inserts detected garments into `public.wardrobe_items` using the caller's JWT so RLS `user_id = auth.uid()` enforces ownership).  
**Request:** `multipart/form-data` with field `file` (JPEG / PNG / WEBP; validated by Content-Type, binary magic bytes, max 10 MB size, and 32–8192 px dimensions).  
**Response (200):** `{ "analysis": GarmentAnalysisResponse, "saved_items": SavedWardrobeRow[], "persisted": boolean }`.  
**Error responses:** 401 (`unauthorized`) · 413/415 (`file_invalid`) · 422 (`validation_error`) · 503 (`model_unavailable`) · 500/502 (`processing_failed`).

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

## Planned Endpoints (not yet implemented)
| Method & path | Purpose |
|---|---|
| `POST /v1/scans/{scan_id}/validate` | run real checks on the 3 images, store report |
| `POST /v1/scans/{scan_id}/avatar` | start avatar parameter estimation → `202` + avatar id |
| `GET /v1/avatars/{avatar_id}` | status + params |
| `POST /v1/wardrobe/{item_id}/analyze` | segmentation + attribute analysis + template mapping → `202` |
| `POST /v1/wardrobe/{item_id}/retry` | re-run failed processing |
| `GET /v1/garment-templates` | available templates / compatible categories |
| `DELETE /v1/scans/{scan_id}` | delete scan row **and** storage objects |
| `DELETE /v1/wardrobe/{item_id}` | delete item + files |

**Via Supabase directly (RLS):** profile get/update, avatar appearance update, wardrobe
list/filter/edit, outfits CRUD, apply/remove garment (outfit_items).

## Validation report schema (scan)
```json
{ "front": {"person_detected": true, "full_body": true, "brightness": "ok", "blur": "ok"},
  "back":  {...}, "face": {"face_detected": true, "face_size_ratio": 0.31},
  "passed": false, "issues": [{"view":"front","code":"feet_cropped","message":"..."}] }
```

