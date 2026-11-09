/**
 * Pure helpers behind the wardrobe "atelier" screen: the featured piece, the
 * colour story built from each garment's detected colours, and filtering by
 * category and/or colour. All data comes from the user's saved garments.
 */
import { getCategoryGroup, type WardrobeFilterGroup, type WardrobeItem } from '../types/wardrobe';

type GarmentLike = Pick<WardrobeItem, 'id' | 'category' | 'created_at' | 'colors'>;

/** The newest saved piece (by `created_at`), or null for an empty wardrobe. */
export function latestGarment<T extends GarmentLike>(items: readonly T[]): T | null {
  let latest: T | null = null;
  for (const item of items) {
    if (!latest || Date.parse(item.created_at) > Date.parse(latest.created_at)) latest = item;
  }
  return latest;
}

export type ColourSwatch = {
  /** Normalised colour name, used as the filter key. */
  key: string;
  name: string;
  hex: string;
  /** How many garments contain this colour. */
  garmentCount: number;
};

function colourKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * The shades that make up the wardrobe: one swatch per detected colour name,
 * most common first (ties broken by total coverage). The swatch uses the hex
 * from the garment where that colour covers the most area.
 */
export function buildColourStory(items: readonly GarmentLike[], limit = 10): ColourSwatch[] {
  const byKey = new Map<string, { name: string; hex: string; bestShare: number; garments: Set<string>; coverage: number }>();

  for (const item of items) {
    for (const colour of item.colors ?? []) {
      const key = colourKey(colour.color_name);
      if (!key) continue;
      const entry = byKey.get(key) ?? { name: colour.color_name, hex: colour.hex, bestShare: -1, garments: new Set<string>(), coverage: 0 };
      entry.garments.add(item.id);
      entry.coverage += colour.percentage;
      if (colour.percentage > entry.bestShare) {
        entry.bestShare = colour.percentage;
        entry.hex = colour.hex;
      }
      byKey.set(key, entry);
    }
  }

  return [...byKey.entries()]
    .sort(([, a], [, b]) => b.garments.size - a.garments.size || b.coverage - a.coverage)
    .slice(0, limit)
    .map(([key, entry]) => ({ key, name: entry.name, hex: entry.hex, garmentCount: entry.garments.size }));
}

export function filterGarments<T extends GarmentLike>(
  items: readonly T[],
  group: WardrobeFilterGroup,
  colour: string | null,
): T[] {
  return items.filter((item) => {
    if (group !== 'all' && getCategoryGroup(item.category) !== group) return false;
    if (colour && !(item.colors ?? []).some((c) => colourKey(c.color_name) === colour)) return false;
    return true;
  });
}

/** "1 piece" / "12 pieces". */
export function piecesLabel(count: number): string {
  return `${count} ${count === 1 ? 'piece' : 'pieces'}`;
}
