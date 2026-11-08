# Changelog

## [Unreleased]
### Added — Measurements pinned on the preview avatar
- `src/features/avatar/avatarAnchors.ts` (body-part anchor points on `avatar-preview.png`, annotation builder,
  label layout), `components/AnnotatedAvatar.tsx` (SVG dots/segments/callouts + label columns),
  `avatarProfileStore.ts` (ratios only, per user, AsyncStorage; deleted with the avatar).
- Shown on the Create Avatar final screen and on the avatar page; plain preview when no measurements exist.
- `services/api/scripts/compute_avatar_anchors.py`: derives the anchors with MediaPipe (`--preview` draws them).
### Changed — Backend works without the service-role key
- New `SUPABASE_ANON_KEY` (public) lets the backend verify logins; without `SUPABASE_SERVICE_ROLE_KEY` the
  endpoint returns the profile with `saved: false`, `avatar_id`/`scan_id` null and writes nothing.
- Tests: backend 69 passed (+2), mobile Jest 133 passed (+5 annotation/store tests).
### Fixed — Bottom navigation overlapped buttons on every screen
- `app/(app)/_layout.tsx`: screens now render in a `flex: 1` container above `AppBottomNav`, so the bar sits
  in normal layout flow at the bottom and can't cover content (it used to be `position: absolute` over all screens,
  while only Home reserved space for it).
- `HomeBottomNav`: no longer absolutely positioned; pads by the bottom safe-area inset on a `#EEF2FB` strip.
  New `shouldShowBottomNav()` hides it on `house-entrance` (as before), `hallway` (door hotspots depend on the
  full-screen image) and `create-avatar` (the bar bypassed the discard-photos confirmation and mid-upload state).
- Home: removed the extra bottom padding that compensated for the floating bar; `HOME_BOTTOM_NAV_HEIGHT` removed.
- Checks: `tsc --noEmit` clean; Jest 128/128 (+1 visibility test); Android export bundles. Not yet checked on a device.
### Added — Avatar preprocessing: photos → saved body + face profile (backend + app)
- Backend `services/api/app/ai/avatar/` (no FastAPI/DB imports): `schemas`, `image_io` (magic bytes,
  EXIF orientation, 50 MP cap), `quality` (resolution/aspect/brightness/blur heuristics), `preprocess`
  (resize-with-padding), `landmarkers` (MediaPipe Pose + Face Landmarker, loaded once, lock-guarded),
  `body_features`, `silhouette`, `face_features`, `pipeline`. Ported from the Colab notebook
  (reference copy in `services/api/notebooks/`); hardcoded test values removed, low-confidence → `null`.
- `POST /v1/avatar/preprocess` (`app/routers/avatar.py`): Supabase token verification (`app/auth.py`),
  `{ "error": {...} }` shape (`app/errors.py`), saves via PostgREST with the service role
  (`app/supabase_rest.py`, `app/avatar_store.py`). Synchronous (ADR-0006). Photos stay in memory
  (`MultiPartParser.spool_max_size` raised in `main.py`) and are not stored.
- Migration `supabase/migrations/0003_avatars.sql`: `avatars`, `body_scans` with RLS (owner select/delete,
  no client insert, only editable params updatable). **Not applied yet — run manually.**
- Scripts: `scripts/download_models.py` (MediaPipe `.task` → `models/`, git-ignored),
  `scripts/benchmark_avatar.py`. `ruff.toml` added. `services/api/README.md` with setup/run steps.
- New deps: `mediapipe>=1.2.0` (Apache-2.0). `inference-sdk` now has `python_version < "3.14"` (no 3.14
  wheels; only the dev garment endpoint imports it). Dev-only: `ruff` in the venv.
- New backend env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (backend only), optional `AVATAR_MODELS_DIR`.
- App: `features/avatar/api/avatarApi.ts` (resize ≤ 1600 px, multipart upload with bearer token, zod
  validation, typed errors, cache cleanup, RLS delete), `types/avatarProfile.ts`, `hooks/useAvatarPreprocessing.ts`,
  `avatarSummary.ts`; reducer stages `consent` / `processing` / `results`; new `AvatarConsentView`,
  `AvatarProcessingView`, `AvatarResultsView`, `AvatarIssuesList`; "Choose from library" on capture steps;
  intro/ready/delete copy updated; deleting the avatar also deletes server rows. Uses `EXPO_PUBLIC_API_URL`.
- Tests: backend 67 passed (avatar features/pipeline/router + existing); mobile Jest 127 passed (new
  `avatarApi`, `avatarSummary`, reducer-stage tests); `tsc` clean; Android export bundles.
### Security — Roboflow key fallback removed
- `garmentApi.ts` no longer contains a hardcoded Roboflow key; a missing or placeholder key fails fast with
  a clear message before any image work (2 new tests). The old key is in git history and must be rotated.
### Added — Preview avatar after capture + avatar page with delete (PROTOTYPE, no generation)
- New asset `assets/avatar-preview.png` (user-provided sample character; white background removed by edge flood-fill and cropped to 179×610). It is a fixed sample, NOT generated from the user's photos; labelled "Preview avatar" wherever shown.
- `src/features/avatar/previewAvatar.ts` + `hooks/usePreviewAvatar.ts`: per-user on-device flag (AsyncStorage key `halo.preview-avatar.v1.<userId>`), re-read on screen focus. No upload, no backend.
- Create Avatar: "Create My Avatar" saves the flag (with loading/error handling), then the final screen shows the preview avatar ("Meet your HALO avatar", "Preview avatar" pill, honest copy that personalized generation is coming soon).
- Home (`HouseHero` gained `hasAvatar`): with an avatar, the preview image stands in the silhouette's spot (no "+") and opens the new `app/(app)/avatar.tsx`; without one, the "+" silhouette opens Create Avatar as before. Nothing is drawn while the flag is loading.
- New `app/(app)/avatar.tsx`: large preview avatar, Back to home, Delete avatar (confirmation) → returns Home showing the "+" silhouette. Empty state links to Create Avatar.
- New `PreviewAvatarFigure` component. Bedroom's "3D Dressing Suite" link still opens Create Avatar (unchanged).
- Checks: `tsc --noEmit` clean; Jest 66/66 (3 new in `src/features/avatar/__tests__/previewAvatar.test.ts`); `npx expo export --platform ios` includes the asset. Not yet verified on a device.
### Added — Create Your Avatar: guided camera capture (UI + working camera; no avatar generation)
- New dependency: `expo-camera` (~58.0.14, first-party Expo, MIT, Expo Go compatible; `npx expo install`). `app.json`: `expo-camera` plugin (camera permission text; microphone and Android audio recording disabled). The shared iOS camera permission string now covers avatar photos and clothing (also set on `expo-image-picker` so neither overrides the other).
- `app/(app)/create-avatar.tsx` rewritten (still reached from the avatar "+" on Home and from the bedroom): intro → Front view → Back view → Face close-up → Review → "Your photos are ready!" placeholder. Single route + `useReducer`, so moving between steps never drops photos. Leaving with photos asks for confirmation; iOS swipe-back disabled on this screen; Android hardware back steps backwards through the flow.
- New `src/features/avatar/`: `avatarSteps.ts` (step copy + default camera per step), `avatarCaptureState.ts` (pure reducer), components `CameraCapture` (permission states incl. Open Settings, live `CameraView`, positioning guide, shutter, front/rear switch, 0/3/10 s self-timer, mount/capture error + restart; camera unmounted when screen unfocused), `CaptureStepView`, `CaptureProgress` (tappable Front/Back/Face with done state), `CaptureGuides` (dashed body/back/face guides; pearly illustration variant), `AvatarIntroView`, `AvatarReviewView` (per-photo retake), `AvatarReadyView` (honest "coming soon", empty silhouette), `CaptureFrame`, `SoftButton`, `AvatarIcons`.
- `AvatarSilhouette.tsx`: exported `HUMAN_SILHOUETTE_PATH` / `SILHOUETTE_ASPECT_RATIO` for reuse (no visual change). Deleted unused `ComingSoonScreen.tsx`.
- Photos stay in memory/app cache only: no upload, no API, no avatar generation (see `docs/SECURITY_AND_PRIVACY.md`).
- Checks: `tsc --noEmit` clean; Jest 63/63 (6 new in `src/features/avatar/__tests__/avatarCaptureState.test.ts`); `npx expo export` iOS + Android bundle; `npx expo config --type introspect` shows the camera permission text applied. Camera not yet verified on a physical device.
- Note: `NSMicrophoneUsageDescription` / `RECORD_AUDIO` still appear in the generated config — they come from the existing `expo-image-picker` plugin defaults, not from `expo-camera`.
### Changed — Home bottom nav is now real frosted glass
- New dependency: `expo-blur` (~58.0.5, first-party Expo, MIT, supported in Expo Go; installed with `npx expo install`).
- `HomeBottomNav`: `BlurView` (`systemUltraThinMaterialLight`; intensity tuned to 20 with a lighter tint for clearer glass) under a faint pearl tint gradient, white rim and top sheen, replacing the 78% white fill. Shadow moved to an outer layer so the blur can be clipped to the rounded shape.
- `app/(app)/index.tsx`: page content wrapped in `BlurTargetView` and passed as `blurTarget`, required for real blur on Android (`blurMethod="dimezisBlurViewSdk31Plus"`: Android 12+ blurs, older Android shows the translucent tint only).
- Checks: `tsc --noEmit` clean; Jest 57/57; `npx expo export --platform android` bundles. Not yet verified visually on a device.
### Changed — Dashboard moved to a bottom navigation with one page per feature (UI prototype)
- Home: the inline dashboard is replaced by `HomeBottomNav` (`src/features/home/components/HomeBottomNav.tsx`), a frosted bottom bar with Wellness, Reminders, Weather and Calendar. Home scroll padding leaves room for it. Header, house and avatar unchanged.
- New routes: `app/(app)/wellness.tsx`, `reminders.tsx`, `weather.tsx`, `calendar.tsx`, sharing `FeaturePageShell` (pastel background, back button, title/subtitle, "Preview · sample data" label).
- Weather page adds `HourlyForecastCard` (sample `SAMPLE_HOURLY`); Calendar page lists all sample events (`CalendarCard` gained `upcomingLimit`, default 2). New `CloudSunIcon`.
- Removed `src/features/home/dashboard/HomeDashboard.tsx` (no longer used).
- Still static sample data only; no APIs, backend, notifications or analysis. No new dependencies.
- Checks: `tsc --noEmit` clean; Jest 57/57. Not yet verified visually on a device.
### Added — Home dashboard UI prototype (static sample data, frontend only)
- New `src/features/home/dashboard/`: `HomeDashboard` (layout), `WellnessCard` (score ring, skin-progress sparkline, clarity/hydration/concerns bars, "View details" link — visual only), `RemindersCard` (timeline-style daily reminders with pending dots), `WeatherCard` (condition, temp, H/L, outfit tip), `CalendarCard` (real current month, pearl-highlighted today, event dots, next two events), shared `DashboardCard`/`CardHeader`, `MiniCharts` (ProgressRing, Sparkline, ThinBar), `DashboardIcons`, `dashboardTheme`, `calendarMath`, `sampleData`.
- `app/(app)/index.tsx`: dashboard mounted under the house (where the wardrobe card was) with the existing staggered fade-in. Header, house and avatar unchanged.
- All wellness/reminder/weather/event content is static sample data in `sampleData.ts`, labelled in-app as "Preview · sample data". No APIs, backend, DB, notifications or skin analysis. Calendar uses the device date; sample events are offsets from today.
- Layout: Wellness (full) → Reminders (full) → Weather | Calendar side by side (stacked under 350 pt width). No new dependencies.
- Checks: `tsc --noEmit` clean; Jest 57/57 (4 new in `src/features/home/__tests__/calendarMath.test.ts`). Not yet verified visually on a device.
### Changed — Home wardrobe card removed; seamless house-entrance → hallway hand-off
- Home: removed the "Add to your wardrobe" card (wardrobe is reachable from the bedroom). Deleted the now-unused `HomeShortcutsCard.tsx` and its test case.
- New asset `assets/hallway-entrance-frame.jpg`: the exact last frame of `house-entrance.mp4` (1080×1920). `DoorSelectionView` now uses it (exported as `HALLWAY_IMAGE`) instead of `hallway-doors.png`, which framed the hallway differently and caused a visible jump. Door hit areas and light portals re-positioned for the new framing.
- `house-entrance.tsx`: the hallway frame sits under the video (pastel loader only while buffering), so the 300 ms fade at the end reveals an identical picture; Home/Skip pills fade out with it.
- `app/(app)/_layout.tsx`: `hallway` route uses `animation: 'none'` so the route swap is invisible (no slide).
- Hallway HUD ("Outside" pill, "Tap a door" hint) now fades in on focus instead of popping in.
- `assets/hallway-doors.png` is no longer referenced (kept on disk).
- Fixed: zoomed top-left hallway flash at the end of the entrance video. The under-video hallway `Image` used `absoluteFill` with no width/height and rendered at its intrinsic 1080×1920 size; it now uses the same layout as `DoorSelectionView` (absolute container + `width/height: '100%'`). Verified via AVAssetImageGenerator that `hallway-entrance-frame.jpg` matches the video's final presented frame (the file has a 0.083 s edit-list offset).
- Checks: `tsc --noEmit` clean; Jest 53/53; `npx expo export --platform android` bundles and includes the new frame. Not yet verified on device.
### Changed — App-open welcome screen is now a full-screen intro video (`apps/mobile`, frontend only)
- New `src/features/launch/components/WelcomeVideoScreen.tsx` (expo-video, already a dependency): plays `assets/videos/welcome-intro.mp4` full-screen (`contentFit="cover"`, no controls, status bar hidden) with sound, once (`loop = false`). On `playToEnd` it fades out (450 ms) and calls `onFinished`, which reveals the navigator exactly as before (Login, or Home with a session). Falls through to the app if the player reports `error` or is not ready within 8 s. Listeners removed on unmount; expo-video releases the player. A ref guards against double-finish, and the callback is held in a ref so re-renders never restart playback.
- `app/_layout.tsx`: `LaunchScreen` swapped for `WelcomeVideoScreen` (same `onFinished` contract; no other changes). `src/features/launch/components/LaunchScreen.tsx` deleted (no longer used).
- Asset renamed `assets/videos/welcome page.mp4` → `welcome-intro.mp4` (spaces in bundled asset names are unsafe for Android resources).
- Untouched: Login/Register, Home, room navigation, auth/session logic, AsyncStorage, and the unreachable legacy `app/(auth)/welcome.tsx`.
- Checks: `tsc --noEmit` clean; Jest 54/54; `npx expo export --platform ios` bundles and includes `welcome-intro.mp4`. Not yet verified on a physical device (playback, audio, Android).
### Added — Two-Door Room Selection & Animated Room Transition (`apps/mobile`, frontend only) (2026-11-06)
- Assets: Integrated user-uploaded two-door hallway screenshot (`assets/hallway-doors.png`, 575×1024), preserving original wood doors ("BEDROOM" and "BATHROOM"), proportions, lighting, and ambient surroundings without stretching.
- [`DoorSelectionView.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/src/features/home/components/DoorSelectionView.tsx) (new): Interactive hallway component with hit zones over Bedroom and Bathroom doors. Implements smooth camera approach zoom (`scale: 1.0 -> 2.7`), amber/gold illuminated door outline highlights, radiant door-opening light bloom, and fluid threshold fade without separate videos. Features `useFocusEffect` to automatically reset animations when returning from a room.
- [`hallway.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/app/(app)/hallway.tsx): Updated to host `DoorSelectionView` with navigation to Bedroom, Bathroom, and Outside.
- [`bedroom.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/app/(app)/bedroom.tsx) (new): Full-screen Bedroom & Dressing Suite with Digital Wardrobe (`/(app)/garment`) and 3D Avatar Dressing Suite (`/(app)/create-avatar`) access cards, and "← Hallway" return button.
- [`bathroom.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/app/(app)/bathroom.tsx) (new): Full-screen Bathroom & Beauty Suite with Smart Vanity Mirror and Beauty Shelf preview cards, and "← Hallway" return button.
- Unit tests: Added test suites in `src/features/home/__tests__/homeComponents.test.ts`. All 54 Jest tests pass (8 test suites); `tsc --noEmit` clean with 0 errors. All files under 250 lines.

### Added — Interactive House Entrance Video & Hallway Screen (`apps/mobile`, frontend only) (2026-11-06)
- Dependency: Installed `expo-video@~58.0.12` compatible with Expo SDK 58.
- Assets: Linked `apps/mobile/assets/videos/house-entrance.mp4` / `house-video.mp4` to the existing 1080×1920 entrance video (`home-video.mp4`).
- [`house-entrance.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/app/(app)/house-entrance.tsx): Implemented full-screen interactive entrance video player using `useVideoPlayer` and `VideoView`. Configured auto-play on mount, muted (`muted: true`), controls hidden (`nativeControls: false`), non-looping (`loop: false`), and scaled to fit without distortion (`contentFit="cover"`). Features a graceful pastel fallback backdrop during buffering, top safe area Home and Skip glass pills, and automatic smooth fade transition to `/(app)/hallway` on `playToEnd`. Full cleanup on unmount stops and releases playback with zero background leaks.
- [`hallway.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/app/(app)/hallway.tsx) & [`house-interior.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/app/(app)/house-interior.tsx): House Interior / Hallway screen matching HALO's pastel aesthetic. Features room action cards for "Digital Wardrobe" (`/(app)/garment`), "Dressing Suite" (`/(app)/create-avatar`), and "Step Outside" back to the front of the house (`/(app)`).
- [`jest.setup.js`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/jest.setup.js): Added mock for `expo-video` TurboModules.
- Unit tests: Added test suites in `src/features/home/__tests__/homeComponents.test.ts`. 51/51 Jest tests passing; `tsc --noEmit` clean with 0 errors.

### Changed — Home Header Styling & Avatar Sizing (`apps/mobile`, frontend only) (2026-11-06)
- [`HomeHeader.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/src/features/home/components/HomeHeader.tsx): Removed the trailing heart (`♡`) from the greeting (`"Welcome, [Name]"` and `"Welcome back"`). Updated greeting text color from dark plum to HALO's signature luminous lilac/purple (`#6B5299`) and subtitle to `#8A76A6` for a soft, pastel glow rather than black.
- [`HouseHero.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/src/features/home/components/HouseHero.tsx): Increased avatar silhouette default height from 42% (`height * 0.42`) to 52% (`height * 0.52`) and adjusted position (`left: width * 0.14`, `bottom: height * 0.03`) for a larger, more prominent full-body presence outside the house.
- Checks: `tsc --noEmit` and all 49 Jest tests passing.

### Changed — Full-body Avatar Silhouette standing in front of House (`apps/mobile`, frontend only) (2026-11-06)
- `apps/mobile/src/features/home/components/AvatarSilhouette.tsx` (new): Full-body human silhouette outline showing head, shoulders, torso, arms, hips, legs, and feet visible from head to toe. Rendered with an SVG closed path, translucent pearlescent fill gradient (`rgba(255,255,255,0.78)` to `rgba(213,192,238,0.58)`), delicate dusty mauve outline (`#8E7AA6`), soft ground contact shadow, and a small floating frosted white `+` badge near the shoulder. Includes tactile spring press animation (`scale: 0.94` on touch) and navigates to `/(app)/create-avatar`.
- `apps/mobile/src/features/home/components/HouseHero.tsx`: Positioned `AvatarSilhouette` directly in front of the house illustration near the entrance/porch pathway (`left: width * 0.17`, `bottom: height * 0.04`). Preserves house touch targeting ("Tap the house to step inside" → `/(app)/house-entrance`) while providing a dedicated, accessible touch target for the avatar.
- `apps/mobile/src/features/home/components/HomeShortcutsCard.tsx`: Completely removed the circular avatar placeholder and its row from underneath the house. Streamlined to cleanly feature the wardrobe capture action ("Add to your wardrobe" → `/(app)/garment`).
- `apps/mobile/app/(app)/index.tsx`: Wired `onAvatarPress={() => router.push('/(app)/create-avatar')}` to `HouseHero`.
- Added unit tests in `src/features/home/__tests__/homeComponents.test.ts`. All 49 Jest tests pass (8 test suites); `tsc --noEmit` clean with 0 errors. Zero backend or auth changes. All touched files under 250 lines.

### Added — Home Page with HALO house and avatar entry point (`apps/mobile`, frontend only)
- `app/(app)/index.tsx` rewritten: pastel orb background (`PastelBlobBackground`), header with HALO logo + profile button, greeting "Welcome back, <first name> ♡" and subtitle, tappable house hero, and a frosted shortcuts card (Create your avatar, Add to your wardrobe). Staggered fade/scale entrance. The old demo home (status pill, account details, log-out button) and the dark `FloatingNavBar` are no longer on this screen; sign-out remains on Profile.
- New temporary screens `app/(app)/house-entrance.tsx` and `app/(app)/create-avatar.tsx` (shared `ComingSoonScreen`) that state the feature is not built yet. No video transition or avatar generation implemented.
- New `src/features/home/components/`: `HomeHeader`, `HouseHero` (uses `assets/halo-house.png` at its 477×523 aspect ratio with a soft ground glow and press feedback), `HomeShortcutsCard`, `ComingSoonScreen`, `GlassIconButton`, `FadeInView`, `HomeIcons`.
- New `src/features/profile/displayName.ts` + `hooks/useDisplayName.ts`: name from `profiles.display_name`, else sign-up metadata `display_name`/`full_name`, else null (neutral greeting — no guessed name).
- Reuses auth visuals (`AuthCard`, `AuthButton`, `HairlineDivider`, `authTheme`, `SoftGlow`); Login/Register screens unchanged. No backend, API, schema or auth-logic changes. No new dependencies.
- Checks: `tsc --noEmit` clean; Jest 46/46 pass (5 new in `src/features/profile/__tests__/displayName.test.ts`). ESLint not run (no ESLint config in the project). Not yet verified visually on a device.
### Changed — Auth background blob replaced with animated iridescent orb (2026-11-06)
- `apps/mobile/src/features/auth/components/IridescentOrb.tsx` (new): frosted orb drawn with `react-native-svg` radial gradients; five pastel colour lobes orbit the centre at different speeds/directions and pulse in scale under a white frost veil, (the breathing outer halo was later removed — it showed as an arc below the card).
- `PastelBlobBackground.tsx`: now renders a pale lilac canvas, three slowly drifting corner glows (lavender, pink, blue) and the floating orb. No longer uses `assets/pearlescent-blob.png`. Same exports (`PastelBlobBackground`, `PastelBackground`), so login, register, welcome, transition overlay and success view pick it up automatically.
- Native-driver transform/opacity animations only; reduce-motion still freezes all motion. No new dependencies.
- Visibility pass: added an opaque lavender sphere body under the swirls, raised swirl opacity/saturation, shrank the white frost to a centre highlight, and raised the orb size cap to `min(screenWidth * 1.05, 520)` so the orb reads clearly through the translucent auth card.
- Pearl pass: milky white-lilac body, soft pearl palette (blush, lilac, powder blue, mint, champagne), and a travelling white sheen lobe.
- Removed the two bottom corner glows (pink bottom-right, blue bottom-left) from `PastelBlobBackground.tsx`; only the top-right lavender glow remains.
- Fixed: removed the orb rim-lustre layer. It was not absolutely positioned, so it rendered one orb-height below the orb and showed as a pink ring under the login card.
- `AuthButton` (`AuthComponents.tsx`) restyled to a pearl gradient (`authTheme.pearlBtnGradient`: `#F2C4E2 → #D5C6F6 → #BCD6F6`) with a white top sheen, white hairline border and dark plum label (`#3D3055`) for contrast on the light fill. `authTheme.btnGradient` is unchanged, so home/profile/onboarding buttons keep the old purple gradient.
- Checks: `tsc --noEmit` clean; 41/41 Jest tests pass. Not yet verified visually on a device.
### Added — Frosted Glass Auth Screens Redesign & Animated Pastel Blob Background (2026-11-06)
- **Visual Identity Redesign (Reference 1 & Reference 2)**:
  - Combined Reference 1's frosted glass card (translucent backdrop `rgba(255, 255, 255, 0.40)`, subtle white hairline border `rgba(255, 255, 255, 0.88)`, rounded corners `borderRadius: 32`, delicate top sheen highlight, and soft ambient shadow) with Reference 2's dreamy pastel palette (pastel lavender `#B392F8`, baby blue `#67BFFC`, cyan `#48E5DC`, pink `#FA7DB9`, and lilac `#C98CFA`).
  - Implemented `PastelBlobBackground.tsx`: One large, soft, blurred organic multi-radial gradient blob positioned directly behind the glass card that animates continuously with slow, seamless floating, horizontal drifting, and breathing scale movements at different speeds. Specially tuned size and luminous opacity to ensure vibrant visibility blooming behind the card.
  - Harmonized button colors to match the page palette with a periwinkle-to-lilac gradient (`['#686EE8', '#9475F5']`).
  - Implemented smooth animated spring-like sliding indicator for Login/Register toggle (`AuthTabBar` in `AuthComponents.tsx`):
    - Slides smoothly within the same toggle container using spring dynamics (`friction: 9, tension: 50`) without button unmounting or cross-fade flashes.
    - Preserves solid white background, rounded corners (`borderRadius: 13`), and soft drop shadow.
    - Unified into a single shared toggle container at the top of `AuthCard` in both `login.tsx` and `register.tsx`.
  - Integrated user-provided 3D pearlescent iridescent liquid blob asset with orbital ring (`assets/pearlescent-blob.png`) into `PastelBlobBackground.tsx`:
    - Dynamic multi-layered native animations: organic floating/drifting, breathing scale, microgravity orbital tilt, fluid liquid morphing via non-uniform scale pulsing, and underlying rotating chromatic aura refraction.
    - 100% performant native driver animations (`useNativeDriver: true`) without React state re-render overhead.
  - Added smooth sliding motion transition (`AuthSlideContainer.tsx`) with fluid cubic deceleration easing (`bezier(0.25, 1, 0.4, 1)`) and synchronized sliding pill indicator on the tab bar (`AuthTabBar`).
  - Fixed `app/(auth)/index.tsx` entry redirect to route straight to `/(auth)/login`.
  - Added reduced-motion accessibility support via `AccessibilityInfo.isReduceMotionEnabled()` and `reduceMotionChanged` listener to freeze animations if requested by the user.
  - Updated brand logo across the app with the new shimmering script HALO logo asset (`assets/halo-logo.png`).
- **Mobile Auth Screens (`apps/mobile`)**:
  - Redesigned `app/(auth)/login.tsx` and `app/(auth)/register.tsx` with responsive `KeyboardAvoidingView` / `ScrollView` layouts, entrance animations, and cohesive glassmorphic styling.
  - Created modular `AuthForms.tsx` and `AuthSuccessView.tsx` for clean architecture and strict file line size limits (<250 lines).
  - Maintained 100% of existing authentication logic, handlers, validation rules, state management, and navigation routes.
  - Zero modifications to backend services, APIs, database schemas, or business logic.
  - All touched files strictly conform to the <250 lines rule; 41/41 mobile Jest unit tests and TypeScript check passing.

### Added — Luxury Pearlescent Garment Studio UI (`apps/mobile`) (2026-11-05)
- **Garment Studio Screen (`app/(app)/garment.tsx`)**:
  - Full luxury beauty & fashion visual identity following HALO brand guidelines (Lavender mist `#D9CFF1`, Blush pink `#F1D9E5`, Pearl blue `#D4E9EC`, Soft mint `#D7EAE3`, Warm ivory `#F6EBDD`, Dusty mauve `#77708F`).
  - Luminous pearlescent multi-radial pastel background (`PearlescentBackground.tsx`) with subtle light reflections and organic shapes.
  - Safe-area header (`HaloHeader.tsx`) with back navigation and centered HALO logo mark.
  - Refined heading "Add to Your Wardrobe" with subtitle and minimal clothing hanger decorative element (`WardrobeHangerDecor.tsx`).
  - Interactive frosted-glass selection cards (`GarmentOptionCard.tsx`) for "Take a Photo" and "Choose from Gallery" with tactile spring scale-down press animations, ambient glows, and thin-line icons.
  - Subtle frosted guidance card (`PhotoCaptureGuide.tsx`) with capture tips.
  - Image review preview screen (`GarmentPreview.tsx`) inside a frosted glass panel with "Choose Another" and prominent "Continue" CTA.
  - Progressive AI analysis view (`GarmentProcessingView.tsx`) with live stages ("Preparing image...", "Detecting garments with AI...", "Extracting colors & attributes...").
  - Luxury detected garment card (`GarmentDetectedCard.tsx`) displaying isolated item crop on white background, category, color swatches with percentage pills, and fabric/pattern attributes.
  - Honest 3D pipeline roadmap card (`GarmentRoadmapCard.tsx`) stating that 3D template fitting and avatar try-on are in development (per `AGENTS.md` §3).
  - Preserves original image URI and connects seamlessly to native in-app pipeline via `useGarmentAnalysis.ts`.
  - Developer route `/test-garment` and Home screen shortcut updated to route seamlessly to the new Garment screen.
  - 41/41 mobile Jest unit tests passing across 6 test suites; all files strictly under 250 lines; zero backend modifications.

### Added — Local Cloned 3D Closet Build from HAR Archive (2026-11-06)
- Extracted and cloned all 93 production assets from the user's DevTools HAR capture into `apps/mobile/public/closet/`: includes all high-res transparent side & front shirts, realistic 3D shoe models (`jordan-4.glb`, `derby.glb`, `samba-left.glb`, etc.), studio HDRI (`studio_small_03_512.hdr`), watch textures, and Next.js client bundles.
- Configured Metro enhanced middleware in `apps/mobile/metro.config.js` to serve these assets locally to mobile devices and emulators with custom RSC route handlers for `/rack`, `/shoes`, and `/accessories`.
- Removed all external Vercel URLs: `apps/mobile/app/(app)/test-closet.tsx` is now strictly local and offline.
- Created `apps/mobile/src/features/closet/logic/garmentModelConverter.ts` to convert scanned wardrobe items into 3D rack hanging profiles and pre-inject them via `window.__HALO_WARDROBE__` so the user's saved clothes hang on the 3D rail.
- Checks run: `tsc --noEmit` ✅ · Jest 57/57 ✅ · Pytest 31/31 ✅.
- Created native 3D Walk-in Closet (`apps/mobile/app/(app)/closet.tsx`) with R3F Canvas, animated doors, sliding chrome rail, in-memory JPEG `DataTexture` loader, and close-up garment inspection.
- Fixed `TypeError: process.emitWarning is not a function` in Hermes: created `apps/mobile/src/shared/lib/polyfills.ts` and application entry point `apps/mobile/index.js` polyfilling `process.emitWarning` before Three.js CJS build evaluates.
- Checks run: `tsc --noEmit` ✅ · Jest 53/53 ✅ · Pytest 31/31 ✅.

### Added — 3D Closet Reference Viewer test screen (2026-11-06)
- New test-only route `apps/mobile/app/(app)/test-closet.tsx` that shows the third-party demo https://ricks-closet.vercel.app/ in a `WebView` as design inspiration for a future HALO 3D wardrobe. We load the live site and do **not** copy its code, photos, or 3D models (they belong to their author). This is not HALO functionality.
- Home screen (`app/(app)/index.tsx`) gets a "3D Closet Test" shortcut card.
- New dependency: `react-native-webview@14.0.1` (installed with `npx expo install`, so the version matches the Expo SDK; MIT licence; included in Expo Go).
- Checks run: `tsc --noEmit` ✅ · Jest 50/50 ✅.

### Added — Wardrobe item editing with category dropdown (2026-11-06)
- `updateWardrobeItem` API (Supabase + offline cache), `editItem` hook, `EditWardrobeModal.tsx`, and an ✏️ edit button on `WardrobeItemCard`.
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
