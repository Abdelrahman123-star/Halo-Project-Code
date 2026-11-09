/**
 * Colours for the closet wardrobe, one palette per closet set so the page
 * matches its images: lilac + pearl for the women's closet, steel + navy for
 * the men's. Same gender rule as the closet images (male → men's; female or
 * unknown → women's). Components read the active palette with `useClosetPalette()`.
 */
import type { Gender } from '@/features/auth/schemas';

export type ClosetPalette = {
  /** Page background. */
  base: string;
  /** Soft background wash behind the page (top → bottom); null uses the lilac blob background. */
  backgroundWash: readonly [string, string] | null;
  text: string;
  heading: string;
  muted: string;
  accent: string;
  /** Dashed Add a Piece outline, empty-photo hanger, callout dots. */
  outline: string;
  /** Add a Piece stage fill and "+" circle gradient. */
  addStage: string;
  addCircle: readonly [string, string];
  /** Highlight gradient: buttons, rod lines, the detail sheet. */
  pearl: readonly [string, string, string];
  /** Text on top of the highlight gradient. */
  onPearl: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  /** Selected pill / switch border. */
  selectedBorder: string;
  /** Drop shadows under cards and floating pills. */
  shadow: string;
  /** Pool of shadow where a folded piece meets the shelf. */
  shelfShadow: string;
  /** Fallback stage behind a photo with no usable colour. */
  neutralStage: string;
  /** Dim veil behind sheets. */
  veil: string;
  danger: string;
};

const SHARED_GLASS = {
  glass: 'rgba(255, 255, 255, 0.62)',
  glassStrong: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.9)',
} as const;

export const WOMENS_PALETTE: ClosetPalette = {
  base: '#EEF2FB',
  backgroundWash: null,
  text: '#3D3055',
  heading: '#6B5299',
  muted: '#8A76A6',
  accent: '#7E5FA8',
  outline: '#B9A8F3',
  addStage: 'rgba(236, 229, 251, 0.6)',
  addCircle: ['#E7D9FB', '#CDB8F4'],
  pearl: ['#F2C4E2', '#D5C6F6', '#BCD6F6'],
  onPearl: '#3D3055',
  ...SHARED_GLASS,
  selectedBorder: '#D5C6F6',
  shadow: '#9C88C8',
  shelfShadow: 'rgba(165, 139, 216, 0.28)',
  neutralStage: '#F4F0FB',
  veil: 'rgba(61, 48, 85, 0.32)',
  danger: '#B4466E',
};

/** Taken from the men's closet images: steel-white walls, navy frames, cool LED light. */
export const MENS_PALETTE: ClosetPalette = {
  base: '#E8ECF3',
  backgroundWash: ['#F1F4F9', '#DDE3EC'],
  text: '#1C2A4A',
  heading: '#2E3F66',
  muted: '#66748C',
  accent: '#3E5A8A',
  outline: '#8FA3C4',
  addStage: 'rgba(220, 230, 242, 0.65)',
  addCircle: ['#C9D7EA', '#8FA6C8'],
  pearl: ['#E3EBF5', '#C7D5E8', '#A9BDD8'],
  onPearl: '#1C2A4A',
  ...SHARED_GLASS,
  selectedBorder: '#A9BDD8',
  shadow: '#6F829F',
  shelfShadow: 'rgba(62, 90, 138, 0.25)',
  neutralStage: '#EEF2F7',
  veil: 'rgba(20, 32, 58, 0.36)',
  danger: '#A3425A',
};

export function closetPaletteFor(gender: Gender | null): ClosetPalette {
  return gender === 'male' ? MENS_PALETTE : WOMENS_PALETTE;
}

/** Matches the screen's horizontal padding. */
export const PAGE_GUTTER = 20;
