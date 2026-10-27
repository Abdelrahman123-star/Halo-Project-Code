# API Contract (FastAPI)

> Status: **contract only — nothing implemented.** Live OpenAPI docs will be served at
> `/docs` once the service exists. Auth, profile and simple CRUD go through Supabase
> directly (see [ARCHITECTURE.md](ARCHITECTURE.md)); FastAPI is only for server work.

**Auth:** `Authorization: Bearer <Supabase access token>` on every route except `/health`.
**Prefix:** `/v1`.

## Error format (all errors)
```json
{ "error": { "code": "scan_incomplete", "message": "Back image is missing.", "details": {} } }
```
Codes: `unauthorized` 401 · `forbidden` 403 · `not_found` 404 · `validation_error` 422 ·
`file_invalid` 415/413 · `model_unavailable` 503 · `processing_failed` 500.

## Processing status enum
`queued → processing → ready | failed` (persisted in DB; client polls).

## Endpoints (planned)
| Method & path | Purpose |
|---|---|
| `GET /health` | liveness (no auth) |
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
