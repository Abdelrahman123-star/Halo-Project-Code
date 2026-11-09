/**
 * Geometry and selection for "Your Style Orbit": garments float on an elliptical
 * orbit around a glowing centre, with four category pearls on a wider outer
 * orbit. Proportions are fractions of the orbit's width so it scales to any
 * phone; they were chosen so nothing overlaps (see orbitLayout.test.ts).
 */
import { getCategoryGroup, type WardrobeFilterGroup } from '../types/wardrobe';

export const ORBIT_MAX_PIECES = 8;
/** Orbit height relative to its width. */
export const ORBIT_ASPECT = 1.22;
/** Centre disc diameter relative to width. */
export const CENTRE_DIAMETER = 0.34;

const PIECE_ORBIT = { rx: 0.355, ry: 0.43 };
const CATEGORY_ORBIT = { rx: 0.58, ry: 0.7 };
const BASE_PIECE = 0.215;
// Varied sizes give depth: some pieces read as closer than others.
const SIZE_PATTERN = [1.08, 0.86, 0.98, 0.82, 1.04, 0.88, 0.95, 0.84];

export type OrbitSlot = { x: number; y: number; size: number };

/** Centre-based positions for `count` pieces (≤ 8), starting at the top, evenly spaced. */
export function orbitSlots(count: number, width: number): OrbitSlot[] {
  const n = Math.min(Math.max(count, 0), ORBIT_MAX_PIECES);
  const height = width * ORBIT_ASPECT;
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return {
      x: width / 2 + PIECE_ORBIT.rx * width * Math.cos(angle),
      y: height / 2 + PIECE_ORBIT.ry * width * Math.sin(angle),
      size: BASE_PIECE * width * SIZE_PATTERN[i],
    };
  });
}

export type OrbitCategory = Exclude<WardrobeFilterGroup, 'all'>;

export type CategoryPoint = {
  group: OrbitCategory;
  label: string;
  x: number;
  y: number;
  /** Labels point inward, away from the screen edge. */
  labelSide: 'left' | 'right';
};

const CATEGORY_POSITIONS: { group: OrbitCategory; label: string; angle: number }[] = [
  { group: 'tops', label: 'Tops', angle: -135 },
  { group: 'dresses', label: 'Dresses', angle: -45 },
  { group: 'outerwear', label: 'Outerwear', angle: 45 },
  { group: 'bottoms', label: 'Bottoms', angle: 135 },
];

export function categoryPoints(width: number): CategoryPoint[] {
  const height = width * ORBIT_ASPECT;
  return CATEGORY_POSITIONS.map(({ group, label, angle }) => {
    const radians = (angle * Math.PI) / 180;
    const x = width / 2 + CATEGORY_ORBIT.rx * width * Math.cos(radians);
    return {
      group,
      label,
      x,
      y: height / 2 + CATEGORY_ORBIT.ry * width * Math.sin(radians),
      labelSide: x < width / 2 ? 'right' : 'left',
    };
  });
}

/** The two orbit ellipses (for the faint orbit lines). */
export function orbitEllipses(width: number) {
  return {
    pieces: { rx: PIECE_ORBIT.rx * width, ry: PIECE_ORBIT.ry * width },
    categories: { rx: CATEGORY_ORBIT.rx * width, ry: CATEGORY_ORBIT.ry * width },
  };
}

type Groupable = { id: string; category: string; created_at: string };

export type OrbitPiece<T> = { item: T; emphasized: boolean };

/**
 * Which pieces float in the orbit (newest first). With a category selected,
 * its pieces come first and are emphasised; remaining slots keep a few others,
 * de-emphasised, so the orbit stays full.
 */
export function orbitPieces<T extends Groupable>(items: readonly T[], group: WardrobeFilterGroup): OrbitPiece<T>[] {
  const newest = [...items].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  if (group === 'all') return newest.slice(0, ORBIT_MAX_PIECES).map((item) => ({ item, emphasized: true }));
  const matches = newest.filter((item) => getCategoryGroup(item.category) === group);
  const others = newest.filter((item) => getCategoryGroup(item.category) !== group);
  return [
    ...matches.map((item) => ({ item, emphasized: true })),
    ...others.map((item) => ({ item, emphasized: false })),
  ].slice(0, ORBIT_MAX_PIECES);
}

export function countByGroup(items: readonly { category: string }[]): Record<OrbitCategory, number> {
  const counts: Record<OrbitCategory, number> = { tops: 0, bottoms: 0, dresses: 0, outerwear: 0 };
  for (const item of items) counts[getCategoryGroup(item.category)] += 1;
  return counts;
}
