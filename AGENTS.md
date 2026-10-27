# AGENTS.md — HALO Engineering Rules

Read this file before changing anything. It is the persistent rulebook for every
AI agent and human developer working on HALO.

## 1. Product in one paragraph
HALO is an **Android + iOS only** app (Expo / React Native, TypeScript). Users scan
themselves (front, back, face), get a **stylized rigged 3D avatar**, photograph real
clothes, have them analysed by computer vision, turn them into **template-based 3D
garments**, and dress the avatar. The live smart-display try-on is a *separate future
product* and must never be claimed as implemented. No web frontend.

## 2. Mandatory workflow
`Plan → Inspect → Implement a small step → Test → Review → Document → Update progress → Continue`

1. Before any substantial task, update `docs/IMPLEMENTATION_PLAN.md`.
2. Implement in small, verifiable increments. Keep the project runnable.
3. Run the relevant checks (see `docs/TESTING.md`). Fix failures before moving on.
4. Update docs **in the same step** (see §6). Tick tasks in `docs/PROGRESS.md` only
   when acceptance criteria are verified.
5. If reality invalidates the plan: stop, revise the plan, then continue.
6. Significant technical decisions get an ADR in `docs/DECISIONS/`.

## 3. Honesty rules (non-negotiable)
- Never claim a test passed, build succeeded, or AI model works without evidence.
- Never hardcode "successful" AI output for arbitrary input. Never fabricate results.
- Mocks are allowed **only in tests**. A mocked feature in the app must be labelled
  and listed in `docs/AI_MODELS.md` / `docs/PROGRESS.md` as a prototype.
- Store model output separately from user-corrected metadata.
- Unknown / low-confidence attributes are `null` / "unknown", not guessed.
- Do not pose landmark detection as 3D human reconstruction.

## 4. Architecture boundaries
| Layer | Owns | Must NOT |
|---|---|---|
| `apps/mobile` screens | UI composition, navigation, permissions | contain Supabase queries or model logic |
| `apps/mobile/src/features/*/api` | data access (Supabase / FastAPI calls) | contain UI |
| `apps/mobile/src/features/*/hooks` | state + orchestration | render UI |
| `apps/mobile/src/three` | 3D scene, avatar, garment attachment | know about screens or the DB |
| Supabase | auth, Postgres, private Storage, RLS | hold business logic that needs secrets |
| `services/api` (FastAPI) | token verification, AI jobs, server validation | duplicate simple CRUD that RLS already secures |
| `services/api/app/ai/*` | replaceable model modules behind interfaces | import FastAPI / DB code |

## 5. Coding conventions
- **TypeScript strict**, no `any` without a comment explaining why. Validate external
  data at boundaries with `zod`.
- **Python**: full type hints, Pydantic schemas, `ruff` for lint + format.
- Names are descriptive. Small functions, early returns, no clever one-liners.
- Comments explain *why*, never restate *what*.
- KISS / YAGNI / DRY (but no premature abstraction). No new dependency without
  checking Expo compatibility, maintenance, licence → record it in the relevant doc.
- Feature-oriented folders; avoid deep hierarchies. No file over ~250 lines
  without a reason.
- One consistent error shape from the API (`docs/API.md`). Never swallow exceptions.
- Never log tokens, signed URLs, or image content.

## 6. Documentation duty after every step
Update, when applicable: `docs/PROGRESS.md` (always), `docs/IMPLEMENTATION_PLAN.md`,
`CHANGELOG.md`, and the topic doc (`DATABASE`, `API`, `AI_MODELS`, `THREED_PIPELINE`,
`SECURITY_AND_PRIVACY`, `TESTING`, `ARCHITECTURE`). Record: what/why, files touched,
new deps/env vars/migrations, how to run & verify, checks actually run + results,
limitations, deviations, next step. Docs describe code that **exists**, not intent.

## 7. Security rules
- RLS enabled on every user table; storage buckets private; ownership = `auth.uid()`.
- The Supabase **service-role key and any model secrets live only in the backend env**.
  Mobile gets only the URL + anon key.
- Validate file type (magic bytes), size, and dimensions server-side.
- Images sent to third-party APIs only with explicit user consent. Default: local models.
- Schema change ⇒ migration file + type update + test + `docs/DATABASE.md` entry.

## 8. Definition of done (per task)
Acceptance criteria met · automated checks run & recorded · failure paths handled ·
ownership preserved · deps/config documented · docs match code · limitations stated ·
no unrelated changes · next step clear.

## 9. Priority rule
Correctness > security > maintainability > simplicity > speed > feature count.
