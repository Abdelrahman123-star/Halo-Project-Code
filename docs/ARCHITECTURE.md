# Architecture

> Status: **planned design**. Sections are updated to match real code as phases land.

## Components
```mermaid
flowchart LR
  M[Expo mobile app] -- auth, CRUD, storage (RLS) --> S[(Supabase: Auth, Postgres, Storage)]
  M -- start job / poll status (JWT) --> F[FastAPI]
  F -- verify JWT, read/write with service role --> S
  F --> AI[AI modules: body, garment, template mapping]
  M --> T[3D module: three + R3F native]
```

## Responsibility split
- **Supabase direct from mobile (RLS-protected):** auth, profile, wardrobe metadata edits,
  outfit CRUD, avatar appearance edits, signed-URL reads of private images. No custom
  endpoint for these.
- **FastAPI only for:** scan validation, avatar parameter estimation, garment segmentation
  & analysis, template mapping, file validation, deletion cascades that touch storage.
- **No queue.** Long jobs: the API sets `status=processing`, runs via FastAPI
  `BackgroundTasks`, writes `status=ready|failed` + error. The app polls. A queue is
  added only if measured need arises (ADR-0004).

## Data flow: scan → avatar profile (implemented 2026-11-08, ADR-0006)
1. After consent, the app resizes the 3 photos and sends them in one multipart request to
   `POST /v1/avatar/preprocess` with the user's Supabase access token.
2. FastAPI verifies the token, validates and analyses the photos **in memory** (quality → MediaPipe
   pose/face → features), and discards them. Synchronous: ~0.2 s measured on CPU.
3. FastAPI inserts `avatars` (`generated_params` = profile) + `body_scans` (validation report) with the
   service role and returns the profile; on validation failure it records a failed scan and returns 422.
4. Later (not built): the 3D module reads the newest `avatars` row via RLS and applies the params to the GLB.

## Data flow: garment → wearable
1. Upload to `wardrobe-images/{uid}/{item}/original.jpg`; row `processing_status=queued`.
2. `POST /v1/wardrobe/{id}/analyze` → segmentation → colour/pattern/category analysis →
   `ai_output` (JSONB, immutable) → template mapping → `garment_asset` (template id +
   material params).
3. User reviews; edits stored in `user_corrections` (JSONB). Effective value =
   correction ?? ai_output.

## 3D module boundary (`apps/mobile/src/three`)
Public API: `<AvatarViewer avatar={AvatarParams} outfit={GarmentAsset[]} pose={Pose} />`.
Screens pass plain typed data; the module owns loading, materials, morphs, attachment.

## Module map (mobile)
`src/features/{auth,profile,scan,avatar,wardrobe,outfit}/{api,hooks,components,types}`,
`src/shared/{ui,theme,lib}`, `src/three/`. Routes in `app/` (expo-router) are thin.
