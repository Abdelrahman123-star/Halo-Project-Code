# Progress

_Last updated: 2026-11-09_

## Current state
**Digital Wardrobe (frontend only):** `/(app)/garment` is a horizontally scrolling closet built from images (`closet-left/middle/right.jpg`; male users get `closet-*-men.jpg` with their own slot positions and a steel/navy palette), with saved garments packed into calibrated slots (rod: outerwear/dresses; shelves: tops, bottoms), category pills, refresh, detail sheet (callouts, Fix it / Edit details → existing editor, Try on my avatar, In the wash — device-only, Delete). tsc clean, Jest 173/173, iOS + Android export OK; device visual check pending.

**Gender-specific rooms:** bedroom and bathroom pick their scene by the user's registered gender (`src/features/home/rooms/roomScenes.ts`): female (and unknown) → girl rooms, male → boy rooms. The male bathroom has no makeup mark. Device check pending.

**Interactive Bathroom (frontend only):** full-screen bathroom image; skincare shelf → Skin recommendations (`/(app)/skincare`, PROTOTYPE sample data), vanity mirror → Wellness & skin (`/(app)/wellness`, sample data), makeup shelf → Makeup (`/(app)/makeup`, PROTOTYPE sample data). Sample content lives in `src/features/home/bathroom/beautySampleData.ts`; pages are labelled "Preview · sample data". tsc clean, Jest 145/145. Device check pending.

**Interactive Bedroom (frontend only)** — full-screen room image with tappable wardrobe (→ Digital Wardrobe `/(app)/garment`) and mirror (→ avatar page / Create Avatar; a dedicated 3D try-on screen is not built yet), minimal line-icon hints with labels revealed on touch/hover, breathing edge light, shimmer + zoom transitions. tsc clean, Jest 140/140. Device check pending.

**Measurements pinned on the avatar (device check pending).** After preprocessing, the final screen and the
avatar page show the preview avatar with the user's ratios pinned to body parts (dots, measured segments,
callout labels). Anchor positions were found by running MediaPipe Pose + Face on the avatar image itself
(`services/api/scripts/compute_avatar_anchors.py`); the waist uses the notebook's 65 % shoulder→hip estimate.
The backend now verifies logins with the public anon key when no service-role key is set and then returns
results unsaved (`saved: false`); the app keeps the ratios on the device. Checks: backend pytest 69/69,
mobile tsc clean + Jest 133/133, layout verified with a rendered mock. Root cause of "couldn't reach the HALO
server": the app still had `EXPO_PUBLIC_API_URL=localhost` baked in (Expo needs a `-c` restart after `.env` edits).

**Bottom nav no longer overlaps screens (device check pending).** The bar is laid out below the screen
stack in `app/(app)/_layout.tsx` instead of floating over it, and owns the bottom safe-area inset. Hidden on
`house-entrance`, `hallway` (full-screen scenes with their own controls) and `create-avatar` (guarded flow).
tsc clean, Jest 128/128, Android export bundles.

**Avatar preprocessing — implemented in code; migration + device E2E pending.** Create Avatar now goes
review → consent → processing → results → complete. With consent, the three photos (camera or library)
are uploaded to `POST /v1/avatar/preprocess`, which runs the Colab pipeline as backend modules
(`services/api/app/ai/avatar/`: OpenCV quality checks + MediaPipe Pose/Face Landmarker + body, silhouette
and face features), discards the photos and saves a per-user profile (`avatars`, `body_scans`, migration
0003). Validation failures ask for specific retakes; network/config errors offer a retry. Deleting the
avatar also deletes the saved profile. The 3D avatar is still the labelled preview image.
- Checks run 2026-11-08: backend pytest 67/67, ruff clean on new files, real-model benchmark median 198 ms
  (public MediaPipe test images), uvicorn LAN smoke (health/401/503); mobile `tsc --noEmit` clean, Jest
  127/127 (20 suites), `expo export --platform android` bundles.
- **Not yet verified:** migration 0003 applied (user), backend `.env` with Supabase service key (user),
  full device run in Expo Go, accuracy on real photos, RLS isolation with two users.
- Also: hardcoded Roboflow key fallback removed from `garmentApi.ts` (missing key → clear error);
  **the leaked key must be rotated** and is still bundled from `.env` as `EXPO_PUBLIC_*`.
- Next: user applies 0003 + fills `services/api/.env` → device E2E → benchmark with real photos → tune
  thresholds; then move Roboflow behind the backend.

**Preview avatar (PROTOTYPE / MOCKED OUTPUT):** finishing Create Avatar assigns a fixed sample avatar image (`assets/avatar-preview.png`), shown on Home in place of the "+" silhouette and on the new avatar page (`app/(app)/avatar.tsx`) with a Delete option. It is not generated from the user's photos and is labelled "Preview avatar" in the UI. Stored as a per-user on-device flag only. tsc clean, Jest 66/66.

**Create Your Avatar — camera capture implemented (PROTOTYPE: no avatar generation)**, device check pending. Guided front / back / face capture with live `expo-camera` preview, guides, timer, camera switch, retake, progress, review, and an honest "generation coming soon" screen. Photos are local/in-memory only. tsc clean, Jest 63/63, iOS + Android export OK. Next: test on device; consent screen + explicit cache cleanup before any upload work.

**Home dashboard — UI PROTOTYPE with static sample data** (device visual check pending). Home has a frosted-glass bottom nav (`expo-blur`, new dep) (Wellness, Reminders, Weather, Calendar); each opens its own page (`app/(app)/wellness|reminders|weather|calendar.tsx`). Not real: wellness scores, skin progress, reminders, weather and events come from `src/features/home/dashboard/sampleData.ts` and each page is labelled "Preview · sample data". Next: wire real sources behind the same types. tsc clean, Jest 57/57.

**House entrance → hallway hand-off made seamless; Home wardrobe card removed** (device check pending). Hallway background is now the entrance video's last frame (`assets/hallway-entrance-frame.jpg`); the video cross-fades into it and the hallway route opens without animation. tsc clean, Jest 53/53, Android export OK.

**App-open intro video implemented — device check pending:** `WelcomeVideoScreen` (expo-video) replaces the old animated `LaunchScreen`; plays `assets/videos/welcome-intro.mp4` once, full-screen, with sound, then fades into Login/Home. Checks: tsc clean, Jest 54/54, iOS export bundles the video. Limitations: iOS silent switch mutes audio (default iOS behaviour); Android system navigation bar is not hidden (would need `expo-navigation-bar`, not added).

**Two-Door Room Selection & Animated Room Transition implemented & verified:**
- `app/(app)/hallway.tsx` & `DoorSelectionView.tsx`: Displays the uploaded two-door hallway image (`assets/hallway-doors.png`) with original proportions, warm lighting, and wood doors ("BEDROOM" on left, "BATHROOM" on right). Each door is individually clickable with soft amber/gold glowing outline. Tapping a door triggers a smooth React Native animated camera approach zoom (`scale: 1.0 -> 2.7`), subtle door-opening radiant light emergence, and fluid bloom transition into the selected room without separate videos. `useFocusEffect` seamlessly resets the camera when returning.
- `app/(app)/bedroom.tsx`: Full-screen Bedroom & Dressing Suite with pastel aesthetic, access to Digital Wardrobe (`/(app)/garment`) and 3D Avatar Dressing Suite (`/(app)/create-avatar`), and "← Hallway" return navigation.
- `app/(app)/bathroom.tsx`: Full-screen Bathroom & Beauty Suite with vanity mirror and beauty shelf cards and "← Hallway" return navigation.
- Checks run: `tsc --noEmit` clean (0 errors), Jest 54/54 passing across 8 suites. Zero backend/API/database modifications. All touched files strictly <250 lines.

Interactive House Entrance Video:
- `app/(app)/house-entrance.tsx`: Full-screen entrance video player using `expo-video` (`home-video.mp4`) that seamlessly transitions into the hallway upon completion.

Phase 0 docs done. Auth smoke test & HALO Futuristic Peaceful UI/UX Design System fully implemented and verified.
**Auth Screens Redesign (Login & Register) completed and verified:**
- Frosted glass card inspired by Reference 1 with translucent backdrop blur simulation (`rgba(255, 255, 255, 0.40)`), subtle white borders (`rgba(255, 255, 255, 0.88)`), rounded corners (`borderRadius: 32`), and soft ambient shadow (`shadowRadius: 28`).
- Dreamy pastel palette from Reference 2 (pastel lavender `#B392F8`, baby blue `#67BFFC`, cyan `#48E5DC`, pink `#FA7DB9`, and lilac `#C98CFA`).
- One large, soft, blurred organic multi-radial gradient blob positioned directly behind the frosted glass card (`PastelBlobBackground.tsx`) with vivid luminescence extending beyond the card boundaries so it is clearly visible shining through the frosted glass.
- Auth primary button (`AuthButton`) uses a pearl gradient (`#F2C4E2 → #D5C6F6 → #BCD6F6`) with a white sheen and dark plum label to match the iridescent orb; other screens still use `btnGradient` (`['#686EE8', '#9475F5']`).
- Smooth animated spring sliding indicator in `AuthTabBar` ([`AuthComponents.tsx`](file:///Users/farahkhaled/Documents/GitHub/Halo-Project-Code/apps/mobile/src/features/auth/components/AuthComponents.tsx)) that smoothly glides horizontally within the same toggle container (`friction: 9, tension: 50`) between Login and Register with zero frame-flash or jump on render.
- Form content slider (`AuthSlideContainer.tsx`) placed directly underneath the shared toggle within a single frosted glass card, creating a unified premium interaction.
- Animated iridescent orb background (`PastelBlobBackground.tsx` + `IridescentOrb.tsx`): a frosted SVG orb whose pink/lavender/sky/aqua radial-gradient lobes each orbit and breathe at independent speeds, plus soft drifting corner glows. Replaces the static `assets/pearlescent-blob.png` image (asset no longer referenced). Freezes when reduce-motion is on. Checks: `tsc --noEmit` clean, 41/41 Jest tests pass; not yet verified visually on a device.
- Multi-layered native animations: continuous organic vertical float (`-20px` to `+22px`), horizontal drift (`-15px` to `+18px`), gentle breathing scale (`0.94` to `1.06`), zero-gravity orbital tilt (`-5°` to `+6°`), liquid morphing (counter-axis stretching), dynamic rotating chromatic aura refraction, and specular gleam pulsing.
- 100% native driver animations (`useNativeDriver: true`) running smoothly on iOS and Android with zero React re-render state overhead; reduced-motion compliant.
- Classy smooth slide motion transition (`AuthSlideContainer.tsx`) between Login and Register with fluid cubic deceleration (`Easing.bezier(0.25, 1, 0.4, 1)`), synchronized sliding pill indicator on the tab bar (`AuthTabBar`), and cross-fade fallback for reduced-motion.
- Fixed direct routing in `app/(auth)/index.tsx` to immediately load `/(auth)/login`.
- Extracted modular forms (`AuthForms.tsx`) and success view (`AuthSuccessView.tsx`) to ensure strict adherence to the <250 lines rule.
- Continuous, slow, seamless floating, horizontal drifting, and breathing scale movements looping at non-harmonic speeds.
- Accessibility compliance: strict detection of `AccessibilityInfo.isReduceMotionEnabled()` with real-time listener to halt animations for users with reduced-motion preferences.
- Brand logo updated with user-provided shimmering script HALO logo asset (`assets/halo-logo.png`).
- 100% preservation of auth handlers, form state, error banners, input validation, and navigation; zero backend/API/database modifications.
- File constraint verified (<250 lines per file); 41/41 mobile Jest unit tests and strict TypeScript typecheck passing.

## Environment (verified 2026-11-06)
Node v22.14.0 · npm 11.11.1 · Python 3.13.1 · Git 2.49.0 · Expo SDK 58 (React Native 0.88, React 19.3).

## What exists — Auth & Garment UI Layer
| Item | Where | Description |
|---|---|---|
| Frosted Glass Login Screen | `apps/mobile/app/(auth)/login.tsx` | Reference 1 translucent glass card, Reference 2 palette, animated blob, new logo |
| Frosted Glass Register Screen | `apps/mobile/app/(auth)/register.tsx` | Cohesive account creation screen with smooth entrance animations and responsive layout |
| Smooth Sliding Auth Container | `apps/mobile/src/features/auth/components/AuthSlideContainer.tsx` | Fluid slide transition between Login and Register with cubic easing |
| Modular Auth Forms | `apps/mobile/src/features/auth/components/AuthForms.tsx` | Encapsulated Login and Register form views under 250 lines |
| Registration Success View | `apps/mobile/src/features/auth/components/AuthSuccessView.tsx` | "You're all set!" confirmation screen with continue CTA |
| Animated Iridescent Orb Canvas | `apps/mobile/src/features/auth/components/PastelBlobBackground.tsx`, `IridescentOrb.tsx` | Frosted pastel orb with orbiting colour swirls, floating motion and drifting corner glows |
| Frosted Glass Auth Components | `apps/mobile/src/features/auth/components/AuthComponents.tsx` | Translucent glass card, pill inputs, gradient CTA button, social buttons, tabs |
| Shimmering Script Logo Asset | `apps/mobile/assets/halo-logo.png` | User-provided starry script HALO brand logo |
| Garment Studio Screen | `apps/mobile/app/(app)/garment.tsx` | Luxury pearlescent wardrobe addition flow (selection, preview, analysis, honest results) |
| Pearlescent Canvas | `apps/mobile/src/features/garment/components/PearlescentBackground.tsx` | Multi-radial organic pastel gradient SVG background with delicate sparkles |
| Frosted Glass Card | `apps/mobile/src/features/garment/components/FrostedGlassCard.tsx` | Translucent white surface, delicate white border, soft mauve ambient shadow |
| Garment Option Card | `apps/mobile/src/features/garment/components/GarmentOptionCard.tsx` | Large interactive cards for Camera & Gallery with spring press animations and ambient glows |
| Garment Preview Card | `apps/mobile/src/features/garment/components/GarmentPreview.tsx` | Frosted glass image review card with Retake / Choose Another and prominent Continue CTA |
| Processing & Results View | `apps/mobile/src/features/garment/components/GarmentProcessingView.tsx` | Progressive loading state and analysis results container |
| Detected Garment Card | `apps/mobile/src/features/garment/components/GarmentDetectedCard.tsx` | Isolated item crop on white background, category, confidence, color swatches, attributes |
| 3D Roadmap Capsule | `apps/mobile/src/features/garment/components/GarmentRoadmapCard.tsx` | Honest stage indicator disclosing 3D template fitting and avatar try-on as upcoming |
| Safe Area Header | `apps/mobile/src/features/garment/components/HaloHeader.tsx` | Back arrow button, centered HALO logo, safe-area top inset support |
| Capture Guide | `apps/mobile/src/features/garment/components/PhotoCaptureGuide.tsx` | Subtle frosted advice card with thin-line sparkle icon |
| Hanger Decorative Element | `apps/mobile/src/features/garment/components/WardrobeHangerDecor.tsx` | Minimal clothing hanger with subtle pearlescent glow and delicate hairlines |
| Mobile Pixel Processor | `apps/mobile/src/features/garment/api/imageProcessor.ts` | Pure TS + `jpeg-js` in-memory JPEG decode/encode, `buffer` polyfill, polygon mask isolation |
| Mobile Native Pipeline | `apps/mobile/src/features/garment/api/garmentApi.ts` | Calls Roboflow Serverless HTTPS endpoint with base64 JPEG, AbortController 25s timeout |
| Mobile Image Optimizer | `apps/mobile/src/features/garment/hooks/useGarmentAnalysis.ts` | Hardware image resizing via `expo-image-manipulator` (max 1024px), original URI preservation |
| Mobile Color Extractor | `apps/mobile/src/features/garment/api/colorExtractor.ts` | In-memory K-Means clustering on RGBA pixel buffers + Redmean perceptual color matching |
| Mobile Attribute Classifier | `apps/mobile/src/features/garment/api/attributeClassifier.ts` | Subtype, fabric, and pattern candidate ranking |
| Mobile Zod Schemas & Types | `apps/mobile/src/features/garment/types/garment.ts` | Zod validation schemas and TypeScript types for garment analysis |
Phase 0 docs done. Auth smoke test & HALO Futuristic Peaceful UI/UX Design System fully implemented and verified.
CV Garment Recognition pipeline is integrated natively in `apps/mobile` (`src/features/garment/api/*`) and reference in `services/api`.
Digital Wardrobe persistence is implemented in Supabase Postgres (`wardrobe_items` table via migration `0002_wardrobe.sql`) with local AsyncStorage fallback.
Intelligent Camera Guidance & Photo Quality Assessment is implemented: Live viewfinder safe-zone overlay (`CameraFramingOverlay.tsx`), in-memory luminance and edge truncation inspector (`qualityInspector.ts`), and real-time Quality Advisory Banner (`PhotoQualityBanner.tsx`).
**Wardrobe Item Editing & Category Dropdown UI is implemented: In-app modal (`EditWardrobeModal.tsx`) with category dropdown picker, subtype chips, fabric/pattern selector, and backend mutation (`updateWardrobeItem`) updating Supabase and local offline cache.**
**Native 3D Walk-in Closet is implemented (`apps/mobile/app/(app)/closet.tsx`): 100% original Three.js / React Three Fiber code with animated swinging wardrobe doors, draggable 3D clothes rails with soft inertia boundaries, Section Switcher (Tops, Bottoms, Outerwear & Dresses), in-memory DataTexture rendering from base64 garment crops, close-up item inspection with smooth camera zoom, and instant attribute editing via `EditWardrobeModal`.**

## Environment (verified 2026-11-06)
Node v22.14.0 · npm 11.11.1 · Python 3.13.1 · Git 2.49.0 · Expo SDK 58 (React Native 0.88, React 19.3).

## What exists — Garment AI, Quality Guidance & Digital Wardrobe Layer
| Item | Where | Description |
|---|---|---|
| 3D Wardrobe-to-Rail Converter | `apps/mobile/src/features/closet/logic/garmentModelConverter.ts` | Converts user's scanned wardrobe clothes (`crop_base64`, categories) into 3D rack models and hanging profiles |
| 3D Closet Clone (Local & Offline) | `apps/mobile/app/(app)/test-closet.tsx` | Strictly local standalone 3D closet (zero external Vercel links), pre-injects user's saved wardrobe clothes dynamically onto the rail |
| 3D Walk-in Closet Screen | `apps/mobile/app/(app)/closet.tsx` | Native 3D wardrobe screen with animated doors, sliding rail, section tabs (Tops/Bottoms/Outerwear), and inspection card |
| 3D Closet Scene Container | `apps/mobile/src/three/closet/ClosetScene.tsx` | R3F Canvas container with PanResponder gestures for smooth rail sliding, camera rig, and lights |
| 3D Animated Wardrobe | `apps/mobile/src/three/closet/Wardrobe.tsx` | Carcass with dual hinged doors smoothly swinging open 105° on tap, ceiling LED spot lighting |
| 3D Clothes Rail & Hangers | `apps/mobile/src/three/closet/Rail.tsx`, `Hanger.tsx` | Chrome rail with wooden/metallic hangers displaying in-memory DataTextures of user's saved garment crops |
| 3D Camera Rig | `apps/mobile/src/three/closet/CameraRig.tsx` | Damped camera positioning for exterior overview, walk-in interior, and close-up inspection zoom |
| 3D Photo Texture Loader | `apps/mobile/src/three/closet/usePhotoTexture.ts` | In-memory `THREE.DataTexture` loader decoding base64 JPEG crops with zero disk I/O |
| Closet Sections Logic & Hook | `apps/mobile/src/features/closet/` | `sections.ts` + `useClosetSections.ts` grouping wardrobe items into Tops, Bottoms, and Outerwear |
| 3D Closet Reference Viewer (test-only) | `apps/mobile/app/(app)/test-closet.tsx` | `react-native-webview` screen that loads the third-party live demo https://ricks-closet.vercel.app/ as design inspiration. No code or assets copied; not HALO functionality. Linked from Home ("3D Closet Test") |
| Edit Wardrobe Modal | `apps/mobile/src/features/wardrobe/components/EditWardrobeModal.tsx` | Interactive modal with category dropdown, subtype chips, fabric/pattern chips, thumbnail preview, and item name editing |
| Wardrobe Update API | `apps/mobile/src/features/wardrobe/api/wardrobeApi.ts` | `updateWardrobeItem(id, updates)` updating Supabase and local storage offline cache |
| Wardrobe Cache Helper | `apps/mobile/src/features/wardrobe/api/wardrobeCache.ts` | Local AsyncStorage sync and offline operations (`upsertLocalItem`, `updateLocalItem`, `deleteLocalItem`) |
| Photo Quality Inspector | `apps/mobile/src/features/garment/api/qualityInspector.ts` | In-memory perceptual luminance ($\mu_Y$), dynamic range ($\sigma_Y$), shadow/highlight clipping, and boundary truncation check |
| Quality Types & Schemas | `apps/mobile/src/features/garment/types/quality.ts` | Zod schemas and TypeScript types for `PhotoQualityReport`, `LightingStatus`, and `FramingStatus` |
| Viewfinder Framing Overlay | `apps/mobile/src/features/garment/components/CameraFramingOverlay.tsx` | Viewfinder guide overlay with 4 corner brackets, center crosshair, and live framing advice badge |
| Quality Advisory Banner | `apps/mobile/src/features/garment/components/PhotoQualityBanner.tsx` | Color-coded quality card (Green / Amber / Red) with lighting warnings, edge clipping details, and Retake action |
| Wardrobe Migration | `supabase/migrations/0002_wardrobe.sql` | `wardrobe_items` table with RLS (select/insert/update/delete own items), user cascade FK, index on `(user_id, created_at desc)`, updated_at trigger |
| Wardrobe Schemas & Types | `apps/mobile/src/features/wardrobe/types/wardrobe.ts` | Zod validation schemas and TypeScript types for `WardrobeItem`, `CreateWardrobeItemInput`, `UpdateWardrobeItemInput`, and category taxonomy |
| Wardrobe API Client | `apps/mobile/src/features/wardrobe/api/wardrobeApi.ts` | Supabase data access layer for fetching, inserting, updating, and deleting wardrobe items with local offline cache fallback |
| Wardrobe State Hook | `apps/mobile/src/features/wardrobe/hooks/useWardrobe.ts` | React hook managing wardrobe state, item persistence, editing (`editItem`), and deletions |
| Wardrobe Item Card | `apps/mobile/src/features/wardrobe/components/WardrobeItemCard.tsx` | Visual card showing cropped garment photo, category, confidence, color swatches, fabric/pattern, edit modal trigger (✏️), and delete action |
| Garment Recognition & Wardrobe Screen | `apps/mobile/app/(app)/test-garment.tsx` | Integrated test page with camera/gallery analyzer, live framing guide, quality advisory banner, and "My Wardrobe" section with edit & delete |
| Mobile Pixel Processor | `apps/mobile/src/features/garment/api/imageProcessor.ts` | Pure TS + `jpeg-js` in-memory JPEG decode/encode, `buffer` polyfill, tight ray-casting polygon mask isolation onto white canvas |
| Mobile Native Pipeline | `apps/mobile/src/features/garment/api/garmentApi.ts` | Calls Roboflow Serverless HTTPS endpoint with base64 JPEG, AbortController 25s timeout, comprehensive terminal logging |
| Mobile Image Optimizer | `apps/mobile/src/features/garment/hooks/useGarmentAnalysis.ts` | Hardware image resizing via `expo-image-manipulator` (max 1024px), dynamic UI/CMD progress tracking |
| Mobile Color Extractor | `apps/mobile/src/features/garment/api/colorExtractor.ts` | In-memory K-Means clustering on RGBA pixel buffers + Redmean perceptual color matching against 32-color fashion palette |
| Mobile Attribute Classifier | `apps/mobile/src/features/garment/api/attributeClassifier.ts` | Subtype, fabric, and pattern candidate ranking from DeepFashion2 class and pixel color distribution |
| Backend Reference Pipeline | `services/api/app/ai/garment/*` | FastAPI + NumPy K-Means + Fashion-CLIP + OpenCV deskew (`POST /v1/garment/analyze-test`) |

## Verification log (only what was actually run)
| Check | Result |
|---|---|
| `npx tsc --noEmit` (apps/mobile) | ✅ passed (exit 0) |
| `npx jest --no-coverage` (apps/mobile, after merging main into farah-2: 88 tests across 15 suites) | ✅ 88/88 passed |
| `python -m pytest` (services/api: 31 unit tests across 4 suites) | ✅ 31/31 passed |
| File size constraint (<250 lines) | ✅ all files strictly verified under 250 lines |
| In-Memory validation | ✅ zero image or JSON files written to disk |

## Known limitations / deviations
- On-device mobile execution uses `attributeClassifier.ts` (category + K-Means pixel color distribution heuristics) for instant native execution without requiring PyTorch/CLIP on a local PC; `services/api` retains full OpenCLIP `ViT-B-32` zero-shot inference for server deployments.
- 3D mesh template generation and avatar fitting are the next stage in development per `docs/THREED_PIPELINE.md`.
- `test-closet.tsx` needs an internet connection and depends on a third-party site we don't control; if the author changes or removes it, the screen breaks. WebGL performance in the WebView depends on the device.
- Users must run `supabase/migrations/0002_wardrobe.sql` in their Supabase Dashboard SQL Editor once to create the `wardrobe_items` table and RLS policies (local AsyncStorage acts as resilient offline fallback if network/ISP blocks Supabase).
- After merging `main` into `farah-2`, the redesigned Home (house + avatar + frosted bottom nav) was kept, so the old Home's "My 3D Closet" / test shortcuts are gone: `/(app)/closet` and `/(app)/test-garment` exist but are not linked from Home yet.

## Next recommended step
Launch the app with `npx expo start -c`, tap the ✏️ edit button on any saved wardrobe item, and select new categories from the dropdown or change attributes.
