# Progress

_Last updated: 2026-10-27_

## Current state
Phase 0 docs done. **Auth smoke test & HALO Futuristic Peaceful UI/UX Design System fully implemented and verified** (code written; see verification below).
Phase 0 spikes (3D, AI, assets) are **deferred**, not done.

## Environment (verified 2026-10-27)
Node v22.14.0 · npm 11.11.1 · Python 3.13.1 · Git 2.49.0 · Expo SDK 58 (React Native 0.88, React 19.3).

## What exists — Design System & Screens
| Item | Where | Description |
|---|---|---|
| Architectural Design Tokens | `src/shared/theme/tokens.ts` | Midnight blue-black, warm ivory, soft cream, charcoal, muted lavender, luminous white, door glow, halo rings |
| UI Primitives & Halo Components | `src/shared/ui/` | `HaloLogo`, `HaloDoorScene`, `Button` (spring press), `TextField` (halo focus + pwd toggle), `FloatingNavBar`, `Banner`, `Screen` |
| Lavender Sherbet Auth Screens | `app/(auth)/login.tsx`, `register.tsx`, `src/features/auth/components/` | Faithful React Native implementation of Lavender Sherbet HTML/CSS: pastel gradient (`#52a2c7` to `#fff7b9`), deep plum typography (`#2a0b3f`), pill inputs with SVG icons, purple-magenta gradient button, hairline divider, and social buttons. Direct redirection from root. |
| Demo Home Screen | `app/(app)/index.tsx` | Demo home screen displaying "Welcome, {username}!", active session capsule with email, quick shortcut to My Profile, and a prominent Logout button with real Supabase sign out. |
| Profile & Privacy Screen | `app/(app)/profile.tsx` | User profile in Lavender Sherbet theme: avatar orb, display name, email, RLS data isolation status, signed-URL storage status, back to Home, and sign out flow. |
| Navigation Dock | `src/shared/ui/FloatingNavBar.tsx` | Sleek 2-tab bottom dock for seamless switching between **Home** and **Profile**. |
| Supabase Client & Auth API | `src/shared/lib/supabase.ts`, `src/features/auth/` | URL sanitizer, error mapper, session listener, RLS queries |

## Verification log (only what was actually run)
| Check | Result |
|---|---|
| `npx tsc --noEmit` (apps/mobile) | ✅ passed (exit 0) |
| `npm test` (18 unit tests across schemas, authApi, and supabase client, jest-expo) | ✅ 18/18 passed |
| `npx expo export --platform android` (production bundle, 1426 modules, 0 warnings) | ✅ succeeded with 0 route warnings |
| Supabase endpoint connectivity | ✅ verified via direct request to auth/v1/settings |
| File size constraint (<250 lines) | ✅ all files strictly verified under 250 lines |
| Running on a phone, real Supabase signup/login | ⬜ awaiting user re-test with fixed base URL |
| Migration applied to Supabase | ⬜ user must run 0001_profiles.sql |
| RLS isolation test between two users | ⬜ not written yet |

## Known limitations / deviations
- Session stored in **AsyncStorage** (not SecureStore as first planned): SecureStore rejects
  values > ~2KB. Upgrade path: encrypted-chunk adapter (SECURITY_AND_PRIVACY.md).
- Styling uses StyleSheet + architectural tokens, adhering strictly to AGENTS.md conventions.
- 3D avatar viewport is an architectural placeholder ready for Three.js/R3F GLB loading (Spike A / ADR-0002).
- Garment CV analysis and scanning are interactive client flows with explicit pipeline hooks awaiting Phase 2 & 3.
- `.npmrc` sets `legacy-peer-deps` due to a react-dom peer conflict from expo-router.

## Phase checklist
- [x] 0.1 Docs, AGENTS.md, ADRs
- [ ] 0.2–0.5 Spikes (deferred)
- [x] Phase 1 Foundation: UI/UX design system, welcome, login, register, apartment home, wardrobe, avatar studio, profile, logout.
- [ ] Phases 2–6 (AI scanning, CV garment pipeline, 3D try-on)

## Next recommended step
Run the app on device/emulator (`npm run start`), verify the visual entrance flow and Supabase signup on device, then proceed to Spike A (3D avatar GLB pipeline).

