/**
 * Geometry for the interactive bathroom image (`assets/girl-bathroom.png`),
 * as fractions of the source image. Screen placement uses the shared
 * `coverLayout` / `regionRect` / `imagePoint` helpers from the bedroom.
 */
import type { ImagePoint, ImageRegion } from '../bedroom/bedroomLayout';

export const BATHROOM_IMAGE_SIZE = { width: 941, height: 1672 } as const;

/**
 * The skincare shelf (left edge) and makeup shelf (right edge) sit near opposite
 * sides, so when phones crop the sides we centre between them, not on the image.
 */
export const BATHROOM_CROP_CENTER_X = 0.532;

/** Left skincare shelves: three floating shelves of bottles plus the counter tray. */
export const SKINCARE_REGION: ImageRegion = { left: 0.07, top: 0.272, width: 0.205, height: 0.245 };

/** Round illuminated vanity mirror (square box around the circle). */
export const VANITY_MIRROR_REGION: ImageRegion = { left: 0.306, top: 0.26, width: 0.404, height: 0.227 };

/** Right makeup shelves: palettes, foundations, brushes. */
export const MAKEUP_REGION: ImageRegion = { left: 0.765, top: 0.31, width: 0.228, height: 0.198 };

/** Where each hint icon sits on its object. */
export const SKINCARE_HINT_POINT: ImagePoint = { x: 0.19, y: 0.395 };
export const VANITY_MIRROR_HINT_POINT: ImagePoint = { x: 0.508, y: 0.33 };
export const MAKEUP_HINT_POINT: ImagePoint = { x: 0.875, y: 0.41 };

/** Top of the marble wall panel above the shelves (labels for mirror/makeup rise just above it). */
export const WALL_PANEL_TOP_Y = 0.17;
/** Front edge of the vanity counter (the skincare label drops onto it). */
export const VANITY_FRONT_Y = 0.528;
