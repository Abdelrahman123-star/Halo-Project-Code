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
