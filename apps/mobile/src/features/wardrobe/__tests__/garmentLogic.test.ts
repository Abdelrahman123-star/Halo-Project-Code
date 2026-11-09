import { attributeCallouts, filterByGroup, STAGE_TINTS, stageTint, toPercent } from '../closet/garmentLogic';

const colour = (name: string, hex: string, percentage: number) => ({ color_name: name, hex, percentage });
const group = (predicted: string | null, confidence: number | null) => ({ predicted, confidence, top_candidates: [] });

const items = [
  { id: 'a', category: 'trousers', colors: [colour('Navy', '#1F2A44', 70), colour('White', '#FFFFFF', 20)] },
  { id: 'b', category: 'dress', colors: [colour('Blush', '#F2A6C8', 80)] },
  { id: 'c', category: 'short_sleeved_shirt', colors: [colour('navy', '#22304F', 90)] },
  { id: 'd', category: 'long_sleeved_outwear', colors: [] },
];

describe('filterByGroup', () => {
  it('keeps the chosen category, or everything for All', () => {
    expect(filterByGroup(items, 'bottoms').map((i) => i.id)).toEqual(['a']);
    expect(filterByGroup(items, 'outerwear').map((i) => i.id)).toEqual(['d']);
    expect(filterByGroup(items, 'all')).toHaveLength(4);
  });
});

describe('stageTint', () => {
  it('maps the main colour to a pastel family', () => {
    expect(stageTint({ colors: [colour('Navy', '#1F2A6E', 90)] })).toBe(STAGE_TINTS.powderBlue);
    expect(stageTint({ colors: [colour('Pink', '#E8749A', 90)] })).toBe(STAGE_TINTS.blush);
    expect(stageTint({ colors: [colour('Olive', '#5A7A3A', 90)] })).toBe(STAGE_TINTS.mint);
    expect(stageTint({ colors: [colour('Camel', '#C19A6B', 90)] })).toBe(STAGE_TINTS.champagne);
    expect(stageTint({ colors: [colour('Purple', '#7B4FB5', 90)] })).toBe(STAGE_TINTS.lilac);
  });

  it('falls back to neutral for greys, whites, blacks and unknown colours', () => {
    expect(stageTint({ colors: [colour('Grey', '#808080', 90)] })).toBe(STAGE_TINTS.neutral);
    expect(stageTint({ colors: [colour('White', '#FFFFFF', 90)] })).toBe(STAGE_TINTS.neutral);
    expect(stageTint({ colors: [] })).toBe(STAGE_TINTS.neutral);
  });
});

describe('attributeCallouts', () => {
  it('lists style, pattern, fabric and main colour with their AI confidence', () => {
    const callouts = attributeCallouts({
      category: 'long_sleeved_shirt',
      attributes: { subtype: group('Knit Sweater', 86), pattern: group('Striped', 0.71), fabric: group(null, null) },
      colors: [colour('Navy', '#1F2A44', 70)],
    });
    expect(callouts).toEqual([
      { field: 'subtype', label: 'Style', value: 'Knit Sweater', confidence: 86 },
      { field: 'pattern', label: 'Pattern', value: 'Striped', confidence: 71 },
      { field: 'colour', label: 'Colour', value: 'Navy', confidence: null },
    ]);
  });

  it('falls back to the category for style when the subtype is unknown', () => {
    const [style] = attributeCallouts({ category: 'dress', attributes: { subtype: group(null, null), pattern: group(null, null), fabric: group(null, null) }, colors: [] });
    expect(style).toMatchObject({ value: 'Dress', confidence: null });
  });
});

describe('formatting helpers', () => {
  it('converts confidences to whole percents', () => {
    expect(toPercent(0.86)).toBe(86);
    expect(toPercent(86)).toBe(86);
    expect(toPercent(null)).toBeNull();
  });
});
