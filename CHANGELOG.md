# Changelog

## [Unreleased]
### Changed — Men's wardrobe colours match the men's closet
- New per-gender palettes in `closet/closetTheme.ts` (`WOMENS_PALETTE` unchanged lilac/plum/pearl; `MENS_PALETTE` sampled from the men's closet images: steel-white `#E8ECF3` page with a soft steel wash, navy text `#1C2A4A`, headings `#2E3F66`, steel-blue accents, ice → silver highlight gradient, cool shadows). `closetPaletteFor(gender)` uses the same rule as the closet images.
- `closet/ClosetPaletteContext.tsx` provides the palette; all wardrobe components (header, title bar + pills, slot cards, Add a Piece card, dots, swipe hint, message card, detail sheet + callouts, Add a Piece sheet) build their styles from it (`usePaletteStyles`). "Try on my avatar" uses a new palette-aware `PearlButton`. Header + background moved from `garment.tsx` to `closet/WardrobeHeader.tsx`. `stageTint` takes the palette's neutral fallback.
- Not themed (shared/teammate components, still lilac): the camera/gallery cards and tips inside the Add a Piece sheet, the photo preview/analysis screens, and the existing `WardrobeDetailModal` editor.
- `tsc --noEmit` clean; Jest 173/173; iOS export bundles. Not yet verified on a device.
### Added — Men's closet for the Digital Wardrobe
- `assets/closet-{left,middle,right}-men.jpg` (2752 × 1536) used for male users; female / unknown keep the women's set (same rule as Bedroom/Bathroom).
- `closet/closetSlots.ts` now defines a `ClosetScene` per gender (images + own slot positions + rod height): the men's art has a narrower bay (x ≈ 0.26–0.735), shelves at y ≈ 0.62 / 0.79 and floor at 0.945, so it has its own calibrated slots (15 per middle tile, 12 per end panel, none on the mirrors). `closetSceneFor(gender)` replaces `closetImagesFor`; `packCloset` takes the scene's slot map; only the user's own set is preloaded.
- Tests run per scene (slots inside the image and below the rod, every piece placed once). `tsc --noEmit` clean; Jest 173/173; Android export bundles; slot placement checked by drawing on the men's images. Not yet verified on a device.
### Changed — Digital Wardrobe is an image-built closet (replaces the shelves, frontend only)
- `/(app)/garment` browsing is now `src/features/wardrobe/closet/WardrobeCloset`: "My Wardrobe" + count pill, round refresh, category pills (All / Tops / Bottoms / Outerwear / Dresses), then a horizontally scrolling closet that fills the height above the 110 pt nav: `closet-left`, N × `closet-middle`, `closet-right` (`assets/*.jpg`), each sized to the closet height at the images' real ratio (2752 × 1536 — the files are landscape JPGs, not portrait 3:4), edge to edge. N = max(1, ceil(pieces / 15)). FlatList with fixed item layout (only nearby panels mounted); images preloaded with `expo-asset`.
- Slots in `closet/closetSlots.ts` as image fractions (rod / shelf1 / shelf2; 15 per middle tile, 12 on each end panel, none on the mirrors); calibrated against the images. DEV-only "Slots" pill draws the outlines. Gender rule as Bedroom/Bathroom; men's images not added yet, so everyone gets the women's set.
- `closet/closetPacking.ts`: Add a Piece in the left panel's first rod slot; outerwear + dresses on the rod, tops on shelf1, bottoms on shelf2, overflow to any free slot (two passes so overflow can't take a later category's zone). Filters re-pack; moved/new pieces fade in.
- `GarmentSlotCard`: rod = tall frosted card (radius 18) with a static pearl line to the rod; shelf = shorter card with a corner sheen and lilac shadow. Both: colour-tinted stage, "3D" badge, "AI · %", name label.
- "In the wash": toggle in the detail sheet; dimmed to 50% with a basket mark. Stored per user **on this device only** (AsyncStorage, `closet/washStore.ts`) — no backend column exists.
- Detail sheet gained "Edit details" (opens the existing editor) and "In the wash".
- First-visit "Swipe to explore ›" pill (fades after the first scroll; remembered on the device), position dots under the closet, centred "Your closet is waiting / Add your first piece" card when empty ("No dresses yet" for an empty filter).
- Removed the shelf view (colour ribbon, shelf rows, grid toggle, empty state) and the vertical pull-to-refresh (the refresh button remains). Parallax was not built: moving images slower than the cards would slide garments off their shelves.
- Checks: `tsc --noEmit` clean; Jest 27 suites / 169 tests (new `closetPacking.test.ts`); iOS + Android `expo export` bundle; slot placement checked by drawing slots on the images at 463 pt height. Not yet verified on a device.
### Changed — Digital Wardrobe as lilac shelves (replaces the orbit, frontend only)
- `/(app)/garment` browsing is now `src/features/wardrobe/shelves/WardrobeShelves`: lilac page (`#EEF2FB` + static `PastelBlobBackground`), "My Wardrobe" + count pill, round refresh button, shelf ↔ grid toggle; "YOUR COLOUR STORY" ribbon (segment width = number of garments with that colour, up to 10 colours; tap filters, "Showing: Navy ×" clears); category shelves (Tops / Bottoms / Outerwear / Dresses, empty ones skipped, "TOPS · 8" labels, pearl shelf line) or a 2-column grid; "Add a Piece" card (dashed lavender stage, pearl "+") is always the first card.
- Garment cards: frosted, radius 22, 120 pt wide; stage tinted from the main detected colour (blush / champagne / mint / powder blue / lilac, neutral for greys/whites/unknown); static diagonal sheen; name, subtype, colour dots, "3D" badge (pieces with a photo), "AI · %" from the stored category confidence (hidden when none).
- New `GarmentDetailSheet` (pearl bottom sheet, handle, ×): large photo, Front | Back switch when a back photo exists, static SVG callouts to frosted labels for the attributes the analysis really stored (Style/subtype, Pattern, Fabric, main Colour) with "AI guess · %"; unknown attributes are not shown. The callout dots mark the garment area only — the analysis has no per-attribute positions. "Fix it" opens the existing `WardrobeDetailModal` editor (colour has no Fix it — the editor can't change it). "Try on my avatar" → avatar page (or Create Avatar when there is none); "Delete piece" asks for confirmation.
- Empty state: hanger in a pearl orb, "No Saved Garments Yet", pearl "+ Add a Piece", empty pearl shelf line.
- `AddPieceSheet` is a bottom sheet again (slide up, grab handle); badge stays removed, tips start closed.
- Reduce Motion: sheets fade instead of slide, entrances fade without rising.
- Removed: `src/features/wardrobe/atelier/*` (orbit, gallery, floating +, pearl-white tokens), route `app/(app)/wardrobe-pieces.tsx`, `orbitLayout`/`wardrobeInsights` tests. New pure logic `shelves/shelfLogic.ts` with 8 tests. Not built (by request): In the wash, Today's look, Style me, Save look, Add to look.
- Checks: `tsc --noEmit` clean; Jest 26 suites / 164 tests pass; `expo export --platform ios` bundles. Not yet verified on a device.
### Changed — Add a Piece is a centred popup; badge removed; tips start closed
- `AddPieceSheet`: bottom sheet → centred pearl-white card (fade in, 28 pt radius, hairline edge, lavender shadow, max 82% height, grab handle removed); "AI CURATION · DIGITAL WARDROBE" badge removed. Camera / gallery cards and the close-then-pick flow unchanged.
- `PhotoCaptureGuide` gained optional `defaultExpanded` (default `true`, so other uses are unchanged); the popup passes `false`, so the "For great 3D models" tips are collapsed until tapped. `tsc --noEmit` clean; garment/wardrobe tests pass.
### Changed — Wardrobe add button restyled as a pearl portal (inside only)
- `FloatingAddButton` (`atelier/AtelierActions.tsx`): same position, 58 pt size, `onPress` and press-shrink. Inside: iridescent blush → lavender → powder-blue gradient, a breathing iridescent inner glow (off with Reduce Motion), a glassy pearl highlight, a thin translucent white edge (1 pt, was 1.5 pt opaque), and a thin plum plus with a tiny four-point sparkle (`SparklePlus`). Lavender floating shadow unchanged. `tsc --noEmit` clean; wardrobe/garment tests pass; checked by rendering on white.
### Changed — Orbit is the wardrobe page; "View all" opens the full collection
- `/(app)/garment`: header lowered (top padding 22 → 44); the orbit is drawn edge to edge (full screen width, so pieces are larger) and centred vertically between header and nav. The gallery moved off this page.
- A pearl "View all pieces · N" button under the orbit (or "View all {Category} · N" when a category pearl is selected) opens the new route `app/(app)/wardrobe-pieces.tsx` (`?group=` pre-filter, "Show all" link): pearl-white "All pieces" title + count, the two-column gallery, pull-to-refresh, and the existing detail/edit sheet. Both screens reload on focus so edits/deletions show on return.
- `GROUP_TITLES` exported from `WardrobeAtelier`; `garmentComponents.test.ts` passes `onViewAll`. `tsc --noEmit` clean; Jest 177/177; iOS export bundles. Not yet verified on a device.
### Removed — "Create an Outfit" teaser from the Digital Wardrobe
- Removed the "Create an Outfit" (Coming soon) card from `WardrobeAtelier` and deleted `atelier/AtelierSections.tsx` (it held only that card). The wardrobe now runs: Your Style Orbit → full gallery, with the floating pearl +. `tsc --noEmit` clean; Jest passes.
### Removed — "Your Colour Story" from the Digital Wardrobe
- Removed the Colour Story section and its colour filter (`ColourStory`, `buildColourStory`, colour argument of `filterGarments`, now `filterGarments(items, group)`), plus the unused `latestGarment` helper and their tests. Gallery "no matches" link now reads "Show all". Colour dots on pieces and colour info in the detail sheet are unchanged. `tsc --noEmit` clean; Jest passes.
### Changed — Digital Wardrobe: "Your Style Orbit"
- New `atelier/StyleOrbit.tsx` + `OrbitParts.tsx` replace the editorial intro, The Style Edit and category pills: a glowing white centre ("Your Style", "Your collection", piece count; breathing pearl glow) with up to 8 saved garments floating on an elliptical orbit in white rounded frames (`contain`, varied sizes, soft floating shadow, slow independent drift), and four category pearls (Tops lilac, Dresses blush, Outerwear champagne, Bottoms powder blue) with inward labels + counts on a wider hairline orbit; dashed inner orbit line.
- Selecting a category: its pearl brightens/grows, its pieces spring forward (1.12×) while others recede (0.78×, 40% opacity) and the orbit refills with that category first (LayoutAnimation); the centre shows the category name + count and becomes a "‹ All" control; tapping the same pearl again also returns to All. The same category filters the full gallery below ("All pieces / Tops… · N PIECES · Show all").
- Tapping a floating piece gently enlarges it, then opens the existing detail sheet. Reduce Motion: no float, breathing or tap enlarge.
- Geometry/selection in `atelier/orbitLayout.ts` (19 tests: no overlaps at 320/350/390 pt for 1–8 pieces, pearls clear of pieces, emphasis + capacity). Removed `StyleEditFeature.tsx`, the intro and category pills; Create an Outfit (Coming soon), Colour Story, gallery, floating + and Add a Piece flow unchanged.
- `tsc --noEmit` clean; Jest 183/183; composition checked by rendering at 390 pt. Not yet verified on a device.
### Changed — Wardrobe screen in pearl white
- `/(app)/garment` background lilac orb → pearl white `#FFFEFF` (`PastelBlobBackground` removed from this screen). New `atelier/pearlWhite.ts` tokens (`PEARL_WHITE`, `PEARL_TINT` #F7F3FD, `PEARL_HAIRLINE`).
- Gallery: no card behind pieces — the white photo stage (now borderless) blends into the page; wider column gap (16) and row spacing (22); smaller name/category type; 8 pt colour dots with a hairline edge; edit control reduced to the fine pencil. 3D badge rule unchanged.
- The Style Edit: card removed, softer pearl glow behind the photo. Pills, Colour Story, Create an Outfit, "Show more", filtered-empty note, back pill and profile button use the pearl tint + hairline edge (`GlassIconButton` gained an optional `style`).
- Add a Piece sheet restyled pearl white (white gradient, lighter plum backdrop, pearl-tint badge/close button); camera/gallery options and flow unchanged.
- `tsc --noEmit` clean; Jest 164/164. Not yet verified visually on a device.
### Changed — Digital Wardrobe redesigned as an editorial "atelier" (frontend only)
- `/(app)/garment` browsing view replaced by `src/features/wardrobe/atelier/WardrobeAtelier`: editorial intro ("My Wardrobe", "Every piece tells your story.", piece count, breathing pearl sparkle); "The Style Edit" featuring the newest piece (large white stage, pearl glow behind the card); "Create an Outfit" teaser clearly marked **Coming soon** (no outfit flow exists; not tappable); category pills (soft periwinkle active); "Your Colour Story" built from the garments' real detected colours (tap to filter, tap again to clear; hidden when no colour data); two-column staggered gallery with editorial index numbers, white photo stages (`contain`), name, subtype/category, colour dots, 3D badge (only for pieces with a photo — the on-device 3D model needs it), edit mark; paged 24 at a time ("Show more pieces"); filtered-empty state with "Clear filters"; elegant empty state ("Your Style Story Starts Here", pearl "Add Your First Piece").
- Selection effect: soft lilac outline + pearl shimmer across the white stage, then the existing detail sheet opens. Reduce Motion skips shimmer/breathing/floating.
- Floating pearl-gradient "+" above the bottom nav opens the existing Add a Piece sheet; camera / gallery / preview / back photo / analysis / save flow unchanged. Header gains a small profile button; pull-to-refresh replaces the refresh button.
- Detail sheet: grab handle, larger white photo stage (240 pt), AI confidence shown as quiet text instead of a pill; editing, 3D preview (existing, only when a model can be built), Save / Delete unchanged.
- Removed now-unused `SavedWardrobeSection`, `SavedGarmentTile`, `AddPieceTile`; `garmentComponents.test.ts` now instantiates `WardrobeAtelier`.
- New `wardrobeInsights.ts` (latest piece, colour story, category/colour filtering) with 8 tests. `tsc --noEmit` clean; Jest 164/164; `npx expo export --platform ios` bundles. Not yet verified visually on a device.
### Added — Separate colours for the men's room marks
- New `src/features/home/rooms/roomLabelTheme.ts` (`RoomLabelTheme`: line, labelText, boxBackground, boxBorder, icon, outline). `FEMALE_LABEL_THEME` = the existing colours (unchanged look); `MALE_LABEL_THEME` = navy lines/text on a light silver-blue box, navy icons, ice-blue outline.
- Each `BedroomScene` / `BathroomScene` now has `labelTheme`; `BedroomHint` takes `theme`, `BedroomHotspot` takes `outlineColor`, and both room views pass the scene's colours to callouts, outlines, hint icons and the back button.
- `tsc --noEmit` clean; Jest passes (new theme test in `roomScenes.test.ts`). Not yet verified on a device.
### Changed — Gender circles use the Create Account button's colours
- Female circle `#F27FC3` → baby pink `#F2C4E2`, Male circle `#5CA9F2` → baby blue `#BCD6F6`, read from `authTheme.pearlBtnGradient` (first / last stop) so they stay in sync with the button. Check mark white → plum `authTheme.pearlBtnText` for contrast on the lighter fills. `tsc --noEmit` clean; auth tests pass.
### Added — Male bedroom & bathroom
- `MALE_BEDROOM` (`assets/boy-bedroom.png`) and `MALE_BATHROOM` (`assets/boy-bathroom.png`) in `roomScenes.ts`; male users now see them, female users and accounts without a saved gender keep the original rooms.
- The boy images share the girls' composition (verified by overlaying the measured regions): the bedroom reuses all female measurements; the bathroom reuses them except a taller skincare region (lowest row sits lower) and `vanityFrontY` 0.528 → 0.548.
- No makeup mark in the male bathroom: `BathroomScene.makeupRegion` / `makeupHintPoint` are now nullable and `BathroomRoomView` renders the makeup hotspot and callout only when present. Destinations, labels, animations unchanged.
- `tsc --noEmit` clean; Jest 155/155 (room-scene tests updated); boy bathroom placement checked by rendering at 390×844. Not yet verified on a device.
### Added — Gender-specific bedroom & bathroom scenes (male scenes pending)
- New `src/features/home/rooms/roomScenes.ts`: `BedroomScene` / `BathroomScene` (room image + measured furniture regions / hint points / label lines). `FEMALE_BEDROOM` / `FEMALE_BATHROOM` hold the current rooms (incl. the wardrobe hint's −20 pt offset); `MALE_BEDROOM` / `MALE_BATHROOM` are `null` until male images are provided, so `bedroomSceneFor` / `bathroomSceneFor` fall back to the female scenes for male users and for accounts without a saved gender.
- New `src/features/profile/hooks/useUserGender.ts` (`readGender` reads `user_metadata.gender`).
- `BedroomRoomView` / `BathroomRoomView` now take a `scene` prop instead of importing the female constants; `bedroom.tsx` / `bathroom.tsx` pick the scene from the user's gender. Everything else in the app is unchanged and shared. No visual change for current rooms.
- Tests: `src/features/home/__tests__/roomScenes.test.ts` (5). `tsc --noEmit` clean; Jest 154/154.
### Changed — Gender field moved under Confirm Password, checklist style
- `GenderSelector` is now a frosted input pill ("Gender" label + Female / Male options) with a circle per option; selecting fills the circle pink (`#F27FC3`, Female) or blue (`#5CA9F2`, Male) with a white check. Placed under Confirm Password (above Create Account). Validation/storage unchanged. `tsc --noEmit` clean; auth tests pass.
### Added — Gender on the register form
- `registerSchema` gains required `gender` (`'female' | 'male'`, exported `GENDER_OPTIONS` / `Gender`); empty choice shows "Please choose your gender.".
- New `src/features/auth/components/GenderSelector.tsx` (Female / Male segmented control styled like the Log In / Register switch), placed under Full Name in `RegisterFormView` (used by both `login.tsx` and `register.tsx` sliders). `useRegisterForm` tracks `gender`.
- `signUp` stores it in the Supabase account's sign-up metadata (`user_metadata.gender`) alongside `display_name` — no table, migration or backend change. Existing accounts have no gender value.
- Tests: 3 new schema tests + `src/features/auth/__tests__/signUpMetadata.test.ts` (mocked Supabase). `tsc --noEmit` clean; full Jest suite passes.
### Changed — Digital Wardrobe header and title
- Section title "My Saved Garments" → "My Wardrobe" (refresh button label updated to match).
- `/(app)/garment` header lowered (top padding 6 → 22, bottom 8 → 14) with a larger HALO logo (92×38 → 136×56); page content starts lower too (scroll top padding 2 → 12). `tsc --noEmit` clean; Jest 145/145.
### Changed — Add to Wardrobe options moved into an "Add a Piece" sheet
- New `src/features/wardrobe/components/AddPieceSheet.tsx`: bottom sheet (styled like `WardrobeDetailModal`) holding the "AI CURATION · DIGITAL WARDROBE" badge, "Add to Your Wardrobe" heading, the existing Take a Photo / From Gallery `GarmentOptionCard`s and the existing `PhotoCaptureGuide`. Choosing a source closes the sheet, then opens the picker (iOS waits for `onDismiss`; Android runs immediately).
- `/(app)/garment`: those blocks removed from the page (it now shows only the saved wardrobe); the "Add a Piece" tile and the empty-state button open the sheet (replaces the earlier `Alert` chooser). Empty-state copy updated ("Tap below…", "+ Add a Piece"). Preview / analysis / save flow unchanged.
- `tsc --noEmit` clean; Jest 145/145. Not yet verified on a device.
### Added — "Add a Piece" tile in the Digital Wardrobe grid
- New `src/features/wardrobe/components/AddPieceTile.tsx`, built from `SavedGarmentTile`'s structure and styles (same 48% width, 128 pt stage, name/sub-label, footer): dashed lavender stage with the page's lavender gradient "+" orb, "Add a Piece" / "Photo or gallery", camera + gallery mini badges.
- `SavedWardrobeSection` gained optional `onAddPiece`; the tile leads the grid whenever saved pieces are shown. `/(app)/garment` passes a chooser (Take a Photo / Choose from Gallery / Cancel) that calls the existing `pickFromCamera` / `pickFromGallery`.
- `tsc --noEmit` clean; Jest 145/145. Not yet verified on a device.
### Removed — Immersive Digital Wardrobe closet (user decision)
- Deleted `app/(app)/digital-wardrobe.tsx`, `src/features/wardrobe/closet/` (`closetLayout`, `ClosetRoomView`, `ClosetPieces`, `AddPieceCompartment`) and `src/features/wardrobe/__tests__/closetLayout.test.ts`. The closet entries below describe code that no longer exists.
- Bedroom wardrobe opens `/(app)/garment` (Digital Wardrobe) again; `digital-wardrobe` removed from the bottom nav's hidden routes. The teammate's 3D closet (`/(app)/closet`) and the wardrobe data/hooks are untouched. `assets/closet.png` left in place (now unused).
- Checks: `tsc --noEmit` clean; Jest 145/145.
### Changed — Larger closet frames, two pieces per shelf
- `ITEMS_PER_SHELF` 3 → 2 and `HANGING_SLOTS` 4 → 3; shelf frames now use 94% of the shelf opening (was 86%) with an 8 pt gap. On a 390 pt phone shelf frames are ≈114 pt wide (was ≈77) and 78–109 pt tall; rail frames ≈76 pt wide. Capacity: 3 hanging + 12 on shelves before the "+N" marker. `tsc --noEmit` clean; Jest 156/156.
### Changed — Closet pieces shown in display frames with their names
- Each piece now sits in a delicate pearl frame (translucent white, hairline white edge, 8 pt radius, soft shadow) with the item's `name` in an 8.5 pt plum strip at its foot (single line, ellipsised). Frames hug each photo's real proportions at the slot width, capped to the slot (`framePiece()` + `PIECE_FRAME` in `closetLayout.ts`, replacing `placePieceImage`); hanging frames start right under the hanger, folded frames stand on the board with a contact shadow.
- Rail pieces are now side by side (6 pt gap) instead of overlapping, so frames don't stack.
- `tsc --noEmit` clean; Jest 156/156 (4 `framePiece` tests); checked by rendering at 390 pt width.
### Changed — Closet: Add a Piece moved to the top compartment, stronger glow, garment placement fixed
- "Add a Piece" now lives in the small top compartment under the crown (`ADD_PIECE_SPACE`, image y 0.075–0.1215), visible on open; all six open shelves now hold clothes (capacity 18).
- `AddPieceCompartment`: solid rose-gold edge with an outer glow, a warm radial rose-gold light inside breathing 60–100%, a stronger touch wash, bolder "+" and label.
- Garment placement: photos were `contain`-centred in their slots, so hanging pieces floated below the hanger and folded pieces floated above the board. New `placePieceImage()` uses each photo's real size (from `onLoad`) to pin hanging pieces right under the hanger and stand folded pieces on the board; the contact shadow matches the piece width; photos stay hidden until measured. Hanging piece width 0.32 → 0.38 of the rail.
- `tsc --noEmit` clean; full Jest suite passes (3 new `placePieceImage` tests); checked by rendering at 390 pt width.
### Changed — Digital Wardrobe closet zoomed in and scrollable
- `closetLayout(screenWidth)` now draws the closet at `CLOSET_ZOOM` (1.15) × screen width at its natural height (≈448×1345 pt on a 390 pt phone; interior ≈248 pt wide, was ≈156) — door outer edges slightly cropped, interior always fully on screen (tested at 360/390/430 pt).
- `ClosetRoomView` wraps the scene in a vertical `ScrollView` (rail at the top → shelves → Add a Piece → drawers); back button stays fixed; entrance animation and all touch targets move with the content.
- `tsc --noEmit` clean; wardrobe Jest suites 16/16; checked by rendering at 390 pt width.
### Added — Immersive Digital Wardrobe closet (frontend only)
- New route `app/(app)/digital-wardrobe.tsx`: the user's closet image (`assets/closet.png`, 724×2172) fills the screen height, sides extended in the image's wall colour (`#EBDFE7`); camera eases in ("stepping closer", 1.2 s) with the clothes layer settling a beat later for depth; warm top light and soft side shading. Bottom nav hidden on this route for immersion.
- The user's real saved items (existing `useWardrobe`, refreshed on focus) are placed in the closet: long tops/outerwear/dresses hang on the rod (up to 4, fine hanger, overlapping), everything else stands on the first five shelves (3 per shelf, contact shadow); overflow shows a small "+N MORE" marker. Each piece has a faint breathing pearl halo, brighter on touch/hover. Tapping a piece opens the existing `WardrobeDetailModal` (edit / delete). Empty wardrobe: "Your pieces will appear here" on the rail.
- "Add a Piece": the bottom open shelf above the drawers is an empty compartment with a dashed rose-gold outline, faint breathing rose-gold light, a fine "+" and small label; the whole compartment opens the existing Add to Wardrobe screen `/(app)/garment` (take a photo / choose from gallery). "+N" also opens it (full list there).
- New `src/features/wardrobe/closet/`: `closetLayout.ts` (measured rod/shelf/interior fractions; `arrangeCloset` placement logic), `ClosetRoomView`, `ClosetPieces`, `AddPieceCompartment`.
- Bedroom wardrobe now opens `/(app)/digital-wardrobe` (was `/(app)/garment`). `/(app)/garment`, `/(app)/closet` (3D closet) and other routes unchanged. No shoes/accessories, no backend changes, no new dependencies.
- Checks: `tsc --noEmit` clean; Jest 151/151 (6 new in `src/features/wardrobe/__tests__/closetLayout.test.ts`); shelf/rod geometry verified by overlaying bands on the image, slot placement by rendering at 390×844. Not yet verified on a device.
### Changed — Smaller room callout labels
- `BedroomHint` (bedroom + bathroom): label 11.5 → 9.5 pt, letter-spacing 1.6 → 1.3, line height 16 → 13; chip padding/radius trimmed to match (user's chip colours kept); first line still centred on the callout bend. `tsc --noEmit` clean; home Jest suites pass.
### Changed — Smaller room callout labels
- `BedroomHint` (bedroom + bathroom): label 11.5 → 9.5 pt, letter-spacing 1.6 → 1.3, line height 16 → 13; chip padding/radius trimmed to match; first line still centred on the callout bend. `tsc --noEmit` clean; home Jest suites pass.
### Changed — Interactive Bathroom + Skin Recommendations / Makeup preview pages (frontend only)
- `app/(app)/bathroom.tsx` now shows `assets/girl-bathroom.png` full-screen (old card layout + mirror "prototype" modal replaced; backup not kept in repo, `RoomPortalCard` component untouched). Three hotspots with the bedroom's hint/callout style: left skincare shelf → new `/(app)/skincare`; round mirror → existing `/(app)/wellness` (skin analysis); right makeup shelf → new `/(app)/makeup`. Labels: "PRESS FOR SKIN RECOMMENDATIONS" (drops onto the vanity front), "PRESS FOR SKIN ANALYSIS" and "PRESS FOR MAKEUP" (upper wall rows; widths computed so lines/labels never cross).
- New `src/features/home/bathroom/`: `bathroomLayout.ts` (regions/points as image fractions; crop centred between the two shelves), `BathroomRoomView`, `BathroomIcons` (bottle, face-scan, lipstick), `SkincareCards`, `MakeupCards`, `beautySampleData.ts`.
- New shared hook `src/features/home/rooms/useRoomInteraction.ts` (breathing light, label reveal, shimmer → zoom → navigate, focus reset, reduced motion). The bedroom still uses its own copy of this logic (not refactored here to avoid touching it).
- `coverLayout` gained an optional `cropCenterX`; default (bedroom: keep right edge) unchanged.
- New pages use `FeaturePageShell` and are labelled "Preview · sample data": Skin recommendations (morning/evening routines, product-type picks tied to the sample wellness metrics — no brands) and Makeup (sample shade match, three looks). No analysis, no backend, no new dependencies.
- Checks: `tsc --noEmit` clean; Jest 145/145 (5 new in `src/features/home/__tests__/bathroomLayout.test.ts`); placement checked by rendering at 390×844. Not yet verified on a device.
### Fixed — Bedroom callout line and label legibility
- The wardrobe line was effectively invisible: with the icon at x≈119 it ran along the wardrobe's gold divider (x≈117) as a 1 pt line at 60% opacity. Line/bend now 1.5 pt in darker plum `rgba(78,58,106,0.9)`.
- Labels were too faint on bright furniture: now 11.5 pt bold in `#3D2E55` on a light frosted pearl chip (`rgba(255,255,255,0.62)`, 0.5 pt white edge, 10 pt radius); the bend runs straight into the chip. Applies to both callouts.
- `tsc --noEmit` clean; home Jest 22/22; checked by rendering at 390×844 (zoomed on the wardrobe line).
### Changed — Wardrobe callout points down to just above the pouf
- `BedroomHint` supports downward callouts (line drops from the icon when `calloutY` is below it, grows from the icon edge) and an optional `maxLabelWidth` (label wraps; 16 pt line height).
- New `POUF_TOP_Y` (0.632) in `bedroomLayout.ts`. Wardrobe label sits at `poufTop − 28`, on the white drawer fronts just above the pouf, wrapped to two lines so it stops before the mirror (`maxLabelWidth = mirror.x − labelStart − 12`). 3D Try-On callout unchanged (upper row).
- `tsc --noEmit` clean; home Jest 22/22; placement checked at 390×844.
### Changed — Bedroom label rows swapped; larger hint buttons
- Wardrobe label moved down a row (just above the wardrobe); the 3D Try-On label takes the upper ceiling row (`mirrorCalloutY = max(wardrobe.y − 52, safeTop + 18)`, `wardrobeCalloutY = mirrorCalloutY + 32`). Wardrobe icon x offset `−20` (user edit) kept.
- Hint buttons enlarged: icon box 34 → 44 pt, glow 56 → 72 pt, hanger 19 → 25 pt, avatar 20 → 26 pt. `tsc --noEmit` clean; home Jest 22/22; placement checked at 390×844.
### Changed — Wardrobe hint centred on the wardrobe
- Wardrobe icon moved to the middle of the wardrobe: vertically level with the handles (`WARDROBE_HINT_POINT.y = 0.432`), horizontally centred on the visible part of the wardrobe (`visibleCenterX`, since phones crop its left edge). Callout line now rises from there to the same label. `tsc --noEmit` clean; home Jest 22/22; placement checked at 390×844.
### Changed — Bedroom callout labels raised; mirror label text
- Callouts moved up into the ceiling band (`wardrobeCalloutY = max(wardrobe.y − 52, safeTop + 18)`, mirror label a fixed 32 pt below) so the mirror label no longer sits on the bright mirror frame. Mirror label now reads "PRESS TO OPEN 3D TRY-ON". Placement checked by rendering at 390×844; `tsc --noEmit` clean.
### Changed — Bedroom hints get hairline callouts with always-visible labels
- `BedroomHint` rewritten: a 1 pt mauve hairline (soft white glow) rises from each icon past the furniture's top edge, bends 18 pt (wardrobe → right, mirror → left), ends in a 4 pt dot and a small spaced-capitals label with a white halo: "PRESS TO OPEN WARDROBE" / "3D TRY-ON". Labels are tappable (same action as the object).
- Callouts draw in on entering the room (line grows upward, bend extends, label fades in; ~1.1 s ease-out) and retract during the zoom-out; touching brightens the line. Mirror callout is kept ≥32 pt below the wardrobe's so labels never collide; both stay below the back button.
- Checks: `tsc --noEmit` clean; home Jest suites 22/22; placement checked by rendering onto the image at 390×844.
### Changed — Bottom nav floats with a clear surround (frontend only)
- `app/(app)/_layout.tsx`: the bottom nav is now an absolutely positioned layer over the screen stack instead of a separate strip below it; `HomeBottomNav` wrapper background `#EEF2FB` → transparent, so the page shows around/under the pill (the pill itself is unchanged).
- New `BOTTOM_NAV_CLEARANCE` (110, matching the `paddingBottom: 110` most screens already use). Home scroll padding 32 → `BOTTOM_NAV_CLEARANCE`; 3D Closet door prompt / inspect card lifted above the bar.
- Checks: `tsc --noEmit` clean; Jest 140/140. Not yet verified on a device.
### Changed — Bedroom hints larger and placed on the furniture
- `BedroomHint`: icon box 26→34 pt, icons ~19–20 pt (1.5 stroke), larger glow, label 13.5 pt.
- Hints now sit on the objects via image-fraction points (`WARDROBE_HINT_POINT` on the wardrobe's central divider at the top shelf, label above; `MIRROR_HINT_POINT` on the upper mirror glass, label below) using new `imagePoint()` in `bedroomLayout.ts`.
- Checks: `tsc --noEmit` clean; home Jest suites 22/22; placement checked by rendering onto the image at 390×844.
### Changed — Bedroom interactions redesigned to be minimal and discoverable (frontend only)
- Removed the frosted "MY WARDROBE" / "3D TRY-ON" pills (`BedroomLabel.tsx` deleted).
- New `BedroomHint`: a tiny line icon (hanger on the wardrobe's top edge; avatar-with-orbit on the floor under the mirror) on a breathing pearl glow; its label ("My Wardrobe" / "3D Try-On") is plain mauve text with a soft white halo that only fades in on touch-down, pointer hover (iPad/desktop pointer), or selection. Icons are 14–15 pt; touch area padded with `hitSlop`.
- `BedroomHotspot`: idle state is now a 1 pt pearl hairline breathing at 8–30% opacity; press/hover brightens the rim and reveals the label; selection adds a diagonal light shimmer (wardrobe) / reflection sweep (mirror) clipped to the object's shape. Whole wardrobe and whole mirror remain the touch targets.
- `BedroomRoomView`: tap → label + shimmer (≈0.4 s) → zoom toward the object + pastel fade → navigate (single tap). Routes unchanged: wardrobe → `/(app)/garment`; mirror → `/(app)/avatar` or `/(app)/create-avatar`. Reduced motion: no breathing/zoom.
- Checks: `tsc --noEmit` clean; Jest 140/140; hint/label placement checked by rendering the computed layout onto the image at 390×844. Not yet verified on a device.
### Changed — Immersive interactive Bedroom (frontend only)
- `app/(app)/bedroom.tsx` now shows the user's bedroom image full-screen (`assets/girl-bedroom.png`, renamed from `girl bedroom.png` — spaces are unsafe in Android asset names). The previous card layout is replaced; `BedroomPortalCard` is kept (bathroom + tests use it).
- New `src/features/home/bedroom/`: `bedroomLayout.ts` (cover geometry + image-fraction regions for wardrobe/mirror; side crop biased so the mirror is always fully visible), `BedroomHotspot` (breathing lavender outline, bright glow on press/selection), `BedroomLabel` (frosted pearl pill: "MY WARDROBE" with hanger icon, "3D TRY-ON" with mirror icon; 46 pt tall), `BedroomRoomView` (zoom toward the chosen object + pastel fade, then navigate; HUD fades back in on return; reduced motion skips the zoom and pulse).
- Only the wardrobe, the mirror and their labels are tappable. Wardrobe → `/(app)/garment` (existing Digital Wardrobe). Mirror → existing avatar experience (`/(app)/avatar` if the user has an avatar, else `/(app)/create-avatar`), the same destination the old "3D Dressing Suite" button used — a dedicated 3D try-on screen does not exist yet. Back → hallway.
- No backend changes, no new dependencies.
- Checks: `tsc --noEmit` clean; Jest 140/140 (6 new in `src/features/home/__tests__/bedroomLayout.test.ts`); `npx expo export --platform android` bundles the image; hotspot/label placement checked by rendering the computed layout onto the image at 390×844. Not yet verified on a device.
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
