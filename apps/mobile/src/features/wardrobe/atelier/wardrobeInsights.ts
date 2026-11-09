/**
 * Pure helpers behind the wardrobe "atelier" screen: filtering by category and
 * the piece-count label. All data comes from the user's saved garments.
 */
import { getCategoryGroup, type WardrobeFilterGroup, type WardrobeItem } from '../types/wardrobe';

type GarmentLike = Pick<WardrobeItem, 'id' | 'category' | 'created_at' | 'colors'>;

export function filterGarments<T extends GarmentLike>(items: readonly T[], group: WardrobeFilterGroup): T[] {
  return group === 'all' ? [...items] : items.filter((item) => getCategoryGroup(item.category) === group);
}

/** "1 piece" / "12 pieces". */
export function piecesLabel(count: number): string {
  return `${count} ${count === 1 ? 'piece' : 'pieces'}`;
}
