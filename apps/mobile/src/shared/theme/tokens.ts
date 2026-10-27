// Design tokens (ivory / charcoal / silver, muted lavender accent) — see AGENTS.md §5.
// Keep every colour, spacing and radius here so screens never hardcode style values.
export const colors = {
  background: '#F6F2EA', // warm ivory
  surface: '#FFFFFF',
  text: '#25252B', // charcoal
  textMuted: '#74747D',
  border: '#DDD8CE',
  silver: '#B9BCC4',
  accent: '#7C77B9', // muted lavender
  accentText: '#FFFFFF',
  danger: '#B3413B',
  success: '#3F7A5A',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;
export const radius = { md: 14, lg: 22 } as const;
export const fontSize = { body: 16, small: 13, title: 28, display: 40 } as const;
