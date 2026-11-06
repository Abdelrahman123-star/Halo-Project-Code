# Security & Privacy

> Status: **design. Controls are marked ⬜ until implemented and tested.**

| Control | Mechanism | Status |
|---|---|---|
| Passwords hashed | Supabase Auth (bcrypt) — app never sees/stores hashes | ⬜ |
| Sessions | Supabase JWT, persisted in `expo-secure-store` | ⬜ |
| Authorization | RLS on all tables, `auth.uid()` ownership | ⬜ |
| Private files | private buckets + folder-per-user policy + signed URLs ≤ 5 min | ⬜ |
| Backend auth | FastAPI verifies JWT; every resource lookup filtered by `user_id` | ⬜ |
| Upload validation | magic-byte MIME check, max size, max dimensions, EXIF stripped | ⬜ |
| Secrets | `.env` (git-ignored) in backend; mobile has only anon key | ⬜ |
| Deletion | endpoints remove DB rows **and** storage objects | ⬜ |
| Logging | never log tokens, signed URLs, image bytes | ⬜ |
| Consent | explicit screen before scan explaining what/why; no third-party image APIs | ⬜ |

## Data captured and why
Front/back/face photos → body proportions & appearance suggestions. Clothing photos →
garment analysis. Nothing else (no location, contacts, etc.).

## Retention
**Current prototype (Create Avatar capture, `app/(app)/create-avatar.tsx`):** front/back/face
photos are taken with `expo-camera`, written by the OS to the app's temporary cache, and
referenced only from in-memory screen state. They are not uploaded, not stored in Supabase,
not sent to any model, and are dropped from state when the user leaves the screen (the
user is warned first). The cache files themselves are not yet deleted explicitly; the OS
may purge them. Explicit cleanup + consent screen are required before any upload is added.

Scan images are kept only while the user keeps them; planned option to auto-delete scan
images after avatar generation (decision pending, ADR when chosen). Account deletion
cascades all data.

## Compliance
No legal-compliance claim (GDPR etc.) is made; no assessment has been done.
