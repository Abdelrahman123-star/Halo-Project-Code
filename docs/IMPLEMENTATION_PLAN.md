# Active Implementation Plan — Enhanced Admin User Actions (Edit Password, Profile, Reset, Delete)

**Current task:** Expand admin capabilities in the web dashboard by adding rich user actions: editing user passwords directly, sending password reset emails, editing display names and gender, managing roles, and deleting accounts.
**Status:** Completed & Verified ✅ (Next.js 15 build passed · web-admin typecheck passed · mobile Jest 98/98 passed · Pytest 35/35 passed · all files < 250 lines)

---

## 1. Objectives & Approach
1. **Server-Side Admin Operations API (`apps/web-admin/app/api/admin/users/route.ts`)**:
   - Verify caller is an authenticated admin using session cookies + profile check (`role === 'admin'`).
   - Implement `PATCH /api/admin/users`:
     - Action `'update_password'`: Set new password via Supabase Service Role client (`auth.admin.updateUserById`). If service key is absent, prompt admin with clear instructions.
     - Action `'send_reset_email'`: Trigger Supabase recovery email via `auth.resetPasswordForEmail`.
     - Action `'update_profile'`: Update `display_name`, `gender`, `role` in `public.profiles`.
   - Implement `DELETE /api/admin/users`:
     - Delete user account from Supabase Auth (`auth.admin.deleteUser`) and cascade. Block self-deletion.
2. **Service Role Helper (`apps/web-admin/lib/supabase/admin.ts`)**:
   - Provide `getAdminClient()` which loads `SUPABASE_SERVICE_ROLE_KEY` if configured, safely isolated to the server.
3. **Dedicated User Actions Modal (`apps/web-admin/components/users/UserActionsModal.tsx`, `UserProfileTab.tsx`, `UserSecurityTab.tsx`)**:
   - Glassmorphic modal containing:
     - Profile editor (Name, Gender binary selector, Role).
     - Security panel (Direct password change + Send Reset Link button).
     - Danger zone (Delete user account with confirmation).
4. **UserTable Integration (`apps/web-admin/components/users/UserTable.tsx`)**:
   - Add "Manage" button in the Actions column of each user row to open `UserActionsModal`.
   - Handle immediate UI state updates on edit/delete.
5. **Verification**:
   - `npm run typecheck --prefix apps/web-admin` (0 errors).
   - `npm run build --prefix apps/web-admin` (clean build, 9 pages compiled, 0 errors).
   - `npm run typecheck --prefix apps/mobile` & `npm run test --prefix apps/mobile` (98/98 passing).
   - `python -m pytest services/api/tests -q` (35/35 passing).
   - All files strictly `< 250` lines.

---

# Active Implementation Plan — HALO Web Admin Dashboard (`apps/web-admin`)

**Current task:** Implement a dedicated, secure Next.js 15 Web Admin Dashboard in `apps/web-admin` with HALO Brand Glassmorphism styling, connecting to the existing Supabase project with RBAC (`role = 'admin'`), edge middleware security, and 4 core panels: Overview KPIs, Users Management, Wardrobe & CV Moderation, and System Health.
**Status:** Completed & Verified ✅ (Next.js 15 build passed · mobile Jest 98/98 · Pytest 35/35 · all files < 250 lines)

---

## 1. Objectives & Approach
1. **Database Migration (`supabase/migrations/0004_admin_role.sql`)**:
   - Added `role text not null default 'user' check (role in ('user', 'admin'))` to `public.profiles`.
   - Created `public.is_admin()` security definer function.
   - Established admin RLS policies for `public.profiles` and `public.wardrobe_items`.
   - Updated `docs/DATABASE.md`.
2. **Next.js 15 App Scaffold (`apps/web-admin`)**:
   - Created Next.js 15 App Router structure with TypeScript, Tailwind CSS, `@supabase/ssr`, `@supabase/supabase-js`, and `lucide-react`.
   - Configured HALO Glassmorphism design tokens (pastel lilac canvas `#EEF0FA`, soft frosted blur surfaces, pearlescent highlights).
3. **Authentication & Edge Middleware Security**:
   - Implemented Supabase server/client/middleware helpers in `lib/supabase/`.
   - Created `middleware.ts` to intercept `/(dashboard)/:path*`, validating session and querying `is_admin()`, instantly blocking unauthorized or regular user accounts.
   - Built `app/(auth)/login/page.tsx` with glassmorphic auth card, error handling, and role verification.
4. **Core 4-Panel Administration Suite**:
   - `app/(dashboard)/layout.tsx`: Persistent frosted glass sidebar with active glow, top header with admin identity & logout.
   - `app/(dashboard)/page.tsx`: Overview KPI metrics (user counts, garment scan counts, detection accuracy, activity feed).
   - `app/(dashboard)/users/page.tsx`: Filterable user directory with role toggle (`user` <-> `admin`).
   - `app/(dashboard)/wardrobe/page.tsx`: Wardrobe & CV garment moderation gallery, crop previews, Roboflow confidence meters, and detailed modal inspector.
   - `app/(dashboard)/system/page.tsx`: System & AI health monitoring (FastAPI endpoint status, Roboflow API check, Supabase health).
5. **Verification & Regression**:
   - Build check: `apps/web-admin` builds cleanly (`next build` 0 errors, 8 static/dynamic routes generated).
   - Mobile check: `npm run typecheck --prefix apps/mobile` (0 errors) & `npm run test --prefix apps/mobile` (98/98 passing).
   - Backend check: `python -m pytest services/api/tests -q` (35/35 passing).
   - All files strictly `< 250` lines.

---

# Active Implementation Plan — Required Binary Gender Selection (Female / Male Only) in Signup

**Current task:** Add a required gender selection section to the user registration / signup form, allowing strictly `Female` or `Male` only (no other options), and saving the selection in auth metadata and the user profile.
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 98/98 · Pytest 35/35)

---

## 1. Objectives & Approach
1. **Zod Validation Schema (`apps/mobile/src/features/auth/schemas.ts`)**:
   - Defined `genderEnum = z.enum(['female', 'male'], { message: 'Please select Female or Male.' })`.
   - Added `gender: genderEnum` to `registerSchema`.
   - Exported `Gender` type (`'female' | 'male'`).
2. **Form State Hook (`apps/mobile/src/features/auth/hooks/useRegisterForm.ts`)**:
   - Added `gender: Gender | ''` to form values.
   - Provided `setGender: (gender: Gender) => void` which also clears any active gender validation error.
   - Forwarded `gender` in payload to `registerSchema.safeParse`.
3. **UI Component (`apps/mobile/src/features/auth/components/AuthGenderSelector.tsx`)**:
   - Created a dedicated, modular, accessible selector (163 lines, `< 250`).
   - Exactly two selectable options: `Female` and `Male` (strictly no other options).
   - Frosted glass design matching `authTheme` with pearl gradient active state, subtle purple focus border, tactile press feedback, and custom Venus / Mars SVG icons.
   - Accessible radiogroup semantics (`accessibilityRole="radiogroup"` and `accessibilityRole="radio"`).
   - Displays error label and styled coral error border if validation fails.
4. **Form Integration (`apps/mobile/src/features/auth/components/AuthForms.tsx`)**:
   - Placed `<AuthGenderSelector />` cleanly between Full Name and Email Address.
5. **Auth API & Supabase User Metadata (`apps/mobile/src/features/auth/api/authApi.ts`)**:
   - Passed `gender: input.gender` inside `options.data` to `supabase.auth.signUp`.
6. **Database Migration & Profile Schema (`supabase/migrations/0003_profile_gender.sql` & `docs/DATABASE.md`)**:
   - Added `gender text check (gender in ('female', 'male'))` column to `public.profiles`.
   - Updated `handle_new_user()` trigger to copy `gender` from `raw_user_meta_data`.
7. **Verification & Testing**:
   - Updated `apps/mobile/src/features/auth/__tests__/schemas.test.ts` to verify:
     - Accepts `'female'`.
     - Accepts `'male'`.
     - Rejects missing / empty gender.
     - Rejects any options other than `'female'` or `'male'`.
   - `npm run typecheck --prefix apps/mobile` (0 errors).
   - `npm run test --prefix apps/mobile` (98/98 passing across 15 suites).
   - `python -m pytest services/api/tests -q` (35/35 passing).
   - All touched files strictly `< 250` lines.

---

# Active Implementation Plan — Smooth Fluid Navigation Transitions (Masking Load Time)

**Current task:** Implement smooth, fluid navigation transitions across bottom navbar route changes (e.g. Home to Weather, Calendar, Wellness, Reminders) that mask background loading and provide an elegant, seamless cross-fade feel instead of abrupt cuts.
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 94/94 · Pytest 35/35)

---

## 1. Objectives & Approach
1. **Enable Animated Route Navigation (`HomeBottomNav.tsx`)**:
   - Switched bottom navigation from `router.replace` to `router.navigate(item.href)`, allowing `react-native-screens` to execute hardware-accelerated screen transition animations on Android and iOS (NativeStack bypasses animations when `replace` is used).
   - Retained active tab short-circuiting (`if (isItemActive(item)) return;`) so tapping the current active tab does not re-trigger transitions or unnecessary re-renders.
2. **Smooth Native Stack Cross-Fade (`apps/mobile/app/(app)/_layout.tsx`)**:
   - Configured `<Stack screenOptions={{ headerShown: false, animation: 'fade' }}>` for a clean, hardware-accelerated cross-fade between views.
   - Decoupled `AppLayout` from `usePathname()` to ensure the root navigation Stack never reconciles or drops transition frames on route switches.
3. **Cohesive In-Screen Glide & Render Masking (`FeaturePageShell.tsx`)**:
   - Paired the stack cross-fade with a tight, hardware-accelerated entrance on [`FeaturePageShell.tsx`](file:///c:/Users/HP/Desktop/GradProject%20Code/apps/mobile/src/features/home/dashboard/FeaturePageShell.tsx) using `FadeInView` (`fromTranslateY: -6` for header, `delayMs: 40, fromTranslateY: 8` for body content).
   - Smoothly glides content into place during the fade, seamlessly masking any data/view initialization.
   - Passed `showOrb={false}` to `PastelBlobBackground` to skip instantiating 60+ SVG radial gradient nodes behind cards, ensuring instant, stutter-free frame delivery.
4. **Verification**:
   - `npm run typecheck --prefix apps/mobile` (0 errors).
   - `npm run test --prefix apps/mobile` (94/94 passing).
   - `python -m pytest services/api/tests -q` (35/35 passing).
   - All touched files strictly `< 250` lines.

---

# Active Implementation Plan — Fix Navigation Lag & UI Performance Bottlenecks

**Current task:** Investigate and eliminate severe navigation lag when switching tabs in the bottom navbar (e.g. Weather, Calendar, Wellness, Reminders, Home).
**Root Causes Identified:**
1. **GPU Blur Thrashing (`BlurView`)**: In `HomeBottomNav.tsx`, `BlurView` was rendering without a valid `blurTarget` on Android / iOS inside the persistent root layout, forcing continuous native Gaussian re-blur passes of the full window during screen transitions.
2. **Stack Accumulation (`router.navigate`)**: In `HomeBottomNav.tsx`, tapping tabs used `router.navigate`, causing screens in the `<Stack>` to continuously pile up in memory without unmounting, while missing an early-return check when tapping an already active tab.
3. **Heavy Slide Transitions**: In `_layout.tsx`, `<Stack>` used the default OS slide transition, translating full-screen views with complex SVGs and shadows across 350-400ms.
4. **Perceived Lag from Double Delay (`FadeInView`)**: `FeaturePageShell.tsx` wrapped the entire content in `<FadeInView>` starting from 0 opacity with a delay on top of the slide transition, causing the screen to appear blank/unresponsive for 300-500ms before content appeared.
5. **Background Animation Overhead (`PastelBlobBackground`)**: `PastelBlobBackground` ran 16 simultaneous infinite SVG animation loops (in `IridescentOrb` and corner glows) on screens where the orb was completely hidden behind cards.

**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 94/94 · Pytest 35/35)

---

## 1. Objectives & Performance Fixes
1. **Replace `BlurView` in `HomeBottomNav.tsx`**:
   - Replace native `BlurView` with high-performance hardware-accelerated frosted liquid-glass `LinearGradient` (`['rgba(255, 255, 255, 0.94)', 'rgba(248, 245, 255, 0.90)', 'rgba(240, 246, 255, 0.88)']`).
   - Completely eliminates GPU blur passes and rendering stalls during navigation.
2. **Tab Navigation Optimization in `HomeBottomNav.tsx`**:
   - Early return if `isItemActive(item)`: Prevents redundant navigation and re-renders when tapping the active tab.
   - Use `router.replace(item.href)`: Replaces the current tab in the stack so previous screens cleanly unmount, stopping background activity and preventing stack memory leaks.
3. **Smooth, Fast Cross-Fade in `apps/mobile/app/(app)/_layout.tsx`**:
   - Configure `screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 150 }}` on `<Stack>`.
   - Eliminates heavy horizontal slide translation; provides an instantaneous, fluid 150ms cross-fade between screens.
4. **Immediate Content Visibility in `FeaturePageShell.tsx`**:
   - Remove the artificial delayed fade-in so screen content (cards, forecast, events) appears immediately upon screen mount without perceived lag.
5. **Add `animated` Prop to `PastelBlobBackground.tsx`**:
   - Allow passing `animated={false}` to disable infinite `Animated.loop` loops on secondary screens where the animated orb is occluded by cards.
6. **Verification**:
   - `npm run typecheck --prefix apps/mobile` (0 errors).
   - `npm run test --prefix apps/mobile` (all Jest tests pass).
   - `python -m pytest services/api/tests -q` (35/35 pass).
   - Strict adherence to `< 250` lines per file.

---

# Active Implementation Plan — App Polish (`ui-ux-pro-max`), Fixed 5-Button Bottom Nav & Animation Tuning

**Current task:** Polish the entire application's UI/UX using `ui-ux-pro-max` design intelligence: implement a persistent, fixed 5-button bottom navbar anchored across all app screens (with the central elevated button routing to Home, visible everywhere except the intro and entrance videos), tune sluggish entrance and hallway animations, and adjust scroll bottom insets so content never collides with the fixed bottom navbar. Preserve the intentional home page house + avatar overlay unchanged.
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 94/94 · Pytest 35/35)

---

## 1. Objectives & Scope
1. **Persistent 5-Button Fixed Bottom Navbar**:
   - Items: `Wellness` (`/(app)/wellness`), `Reminders` (`/(app)/reminders`), `Home` (center, `/(app)`), `Weather` (`/(app)/weather`), and `Calendar` (`/(app)/calendar`).
   - Center button: elevated circular pearl-lavender badge with subtle halo glow, prominent `HomeIcon` SVG, distinct active indicator.
   - Mounted globally in `apps/mobile/app/(app)/_layout.tsx` so it persists cleanly across navigation transitions.
   - Hidden strictly on video screens (`pathname?.includes('house-entrance')` and launch intro `WelcomeVideoScreen.tsx`).
   - Active route detection via `usePathname()`.
   - Remove duplicate local bottom nav from `apps/mobile/app/(app)/index.tsx`.
   - Remove obsolete 2-tab `FloatingNavBar` from `apps/mobile/app/(app)/profile.tsx`.
2. **Strict Preservation**:
   - **DO NOT TOUCH** or alter the house image and avatar image overlay on `apps/mobile/app/(app)/index.tsx` (`HouseHero.tsx`).
3. **Animation Polish (Fast, Fluid, Liquid Glass Experience)**:
   - `FadeInView.tsx`: reduce sluggish 520ms timing to 240ms; tighten spring tension from 40 to 68 and friction from 8 to 10 for responsive, instant entrance without floaty lag. Reduce default translateY to 8px and scale from 0.92 to 0.98.
   - `DoorSelectionView.tsx`: eliminate extreme 2.7x zoom that pixelates the hallway; reduce scale to 1.38x. Shorten transition delay from 900ms to 420ms for a crisp, cinematic door entry.
   - `FeaturePageShell.tsx`: refine stagger delays for rapid, responsive rendering.
4. **Layout & Scroll Clearance**:
   - Ensure all scrollable screens (`FeaturePageShell.tsx`, `bedroom.tsx`, `bathroom.tsx`, `garment.tsx`, `avatar.tsx`, `profile.tsx`) provide `paddingBottom: 110` so all content scrolls cleanly above the floating bottom navbar.
   - Adjust `DoorSelectionView.tsx` bottom HUD padding so the "Tap a door to enter" pill does not overlap with the bottom nav.
5. **Architectural & Quality Compliance**:
   - Keep every touched file strictly `< 250` lines.
   - TypeScript strict mode (0 errors).
   - Jest (all tests pass) and Pytest (35/35 pass).

---

# Active Implementation Plan — App Intro & Landing Page Video Skip Button

**Current task:** Add a "Skip" pill button to `WelcomeVideoScreen.tsx` (the app-open intro / landing page video) matching the styling and behavior of the Skip button in `house-entrance.tsx`, allowing users to immediately skip directly into the app.
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 92/92 · Pytest 35/35)

---

## 1. Objectives & UI Implementation
1. **Visual Parity with House Entrance Skip Button**:
   - Translucent dark frosted pill (`backgroundColor: 'rgba(25, 18, 40, 0.45)'`, `borderWidth: 1`, `borderColor: 'rgba(255, 255, 255, 0.28)'`, `borderRadius: 20`).
   - Clean white text (`Skip`, `fontSize: 13, fontWeight: '600'`).
   - Placed in top-right `SafeAreaView` with generous touch slop (`hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`).
2. **Behavior & Lifecycle**:
   - Tapping "Skip" pauses playback and smoothly triggers the native fade-out into the authenticated navigation stack (`Login` or `Home`).
3. **Verification**:
   - `tsc --noEmit` 0 errors.
   - Mobile Jest tests passing (92/92 across 15 suites).
   - File length strictly `< 250` lines.

---

# Active Implementation Plan — Test Pages & Cloned Assets Deletion & Route Hygiene

**Current task:** Delete all identified test pages (`/(app)/test-closet.tsx`, `/(app)/test-garment.tsx`, and the entire `public/closet/` directory), restore default `metro.config.js`, remove backend test endpoint `POST /v1/garment/analyze-test`, and retarget internal links (`closet.tsx` empty-rail scan action) to production routes (`/(app)/garment`) without affecting core room and styling suites.
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 91/91 · Pytest 35/35)

---

## 1. Objectives & Scope
1. **Deletion of Standalone Test Pages & Cloned Assets**:
   - `apps/mobile/app/(app)/test-closet.tsx` (WebView 3D rail test viewer).
   - `apps/mobile/app/(app)/test-garment.tsx` (Legacy garment scanner test page).
   - `apps/mobile/public/closet/` (All ~15MB of static cloned assets: `rack.html`, `shoes.html`, `accessories.html`, `index.html`, `_next/`, 3D `.glb` assets).
   - Cleaned `apps/mobile/metro.config.js` back to standard Expo Metro configuration.
2. **Backend Test Endpoint Removal**:
   - Removed developer test endpoint `POST /v1/garment/analyze-test` from `services/api/app/routers/garment.py`.
   - Updated `services/api/tests/test_garment_router.py` to validate directly against the production authenticated endpoint `POST /v1/garment/analyze`.
3. **Production Route Hygiene**:
   - Updated `apps/mobile/app/(app)/closet.tsx` line 88 so the empty rail action button ("+ Scan Clothes to Hang Here") points directly to the real, redesigned Digital Wardrobe screen (`/(app)/garment`).
4. **Verification**:
   - `tsc --noEmit` 0 errors.
   - All 15 Jest test suites passing (91/91 tests).
   - Backend pytest 35/35 passing.
   - Preserves all production rooms (`bedroom.tsx`, `bathroom.tsx`, `hallway.tsx`, `garment.tsx`, etc.).

---

# Active Implementation Plan — Vanity Suite Screen Redesign (`ui-ux-pro-max`)

**Current task:** Redesign the Vanity Suite screen (`apps/mobile/app/(app)/bathroom.tsx`) accessed from the hallway ("BATHROOM" door), applying `ui-ux-pro-max` design intelligence to match the exact visual language, elegance, and layout of "The Bedroom" page (`bedroom.tsx`).
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 91/91 · Pytest 35/35)

---

## 1. Objectives & Architecture
1. **Visual Parity with The Bedroom (`bedroom.tsx`)**:
   - Dreamy pastel canvas (`#EEF2FB`, `PastelBlobBackground`, plum `#2E2242`/`#34264C`, royal lilac `#6B5299`, blush rose `#B04278`, celestial periwinkle `#4865B8`).
   - Frosted back button navigating back to `Hallway` (`ChevronLeftIcon`, tactile scale feedback).
   - Centered HALO logo asset (`assets/halo-logo.png`) with symmetrical header spacing (`headerSpacer: { width: 80 }`).
   - Suite badge: `SUITE 02 · BEAUTY & RADIANCE` with glowing dot indicator (`#E05E9A`).
   - Main title `The Vanity Suite` and responsive subtitle.
2. **Elevated Feature Portal Cards (`RoomPortalCard` / `BedroomPortalCard.tsx`)**:
   - **Smart Vanity Mirror**: Frosted gradient card with rose accent badge (`SMART MIRROR`), dual-layer gradient icon circle (`MirrorIcon`), micro-tags (`Studio Lighting`, `Shade Match`, `Radiance`), tactile scale micro-interaction (`0.985`), and honest prototype preview modal for upcoming smart mirror live camera shader.
   - **Beauty Shelf**: Frosted gradient card with periwinkle accent badge (`SKINCARE & WELLNESS`), dual-layer gradient icon circle (`SparkleBeautyIcon`), micro-tags (`Skincare Shelf`, `Daily Ritual`, `Formulas`), tactile scale micro-interaction (`0.985`), and working navigation to `/(app)/wellness`.
3. **Icons & Components (`HomeIcons.tsx`, `BedroomPortalCard.tsx`)**:
   - Added `MirrorIcon` and `SparkleBeautyIcon` to `HomeIcons.tsx` in HALO's rounded-stroke SVG style.
   - Added `'rose'` badge variant to `BedroomPortalCard.tsx` and exported alias `RoomPortalCard`.
4. **Constraints & Verification**:
   - Strict TypeScript (`tsc --noEmit` clean with 0 errors), Jest unit tests (15 suites passing, 91/91 tests), every touched file `< 250` lines, zero `any`.

---

# Active Implementation Plan — Digital Wardrobe Compact Ergonomic Capture Layout (`ui-ux-pro-max`)

**Current task:** Optimize the layout of the top capture section on `/(app)/garment` (`Take a Photo`, `Choose from Gallery`, and `PhotoCaptureGuide` tip banner) to make it reasonably compact, balanced, and space-efficient, so users can comfortably see both the capture actions and their saved garments without excessive vertical scrolling.
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 91/91 · Pytest 35/35)

---

## 1. Objectives & Ergonomic Redesign
1. **Side-by-Side Dual Capture Tiles (`GarmentOptionCard.tsx`)**:
   - Transformed the two full-width vertically stacked cards into a side-by-side 2-column action grid (`cardsRow` with `flexDirection: 'row', gap: 10`).
   - Each card (`Take a Photo` and `From Gallery`) is now a compact, vertical frosted bento card (`minHeight: 108px`) with top icon circle + micro badge, prominent title, and crisp caption.
   - Retains all tactile press feedback, pastel gradients (royal lilac for Camera, celestial periwinkle for Gallery), and SVG icons.
2. **Compact Streamlined Photo Tip Banner (`PhotoCaptureGuide.tsx`)**:
   - Replaced the tall multi-section card (~130px) with an ultra-compact single-tier frosted helper banner (~42px).
   - Features a lilac sparkle SVG badge, concise 1-line guidance ("Photo tip: Lay flat in bright, even light for clean 3D garment edges"), and an interactive toggle pill ("Tips") that reveals the 3 micro-pills (`Even Lighting`, `Full Frame`, `Minimal Folds`) on tap.
3. **Streamlined Header Spacing in `garment.tsx`**:
   - Tightened title and subtitle typography and vertical gaps (`titleWrap`, `cardsRow`, `divider`) recovering ~220px+ of vertical space.
   - Ensures the "My Saved Garments" grid and filter pills are immediately visible and prominent above or near the fold on mobile screens.
4. **Verification & Constraints**:
   - Strict TypeScript (`tsc --noEmit` passed with 0 errors), Jest test suite (15 suites, 91/91 tests passing), Pytest (35/35 passing), all files strictly `< 250` lines, zero `any`.

---

# Active Implementation Plan — Digital Wardrobe UI/UX Redesign (`ui-ux-pro-max`) & End-to-End Wardrobe Persistence

**Current task:** Redesign Digital Wardrobe (`apps/mobile/app/(app)/garment.tsx`) using `ui-ux-pro-max` while preserving HALO's dreamy pastel palette, add an inline **Saved Garments** section with empty state and a **Garment Detail & Dropdown Edit Modal**, and wire full backend persistence (Supabase `wardrobe_items` RLS + local cache sync + FastAPI `POST /v1/garment/analyze` with magic-byte/dimension/JWT validation).
**Status:** Completed & Verified ✅ (tsc 0 errors · Jest 91/91 · Pytest 35/35)

---

## 1. Objectives & Architecture
1. **`ui-ux-pro-max` Visual Redesign (`/(app)/garment`)**:
   - Cohesive dreamy pastel palette (`#EEF2FB`, `PastelBlobBackground`, deep plum `#2E2242`, heather `#6D5B85`, royal lilac `#6B5299`, celestial periwinkle `#4865B8`).
   - Redesigned `GarmentOptionCard` (Camera & Gallery) and `PhotoCaptureGuide` ("A little tip for better results") with crisp SVG icons (no emoji icons), frosted glass gradients, >=4.5:1 WCAG AA contrast, and tactile press micro-interactions.
2. **Inline Saved Garments Section + Empty State**:
   - Displayed directly below the capture guide on `/(app)/garment` (`SavedWardrobeSection.tsx`), with category filter pills, item count badge, memoized 2-column garment cards, and an inviting SVG empty state when no garments are saved.
3. **Garment Detail & Dropdown Edit Modal (`WardrobeDetailModal.tsx` + `WardrobeDropdownField.tsx`)**:
   - Tapping any saved garment opens a frosted modal showing isolated crop preview, dominant color swatches, AI confidence, immutable original AI prediction metadata (`ai_original` per AGENTS.md §3), editable name, dropdown selectors for Category, Style/Subtype, Fabric, and Pattern, plus Save and confirmed Delete actions.
4. **Backend Implementation & Persistence Wiring**:
   - **Mobile Persistence (`wardrobeApi.ts`, `useWardrobe.ts`, `garment.tsx`)**: Auto-saves detected garments upon photo/gallery analysis to Supabase `public.wardrobe_items` (RLS `user_id = auth.uid()`) with per-user local cache fallback and honest manual-add fallback (`confidence: null`, `predicted: null`) when CV detects 0 items.
   - **FastAPI Server (`services/api`)**: Adds authenticated `POST /v1/garment/analyze` with Bearer JWT verification (`dependencies.py`), server-side magic-byte + size + dimension validation (`AGENTS.md` §7), and optional RLS-forwarded persistence to `wardrobe_items`.
5. **Constraints**:
   - Every touched file strictly `< 250` lines; TypeScript strict (`0` errors); Zod validation at boundaries; Jest & Pytest suites green.

---

# Active Implementation Plan — Bedroom & Dressing Suite UI/UX Redesign (ui-ux-pro-max)

**Current task:** Redesign the Bedroom & Dressing Suite screen (`apps/mobile/app/(app)/bedroom.tsx`) accessed from the hallway, applying `ui-ux-pro-max` design intelligence while strictly preserving HALO's dreamy pastel color palette and style.
**Status:** Completed & Verified ✅

---

## 1. Objectives & Guidelines
1. **Retain Brand Aesthetic & Palette**:
   - Maintain HALO's dreamy pastel canvas (`#EEF2FB`, `PastelBlobBackground`, plum `#2E2242`, lilac `#72618A`, periwinkle `#686EE8`).
2. **Elevate the 2 Primary Action Cards**:
   - **Digital Wardrobe**: Luminous frosted glass gradient, dedicated AI Curation badge, enhanced iconography, clear micro-tags (`CV Tagging`, `Catalogue`), and tactile press feedback.
   - **3D Dressing Suite**: Luminous frosted glass gradient, Virtual Fit badge, enhanced avatar iconography, micro-tags (`Rigged Avatar`, `3D Try-On`), and tactile press feedback.
3. **Ergonomics & Touch Accessibility**:
   - Touch targets exceed 44×44px with generous touch padding.
   - Contrast ratio meets WCAG AA standards (minimum 4.5:1 for body, 7:1 for headings).
   - Smooth press micro-interactions with tactile scale feedback (`0.985`).
4. **Non-breaking Architecture**:
   - Preserves routes: `/(app)/garment` and `/(app)/create-avatar`.
   - Preserves return navigation to `/(app)/hallway`.
   - File length under 250 lines; TypeScript strict with zero `any`.

---

# Active Implementation Plan — Avatar preprocessing (body + face profile)

**Status:** Implemented and tested in code (2026-11-08); migration 0003 + device E2E pending (user).
**Goal:** front / back / face photos from Create Avatar → FastAPI runs the HALO Colab
preprocessing pipeline (OpenCV + MediaPipe Pose/Face Landmarker) → a per-user avatar
profile (body + face proportions, landmarks, validation report) saved in Supabase.
**Out of scope:** 3D avatar generation, Blender/Unity, try-on, smart-mirror pipeline. The app
avatar stays the labelled "Preview avatar" image; the profile is input for later 3D work.

## Decisions (user, 2026-11-08)
1. Photos are processed **in memory and discarded**. Only the profile and validation report are stored.
2. **Synchronous** request for now, but **benchmark first**. If it is slow or unreliable, move to the ADR-0004 background job → new ADR (ADR-0006).
3. Backend uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (**backend `.env` only**). The user runs migration 0003 manually after it is explained.
4. Backend reachable on local Wi-Fi (`uvicorn --host 0.0.0.0`); mobile `EXPO_PUBLIC_API_URL=http://<PC-LAN-IP>:8000`.
5. Remove the hardcoded Roboflow key fallback in `garmentApi.ts`; handle a missing key safely.

## Source pipeline
`services/api/notebooks/halo_avatar_preprocessing.py` (Colab export, reference only, not imported).
Fixes vs notebook: hardcoded `shoulder_width=103`, `hip_width=112` and `fused_body_features`
replaced by per-user computation · crashes on "no person/face" → typed validation issues ·
hip/shoulder widths use the torso-central silhouette segment (the full row includes arms) ·
ratios are the real measurements; px values are diagnostics only · low-confidence values → `null` ·
EXIF orientation applied before analysis · `mp.solutions` (drawing only) dropped.
Quality checks beyond the notebook (brightness, blur, aspect, framing) are **new heuristics**.

## Design
- **API:** `POST /v1/avatar/preprocess` (Bearer Supabase token; multipart `front`, `back`, `face`).
  200 → unified profile + validation report + timings. 422 `scan_invalid` (details carry the
  report, so the app can ask for a retake), 401, 413/415 `file_invalid`, 503 `model_unavailable` /
  `server_not_configured` / `save_failed`. Errors use the `{ "error": {...} }` shape from docs/API.md.
- **Backend modules** (`app/ai/avatar/`, no FastAPI/DB imports): `schemas`, `image_io` (magic bytes,
  decode, EXIF, dims), `quality`, `preprocess`, `landmarkers` (MediaPipe wrappers + lock),
  `body_features`, `silhouette`, `face_features`, `pipeline`. Plus `app/auth.py` (verify the token via
  Supabase `/auth/v1/user`), `app/supabase_rest.py` (PostgREST insert with the service role),
  `app/errors.py`, `app/avatar_store.py`, `app/routers/avatar.py`, `scripts/download_models.py`,
  `scripts/benchmark_avatar.py`. (No `GET` endpoint: reads/deletes go through Supabase RLS.)
- **DB:** `supabase/migrations/0003_avatars.sql`: `avatars` (generated_params immutable for clients;
  only appearance/body params are user-updatable) and `body_scans` (validation report, status,
  timings). RLS: owner select/delete; clients cannot insert; only the backend's service role writes.
- **Mobile:** `features/avatar/api/avatarApi.ts` (resize/normalize with expo-image-manipulator,
  multipart upload with token, zod-validated response, typed errors), `types/avatarProfile.ts`,
  `hooks/useAvatarPreprocessing.ts`, new stages consent → processing → results in the existing
  reducer and screen (`AvatarConsentView`, `AvatarProcessingView`, `AvatarResultsView`),
  "Choose from library" on capture steps, deleting the avatar also deletes server profiles (RLS).

## Steps (each: implement → test → docs)
| # | Step | Verify | Status |
|---|---|---|---|
| 0 | Backend env on Python 3.14 (inference-sdk marker), mediapipe dep, reference copy of notebook | deps install, existing pytest green | ✅ |
| 1 | Pure modules: schemas, image_io, quality, preprocess, body/silhouette/face features | unit tests with synthetic landmarks/masks | ✅ |
| 2 | MediaPipe wrappers + pipeline + model download script | real-image smoke run + benchmark | ✅ (public test images; ~0.2 s) |
| 3 | Auth, error shape, Supabase REST, avatar router, config/env | router tests (models + Supabase mocked in tests only) | ✅ |
| 4 | Migration 0003 (+ DATABASE.md); **user runs it** | SQL review; RLS check after the user applies it | ⏳ written, not applied |
| 5 | Roboflow fallback removal + safe missing-key handling | Jest | ✅ (key rotation: user) |
| 6 | Mobile api/types/hook + reducer stages | Jest + tsc | ✅ |
| 7 | Mobile views (consent, processing, results, library pick), Ready copy, delete wiring | tsc, Jest, export | ✅ (device visual check pending) |
| 8 | End-to-end: local backend + Supabase + phone (Expo Go) | user device run; DB row present | ⏳ needs 0003 + backend `.env` |
| 9 | Docs: API, DATABASE, AI_MODELS, SECURITY, TESTING, PROGRESS, CHANGELOG, ADR-0006 | — | ✅ |

## Risks
MediaPipe accuracy on 2D phone photos is approximate (not 3D reconstruction). Left/right labels on
the back view are unreliable (we average left/right). Face landmarks are biometric-like data:
stored only on the user's own RLS-protected row and deleted with the avatar/account.

---

# Previous Implementation Plan — Create Your Avatar (camera capture)

**Status:** Implemented — tsc, Jest, iOS/Android export pass; physical-device camera check pending.
- Scope: guided capture of front, back, face photos with `expo-camera`; review; placeholder completion. No upload, no AI, no 3D.
- State: one route, pure reducer (`src/features/avatar/avatarCaptureState.ts`); photos in memory only.
- Camera lifecycle: `CameraView` mounted only on an active capture step while the screen is focused.
- Exit safety: confirmation before discarding photos; swipe-back disabled; Android back steps backwards.

---

# Active Implementation Plan — Home dashboard (UI prototype)

**Current task:** Add a static-data dashboard below the house on Home (where "Add to your wardrobe" used to be): Wellness & Skin (main), Today's reminders, Weather, Calendar.
**Status:** Implemented — tsc + Jest pass; visual check on device pending
- UI only: sample data in `src/features/home/dashboard/sampleData.ts`, labelled "Preview · sample data" in the UI. No APIs, backend, DB, notifications, or analysis.
- Calendar uses the device's real current date; sample events are offsets from today.
- Reuse auth/home styling tokens (`authTheme`, pearl gradient, orb pastels, plum text). Header, house, avatar, Login/Register untouched. No new deps.
- Layout (revised): Home shows a frosted bottom nav; each feature has its own page (`/(app)/wellness`, `/reminders`, `/weather`, `/calendar`) via a shared `FeaturePageShell`.
- Verify: tsc, Jest (+ unit test for month-grid helper).

---

# Active Implementation Plan — Welcome intro video

**Current task:** Replace the app-open welcome animation (`LaunchScreen`, shown by `app/_layout.tsx`) with the uploaded intro video.
**Status:** Implemented — tsc + Jest + iOS export pass; device check pending.
Files: new `src/features/launch/components/WelcomeVideoScreen.tsx`; `app/_layout.tsx` (one-component swap); delete `LaunchScreen.tsx`; rename video asset. No auth/session/AsyncStorage/Login/Register/Home changes; no new deps.

---

# Active Implementation Plan — Two-Door Room Selection & Animated Room Transition

**Current task:** Implement the interactive two-door room selection experience using the uploaded screenshot (`assets/hallway-doors.png`), interactive touch targets for Bedroom and Bathroom doors, smooth camera approach zoom, door highlight glow, opening radiant light bloom, and transition into separate full-screen room environments (Bedroom and Bathroom).  
**Status:** Completed & Verified ✅

---

## 1. Objectives & Constraints

1. **Room Selection Visuals (Uploaded Screenshot)**:
   - Preserves the uploaded hallway image (`assets/hallway-doors.png`) with two wooden doors side by side ("BEDROOM" on left, "BATHROOM" on right), warm lighting, wood floors, and plants.
   - Original design, proportions, colors, and lighting kept without stretching or distortion (`resizeMode="cover"`).
2. **Interactive Door Selection**:
   - Each door is individually clickable with soft glowing amber/gold highlight matching the illuminated door signs.
   - Guarded against double-tapping (`isNavigating` ref).
3. **Approaching & Entering a Room (No Videos)**:
   - Smooth React Native animation camera zoom approaching the selected door (`scale: 1.0 -> 2.7`, `translateX`, `translateY`).
   - Door-opening radiant light emergence as the camera reaches the door threshold.
   - Fluid fade bloom into the selected full-screen room environment.
4. **Room Screens & Reusable Architecture**:
   - `apps/mobile/app/(app)/bedroom.tsx`: Bedroom & Dressing Suite (Wardrobe link to `/(app)/garment`, Avatar Suite to `/(app)/create-avatar`, return to Hallway).
   - `apps/mobile/app/(app)/bathroom.tsx`: Bathroom & Beauty Suite (Glow mirror preview, beauty shelf, return to Hallway).
   - Both screens provide an intuitive return button ("← Hallway") that resets the door selection camera for fluid repeat exploration.
5. **Strict Constraints & Aesthetic Integrity**:
   - Zero changes to Login or Register screens.
   - Zero redesign of the homepage.
   - Strictly no video rendering for rooms (100% smooth native-driver animations).
   - Strict TypeScript, all files under 250 lines.

---

## 2. Technical Architecture & File Layout

### Mobile: `apps/mobile`
- `apps/mobile/assets/hallway-doors.png`: Original uploaded screenshot asset preserved at 575×1024 resolution.
- `apps/mobile/src/features/home/components/DoorSelectionView.tsx`:
  - Full-screen interactive hallway component with Bedroom and Bathroom hit zones.
  - Native driver camera zoom animations (`scale`, `translateX`, `translateY`).
  - Pulsing door highlight and door-opening radiant light bloom.
  - `useFocusEffect` reset logic ensuring instant re-usability when returning from a room.
- `apps/mobile/app/(app)/hallway.tsx`:
  - Hallway screen hosting `DoorSelectionView` with navigation to `bedroom`, `bathroom`, and outside.
- `apps/mobile/app/(app)/bedroom.tsx`:
  - Full-screen Bedroom & Dressing Suite with wardrobe and avatar try-on options.
- `apps/mobile/app/(app)/bathroom.tsx`:
  - Full-screen Bathroom & Beauty Suite with vanity mirror and beauty shelf options.
- `apps/mobile/src/features/home/__tests__/homeComponents.test.ts`:
  - Unit tests verifying `DoorSelectionView`, `BedroomScreen`, and `BathroomScreen`.

---

## 3. Step-by-Step Implementation Plan

| # | Step | Description | Status |
|---|---|---|---|
| 1 | **Asset Integration** | Copied uploaded two-door screenshot to `apps/mobile/assets/hallway-doors.png` and verified coordinates. | ✅ Verified |
| 2 | **DoorSelectionView Component** | Created `DoorSelectionView.tsx` with smooth camera approach zoom, highlight, and light-bloom door opening. | ✅ Verified |
| 3 | **Hallway Screen Update** | Wired `hallway.tsx` to host `DoorSelectionView` and route to `/(app)/bedroom` and `/(app)/bathroom`. | ✅ Verified |
| 4 | **Bedroom & Bathroom Screens** | Built full-screen `bedroom.tsx` and `bathroom.tsx` matching HALO's dreamy pastel aesthetic with return navigation. | ✅ Verified |
| 5 | **Verification & Automated Tests** | `tsc --noEmit` clean, 54/54 Jest tests pass. All files under 250 lines. | ✅ Verified |

---

# Previous Implementation Plan — Interactive House Entrance Video & Hallway

**Current task:** Implement the interactive house entrance video playback (`assets/videos/house-entrance.mp4` / `home-video.mp4`) with `expo-video`, full-screen presentation, auto-play, muted, controls hidden, aspect-ratio preservation (`contentFit="cover"`), seamless finish transition to the House Interior / Hallway screen, safe lifecycle release, and clean frosted styling.  
**Status:** Completed & Verified ✅

---

## 1. Objectives & Constraints

1. **Interactive House Tap**:
   - Keep current HALO logo, personalized "Welcome, [Name]" header, and existing house image.
   - House remains clickable with subtle spring press animation (`springTo(0.96)`) navigating to `/(app)/house-entrance`.
2. **Entrance Video Playback (`expo-video`)**:
   - Installed official Expo package: `expo-video@~58.0.12`.
   - Full-screen presentation (`contentFit="cover"`, no stretching or distortion of 1080×1920 video).
   - Auto-play on screen mount, muted (`muted: true`), controls hidden (`nativeControls: false`), plays once without looping (`loop: false`).
   - Prevents blank screen while buffering via underlying pastel ambient backdrop and "Stepping inside..." indicator.
   - Elegant frosted glass Home and Skip buttons in top safe area for user agency.
3. **Smooth Transition to Interior / Hallway**:
   - Automatically navigates to `/(app)/hallway` (aliased to `/(app)/house-interior`) when `playToEnd` fires.
   - Guarded against double-navigation (`hasNavigated` ref).
   - Video properly paused and released on screen unmount; zero background playback leaks.
4. **House Interior / Hallway Screen**:
   - Implemented in `apps/mobile/app/(app)/hallway.tsx` with HALO's dreamy pastel aesthetic.
   - Frosted cards for "Digital Wardrobe" (links to `/(app)/garment`), "Dressing Suite" (preview), and "Step Outside" (navigates back to home).
5. **Strict Preservation of Existing Work**:
   - No modifications to Login or Register screens.
   - No changes to backend, APIs, database, or auth logic.
   - Strict TypeScript, all files under 250 lines.

---

## 2. Technical Architecture & File Layout

### Mobile: `apps/mobile`
- `apps/mobile/assets/videos/`: Video assets linked (`home-video.mp4`, `house-entrance.mp4`, `house-video.mp4`).
- `apps/mobile/app/(app)/house-entrance.tsx`:
  - Full-screen `expo-video` player using `useVideoPlayer` and `VideoView`.
  - Muted, auto-play, non-looping, `playToEnd` listener with smooth fade transition to hallway.
  - Safe lifecycle release on unmount, Home / Skip action pills.
- `apps/mobile/app/(app)/hallway.tsx` & `house-interior.tsx`:
  - Frosted glass interior hallway screen with pastel blob background, room shortcut cards, and return button.
- `apps/mobile/jest.setup.js`:
  - Mocked `expo-video` for native TurboModule compatibility in automated unit tests.
- `apps/mobile/src/features/home/__tests__/homeComponents.test.ts`:
  - Unit tests for `HouseEntranceScreen` and `HallwayScreen`.

---

## 3. Step-by-Step Implementation Plan

| # | Step | Description | Status |
|---|---|---|---|
| 1 | **Inspect Project & Assets** | Verified Expo SDK 58, Expo Router, existing house image, and localized `home-video.mp4` / `house-entrance.mp4`. | ✅ Verified |
| 2 | **Install `expo-video`** | Installed `expo-video@~58.0.12` compatible with Expo SDK 58. | ✅ Verified |
| 3 | **Implement `house-entrance.tsx`** | Built full-screen video player with auto-play, muted, controls hidden, loading fallback, and safe unmount cleanup. | ✅ Verified |
| 4 | **Implement `hallway.tsx`** | Created Hallway / House Interior screen matching HALO pastel visual identity. | ✅ Verified |
| 5 | **Automated Tests & Quality Checks** | `tsc --noEmit` clean, 51/51 Jest tests pass. All files under 250 lines. | ✅ Verified |

---

# Previous Implementation Plan — Homepage Avatar Silhouette in Front of House

**Current task:** Redesign the HALO homepage avatar placement: remove the circular avatar placeholder underneath the house and integrate a full-body human avatar outline/silhouette standing in front of the house with an interactive `+` create button, pastel aesthetic, and head-to-toe visibility.  
**Status:** Completed & Verified ✅

---

## 1. Objectives & Constraints

1. **Avatar Placement & Design (In Front of House)**:
   - Full-body human silhouette/outline showing head, shoulders, torso, arms, and legs (visible from head to toe).
   - Positioned standing naturally in front of the house near the entrance/pathway.
   - Styled with HALO's refined pastel aesthetic: delicate dusty mauve / lavender outline (`#8E7AA6`) with soft translucent pearlescent fill and subtle grounded contact shadow.
   - Elegant interactive `+` badge near the avatar signaling creation/upload capability.
   - Clickable avatar area with smooth spring press animation navigating to `/(app)/create-avatar`.
   - Remove the circular avatar placeholder completely from underneath the house.
2. **Visual & Architectural Harmony**:
   - Integrated directly into the house illustration scene (`HouseHero.tsx`), not as a disconnected card or circular icon.
   - Does not obscure key architectural features of the house.
   - Preserves house image (`halo-house.png`), welcome message ("Welcome back, [Name]"), logo, palette, typography, and background (`PastelBlobBackground`).
   - Zero changes to Login or Register screens.
   - Zero changes to backend, APIs, database, or auth logic.
3. **Responsive & Strictly Typed**:
   - Scaled proportionally based on screen width and house dimensions.
   - Strict TypeScript, all files under 250 lines.

---

## 2. Technical Architecture & File Layout

### Mobile: `apps/mobile`
- `apps/mobile/src/features/home/components/AvatarSilhouette.tsx`:
  - Full-body human vector silhouette outline (`react-native-svg`) with elegant fashion proportions (head, shoulders, torso, arms, hips, legs, feet).
  - Translucent pearlescent fill (`#FFFFFF` to `#D5C0EE`), dusty mauve / lavender outline (`#8E7AA6`), subtle ambient floor shadow.
  - Small frosted glass `+` button badge positioned near the avatar shoulder.
  - Tactile spring press feedback with hit slop for effortless tapping.
- `apps/mobile/src/features/home/components/HouseHero.tsx`:
  - Integrates `AvatarSilhouette` directly in front of the house illustration near the entrance/porch.
  - Retains house tap behavior ("Enter your HALO house") while providing distinct, accessible tap targeting for the avatar ("Create your avatar").
- `apps/mobile/src/features/home/components/HomeShortcutsCard.tsx`:
  - Completely removes the circular avatar placeholder (`AvatarPlaceholder`) as requested.
  - Streamlines the frosted shortcuts card to feature the wardrobe capture action with clean typography and luxury iconography.
- `apps/mobile/app/(app)/index.tsx`:
  - Connects `onAvatarPress` to navigate to `/(app)/create-avatar`.
- `apps/mobile/src/features/home/__tests__/homeComponents.test.ts`:
  - Unit tests for `AvatarSilhouette`, `HouseHero`, and `HomeShortcutsCard`.

---

## 3. Step-by-Step Implementation Plan

| # | Step | Description | Status |
|---|---|---|---|
| 1 | **Create `AvatarSilhouette.tsx`** | Design full-body human vector outline with head-to-toe anatomy, soft dusty mauve/lavender outline, subtle pearlescent fill, contact shadow, and `+` badge. | ✅ Verified |
| 2 | **Integrate into `HouseHero.tsx`** | Position avatar in front of house near the entrance/pathway, configure touch targets with spring animations, and preserve house entrance tap. | ✅ Verified |
| 3 | **Update `HomeShortcutsCard.tsx`** | Remove the circular avatar placeholder completely. | ✅ Verified |
| 4 | **Update `HomeScreen` (`index.tsx`)** | Wire `onAvatarPress` to navigate to `/(app)/create-avatar`. | ✅ Verified |
| 5 | **Verification & Tests** | Run `npm run typecheck` and `npm test` across mobile suite. Verify <250 lines per file and zero backend touches. | ✅ 49/49 Jest tests pass; 0 TS errors |

---

## 4. Historical Reference

---

## 1. Objectives & Constraints

1. **Visual Redesign (Reference 1 & Reference 2)**:
   - Combine Reference 1's frosted glass card (translucent backdrop, subtle white border, rounded corners, soft shadows) with Reference 2's pastel palette (pastel lavender, baby blue, cyan, pink, lilac).
   - Create one large, soft, blurred organic gradient blob BEHIND the glass card like Reference 2.
   - Animate the blob continuously with slow, seamless floating, drifting, and scaling movements at different speeds.
   - Support `AccessibilityInfo.isReduceMotionEnabled()` to respect user reduced-motion preferences.
2. **New Brand Logo**:
   - Replace current HALO logo with the newly provided shimmering script HALO logo asset (`assets/halo-logo.png`).
3. **Strict Zero Backend / Zero Auth Logic Modification**:
   - Frontend-only: no changes to backend code, APIs, endpoints, Supabase schemas, models, controllers, routes, auth logic, validation rules, or business logic.
   - Reuse existing `useLoginForm` and `useRegisterForm` hooks, error banners, field handlers, and navigation.
4. **Responsive & Smooth UX**:
   - `KeyboardAvoidingView` and `ScrollView` for all device heights, preserving keyboard accessibility and hit slops.
   - Smooth staggered entrance transitions and clean visual hierarchy.

---

## 2. Technical Architecture & File Layout

### Mobile: `apps/mobile`
- `apps/mobile/assets/halo-logo.png`: Updated with the user-provided script HALO logo.
- `apps/mobile/src/features/auth/components/PastelBlobBackground.tsx`:
  - Full-screen pastel background with one large, soft, blurred organic multi-color gradient blob (lavender `#CEB8F8`, baby blue `#A8D4FE`, cyan `#98F3EC`, pink `#F8B6D3`, lilac `#DFB8FC`).
  - Seamless non-repeating continuous floating, drifting, and breathing scale animations using React Native `Animated.loop`.
  - Native `AccessibilityInfo` listener to freeze animations if reduced motion is enabled.
- `apps/mobile/src/features/auth/components/AuthComponents.tsx`:
  - Updated `authTheme` with Reference 2 pastel palette and Reference 1 frosted glass tokens.
  - Refined `AuthCard`: true frosted-glass surface container with translucent fill, subtle crisp white border, delicate top sheen, and soft diffuse ambient shadow.
  - Refined `AuthInput`: translucent pill input with delicate white border, clear placeholder, and refined icon strokes.
  - Refined `AuthButton`: Reference 1/2 dreamy periwinkle-to-rose/lilac gradient with spring press interaction.
  - Refined `AuthTabBar`: translucent glass capsule pill with smooth active indicator.
  - Refined `SocialButtons` & `HairlineDivider`: frosted pill buttons with clean typography and subtle borders.
- `apps/mobile/src/features/auth/components/AuthSuccessView.tsx`:
  - Modular "You're all set!" confirmation screen after successful registration.
- `apps/mobile/app/(auth)/login.tsx`:
  - Redesigned Login screen integrating the new frosted glass card, animated background blob, new logo, and responsive keyboard layout.
- `apps/mobile/app/(auth)/register.tsx`:
  - Redesigned Register screen matching Login visual identity with smooth entrance animations, success state, and responsive layout.

---

## 3. Step-by-Step Implementation Plan

| # | Step | Description | Status |
|---|---|---|---|
| 1 | **Logo Asset Update** | Replace `apps/mobile/assets/halo-logo.png` with the user-uploaded script logo. | ✅ Verified |
| 2 | **Animated Pastel Blob Background** | Implement `PastelBlobBackground.tsx` with one large soft blurred multi-radial organic blob, continuous drifting/scaling animation loops, and reduced motion detection. | ✅ Verified |
| 3 | **Frosted Glass Auth Components** | Redesign `AuthCard`, `AuthInput`, `AuthButton`, `AuthTabBar`, and theme tokens in `AuthComponents.tsx` to match Reference 1 frosted glass and Reference 2 colors. | ✅ Verified |
| 4 | **Login Screen Redesign** | Update `app/(auth)/login.tsx` with frosted glass card, new logo, animated blob background, and responsive layout while keeping all existing state/handlers. | ✅ Verified |
| 5 | **Register Screen Redesign** | Update `app/(auth)/register.tsx` with identical styling, animations, success state, and responsive layout while keeping all existing state/handlers. | ✅ Verified |
| 6 | **Verification & Automated Tests** | Run `npm run typecheck` and `npm test` across mobile test suites. Verify <250 lines per file and zero backend touches. | ✅ 41/41 Jest tests passed; 0 errors |

---

## 4. Historical Reference


---

## 1. Objectives & Constraints

1. **Architecture Separation (per `AGENTS.md`)**:
   - Heavy CV/ML (PyTorch, OpenCLIP ViT-B/32, Roboflow Serverless SDK, scikit-learn K-Means, OpenCV) runs exclusively in Python backend (`services/api`).
   - Mobile app (`apps/mobile`) handles camera capture, gallery selection, and API communication.
2. **In-Memory Execution (Strict No-File Policy)**:
   - Prototype code saved files (`local_fashion_report.json`, `result.json`, `annotated_result.jpg`, `garment_crops/*`).
   - Production pipeline processes images in-memory (`io.BytesIO`, PIL, base64 data URIs). **Zero files written to disk**.
3. **Standalone Test Page (Zero UI Collision)**:
   - Teammates are actively designing the main wardrobe and UI screens.
   - Provided an isolated test route (`app/(app)/test-garment.tsx`) accessible for testing the backend pipeline without interfering with teammates' work.
4. **No Database Writes**:
   - Pure test pipeline for now; no persistence to Postgres/Supabase tables until user requests database integration.
5. **Camera & Gallery**:
   - Used `expo-image-picker` for native image capture (Camera) and library picker (Gallery).
6. **Code Cleanup**:
   - Prototype `"Cloth Recognation Code"` folder safely removed.

---

## 2. Technical Architecture & File Layout

### Backend: `services/api` (FastAPI)
- `services/api/requirements.txt`: FastAPI, uvicorn, pydantic, open_clip_torch, torch, torchvision, scikit-learn, pillow, opencv-python-headless, inference-sdk, python-multipart, python-dotenv, pytest.
- `services/api/app/ai/garment/`:
  - `schemas.py`: Pydantic models for detection bounding boxes, color breakdown, attributes (subtype, fabric, pattern), and response.
  - `color_extractor.py`: K-Means (scikit-learn) with human perception redmean metric and curated fashion palette.
  - `classifier.py`: Fashion-CLIP zero-shot classifier (`open_clip_torch`, ViT-B-32) for fabric, pattern, and subtype taxonomy.
  - `postprocess.py`: In-memory deskew, hanger cleanup, and white background compositing via OpenCV/PIL.
  - `detector.py`: Roboflow `deepfashion2-m-10k/2` serverless client with header-based auth.
  - `pipeline.py`: Orchestrator taking image bytes, returning structured JSON + base64 crop previews with 0 disk writes.
- `services/api/app/routers/garment.py`:
  - `POST /v1/garment/analyze-test`: Multipart image upload endpoint with standardized error shapes per `docs/API.md`.
- `services/api/tests/`:
  - Unit tests for color extractor, schemas, postprocessor, and mock router tests (31 passed).

### Mobile: `apps/mobile` (Expo SDK 58 / React Native)
- Dependency: `expo-image-picker`
- `src/features/garment/`:
  - `types/garment.ts`: TypeScript types and Zod schemas matching backend response.
  - `api/garmentApi.ts`: Data access function sending multipart image to FastAPI backend.
  - `hooks/useGarmentAnalysis.ts`: State hook for photo capture, gallery picking, in-flight analysis, error handling, and results.
  - `components/GarmentCard.tsx`: Reusable result card with swatches and crop preview.
- `app/(app)/test-garment.tsx`:
  - Developer testing screen:
    - [Take Photo with Camera] & [Choose from Gallery]
    - Selected image preview
    - [Analyze Garment] button
    - Results display: detected items, subtype, fabric candidates, pattern, dominant color swatches (with live hex preview & percentage), and base64 crop previews.
- `src/features/garment/__tests__/`:
  - Jest tests for Zod schema validation and API error handling (33/33 passed across mobile).

---

## 3. Step-by-Step Implementation Plan & Results

| # | Step | Description | Verification Result |
|---|---|---|---|
| 1 | **FastAPI Backend Setup** | Created `services/api` structure, dependencies, configuration, and app entry point (`main.py`). | ✅ `GET /health` passes |
| 2 | **In-Memory AI Garment Module** | Ported and refactored `color_extractor`, `classifier`, `postprocess`, `detector`, and `pipeline` to run 100% in-memory with 0 disk writes and Pydantic schemas. | ✅ 31 unit tests pass (`pytest`) |
| 3 | **Garment Test Router** | Created `POST /v1/garment/analyze-test` router and registered with FastAPI app. | ✅ Router tests pass with mocked pipeline & error cases |
| 4 | **Mobile Dependency & Feature Layer** | Installed `expo-image-picker` in `apps/mobile`, created Zod schemas, API client (`garmentApi.ts`), and hook (`useGarmentAnalysis.ts`). | ✅ `npm test` & `npx tsc --noEmit` pass |
| 5 | **Mobile Developer Test Screen** | Implemented `app/(app)/test-garment.tsx` & `GarmentCard.tsx` with camera/gallery actions, image preview, analysis trigger, and rich attribute/color/crop visual display. | ✅ Strict typing & <250 lines verified |
| 6 | **Automated Tests & Quality Checks** | Ran full test suite for mobile (`npm test`) and backend (`pytest`). Verified file size rules (<250 lines) and strict TypeScript. | ✅ 33 Jest tests & 31 pytest tests pass |
## 4. Phase 2: Native On-Device Garment Pipeline (Zero Local Server Dependency)

**Objective:** Eliminate `FormData` multipart issues and fragile local PC server / `localtunnel` dependencies on physical phones by executing the garment analysis pipeline directly inside the React Native app in memory.

| # | Step | Description | Verification |
|---|---|---|---|
| 1 | **Cloud HTTPS Detection (`garmentApi.ts`)** | Send base64 JPEG from `expo-image-picker` (`base64: true`) directly to Roboflow Serverless HTTPS API (`deepfashion2-m-10k/2`). | ✅ Live HTTPS 200 & unit tests pass |
| 2 | **In-Memory Pixel Isolation (`imageProcessor.ts`)** | Decode JPEG bytes in memory with `jpeg-js`, apply ray-casting segmentation polygon mask onto a clean `(255, 255, 255)` white background with 5% padding, and encode to base64 data URI. | ✅ Unit tests pass; 0 disk writes |
| 3 | **In-Memory K-Means Color Extractor (`colorExtractor.ts`)** | Run deterministic K-Means clustering on RGBA garment pixels and match to the 32-color `FASHION_PALETTE` via the Redmean human-perception metric. | ✅ Unit tests pass |
| 4 | **On-Device Attribute Classifier (`attributeClassifier.ts`)** | Compute subtype, fabric, and pattern candidate rankings from DeepFashion2 class and extracted color distribution. | ✅ Unit tests pass |
| 5 | **Single-Command Mobile Startup (`package.json`)** | Restore `"start": "expo start"` so `npm start` launches the mobile app cleanly without requiring a background PC server or tunnel. | ✅ `npx tsc --noEmit` & 35/35 Jest tests pass |

## 6. Phase 3: HALO Garment Studio UI Redesign

**Status:** Completed & Verified ✅  
**Goal:** Designed the luxury pearlescent Garment Studio screen (`apps/mobile/app/(app)/garment.tsx`) following HALO's refined pastel visual identity (Lavender mist `#D9CFF1`, Blush pink `#F1D9E5`, Pearl blue `#D4E9EC`, Soft mint `#D7EAE3`, Warm ivory `#F6EBDD`, Dusty mauve `#77708F`).

| # | Step | Description | Verification |
|---|---|---|---|
| 1 | **Pearlescent Canvas & Tokens** | Created `PearlescentBackground.tsx` and exported `luxuryPastel` theme tokens in `tokens.ts`. | ✅ Verified color accuracy and rendering |
| 2 | **Modular UI Primitives** | Created `HaloHeader.tsx`, `FrostedGlassCard.tsx`, `GarmentOptionCard.tsx`, `PhotoCaptureGuide.tsx`, and `WardrobeHangerDecor.tsx`. | ✅ All components <250 lines & strict TS |
| 3 | **Interactive Pre-Analysis Preview** | Created `GarmentPreview.tsx` with smooth scale/fade animations, "Retake / Choose Another", and prominent "Continue" CTA. | ✅ User confirms before AI processing runs |
| 4 | **Progressive Analysis & Results** | Created `GarmentProcessingView.tsx`, `GarmentDetectedCard.tsx`, and `GarmentRoadmapCard.tsx` with honest Phase 3 disclosure. | ✅ In-memory pipeline executed; 0 DB/disk writes |
| 5 | **Screen Orchestration & Navigation** | Created `garment.tsx`, updated `test-garment.tsx` forwarder, and linked `index.tsx` Home action card. | ✅ Smooth back navigation and flow transitions |
| 6 | **Verification & Zero Backend Touches** | Ran `npm run typecheck` and `npm test` across mobile suite. | ✅ 41/41 Jest tests passed; 0 backend files touched |


| 1 | **Remove Deskew & Orientation Modules** | Deleted `deskew.ts` and `orientation.ts`. Cleaned `imageProcessor.ts` to un-distorted polygon mask isolation. | ✅ Verified clean polygon masking |
| 2 | **Remove UI Rotate & Align Buttons** | Removed `rotate90` and `autoAlign` buttons and callbacks from `test-garment.tsx` and `useGarmentAnalysis.ts`. | ✅ Clean, uncluttered UI |
| 3 | **Tests & Verification** | Cleaned unit tests in `garmentApi.test.ts`. Verified `tsc --noEmit` and all 35 Jest tests pass. | ✅ 35/35 Jest tests & 31/31 pytest passing |

## 6. Phase 3: Digital Wardrobe Database Persistence & Test Screen Integration

**Objective:** Enable each authenticated user to persist detected garments in Supabase Postgres under strict Row Level Security (RLS), and display their personal saved wardrobe with cropped photos directly on the test screen (`test-garment.tsx`).

| # | Step | Description | Verification |
|---|---|---|---|
| 1 | **Database Migration (`0002_wardrobe.sql`)** | Create `wardrobe_items` table with `user_id` FK cascade, RLS policies (select/insert/update/delete for own items), index on `(user_id, created_at desc)`, and `updated_at` trigger. | Migration file created; idempotent |
| 2 | **Wardrobe Data Layer (`features/wardrobe`)** | Define Zod schemas & TypeScript types (`types/wardrobe.ts`), data access methods (`wardrobeApi.ts`), and React hook (`useWardrobe.ts`). | Unit tests in Jest; strict TypeScript |
| 3 | **Wardrobe Display Component (`WardrobeItemCard.tsx`)** | Visual card for saved wardrobe items displaying the isolated crop image, category, attributes, swatches, and delete action. | Strict typing; <250 lines |
| 4 | **Test Screen Integration (`test-garment.tsx`)** | Add "Save to Wardrobe" button to detected garments and render the "My Digital Wardrobe" list below the analyzer. | File strictly under 250 lines |
| 5 | **Testing & Verification** | Run mobile Jest test suite, TypeScript check (`tsc --noEmit`), and backend pytest suite. | All tests pass (0 failures) |

## 7. Phase 4: Intelligent Garment Camera Guidance & Quality Assessment

**Status:** Completed & Verified ✅  
**Objective:** Provide real-time framing guidance and instant photo quality inspection (lighting condition analysis, edge truncation detection, and user advisory warnings) to ensure high-accuracy garment analysis.

| # | Step | Description | Verification |
|---|---|---|---|
| 1 | **Quality Types & Schemas (`types/quality.ts`)** | Define Zod schemas and TypeScript types for `LightingStatus`, `FramingStatus`, and `PhotoQualityReport`. | ✅ Strict TypeScript; Zod validation |
| 2 | **In-Memory Quality Engine (`api/qualityInspector.ts`)** | Implement deterministic pixel luminance calculation ($\mu_Y, \sigma_Y$), clipping checks, and edge-truncation checks ($<4\%$ margins). | ✅ Pure TypeScript; unit tests pass |
| 3 | **Camera Framing Guide Overlay (`components/CameraFramingOverlay.tsx`)** | Visual safe-zone viewfinder overlay with corner brackets, alignment guides, and live capture tips. | ✅ Strict typing; <250 lines |
| 4 | **Quality Advisory Banner (`components/PhotoQualityBanner.tsx`)** | Color-coded quality pill and warning banner displaying lighting feedback, edge alerts, and Retake/Proceed actions. | ✅ Strict typing; <250 lines |
| 5 | **Integration & Orchestration** | Hook quality inspector into `useGarmentAnalysis.ts` and `test-garment.tsx`. | ✅ Instant pre-flight feedback (<30ms) |
| 6 | **Automated Tests & Quality Checks** | Jest unit tests in `qualityInspector.test.ts`, `tsc --noEmit`, and pytest. | ✅ 48/48 Jest tests & 31/31 pytest pass |

## 8. Phase 5: Digital Wardrobe Edit Backend & Dropdown UI

**Status:** Completed & Verified ✅  
**Objective:** Implement the backend mutation (`updateWardrobeItem`) and UI modal with dropdown category/subtype selectors to allow users to edit saved garments (name, category, fabric, pattern) in Supabase with local fallback.

| # | Step | Description | Verification |
|---|---|---|---|
| 1 | **Update Types & Schemas (`types/wardrobe.ts`)** | Define `UpdateWardrobeItemInputSchema`, `UpdateWardrobeItemInput`, and `WARDROBE_CATEGORIES` taxonomy list. | ✅ Strict TypeScript; Zod validation |
| 2 | **Wardrobe Cache & API (`api/wardrobeApi.ts`)** | Implement `updateWardrobeItem(id, updates)` in Supabase (`.update()`) with local storage offline sync. | ✅ Unit tests in Jest |
| 3 | **Hook Mutation (`hooks/useWardrobe.ts`)** | Expose `editItem(id, updates)` managing optimistic/confirmed state update. | ✅ Strict TypeScript |
| 4 | **Edit Modal with Dropdown (`EditWardrobeModal.tsx`)** | Build interactive edit modal with category dropdown, subtype quick chips, and name/fabric fields. | ✅ Strict typing; 235 lines (<250) |
| 5 | **Card & Test Screen Integration** | Connect Edit button in `WardrobeItemCard` and pass handler from `test-garment.tsx`. | ✅ Strict typing; 238 lines (<250) |
| 6 | **Automated Tests & Docs** | Add Jest tests for update mutations and update `PROGRESS.md`. | ✅ 50/50 Jest tests & 31/31 pytest pass |


## 9. Phase 6: 3D Closet Reference Viewer (test-only)

**Status:** Completed & Verified ✅ (typecheck + Jest; manual device check pending)  
**Objective:** Let the team browse the third-party "Rick's Closet" demo (https://ricks-closet.vercel.app/) inside the app as inspiration for a future HALO 3D wardrobe. **No backend work.**

**Decision:** Show the live site in a `react-native-webview` instead of cloning it. The demo's code, product photos, and 3D models belong to its author, and copying them would infringe their rights. A future HALO 3D closet must be built from original code and HALO's own garment assets.

| # | Step | Verification |
|---|---|---|
| 1 | `npx expo install react-native-webview` (14.0.1) | ✅ added to `package.json` |
| 2 | `app/(app)/test-closet.tsx`: WebView with loading overlay, error/retry state, back + reload buttons, hardware layer for WebGL | ✅ `tsc --noEmit` passes |
| 3 | Home shortcut card "3D Closet Test" in `app/(app)/index.tsx` | ✅ typecheck |
| 4 | Regression | ✅ Jest 50/50 |


## 10. Phase 7: Native 3D Walk-in Closet (Original Code & User Wardrobe)

**Status:** Completed & Verified ✅  
**Objective:** Build a 100% original Three.js + React Three Fiber 3D wardrobe screen (`/closet`) allowing users to walk into a virtual closet, drag clothes along horizontal rails with smooth inertia, view their own saved clothes on hangers, inspect items with close-up camera zoom, switch between wardrobe sections (Tops, Bottoms, Outerwear & Dresses), and edit garment attributes.

| # | Step | Description | Verification |
|---|---|---|---|
| 1 | **3D Dependencies** | Installed `three`, `@react-three/fiber`, `expo-gl`, `expo-asset`, `@types/three` matching Expo SDK 58. | ✅ Installed with Expo CLI |
| 2 | **Closet Section Logic** | Pure `sections.ts` mapping wardrobe categories into 3 sections with unit tests. | ✅ 3/3 Jest tests pass |
| 3 | **State Hook** | `useClosetSections.ts` integrating with `useWardrobe()` for active items & inspection state. | ✅ Strict TypeScript; <250 lines |
| 4 | **In-Memory Texture Loader** | `usePhotoTexture.ts` converting base64 JPEG crops into `THREE.DataTexture` with zero disk I/O. | ✅ Pure memory decode via `jpeg-js` |
| 5 | **3D Cabinet Carcass & Doors** | `Wardrobe.tsx` with ceiling LED spotlight and smooth 105° swinging hinged doors. | ✅ 60fps damped animation |
| 6 | **3D Clothes Rail & Hangers** | `Rail.tsx` + `Hanger.tsx` with metallic chrome bar and hanging photo cards. | ✅ Strict typing; <250 lines |
| 7 | **3D Camera Rig & Gestures** | `CameraRig.tsx` + `ClosetScene.tsx` PanResponder gesture handler for dragging rail with soft stops. | ✅ PanResponder gesture physics |
| 8 | **Screen UI & Inspection** | `app/(app)/closet.tsx` with header, quality switch (Light/HD), section tabs, and inspection overlay. | ✅ 176 lines (<250); strict TypeScript |
| 9 | **Home Navigation Link** | Added "✨ My 3D Closet" action card on `app/(app)/index.tsx`. | ✅ 224 lines (<250) |
| 10 | **Regression & Automated Checks** | Ran TypeScript typecheck, mobile Jest suite (53/53 tests pass), and backend pytest (31/31 pass). | ✅ 100% checks passed |

## 11. Digital Wardrobe shelves redesign (frontend only, 2026-11-09)

**Objective:** Replace the orbit / pearl-white wardrobe with a lilac shelf layout (brief from the user). No backend, schema or analysis changes.

| # | Step | Status |
|---|---|---|
| 1 | Pure logic `shelves/shelfLogic.ts`: colour ribbon, colour filter, category shelves, stage tint, attribute callouts (+ tests) | ✅ 8 tests pass |
| 2 | Components: title bar, colour ribbon, shelf row, garment / Add a Piece cards, empty state, grid toggle | ✅ tsc clean |
| 3 | `GarmentDetailSheet` with SVG callouts, Front/Back, Fix it → existing editor, Try on my avatar, Delete with confirm | ✅ tsc clean |
| 4 | Wire into `/(app)/garment`; Add a Piece back to a bottom sheet; remove atelier, `wardrobe-pieces` route and their tests | ✅ Jest 164/164, iOS export bundles |
| 5 | Device visual check (iOS + Android, Reduce Motion on/off) | ⏳ Pending |

Out of scope by user decision: In the wash, Today's look tray, Style me, Save look, Add to look. Callouts show only stored attributes (no sleeve data exists).

## 12. Digital Wardrobe image closet (frontend only, 2026-11-09)

**Objective:** Replace the shelf view with a horizontally scrolling closet built from `closet-left/middle/right` images, garments placed in calibrated slots. No backend changes.

| # | Step | Status |
|---|---|---|
| 1 | `closetSlots.ts` (image-fraction slots, gender image set) + `closetPacking.ts` (zone packing, Add a Piece first) with tests | ✅ 7 tests pass |
| 2 | `ClosetScroller`, `ClosetSegment`, `GarmentSlotCard` (rod / shelf), `AddPieceCard`, dots, swipe hint, empty card, DEV slot outlines | ✅ tsc clean |
| 3 | Category pills; "In the wash" (device-only AsyncStorage) + "Edit details" in the detail sheet | ✅ Jest 169/169 |
| 4 | Wire into `/(app)/garment`; remove shelf view | ✅ iOS + Android export bundle |
| 5 | Men's closet images + own slots (`closetSceneFor`) | ✅ Jest 173/173 |
| 6 | Device check on small + large phones; fine-tune slots with the DEV "Slots" toggle | ⏳ Pending |

Deviations: the images are landscape 2752 × 1536 JPGs (brief said portrait 3:4 PNGs) — sizes follow the real ratio. Parallax skipped (would misalign garments with shelves). Image edges show a slight tone change in the art (half-bays at each edge); a card sits on each side of every edge.
