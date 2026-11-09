/**
 * Closet scenes: the closet images for each gender and the slot positions where
 * garments are placed on them.
 *
 * All positions are fractions of the image (x, y = slot centre; w, h = slot
 * size, including the small name label under the card), so they hold on every
 * screen size. Each set is three 2752 × 1536 images (left end, repeating middle
 * tile, right end); a half-bay sits at each image edge so neighbouring images
 * complete it. The two sets are drawn differently, so each has its own slots.
 * Turn on the DEV "Slots" toggle on the wardrobe screen to see the outlines
 * over the images while calibrating.
 */
import type { ImageSourcePropType } from 'react-native';
import type { Gender } from '@/features/auth/schemas';

export type ClosetZone = 'rod' | 'shelf1' | 'shelf2';
export type ClosetSlot = { zone: ClosetZone; x: number; y: number; w: number; h: number };
export type SegmentKind = 'left' | 'tile' | 'right';
export type ClosetSlotMap = Record<SegmentKind, readonly ClosetSlot[]>;

export type ClosetScene = {
  images: Record<SegmentKind, ImageSourcePropType>;
  slots: ClosetSlotMap;
  /** Height of the clothes rod, where hanging cards' pearl lines start. */
  rodY: number;
};

/** Width / height of every closet image (both sets share one size). */
export const CLOSET_IMAGE_ASPECT = 2752 / 1536;

type Band = { y: number; h: number };
type Bands = Record<ClosetZone, Band>;

function column(x: number, w: number, bands: Bands): ClosetSlot[] {
  return (['rod', 'shelf1', 'shelf2'] as const).map((zone) => ({ zone, x, w, ...bands[zone] }));
}

/** Slots grouped by zone and ordered left → right, so pieces fill the closet from the start. */
function byZoneThenX(columns: ClosetSlot[][]): ClosetSlot[] {
  const zones: ClosetZone[] = ['rod', 'shelf1', 'shelf2'];
  return zones.flatMap((zone) =>
    columns
      .flat()
      .filter((slot) => slot.zone === zone)
      .sort((a, b) => a.x - b.x),
  );
}

type ColumnSpec = { x: number; w: number };

function slotMap(bands: Bands, cols: { left: ColumnSpec[]; tile: ColumnSpec[]; right: ColumnSpec[] }): ClosetSlotMap {
  const build = (specs: ColumnSpec[]) => byZoneThenX(specs.map(({ x, w }) => column(x, w, bands)));
  return { left: build(cols.left), tile: build(cols.tile), right: build(cols.right) };
}

// ── Women's set: rod y ≈ 0.16, shelves y ≈ 0.59 / 0.78, low ledge y ≈ 0.97;
//    main bay x ≈ 0.20–0.81 (0.20–0.66 on the right panel, before the mirrors).
const WOMENS_MAIN = [0.31, 0.51, 0.71].map((x) => ({ x, w: 0.15 }));
const WOMENS_LEFT_HALF = { x: 0.062, w: 0.095 };
const WOMENS_RIGHT_HALF = { x: 0.94, w: 0.095 };

const WOMENS_CLOSET: ClosetScene = {
  images: {
    left: require('../../../../assets/closet-left.jpg'),
    tile: require('../../../../assets/closet-middle.jpg'),
    right: require('../../../../assets/closet-right.jpg'),
  },
  rodY: 0.16,
  slots: slotMap(
    {
      rod: { y: 0.3875, h: 0.355 }, // hangs from the rod down to just above the shelf at 0.59
      shelf1: { y: 0.7, h: 0.15 }, // stands on the shelf at 0.78
      shelf2: { y: 0.885, h: 0.16 }, // stands on the low ledge at 0.97
    },
    {
      // Mirror door on the far left; mirrors on the right: slots only in the open parts.
      left: [...WOMENS_MAIN, WOMENS_RIGHT_HALF],
      tile: [WOMENS_LEFT_HALF, ...WOMENS_MAIN, WOMENS_RIGHT_HALF],
      right: [WOMENS_LEFT_HALF, ...[0.29, 0.437, 0.585].map((x) => ({ x, w: 0.125 }))],
    },
  ),
};

// ── Men's set: rod y ≈ 0.16, shelves y ≈ 0.62 / 0.79, floor y ≈ 0.945;
//    main bay x ≈ 0.26–0.735 on every image; mirror x < 0.2 (left), x > 0.8 (right).
const MENS_MAIN = [0.34, 0.4975, 0.655].map((x) => ({ x, w: 0.13 }));
const MENS_LEFT_HALF = { x: 0.075, w: 0.11 };
const MENS_RIGHT_HALF = { x: 0.925, w: 0.11 };

const MENS_CLOSET: ClosetScene = {
  images: {
    left: require('../../../../assets/closet-left-men.jpg'),
    tile: require('../../../../assets/closet-middle-men.jpg'),
    right: require('../../../../assets/closet-right-men.jpg'),
  },
  rodY: 0.16,
  slots: slotMap(
    {
      rod: { y: 0.4025, h: 0.385 }, // hangs from the rod down to just above the shelf at 0.62
      shelf1: { y: 0.715, h: 0.14 }, // stands on the shelf at 0.79
      shelf2: { y: 0.88, h: 0.13 }, // stands on the floor at 0.945
    },
    {
      left: [...MENS_MAIN, MENS_RIGHT_HALF],
      tile: [MENS_LEFT_HALF, ...MENS_MAIN, MENS_RIGHT_HALF],
      right: [MENS_LEFT_HALF, ...MENS_MAIN],
    },
  ),
};

export const CLOSET_SCENES = { female: WOMENS_CLOSET, male: MENS_CLOSET } as const;

/** Same gender rule as the Bedroom / Bathroom: male → men's closet; female or unknown → women's. */
export function closetSceneFor(gender: Gender | null): ClosetScene {
  return gender === 'male' ? MENS_CLOSET : WOMENS_CLOSET;
}
