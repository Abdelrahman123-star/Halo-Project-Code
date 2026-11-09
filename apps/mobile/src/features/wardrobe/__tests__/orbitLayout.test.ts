import {
  categoryPoints,
  CENTRE_DIAMETER,
  countByGroup,
  ORBIT_ASPECT,
  ORBIT_MAX_PIECES,
  orbitPieces,
  orbitSlots,
} from '../atelier/orbitLayout';

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe.each([320, 350, 390])('orbit geometry at width %i', (width) => {
  const height = width * ORBIT_ASPECT;
  const centre = { x: width / 2, y: height / 2 };

  it.each([1, 3, 5, 8])('places %i pieces inside the orbit without overlaps', (count) => {
    const slots = orbitSlots(count, width);
    expect(slots).toHaveLength(count);
    for (const slot of slots) {
      const half = slot.size / 2;
      // Inside the orbit box.
      expect(slot.x - half).toBeGreaterThanOrEqual(0);
      expect(slot.x + half).toBeLessThanOrEqual(width);
      expect(slot.y - half).toBeGreaterThanOrEqual(0);
      expect(slot.y + half).toBeLessThanOrEqual(height);
      // Clear of the centre disc (using the slot's circumscribed circle).
      expect(distance(slot, centre)).toBeGreaterThan((CENTRE_DIAMETER * width) / 2 + half * Math.SQRT2 * 0.7);
    }
    // Pieces don't overlap each other.
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        expect(distance(slots[i], slots[j])).toBeGreaterThan((slots[i].size + slots[j].size) / 2);
      }
    }
  });

  it('keeps category pearls clear of every piece', () => {
    const slots = orbitSlots(8, width);
    for (const point of categoryPoints(width)) {
      expect(point.y).toBeGreaterThan(0);
      expect(point.y).toBeLessThan(height);
      for (const slot of slots) expect(distance(point, slot)).toBeGreaterThan(slot.size / 2 + 12);
    }
  });
});

describe('orbitPieces', () => {
  const items = [
    { id: 'jeans', category: 'trousers', created_at: '2026-11-01T00:00:00Z' },
    { id: 'dress', category: 'dress', created_at: '2026-11-08T00:00:00Z' },
    { id: 'tee', category: 'short_sleeved_shirt', created_at: '2026-11-05T00:00:00Z' },
  ];

  it('shows the newest pieces, all emphasised, for All', () => {
    expect(orbitPieces(items, 'all').map((p) => p.item.id)).toEqual(['dress', 'tee', 'jeans']);
    expect(orbitPieces(items, 'all').every((p) => p.emphasized)).toBe(true);
  });

  it('brings the selected category forward and dims the rest', () => {
    const pieces = orbitPieces(items, 'bottoms');
    expect(pieces[0]).toEqual({ item: items[0], emphasized: true });
    expect(pieces.slice(1).every((p) => !p.emphasized)).toBe(true);
  });

  it('never exceeds the orbit capacity', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, category: 'skirt', created_at: `2026-10-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z` }));
    expect(orbitPieces(many, 'all')).toHaveLength(ORBIT_MAX_PIECES);
  });
});

describe('countByGroup', () => {
  it('counts pieces per category', () => {
    expect(countByGroup([{ category: 'dress' }, { category: 'skirt' }, { category: 'trousers' }])).toEqual({
      tops: 0,
      bottoms: 2,
      dresses: 1,
      outerwear: 0,
    });
  });
});
