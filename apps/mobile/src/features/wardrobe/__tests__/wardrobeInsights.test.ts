import { filterGarments, piecesLabel } from '../atelier/wardrobeInsights';

const colour = (name: string, hex: string, percentage: number) => ({ color_name: name, hex, rgb: [0, 0, 0], percentage });

const items = [
  { id: 'a', category: 'trousers', created_at: '2026-11-01T10:00:00Z', colors: [colour('Navy', '#1F2A44', 70), colour('White', '#FFFFFF', 20)] },
  { id: 'b', category: 'dress', created_at: '2026-11-08T10:00:00Z', colors: [colour('Blush', '#F2C4E2', 80)] },
  { id: 'c', category: 'short_sleeved_shirt', created_at: '2026-11-05T10:00:00Z', colors: [colour('navy', '#22304F', 90)] },
];

describe('filterGarments', () => {
  it('filters by category group', () => {
    expect(filterGarments(items, 'bottoms').map((i) => i.id)).toEqual(['a']);
    expect(filterGarments(items, 'all')).toHaveLength(3);
  });
});

describe('piecesLabel', () => {
  it('pluralises', () => {
    expect(piecesLabel(1)).toBe('1 piece');
    expect(piecesLabel(12)).toBe('12 pieces');
  });
});
