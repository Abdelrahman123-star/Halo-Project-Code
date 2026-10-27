# Changelog

## [Unreleased]
### Fixed — auth smoke test routing & connectivity (2026-10-27)
- Unmatched route at root: Added `redirectTo` props to `Stack.Protected` in `app/_layout.tsx` so unauthenticated users visiting `/` redirect to `/(auth)/login`, and authenticated users visiting auth screens redirect to `/(app)`.
- Added fallback `app/(auth)/index.tsx` redirecting to `login`.
- Fixed 404 on Supabase auth endpoints: Cleaned `EXPO_PUBLIC_SUPABASE_URL` in `apps/mobile/.env` (stripped `/rest/v1/`) and added defensive normalization (`cleanSupabaseUrl`) in `supabase.ts`.
- Enhanced `friendlyMessage` in `authApi.ts` to surface detailed error info in `__DEV__` mode.
- Added 10 unit tests for `cleanSupabaseUrl` and `friendlyMessage`; configured Jest setup file with AsyncStorage mock.

### Added
- Phase 0: `AGENTS.md`, `README.md`, and `docs/` (project plan, implementation plan,
  architecture, database, API, AI models, 3D pipeline, security, testing, progress, ADRs).
  Documentation only — no application code.
