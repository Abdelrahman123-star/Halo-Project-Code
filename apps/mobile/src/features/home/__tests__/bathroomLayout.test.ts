import {
  BATHROOM_CROP_CENTER_X,
  BATHROOM_IMAGE_SIZE,
  MAKEUP_REGION,
  SKINCARE_REGION,
  VANITY_MIRROR_REGION,
} from '../bathroom/bathroomLayout';
import { coverLayout, regionRect, type Rect } from '../bedroom/bedroomLayout';

function visibleFraction(rect: Rect, screenWidth: number): number {
  const visible = Math.min(rect.x + rect.width, screenWidth) - Math.max(rect.x, 0);
  return Math.max(visible, 0) / rect.width;
}

describe('bathroom layout', () => {
  it.each([
    [390, 844],
    [360, 800],
    [430, 932],
    [375, 667],
  ])('on a %ix%i phone keeps the mirror whole and both shelves mostly visible', (w, h) => {
    const layout = coverLayout(w, h, BATHROOM_IMAGE_SIZE, BATHROOM_CROP_CENTER_X);
    // Cover: no gaps at the edges.
    expect(layout.x).toBeLessThanOrEqual(0);
    expect(layout.x + layout.width).toBeGreaterThanOrEqual(w - 0.001);

    const mirror = regionRect(layout, VANITY_MIRROR_REGION);
    expect(visibleFraction(mirror, w)).toBeCloseTo(1, 5);
    expect(visibleFraction(regionRect(layout, SKINCARE_REGION), w)).toBeGreaterThan(0.6);
    expect(visibleFraction(regionRect(layout, MAKEUP_REGION), w)).toBeGreaterThan(0.6);
  });

  it('without a crop centre keeps the bedroom behaviour (right edge kept)', () => {
    const keepRight = coverLayout(390, 844, BATHROOM_IMAGE_SIZE);
    const centred = coverLayout(390, 844, BATHROOM_IMAGE_SIZE, BATHROOM_CROP_CENTER_X);
    expect(keepRight.x).toBeLessThan(centred.x);
  });
});
