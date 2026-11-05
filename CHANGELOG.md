# Changelog

## [Unreleased]
### Added — In-Memory CV Garment Recognition Pipeline & Mobile Test Screen (2026-11-03)
- **Ported Prototype into Production Backend (`services/api`)**:
  - Refactored `Cloth Recognation Code` into a clean, modular, in-memory AI package (`services/api/app/ai/garment/`):
    - `color_extractor.py`: K-Means clustering with human-perception redmean metric and curated fashion palette.
    - `classifier.py`: Fashion-CLIP zero-shot attribute classification (`open_clip_torch`, ViT-B-32) for fabric, pattern, and subtype.
    - `postprocess.py`: OpenCV bilateral symmetry auto-straightening (deskew), hanger hook cleanup, and white canvas compositing.
    - `detector.py`: Roboflow `deepfashion2-m-10k/2` serverless client with header-based authentication.
    - `pipeline.py`: In-memory orchestrator returning structured Pydantic responses with base64 data URI crop previews.
  - **Zero Disk Writes**: Eliminated all local file generation (`annotated_result.jpg`, `local_fashion_report.json`, `result.json`, `garment_crops/`); all operations run via `io.BytesIO` and base64 strings.
  - **Zero Database Persistence**: Pure computation pipeline; does not write to Postgres/Supabase tables until explicitly requested.
  - **Garment Test Router (`app/routers/garment.py`)**: `POST /v1/garment/analyze-test` accepting multipart image uploads with standard error envelopes.
  - **Backend Test Suite (`services/api/tests/`)**: 31 unit tests covering color extraction, deskew post-processing, Pydantic schemas, and router mocks.
  - **Mobile Feature Layer & Standalone Native Execution (`apps/mobile`)**:
  - Installed `expo-image-picker`, `expo-image-manipulator`, `buffer`, `expo-file-system`, and `jpeg-js`.
  - Implemented 100% native in-app garment analysis pipeline (`garmentApi.ts`, `imageProcessor.ts`, `colorExtractor.ts`, `attributeClassifier.ts`) that calls Roboflow Serverless HTTPS API directly with base64 image data and runs polygon segmentation masking, white-background isolation, K-Means color extraction, and attribute classification in memory on the device.
  - Reverted experimental rotation/deskewing heuristics per user request to maintain un-distorted, faithful garment isolation.
  - Added `Buffer` polyfill in `app/_layout.tsx` and `imageProcessor.ts` so `jpeg-js` encoder executes cleanly in React Native Hermes.
  - Added hardware image optimization via `expo-image-manipulator` to downscale high-resolution camera photos (e.g. 12MP/4000x3000) to max 1024px.
  - Added comprehensive real-time command-line (CMD) logging at every stage with timing, network status, predictions, dominant colors, and attributes.
  - Implemented 25-second `AbortController` network timeout so fetch never hangs indefinitely.
  - 35/35 mobile Jest unit tests and 31/31 backend pytest tests passing.
- **Cleanup**: Safely deleted temporary prototype folder `Cloth Recognation Code`.

### Changed — Project Scope Simplification & Demo Home Implementation (2026-10-28)
- **Direct Auth Redirection (`app/(auth)/index.tsx`)**: Removed onboarding landing pages (`welcome.tsx`, `features/onboarding/`). Unauthenticated users now redirect directly to the Lavender Sherbet Login screen.
- **Demo Home Page (`app/(app)/index.tsx`)**: Replaced complex architectural apartment 3D scene with a clean, focused demo home screen:
  - Personal greeting: "Welcome, {username}!" displaying live profile name, user metadata, or email handle.
  - Active session capsule showing account email and display name.
  - Prominent "Log out" button directly on the page with loading indicator and secure Supabase sign out.
  - Shortcut action card navigating to My Profile.
  - Cohesive Lavender Sherbet pastel theme (`#52a2c7` -> `#ee92c2` -> `#fff7b9`) with deep plum typography (`#2a0b3f`).
- **Retained & Styled Profile Page (`app/(app)/profile.tsx`)**:
  - Restyled to cohesive Lavender Sherbet theme with user initial avatar orb, email, and security/privacy section.
  - Retained functional Sign Out button and navigation back to Home.
- **Removed Prototype Screens**:
  - Removed wardrobe screen (`wardrobe.tsx`).
  - Removed avatar screens (`avatar.tsx`, `create-avatar.tsx`, `features/avatar/`).
  - Streamlined `FloatingNavBar.tsx` to 2 tabs: **Home** and **Profile**.
- **Cleaned Auth Headers (`login.tsx`, `register.tsx`)**:
  - Removed onboarding back buttons from login and register headers, leaving clean concentric circle logo marks.
- **Verified**: `tsc --noEmit` passed (0 errors), 18/18 Jest tests passed, `npx expo export --platform android` succeeded (1426 modules, 0 warnings).

### Added — Lavender Sherbet Multi-Slide Onboarding & Landing Pages (2026-10-27)
- **Multi-Slide Onboarding Landing Experience (`app/(auth)/welcome.tsx`)**:
  - Implemented 3 interactive onboarding steps matching the Lavender Sherbet aesthetic (`#52a2c7` -> `#a2e9f3` -> `#ee92c2` -> `#fff7b9`):
    1. **Slide 1 — Smart Mirror AI**: Ambient mirror frame with glowing concentric halo rings, floating sparkles, and "Meet your smartest reflection."
    2. **Slide 2 — 3D Avatar Scan**: Stylized 3D digital twin silhouette with biometric scan corner brackets, guidelines, and "Your stylized 3D avatar."
    3. **Slide 3 — Intelligent Closet**: Smart hanger with digital garment showcase, CV tags ("CV Garment Analysis", "Digital Closet"), and "Wear your wardrobe digitally."
  - **Dynamic Navigation & Action Flow**:
    - Top bar with HALO logo mark, wordmark, and "Skip" button.
    - Animated pagination dots with active pill gradient expansion (`OnboardingControls.tsx`).
    - Next / Back controls for slides 1 & 2.
    - Final slide delivers explicit action buttons: **"Create account"** (gradient primary CTA navigating to `/(auth)/register`) and **"Log in"** (glass/pill secondary CTA navigating to `/(auth)/login`).
    - Back button navigation added to both `login.tsx` and `register.tsx` headers allowing users to seamlessly return to the onboarding landing pages at any time.
- **Architectural Modularity**:
  - Separated illustrations into `OnboardingVisuals.tsx` (219 lines).
  - Separated slide card layout into `OnboardingSlideCard.tsx` (69 lines).
  - Separated controls into `OnboardingControls.tsx` (162 lines).
  - Extracted slide configurations into `onboardingData.ts` (33 lines).
  - Maintained `welcome.tsx` strictly under 250 lines (218 lines).
  - Verified with `tsc --noEmit` (0 errors), 18/18 passing Jest tests, and `npx expo export --platform android` (clean bundle, 1440 modules, 0 warnings).

### Added — Lavender Sherbet Auth Theme & Keyboard Bug Resolution (2026-10-27)
- **Lavender Sherbet Auth Screens (`login.tsx`, `register.tsx`)**: Replaced dark auth layout with user's Lavender Sherbet design matching HTML/CSS specification:
  - 4-stop pastel background gradient (`#52a2c7` -> `#a2e9f3` -> `#ee92c2` -> `#fff7b9`) using `expo-linear-gradient`.
  - Concentric circle `HaloMark` vector badge with gradient fill.
  - Deep plum typography (`#2a0b3f`, `rgba(42, 11, 63, 0.65)`).
  - Pill input fields (`AuthInput`) with left SVG icons (Mail, Lock, User) and password visibility toggle.
  - Purple-magenta gradient primary action button (`AuthButton`) with press-scale feedback and loading spinner.
  - Hairline "or" divider (`HairlineDivider`) and circular Google & Apple social buttons (`SocialButtons`).
- **Complete Elimination of Focus-Cycling & Keyboard Dismissal Bugs**:
  - Removed internal `useState` re-renders and elevation changes on input focus, eliminating Android Yoga layout recalculation loops that manifested as holding down the Tab key.
  - Enforced fixed 50px input container height with `paddingVertical: 0` to prevent Android `EditText` from losing focus.
  - Removed `justifyContent: 'center'` from ScrollView container to prevent soft keyboard vertical reflows from triggering `clearFocus()`.
  - Added `returnKeyType="next"` and `blurOnSubmit={false}` for smooth field progression.
- **Fixed Expo Router Warning**: Moved `avatarStyles.ts` to `src/features/avatar/components/AvatarStudioStyles.ts`, eliminating the warning `Route "./(app)/avatarStyles.ts" is missing the required default export`.
- **Validation & Dependencies**:
  - Added `expo-linear-gradient` (~14.0.2) and `react-native-svg` (15.11.2) to `apps/mobile`.
  - Updated `useRegisterForm` to map missing `confirmPassword` directly to `password`, preserving 3-field UX while maintaining 100% test compatibility with `registerSchema`.
  - Verified with `tsc --noEmit` (0 errors), 18/18 passing Jest tests, and `npx expo export --platform android` (clean bundle, 0 warnings).

### Added — HALO Futuristic, Peaceful, Immersive Mobile UI/UX Design System (2026-10-27)
- **Architectural Design System Tokens (`tokens.ts`)**: Implemented the complete architectural palette (midnight blue-black `#171B27`, warm ivory `#F4F0E8`, soft cream `#E8E0D4`, charcoal `#24262A`, muted lavender `#B8AED8`, soft silver `#C9CDD4`, luminous white `#FFFDF8`, ice blue `#B8DDF0`, door glow & halo rings).
- **First-Launch Cinematic Welcome Screen (`app/(auth)/welcome.tsx`)**: Atmospheric futuristic apartment entrance with skippable fade-in sequence, illuminated wordmark, primary luminous CTA "Enter your space", and returning user login link; persisted via AsyncStorage (`HAS_SEEN_WELCOME_KEY`).
- **Architectural Login & Registration Screens (`login.tsx`, `register.tsx`)**: Reimagined with subtle halo focus illumination, password show/hide toggle, real validation with Zod, and friendly Supabase auth feedback.
- **Signature Home Screen — Front Door of Apartment (`app/(app)/index.tsx`)**:
  - Full-screen architectural scene with breathing indirect lighting, door frame illumination, access panel, and floor reflections (`HaloDoorScene.tsx`).
  - Stylized avatar silhouette with pulsing illuminated '+' invitation button (`AvatarPresenter.tsx`) inviting first-time users to create their digital twin.
  - Contextual time-based greeting, environmental wardrobe/add-garment widgets, and profile indicator.
- **Avatar Creation Onboarding Guide (`app/(app)/create-avatar.tsx`)**: 3-step scan guide (front, back, face) with explicit camera/upload pipeline integration points adhering to honesty rules.
- **Core Navigation & Destinations**:
  - Sleek floating bottom navigation bar (`FloatingNavBar.tsx`) with 4 destinations: Home, Wardrobe, Avatar, Profile.
  - **Wardrobe Screen (`wardrobe.tsx`)**: Digital closet with category filter chips, empty state with add garment action.
  - **Avatar Studio Screen (`avatar.tsx`)**: 3D studio viewport placeholder ready for GLB/R3F integration (ADR-0002) with interactive skin tone, hair color, and hairstyle controls.
  - **Profile Screen (`profile.tsx`)**: Account credentials, RLS data ownership status, private storage badges, and logout flow.
- All files strictly typed, modular (<250 lines), verified with `tsc --noEmit`, 18/18 passing Jest tests, and clean production bundle export via `npx expo export`.

### Fixed — Android input focus cycling and keyboard dismissal (2026-10-27)
- Eliminated focus loop / "tab cycling" bug on Android: Removed `useState` focus re-renders from `TextField.tsx`, fixed input row height (52px fixed, `paddingVertical: 0`), and removed unresolved `height: '100%'` Yoga layout calculation.
- Resolved Android Autofill collision on register: Set `autoComplete="off"` on `confirmPassword` and added explicit `returnKeyType` (`next` / `done`) and `blurOnSubmit={false}` to prevent soft keyboard flicker.
- Fixed stray route warning: Moved `avatarStyles.ts` to `src/features/avatar/components/AvatarStudioStyles.ts` and removed it from `app/(app)/`.
- Cleaned up ScrollView layout in `Screen.tsx`: Removed `justifyContent: 'center'` from `contentContainerStyle` to prevent Android ScrollView re-centering and focus clearing when the soft keyboard is active.

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
