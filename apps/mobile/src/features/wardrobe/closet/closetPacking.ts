/**
 * Places garments into closet slots. The closet is: left panel, N middle tiles,
 * right panel. The first rod slot of the left panel is always "Add a Piece".
 * Outerwear and dresses hang on the rod, tops go on the middle shelf, bottoms on
 * the low shelf; when a zone is full, a piece takes the next free slot of any zone.
 */
import { getCategoryGroup } from '../types/wardrobe';
import type { ClosetSlot, ClosetSlotMap, ClosetZone, SegmentKind } from './closetSlots';

export type SlotContent<T> = { kind: 'add' } | { kind: 'garment'; item: T };
export type PlacedSlot<T> = { slot: ClosetSlot; key: string; content: SlotContent<T> };
export type ClosetSegmentLayout<T> = { kind: SegmentKind; index: number; placed: PlacedSlot<T>[] };

/** N middle tiles: one per `slotsPerTile` pieces, at least one. */
export function tileCountFor(garmentCount: number, slotsPerTile: number): number {
  return Math.max(1, Math.ceil(garmentCount / slotsPerTile));
}

export function preferredZone(category: string): ClosetZone {
  const group = getCategoryGroup(category);
  if (group === 'outerwear' || group === 'dresses') return 'rod';
  if (group === 'bottoms') return 'shelf2';
  return 'shelf1';
}

export function segmentKinds(tileCount: number): SegmentKind[] {
  return ['left', ...Array.from({ length: tileCount }, () => 'tile' as const), 'right'];
}

export function packCloset<T extends { category: string }>(
  items: readonly T[],
  slotMap: ClosetSlotMap,
  tileCount = tileCountFor(items.length, slotMap.tile.length),
): ClosetSegmentLayout<T>[] {
  const slots = segmentKinds(tileCount).flatMap((kind, segment) =>
    slotMap[kind].map((slot, index) => ({ slot, segment, key: `${segment}-${index}` })),
  );
  const contents: (SlotContent<T> | null)[] = slots.map(() => null);
  contents[0] = { kind: 'add' }; // left panel's first rod slot

  const firstFree = (zone: ClosetZone | null) => contents.findIndex((c, i) => c === null && (zone === null || slots[i].slot.zone === zone));

  // Pass 1: every piece gets its own zone while it has room. Pass 2: overflow takes any free slot,
  // so an early overflowing category can't take the slots a later category needs.
  const overflow: T[] = [];
  for (const item of items) {
    const index = firstFree(preferredZone(item.category));
    if (index === -1) overflow.push(item);
    else contents[index] = { kind: 'garment', item };
  }
  for (const item of overflow) {
    const index = firstFree(null);
    // Capacity always covers the pieces (the tiles alone hold them all); this guards misuse.
    if (index !== -1) contents[index] = { kind: 'garment', item };
  }

  return segmentKinds(tileCount).map((kind, segment) => ({
    kind,
    index: segment,
    placed: slots.flatMap((entry, i) => {
      const content = contents[i];
      return entry.segment === segment && content ? [{ slot: entry.slot, key: entry.key, content }] : [];
    }),
  }));
}
