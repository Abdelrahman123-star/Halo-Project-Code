/**
 * STATIC SAMPLE DATA for the bathroom's Skin Recommendations and Makeup pages.
 *
 * Nothing here comes from the user's skin, photos or products, and no
 * analysis runs. Both pages are labelled "Preview · sample data". Replace these
 * constants with real sources later; the types are the contract the cards render.
 * Product suggestions are generic product types, never brand claims.
 */
import type { Tone } from '../dashboard/dashboardTheme';

export type RoutineStep = {
  id: string;
  step: string;
  product: string;
  /** Short reason, tied to the (sample) wellness metrics. */
  why: string;
};

export type ProductPick = {
  id: string;
  name: string;
  reason: string;
  /** Which wellness metric the pick targets. */
  focus: string;
  tone: Tone;
};

export type ShadeMatch = {
  name: string;
  code: string;
  undertone: string;
  swatch: string;
  /** Neighbouring shades, lightest first, for context. */
  neighbours: readonly string[];
};

export type MakeupLook = {
  id: string;
  name: string;
  occasion: string;
  palette: readonly string[];
  steps: readonly string[];
};

export const SAMPLE_MORNING_ROUTINE: readonly RoutineStep[] = [
  { id: 'cleanse', step: 'Cleanse', product: 'Gentle gel cleanser', why: 'Keeps the skin barrier calm' },
  { id: 'serum', step: 'Treat', product: 'Vitamin C serum', why: 'Supports clarity (78%)' },
  { id: 'moisturise', step: 'Hydrate', product: 'Light gel moisturiser', why: 'Hydration is 64% — room to grow' },
  { id: 'spf', step: 'Protect', product: 'Broad-spectrum SPF 50', why: 'Every morning, even on cloudy days' },
];

export const SAMPLE_EVENING_ROUTINE: readonly RoutineStep[] = [
  { id: 'double-cleanse', step: 'Cleanse', product: 'Cleansing balm, then gel cleanser', why: 'Lifts SPF and makeup' },
  { id: 'treat', step: 'Treat', product: 'Niacinamide serum', why: 'Helps the 2 mild concerns settle' },
  { id: 'repair', step: 'Repair', product: 'Ceramide night cream', why: 'Overnight barrier support' },
];

export const SAMPLE_PRODUCT_PICKS: readonly ProductPick[] = [
  { id: 'ha', name: 'Hyaluronic acid serum', reason: 'Draws in moisture for plumper skin', focus: 'Hydration', tone: 'blue' },
  { id: 'niacinamide', name: 'Niacinamide 5–10%', reason: 'Evens tone and calms redness', focus: 'Skin concerns', tone: 'blush' },
  { id: 'aha', name: 'Gentle lactic acid (2×/week)', reason: 'Soft exfoliation for a brighter look', focus: 'Clarity', tone: 'lilac' },
];

export const SAMPLE_SHADE_MATCH: ShadeMatch = {
  name: 'Warm beige',
  code: 'W3',
  undertone: 'Warm · golden',
  swatch: '#D9A882',
  neighbours: ['#E8C2A2', '#D9A882', '#C68F68'],
};

export const SAMPLE_LOOKS: readonly MakeupLook[] = [
  {
    id: 'soft-glam',
    name: 'Soft glam',
    occasion: 'Brunch with Sara · today',
    palette: ['#E7B7A8', '#C98B86', '#B9A8F3', '#7A4E5C'],
    steps: ['Skin tint + concealer', 'Rosy-taupe lid wash', 'Mauve lip'],
  },
  {
    id: 'fresh-day',
    name: 'Fresh daytime',
    occasion: 'Everyday',
    palette: ['#F3D3C2', '#E9A9A0', '#F2C4E2', '#D98C8C'],
    steps: ['Light coverage', 'Cream blush', 'Tinted balm'],
  },
  {
    id: 'evening-glow',
    name: 'Evening glow',
    occasion: 'Dinner party · in 9 days',
    palette: ['#D8B4E2', '#A47DAB', '#E8C39E', '#8E3B5A'],
    steps: ['Satin foundation', 'Shimmer lid + liner', 'Berry lip'],
  },
];
