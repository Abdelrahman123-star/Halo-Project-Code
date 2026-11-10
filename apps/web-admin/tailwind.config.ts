import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        halo: {
          canvas: '#EEF0FA',
          canvasSoft: '#F6F3FC',
          plum: '#3D3055',
          plumMuted: '#6D5D88',
          periwinkle: '#8B7BEF',
          periwinkleLight: '#EFEAFF',
          lilac: '#C9B6F6',
          blush: '#F2C4E2',
          powder: '#BCD6F6',
          mint: '#D8F3E5',
          amber: '#FDECC8',
          rose: '#FCD8DF',
        },
      },
      backgroundImage: {
        'pearl-gradient': 'linear-gradient(135deg, #F2C4E2 0%, #D5C6F6 50%, #BCD6F6 100%)',
        'pearl-active': 'linear-gradient(135deg, #EAD7FF 0%, #DFCEFD 100%)',
        'glass-sheen': 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 100%)',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(61, 48, 85, 0.04), 0 1px 3px 0 rgba(61, 48, 85, 0.02)',
        'glass-md': '0 8px 30px 0 rgba(61, 48, 85, 0.08), 0 2px 6px 0 rgba(61, 48, 85, 0.04)',
        'glass-lg': '0 16px 48px 0 rgba(61, 48, 85, 0.12), 0 4px 12px 0 rgba(61, 48, 85, 0.06)',
        'glow-purple': '0 0 24px -4px rgba(139, 123, 239, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;

