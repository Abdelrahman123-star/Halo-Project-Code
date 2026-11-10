/**
 * Geometry for the interactive bedroom image (`assets/girl-bedroom.png`).
 *
 * The image is drawn "cover" (fills the screen, never stretched). We compute
 * its on-screen rectangle ourselves instead of using resizeMode="cover", so
 * the wardrobe / mirror hotspots can be placed exactly over the furniture on
 * any screen size.
 */

export const BEDROOM_IMAGE_SIZE = { width: 941, height: 1670 } as const;

/** Fractions (0–1) of the source image. */
export type ImageRegion = { left: number; top: number; width: number; height: number };

/** Glass wardrobe: four lit columns, top cabinet edge to the bottom drawers. */
export const WARDROBE_REGION: ImageRegion = { left: 0.068, top: 0.172, width: 0.688, height: 0.52 };

/** Illuminated full-length mirror on the right wall. */
export const MIRROR_REGION: ImageRegion = { left: 0.772, top: 0.207, width: 0.212, height: 0.477 };

/** Image-fraction points where the hint icons sit on the furniture. */
export type ImagePoint = { x: number; y: number };
/** Middle of the wardrobe, level with the handles (x is re-centred on the visible part on screen). */
export const WARDROBE_HINT_POINT: ImagePoint = { x: 0.414, y: 0.432 };
/** Top edge of the round pouf (ottoman) in front of the wardrobe, as an image fraction. */
export const POUF_TOP_Y = 0.632;
/** On the mirror glass, centred, in its upper part. */
export const MIRROR_HINT_POINT: ImagePoint = { x: 0.878, y: 0.272 };

export type Rect = { x: number; y: number; width: number; height: number };

/**
 * Right edge (as an image fraction) that must stay on screen when the sides
 * are cropped. Phones are taller than the image, so a centred crop would cut
 * the narrow mirror in half; we crop the left edge (plant/shelf) instead.
 */
const KEEP_VISIBLE_RIGHT = 0.99;

export function coverLayout(
  screenWidth: number,
  screenHeight: number,
  image: { width: number; height: number } = BEDROOM_IMAGE_SIZE,
  /**
   * Image x-fraction to centre when the sides are cropped (e.g. midway between
   * two objects at opposite edges). Omitted: keep the right edge (bedroom mirror).
   */
  cropCenterX?: number,
): Rect {
  const scale = Math.max(screenWidth / image.width, screenHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  // Horizontal crop, never leaving a gap at either edge.
  const minLeft = screenWidth - width;
  const preferredLeft =
    cropCenterX === undefined ? screenWidth - KEEP_VISIBLE_RIGHT * width : screenWidth / 2 - cropCenterX * width;
  const x = Math.min(0, Math.max(minLeft, preferredLeft));
  // Vertical crop (wide screens/tablets): centred.
  const y = (screenHeight - height) / 2;

  return { x, y, width, height };
}

/** Screen rectangle of an image region, given the image's on-screen layout. */
export function regionRect(layout: Rect, region: ImageRegion): Rect {
  return {
    x: layout.x + region.left * layout.width,
    y: layout.y + region.top * layout.height,
    width: region.width * layout.width,
    height: region.height * layout.height,
  };
}

/** Screen position of an image-fraction point. */
export function imagePoint(layout: Rect, point: ImagePoint): { x: number; y: number } {
  return { x: layout.x + point.x * layout.width, y: layout.y + point.y * layout.height };
}

/** Centre of the part of `rect` that is actually on screen (for label placement). */
export function visibleCenterX(rect: Rect, screenWidth: number): number {
  const left = Math.max(rect.x, 0);
  const right = Math.min(rect.x + rect.width, screenWidth);
  return (left + right) / 2;
}
