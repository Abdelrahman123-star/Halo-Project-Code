# Active Implementation Plan — Garment Recognition Pipeline Integration

**Current task:** Port and integrate Computer Vision & Fashion AI Garment Recognition from prototype (`Cloth Recognation Code`) into production FastAPI backend (`services/api`) and Expo mobile app (`apps/mobile`) with a standalone developer test page.  
**Status:** Completed & Verified ✅

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

## 5. Reversion of Heuristic Rotation & Deskewing

**Status:** Completed ✅
Per user instruction, the rotation and deskewing heuristics were completely removed. Garments are extracted faithfully from the segmentation polygon onto a clean white background with 5% padding without artificial rotation or warping.

| # | Step | Description | Verification |
|---|---|---|---|
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
