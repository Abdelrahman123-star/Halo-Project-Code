# Progress

_Last updated: 2026-10-27_

## Current state
Phase 0 docs done. **Auth smoke test implemented** (code written; see verification below).
Phase 0 spikes (3D, AI, assets) are **deferred**, not done.

## Environment (verified 2026-10-27)
Node v22.14.0 · npm 11.11.1 · Python 3.13.1 · Git 2.49.0 · Expo SDK 58 (React Native 0.88, React 19.3).

## Auth smoke test — what exists
| Item | Where |
|---|---|
| Expo app, expo-router, TS strict, `@/` alias | `apps/mobile` |
| Design tokens + Button/TextField/Screen/Banner | `src/shared/theme`, `src/shared/ui` |
| Supabase client (anon key, AsyncStorage session) | `src/shared/lib/supabase.ts` |
| Validators (zod) + tests | `src/features/auth/schemas.ts`, `__tests__/` |
| Auth API (signIn/signUp/signOut, friendly errors) | `src/features/auth/api/authApi.ts` |
| Session provider + route gate (`Stack.Protected`) | `useSession.tsx`, `app/_layout.tsx` |
| Screens: login, register (+ "check your email" state), welcome home | `app/` |
| `profiles` table + RLS + signup trigger | `supabase/migrations/0001_profiles.sql` |

## Verification log (only what was actually run)
| Check | Result |
|---|---|
| `npx tsc --noEmit` (apps/mobile) | ✅ passed (exit 0) |
| `npm test` (18 unit tests across schemas, authApi, and supabase client, jest-expo) | ✅ 18/18 passed |
| `npx expo export --platform android` (bundle compiles, 1310 modules, expo-router entry) | ✅ succeeded |
| Supabase endpoint connectivity | ✅ verified via direct request to auth/v1/settings |
| Running on a phone, real Supabase signup/login | ⬜ awaiting user re-test with fixed base URL |
| Migration applied to Supabase | ⬜ user must run 0001_profiles.sql |
| RLS isolation test between two users | ⬜ not written yet |

## Known limitations / deviations
- Session stored in **AsyncStorage** (not SecureStore as first planned): SecureStore rejects
  values > ~2KB. Upgrade path: encrypted-chunk adapter (SECURITY_AND_PRIVACY.md).
- Styling uses StyleSheet + tokens, not NativeWind (YAGNI for now).
- No forgot-password, email-verification deep link, or profile editing yet.
- `.npmrc` sets `legacy-peer-deps` due to a react-dom peer conflict from expo-router.
- `npm audit` reports 5 high-severity advisories in the Expo toolchain tree; not yet reviewed.

## Phase checklist
- [x] 0.1 Docs, AGENTS.md, ADRs
- [ ] 0.2–0.5 Spikes (deferred)
- [~] Phase 1 Foundation: register/login/home/logout code written; forgot-password, profile editing, FastAPI skeleton pending
- [ ] Phases 2–6

## Blockers / needs from user
1. Create `apps/mobile/.env` from `.env.example` (URL + anon key).
2. Run `supabase/migrations/0001_profiles.sql` in the SQL Editor.
3. Test on phone and report what you see.

## Next recommended step
After the smoke test passes on your phone: forgot/reset password + profile edit + RLS test,
then Spike A (3D) before Phase 2.
