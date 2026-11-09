import { buildColourStory, filterGarments, latestGarment, piecesLabel } from '../atelier/wardrobeInsights';

const colour = (name: string, hex: string, percentage: number) => ({ color_name: name, hex, rgb: [0, 0, 0], percentage });

const items = [
  { id: 'a', category: 'trousers', created_at: '2026-11-01T10:00:00Z', colors: [colour('Navy', '#1F2A44', 70), colour('White', '#FFFFFF', 20)] },
  { id: 'b', category: 'dress', created_at: '2026-11-08T10:00:00Z', colors: [colour('Blush', '#F2C4E2', 80)] },
  { id: 'c', category: 'short_sleeved_shirt', created_at: '2026-11-05T10:00:00Z', colors: [colour('navy', '#22304F', 90)] },
];

describe('latestGarment', () => {
  it('picks the newest piece by created_at', () => {
    expect(latestGarment(items)?.id).toBe('b');
  });

  it('is null for an empty wardrobe', () => {
    expect(latestGarment([])).toBeNull();
  });
});

describe('buildColourStory', () => {
  it('groups colour names case-insensitively, most common first', () => {
    const story = buildColourStory(items);
    expect(story[0]).toMatchObject({ key: 'navy', garmentCount: 2 });
    expect(story.map((s) => s.key)).toEqual(['navy', 'blush', 'white']);
  });

  it('uses the hex where the colour covers the most area', () => {
    expect(buildColourStory(items)[0].hex).toBe('#22304F');
  });

  it('respects the limit and handles garments without colours', () => {
    expect(buildColourStory(items, 1)).toHaveLength(1);
    expect(buildColourStory([{ id: 'x', category: 'skirt', created_at: '2026-01-01', colors: [] }])).toEqual([]);
  });
});

describe('filterGarments', () => {
  it('filters by category group', () => {
    expect(filterGarments(items, 'bottoms', null).map((i) => i.id)).toEqual(['a']);
    expect(filterGarments(items, 'all', null)).toHaveLength(3);
  });

  it('filters by colour and combines with category', () => {
    expect(filterGarments(items, 'all', 'navy').map((i) => i.id)).toEqual(['a', 'c']);
    expect(filterGarments(items, 'tops', 'navy').map((i) => i.id)).toEqual(['c']);
  });
});

describe('piecesLabel', () => {
  it('pluralises', () => {
    expect(piecesLabel(1)).toBe('1 piece');
    expect(piecesLabel(12)).toBe('12 pieces');
  });
});
