# ADR-0002: 3D renderer on mobile

- **Status:** Proposed — **must be validated by Spike A before acceptance**
- **Context:** Need rigged GLB, morph targets, runtime material changes, skinned garments,
  rotation, idle animation on Android + iOS in Expo.
- **Options:**
  1. `three` + `@react-three/fiber/native` + `expo-gl` (native GL, one JS codebase).
  2. WebView hosting three.js with a message bridge (mature three.js, slower, bridge cost).
  3. Native engines (Filament/SceneKit via custom modules) — too costly for the team.
- **Leaning:** (1); fallback (2) behind the same `AvatarViewer` interface.
- **Spike A pass criteria:** loads a skinned GLB with ≥1 morph target; plays an
  animation clip; changes a material colour and a texture at runtime; ≥ 30 fps on an
  emulator/mid-range phone; works in Expo (dev build acceptable).
- **Consequences:** If (2) chosen, 3D code lives in a bundled HTML asset + typed bridge.
- **Evidence:** _pending_.
