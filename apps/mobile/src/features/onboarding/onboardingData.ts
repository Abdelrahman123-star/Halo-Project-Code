import type { ReactNode } from 'react';

export type OnboardingSlideData = {
  key: string;
  tag: string;
  title: string;
  subtitle: string;
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    key: 'mirror',
    tag: 'AI AMBIENT MIRROR',
    title: 'Meet your smartest\nreflection.',
    subtitle:
      'HALO is your personal fashion companion — transforming daily dressing into a peaceful, intelligent experience.',
  },
  {
    key: 'avatar',
    tag: '3D AVATAR SCAN',
    title: 'Your stylized\n3D avatar.',
    subtitle:
      'Scan yourself from 3 angles — front, back, and face. HALO constructs your personalized 3D avatar with true proportions.',
  },
  {
    key: 'wardrobe',
    tag: 'INTELLIGENT CLOSET',
    title: 'Wear your wardrobe\ndigitally.',
    subtitle:
      'Photograph real clothes to create 3D garment templates. Mix, match, and style before you ever step out.',
  },
];
