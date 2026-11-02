# Active Implementation Plan

**Current task:** Implement HALO — Futuristic, Peaceful, Immersive Mobile UI/UX Design System & Screens.

## Objective
Design and implement the complete visual identity and screen experience for HALO:
1. **Design System & Architectural Theme Tokens**: Establish the warm ivory, midnight blue-black, soft cream, muted lavender, and luminous halo lighting palette.
2. **First-Open Welcome Experience (`welcome.tsx`)**: Atmospheric apartment entrance, ambient door lighting, logo with halo, peaceful skippable entrance animation, first-launch tracking via AsyncStorage.
3. **Login & Registration Screens (`login.tsx`, `register.tsx`)**: Architectural theme, password visibility toggle, subtle halo outline on focus, real Supabase auth integration with validation.
4. **The Signature Home Screen (`(app)/index.tsx`)**: Futuristic apartment entrance door with subtle ambient light, floor reflections, and digital twin avatar:
   - First-time avatar state: Stylized silhouette with floating pulsing luminous '+' invitation button and CTA to create digital twin.
   - Configured avatar state: Display personalized avatar with outfit and contextual actions.
   - Environmental widgets: Wardrobe shortcut, add clothing action, profile avatar header.
5. **Avatar Creation Flow (`(app)/create-avatar.tsx`)**: Expanding halo transition, front/back/face photo guide, connection to scan data pipeline.
6. **Navigation & Main App Screens (`(app)/_layout.tsx`, `wardrobe.tsx`, `avatar.tsx`, `profile.tsx`)**:
   - Floating luxury bottom navigation bar.
   - Wardrobe screen: digital closet, category filters, garment cards, add garment flow.
   - Avatar Studio screen: 3D studio viewport placeholder ready for GLB/R3F per ADR-0002, appearance customization controls (skin tone, hair, proportions).
   - Profile screen: account details, security/privacy, logout.
7. **Quality & Honesty**: All files TypeScript strict, modular (<250 lines), zero fabricated AI outputs, unit tests updated & passing, bundle compiles.

## Plan Steps
| # | Step | Files | Verification |
|---|---|---|---|
| 1 | Upgrade theme tokens (`tokens.ts`) with official HALO palette, halos, and architectural shadows/lighting | `src/shared/theme/tokens.ts` | Typecheck |
| 2 | Build core UI components: `HaloBadge`, `HaloDoorScene`, `HaloButton`, `HaloTextField`, `FloatingNavBar` | `src/shared/ui/` | Unit tests / Typecheck |
| 3 | Implement First-Open Welcome Screen with entrance animation and AsyncStorage flag | `app/(auth)/welcome.tsx`, `app/(auth)/index.tsx` | Verification on route redirect |
| 4 | Upgrade Login & Register screens with password toggle, halo focus, and real auth | `app/(auth)/login.tsx`, `app/(auth)/register.tsx` | Unit test suite |
| 5 | Build the Apartment Front Door Home Screen with avatar silhouette & pulsing '+' button | `app/(app)/index.tsx`, `src/features/avatar/` | Render check & unit test |
| 6 | Build Avatar Creation modal/screen with scan guide | `app/(app)/create-avatar.tsx` | Typecheck & navigation |
| 7 | Implement Wardrobe, Avatar Studio, and Profile screens with floating bottom navigation | `app/(app)/_layout.tsx`, `wardrobe.tsx`, `avatar.tsx`, `profile.tsx` | Typecheck & expo export |
| 8 | Run full test suite, verify compilation (`npx expo export`), document progress in docs | `docs/PROGRESS.md`, `CHANGELOG.md` | `npm test`, `npx expo export` |

