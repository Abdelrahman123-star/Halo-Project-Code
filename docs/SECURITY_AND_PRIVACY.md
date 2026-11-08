# Security & Privacy

> Status: **design. Controls are marked ⬜ until implemented and tested.**

| Control | Mechanism | Status |
|---|---|---|
| Passwords hashed | Supabase Auth (bcrypt) — app never sees/stores hashes | ⬜ |
| Sessions | Supabase JWT, persisted in `expo-secure-store` | ⬜ |
| Authorization | RLS on all tables, `auth.uid()` ownership | ⬜ |
| Private files | private buckets + folder-per-user policy + signed URLs ≤ 5 min | ⬜ |
| Backend auth | FastAPI verifies the Supabase token via `GET /auth/v1/user` (`app/auth.py`); avatar writes use that user id | ✅ avatar route (tests, mocked Supabase); garment dev route still open |
| Upload validation | magic-byte type check, 10 MB per file, ≤ 50 MP, min 480 px; EXIF used for orientation only (photos are never stored) | ✅ avatar route (tests) |
| Secrets | `.env` (git-ignored) in backend; `SUPABASE_SERVICE_ROLE_KEY` backend-only | ⚠️ service key backend-only ✅; but `EXPO_PUBLIC_ROBOFLOW_API_KEY` is still shipped in the app bundle (see below) |
| Deletion | endpoints remove DB rows **and** storage objects | ⬜ |
| Logging | never log tokens, signed URLs, image bytes | ⬜ |
| Consent | explicit screen before upload (`AvatarConsentView`): what is sent, not kept, saved, deletable | ✅ avatar flow (per session, not persisted); garment photos still go to Roboflow without a consent screen |

## Data captured and why
Front/back/face photos → body proportions & appearance suggestions. Clothing photos →
garment analysis. Nothing else (no location, contacts, etc.).

## Retention
**Create Avatar (`app/(app)/create-avatar.tsx`), as implemented 2026-11-08:**
- Photos (camera or library) live in the app cache and in-memory screen state. After explicit consent
  they are resized to ≤ 1600 px and uploaded once to the HALO backend. The resized copies are deleted
  right after the upload; the originals are deleted from the app cache when the user leaves the screen
  (only files inside the app's cache directory are touched).
- The backend analyses them **in memory** (upload spool threshold raised so Starlette does not write a
  temp file) and drops them when the request ends. Photos are **not stored** anywhere (ADR-0006).
- Stored per user (RLS, owner-only read/delete): `avatars.generated_params` — body ratios, silhouette
  widths, 33 pose landmarks per view and **478 face landmarks** (biometric-like data) — and
  `body_scans.validation_report`. Deleting the avatar in the app deletes both; account deletion cascades.
- Dev setup uses plain HTTP on the local Wi-Fi, so uploads are **not encrypted in transit** during
  development. Production needs HTTPS (the consent copy does not claim encryption).

**Leaked Roboflow key:** a Roboflow API key was hardcoded as a fallback in `garmentApi.ts` and is in
git history (3 commits). The fallback is removed (2026-11-08); the key must be rotated in Roboflow.
Any `EXPO_PUBLIC_*` value is compiled into the app bundle (verified: the key from a local `.env` appears
in the Android export), so a Roboflow key in the mobile app is always extractable — moving garment
detection behind the backend is the real fix (follow-up).

Scan images are kept only while the user keeps them; planned option to auto-delete scan
images after avatar generation (decision pending, ADR when chosen). Account deletion
cascades all data.

## Compliance
No legal-compliance claim (GDPR etc.) is made; no assessment has been done.
