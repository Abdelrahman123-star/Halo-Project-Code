# 3D Pipeline (Avatar & Garments)

> Status: **design; no assets or renderer exist yet.** Validated by Spike A / C.

## Approach (MVP)
A single **rigged stylized base body GLB** with:
- **Skeleton** (humanoid; shared by all garments) → idle + a few poses (Mixamo-style
  clips or authored in Blender; check licence).
- **Morph targets** (blend shapes): height, shoulder width, torso, waist, hip, leg length.
- **Materials**: separate named materials for skin, hair, eyes → colour set at runtime.
- **Hair**: swappable hair meshes (3–5 styles) sharing the head bone.

### Parameter provenance
| Parameter | Source |
|---|---|
| height/shoulder/torso/hip/leg ratios | **scan-derived** from pose landmarks (approximate, 2D photo) |
| skin tone, hair colour, eye colour | **suggested** from face image; user-editable |
| hairstyle, outfit | **user choice** |
These are stored in `avatars.generated_params` (immutable, enables reset) and
`avatars.appearance_params` / `body_params` (editable).

## Garments
Template GLBs authored against the **same skeleton** (skinned meshes, so they follow
animation and morphs). Slots: `top`, `bottom`, `one_piece`, `outerwear`, `shoes`, plus
non-skinned attachments (`bag`, `accessory`) on bones.
- Mapping (rule-based): `tshirt|shirt|…→top_tshirt`, `trousers|jeans→bottom_pants`, …
- Material params from analysis: base colour, optional pattern texture (solid / stripe /
  check / photo-crop tile), roughness constant.
- Layer rules: `one_piece` excludes `top`+`bottom`; `outerwear` renders over `top` via
  a small body-mask/scale offset to limit clipping.
- No template for a category ⇒ item gets `compatibility = unsupported`, shown clearly.

## Renderer
`three` + `@react-three/fiber/native` + `expo-gl` (ADR-0002, pending Spike A).
Known risks: GLB loading via `expo-asset`, texture loading, morph target support,
performance on low-end Android. Fallback: WebView + three.js with a typed message bridge;
the public component interface (`AvatarViewer`) stays identical.

## Asset licence log
See `assets/3d-source/LICENSES.md` (to be created in Spike C). No asset is used before
its licence is recorded.

## Not implemented / out of scope
Photo-to-3D garment reconstruction · physical cloth simulation · personalised face mesh.
