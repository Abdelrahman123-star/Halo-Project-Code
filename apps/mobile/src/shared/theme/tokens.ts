// HALO Design Tokens — Architectural luxury, peaceful futuristic palette.
// See AGENTS.md §5 and UI/UX design specifications.
export const colors = {
  // Primary Architectural Tones
  background: '#171B27', // Midnight blue-black
  backgroundWarm: '#F4F0E8', // Warm ivory
  softCream: '#E8E0D4', // Soft cream
  charcoal: '#24262A', // Warm charcoal
  midnight: '#171B27', // Midnight blue-black
  lavender: '#B8AED8', // Muted lavender
  silver: '#C9CDD4', // Soft silver
  luminousWhite: '#FFFDF8', // Gentle luminous white
  iceBlue: '#B8DDF0', // Pale ice blue

  // Functional Surfaces
  surface: '#1F2433', // Deep midnight glass
  surfaceWarm: '#FFFFFF', // Clean warm card surface
  surfaceElevated: '#282F42', // Elevated architectural panel
  surfaceMuted: 'rgba(255, 253, 248, 0.05)',
  surfaceGlass: 'rgba(23, 27, 39, 0.72)',
  surfaceGlassWarm: 'rgba(244, 240, 232, 0.88)',

  // Typography
  text: '#FFFDF8', // Luminous white on dark
  textWarm: '#24262A', // Charcoal on light
  textMuted: '#9BA2B0', // Subdued architectural slate
  textMutedWarm: '#76747A',

  // Borders & Halos
  border: 'rgba(201, 205, 212, 0.18)',
  borderWarm: 'rgba(36, 38, 42, 0.12)',
  haloRing: 'rgba(184, 174, 216, 0.45)', // Luminous lavender halo
  haloGlow: 'rgba(255, 253, 248, 0.15)',
  doorGlow: 'rgba(232, 224, 212, 0.28)', // Light spilling under door

  // Accents & State
  accent: '#B8AED8', // Muted lavender
  accentWarm: '#24262A',
  accentText: '#171B27',
  danger: '#E06D63',
  success: '#5FA87F',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 52,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 9999,
} as const;

export const fontSize = {
  micro: 11,
  small: 13,
  body: 15,
  heading: 20,
  title: 28,
  display: 36,
  hero: 44,
} as const;

