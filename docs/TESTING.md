# Testing Strategy

> Status: **partly implemented.** Mobile validator tests exist; nothing else yet.
> Commands below marked ✅ were run successfully on 2026-10-27.

## Currently working commands (`apps/mobile`)
- ✅ `npm run typecheck` · ✅ `npm test` (jest-expo, `src/**/__tests__`)
- ✅ `npx expo export --platform android --output-dir dist-check` (bundle smoke check; delete the folder after)
- Tooling gotchas: jest-expo needs `@react-native/jest-preset`; TypeScript 6 needs
  `"types": ["jest"]` in tsconfig and rejects `baseUrl`.

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

## Known gaps
Backend tests, RLS isolation test, device run of the auth flow, component/E2E tests.
