# Testing Strategy

> Status: **partly implemented.** Mobile Jest suites and backend pytest suites exist.
> Commands below marked ✅ were run successfully (mobile on 2026-10-27, re-run 2026-11-08; backend 2026-11-08).

## Currently working commands (`apps/mobile`)
- ✅ `npm run typecheck` · ✅ `npm test` (jest-expo, `src/**/__tests__`)
- ✅ `npx expo export --platform android --output-dir dist-check` (bundle smoke check; delete the folder after)
- Tooling gotchas: jest-expo needs `@react-native/jest-preset`; TypeScript 6 needs
  `"types": ["jest"]` in tsconfig and rejects `baseUrl`.

## Currently working commands (`services/api`, venv in `.venv`, Python 3.14)
- ✅ `.venv\Scripts\python -m pytest -q` — 67 passed (2026-11-08): garment tests + avatar
  `test_avatar_features.py` (pure measurement logic, synthetic landmarks/masks), `test_avatar_pipeline.py`
  (orchestration with fake detectors), `test_avatar_router.py` (endpoint with auth/Supabase/detectors
  overridden; auth dependency with mocked Supabase HTTP). Fakes live in `tests/avatar_fixtures.py` (tests only).
- ✅ `ruff check` + `ruff format --check` on the avatar/backend-core files (config `services/api/ruff.toml`).
  The older garment modules still have 17 findings (pre-existing).
- ✅ Real-model smoke + benchmark: `scripts/benchmark_avatar.py FRONT BACK FACE --runs 5 --show-report`
  (run with Google's public MediaPipe test images `pose.jpg` / `portrait.jpg`, not committed).
- ✅ Manual HTTP smoke (uvicorn on `0.0.0.0:8000`): `/health` OK via the Wi-Fi IP; preprocess without a
  token → 401 `unauthorized`; with a token but no Supabase env → 503 `server_not_configured`.

## Target strategy

| Layer | Tool | Command (target) | Priority |
|---|---|---|---|
| Mobile types | `tsc --noEmit` (strict) | `npm run typecheck` | every step |
| Mobile lint/format | ESLint + Prettier | `npm run lint` | every step |
| Mobile unit | Jest + `jest-expo`, Testing Library | `npm test` | validators, mapping, hooks |
| Backend lint/format | Ruff | `ruff check . && ruff format --check .` | every step |
| Backend unit/API | pytest + httpx `TestClient` | `pytest` | auth, uploads, validation, mapping |
| AI modules | pytest with **fixture images** (real models, small set) | `pytest -m ai` | marked separately, may be slow |
| RLS / storage isolation | pytest against a Supabase test project, 2 users | `pytest -m rls` | security-critical |
| E2E | manual checklist now; Maestro later if time | `docs/TESTING.md` §checklist | phase boundaries |

## Rules
- TDD for: ownership/RLS, upload validation, template mapping, status transitions,
  attribute confidence thresholds.
- Mocks of AI only in unit tests of API logic; AI tests use real models and say so.
- Deterministic fixtures in `services/api/tests/fixtures/`.

## Manual E2E checklist (Definition of Done)
Register → verify/login → scan 3 views → generate avatar → customise → add garment →
review attributes → wear on avatar → save outfit → logout/login → data intact.

## Avatar preprocessing E2E (manual, pending — needs migration 0003 + backend `.env` + phone)
1. Backend running on `0.0.0.0:8000`; phone on the same Wi-Fi; `EXPO_PUBLIC_API_URL=http://<PC-IP>:8000`.
2. Create Avatar → capture or choose front / back / face → Review → Create My Avatar → consent → processing.
3. Expect the results screen (proportions + tips) → Finish → "Meet your HALO avatar".
4. Supabase Table Editor: a new `avatars` row (`generated_params` filled) and a `body_scans` row for your user.
5. Failure paths: a photo with no person → "Retake front photo"; backend stopped → "Couldn't reach the HALO server".
6. Avatar page → Delete → both rows gone.

## Known gaps
RLS isolation test (needs two test users after 0003 is applied), device run of the avatar flow, accuracy
evaluation on real photos, component/E2E tests, garment-module ruff cleanup.
