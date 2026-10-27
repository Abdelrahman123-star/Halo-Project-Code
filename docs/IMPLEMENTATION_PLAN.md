# Active Implementation Plan

**Current task:** Fix route redirection for unauthenticated users and sanitize Supabase base URL.

## Problem Analysis
1. **Unmatched route at `halo:///`:**
   In `app/_layout.tsx`, `<Stack.Protected guard={Boolean(session)}>` hid `(app)` without specifying a `redirectTo` prop. When an unauthenticated user launched the app at `/`, Expo Router had no accessible route matching `/` (since `(app)/index.tsx` was excluded and `(auth)` only exposed `/login` and `/register`), resulting in an Unmatched Route 404 error screen.
2. **"Something went wrong" on signup/login with 404 in Supabase edge logs:**
   In `apps/mobile/.env`, `EXPO_PUBLIC_SUPABASE_URL` was set to `https://tjfbytzzchatzfwteyls.supabase.co/rest/v1/`. `@supabase/supabase-js` expects the project root URL and appends `/auth/v1/...` internally, causing calls to hit `/rest/v1/auth/v1/signup` (which does not exist, returning HTTP 404).

## Solution Steps
| # | Step | Files | Verification |
|---|---|---|---|
| 1 | Add `redirectTo` to `Stack.Protected` in `app/_layout.tsx` and specify `initialRouteName` in `app/(auth)/_layout.tsx` | `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(auth)/_layout.tsx` | `npx expo export --platform android` & route test |
| 2 | Clean and sanitize `EXPO_PUBLIC_SUPABASE_URL` defensively in code (strip trailing `/rest/v1/` and slashes) | `apps/mobile/src/shared/lib/supabase.ts` | Unit tests for URL sanitizer |
| 3 | Update `apps/mobile/.env` to the canonical project base URL | `apps/mobile/.env` | Curl/API check |
| 4 | Surface raw error details in `__DEV__` mode in `authApi.ts` for actionable debugging | `apps/mobile/src/features/auth/api/authApi.ts` | Unit tests & code review |
| 5 | Run typecheck, unit tests, and bundle verification | `apps/mobile` | `npm run typecheck`, `npm test`, `npx expo export` |
| 6 | Update documentation (`PROGRESS.md`, `CHANGELOG.md`, `README.md`) | `docs/`, root | Docs accurately reflect fixes |
