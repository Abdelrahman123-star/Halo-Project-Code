/**
 * Graphics quality presets for HALO 3D Closet.
 * Optimized for smooth performance across budget Android & iPhones.
 */

export interface ClosetQualityProfile {
  name: "light" | "standard" | "high";
  pixelRatio: number;
  shadows: boolean;
  antialias: boolean;
  maxActiveHangers: number;
}

export const QUALITY_PRESETS: Record<"light" | "standard" | "high", ClosetQualityProfile> = {
  light: {
    name: "light",
    pixelRatio: 1,
    shadows: false,
    antialias: false,
    maxActiveHangers: 12,
  },
  standard: {
    name: "standard",
    pixelRatio: 1.5,
    shadows: true,
    antialias: true,
    maxActiveHangers: 24,
  },
  high: {
    name: "high",
    pixelRatio: 2,
    shadows: true,
    antialias: true,
    maxActiveHangers: 36,
  },
};

