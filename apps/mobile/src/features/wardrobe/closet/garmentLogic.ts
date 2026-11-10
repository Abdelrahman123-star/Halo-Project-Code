/**
 * Pure garment logic for the closet wardrobe: the category filter, the pastel
 * stage tint behind each photo, and the AI attribute callouts shown in the
 * detail sheet. All values come from the user's saved garments; unknown
 * attributes are left out, never guessed.
 */
import { getCategoryGroup, getCategoryLabel, type WardrobeFilterGroup, type WardrobeItem } from '../types/wardrobe';

type Colour = { color_name: string; hex: string; percentage: number };

export type ClosetFilter = WardrobeFilterGroup;
export const FILTER_OPTIONS: readonly { value: ClosetFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'dresses', label: 'Dresses' },
];

export function filterByGroup<T extends Pick<WardrobeItem, 'category'>>(items: readonly T[], group: ClosetFilter): T[] {
  if (group === 'all') return [...items];
  return items.filter((item) => getCategoryGroup(item.category) === group);
}

// ── Stage tint ──────────────────────────────────────────────────────────────

export const STAGE_TINTS = {
  blush: '#FBE3EF',
  lilac: '#ECE5FB',
  powderBlue: '#E1EEFB',
  mint: '#E3F5F0',
  champagne: '#FBEBDD',
  neutral: '#F4F0FB',
} as const;

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h, s, l };
}

/** Soft pastel stage colour from the garment's main colour (by coverage); `neutral` for greys/whites/unknown. */
export function stageTint(item: { colors?: readonly Colour[] }, neutral: string = STAGE_TINTS.neutral): string {
  const main = [...(item.colors ?? [])].sort((a, b) => b.percentage - a.percentage)[0];
  const hsl = main ? hexToHsl(main.hex) : null;
  if (!hsl || hsl.s < 0.18 || hsl.l > 0.93 || hsl.l < 0.08) return neutral;
  const { h } = hsl;
  if (h >= 330 || h < 20) return STAGE_TINTS.blush;
  if (h < 70) return STAGE_TINTS.champagne;
  if (h < 190) return STAGE_TINTS.mint;
  if (h < 250) return STAGE_TINTS.powderBlue;
  return STAGE_TINTS.lilac;
}

// ── AI attribute callouts ───────────────────────────────────────────────────

export type AttributeField = 'subtype' | 'pattern' | 'fabric' | 'colour';

export type AttributeCallout = {
  field: AttributeField;
  label: string;
  value: string;
  /** 0–100, or null when the model gave no confidence for it. */
  confidence: number | null;
};

/** Confidences arrive as 0–1 or 0–100 depending on the source; show them as whole percents. */
export function toPercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value <= 1 ? value * 100 : value);
}

export function attributeCallouts(item: Pick<WardrobeItem, 'category' | 'attributes'> & { colors?: readonly Colour[] }): AttributeCallout[] {
  const callouts: AttributeCallout[] = [];
  const attrs = item.attributes;
  const subtype = attrs?.subtype?.predicted;
  callouts.push({
    field: 'subtype',
    label: 'Style',
    value: subtype || getCategoryLabel(item.category),
    confidence: subtype ? toPercent(attrs?.subtype?.confidence) : null,
  });
  if (attrs?.pattern?.predicted) {
    callouts.push({ field: 'pattern', label: 'Pattern', value: attrs.pattern.predicted, confidence: toPercent(attrs.pattern.confidence) });
  }
  if (attrs?.fabric?.predicted) {
    callouts.push({ field: 'fabric', label: 'Fabric', value: attrs.fabric.predicted, confidence: toPercent(attrs.fabric.confidence) });
  }
  const main = [...(item.colors ?? [])].sort((a, b) => b.percentage - a.percentage)[0];
  if (main) callouts.push({ field: 'colour', label: 'Colour', value: main.color_name, confidence: null });
  return callouts;
}
