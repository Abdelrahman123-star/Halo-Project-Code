# HALO — Project Plan (Roadmap)

Status legend: ⬜ not started · 🟨 in progress · ✅ verified done.
Live status is tracked in [PROGRESS.md](PROGRESS.md); this file defines scope and acceptance.

## Repository layout (target)
```
apps/mobile/        Expo + React Native + TypeScript app
services/api/       FastAPI backend + AI modules
supabase/           migrations, seed, config (reproducible schema)
assets/3d-source/   source/licence notes for GLB assets
docs/               all documentation
```

## Phase 0 — Planning & feasibility spikes  🟨
Docs, ADRs, repo skeleton, and **two de-risking spikes before building on them**:
- **Spike A — 3D on mobile:** load a rigged GLB with morph targets + swap a texture using
  `three` + `@react-three/fiber/native` + `expo-gl` inside Expo (dev build / Expo Go).
  Fallback: WebView hosting three.js. Decision recorded in ADR-0002.
- **Spike B — AI runtime:** run MediaPipe Pose + Face Detector and a segmentation +
  CLIP zero-shot model on CPU in Python 3.13/3.11 (check wheel availability).
- **Spike C — Avatar asset:** pick a licensed rigged base model (CC0/CC-BY) with morph
  targets; record licence in `assets/3d-source/LICENSES.md`.
*Acceptance:* all docs exist; each spike has a written result (pass/fail + evidence).

## Phase 1 — Foundation ⬜
Expo app, design system (ivory/charcoal tokens), navigation (expo-router, auth-gated),
Supabase project + migrations (`profiles`), Supabase Auth (sign up, login, logout,
reset, verify email), profile/settings screen, FastAPI skeleton with JWT verification
and `/health`.
*Acceptance:* new user registers, logs in, edits profile, logs out; RLS test proves
user B cannot read user A's profile; mobile typecheck + lint + backend tests green.

## Phase 2 — Avatar scanning ⬜
Tables `body_scans` + private bucket `scan-images`. Camera/upload wizard (front, back,
face) with guide overlays, retake, review. Backend validates files and runs **real**
checks (person present, full body visible, face detected, brightness/blur).
*Acceptance:* incomplete scans are rejected with actionable messages; images never
publicly reachable; user can delete scans.

## Phase 3 — Avatar generation ⬜
Pose landmarks → body proportion parameters → morph-target values; skin/hair/eye
estimates from the face image as *suggestions*. `avatars` table, status polling,
3D avatar viewer (rotate, idle animation, poses), customization studio, reset, save.
*Acceptance:* generated avatar renders in 3D on device, appearance persists across
logout/login. Docs clearly list scan-derived vs user-adjustable parameters.

## Phase 4 — Digital wardrobe ⬜
Table `wardrobe_items`, bucket `wardrobe-images`. Add-garment wizard, segmentation,
category/pattern/colour analysis, review/edit screen (model output stored separately
from corrections), grid with filter/search/sort, retry, delete. Template mapping
service creates a garment asset record (template id + material params).
*Acceptance:* a real garment photo yields real detected attributes; failures show retry.

## Phase 5 — Outfit studio ⬜
`outfits` table, garment attach/remove/replace on the rig, layer-compatibility rules,
save/load outfits.
*Acceptance:* top + bottom shown on avatar, persisted, restored after re-login.

## Phase 6 — Quality & documentation ⬜
End-to-end walkthrough of the Definition of Done, responsive/tablet checks, error-state
audit, security review, final docs, honest feature matrix.

## Out of scope (explicit)
Live smart-display try-on · true photo-to-3D body reconstruction · physical cloth
simulation · exact fabric composition · web frontend · e-commerce.

## Risk register
| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 | R3F-native GLB/morph/texture quirks | High | Spike A first; WebView fallback |
| R2 | No suitable free rigged avatar + garments | High | Spike C; Blender-authored simple low-poly set sharing one skeleton |
| R3 | Python AI wheels on 3.13 | Medium | Spike B; pin Python 3.11 in `.python-version` |
| R4 | Free-tier hosting too small for ML | Medium | Run backend locally for demo; document |
| R5 | Photo→garment texture looks poor | Medium | Colour/pattern material first, photo-crop texture second |
| R6 | Scope too large for timeline | High | Vertical slices; Phase gates; cut Phase 5 polish first |
