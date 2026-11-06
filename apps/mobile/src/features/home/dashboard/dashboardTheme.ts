/**
 * Dashboard colour tokens. Everything here is taken from colours already used
 * on Home / auth: the auth text tokens, the home header plums, and the pearl
 * orb pastels (blush, lilac, powder blue, mint, champagne).
 */
import { authTheme } from '@/features/auth/components/AuthComponents';

export type Tone = 'lilac' | 'blue' | 'blush' | 'mint' | 'champagne';

export const dashboardTheme = {
  text: authTheme.textMain,
  plum: '#6B5299',
  muted: '#8A76A6',
  accent: '#7E5FA8',
  hairline: authTheme.dividerColor,
  track: 'rgba(165, 148, 195, 0.18)',
  cardBg: authTheme.inputBg,
  cardBorder: authTheme.cardBorder,
  pearlGradient: authTheme.pearlBtnGradient,
  /** Gradient pairs (light → strong) for bars, rings and charts. */
  toneGradient: {
    lilac: ['#D5C6F6', '#A996F2'],
    blue: ['#CFE3FA', '#7FC4F8'],
    blush: ['#F8D3E8', '#F27FC3'],
    mint: ['#D3F3EE', '#5EDDD5'],
    champagne: ['#FBEADD', '#F2B98F'],
  } satisfies Record<Tone, readonly [string, string]>,
  /** Soft tinted backgrounds for icon chips. */
  toneChip: {
    lilac: 'rgba(185, 168, 243, 0.24)',
    blue: 'rgba(163, 207, 246, 0.28)',
    blush: 'rgba(245, 180, 216, 0.28)',
    mint: 'rgba(174, 233, 224, 0.34)',
    champagne: 'rgba(247, 220, 200, 0.45)',
  } satisfies Record<Tone, string>,
  /** Icon stroke colour that reads well on each chip. */
  toneInk: {
    lilac: '#7E5FA8',
    blue: '#4F8FC9',
    blush: '#C25A97',
    mint: '#3A9E97',
    champagne: '#B97A4E',
  } satisfies Record<Tone, string>,
} as const;
