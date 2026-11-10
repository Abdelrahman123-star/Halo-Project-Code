import {
  BEDROOM_IMAGE_SIZE,
  coverLayout,
  MIRROR_REGION,
  regionRect,
  visibleCenterX,
  WARDROBE_REGION,
} from '../bedroom/bedroomLayout';

const ASPECT = BEDROOM_IMAGE_SIZE.width / BEDROOM_IMAGE_SIZE.height;

describe('coverLayout', () => {
  it.each([
    [390, 844],
    [360, 800],
    [430, 932],
    [375, 667],
  ])('fills a %ix%i phone without distortion and keeps the mirror fully visible', (w, h) => {
    const layout = coverLayout(w, h);
    expect(layout.width / layout.height).toBeCloseTo(ASPECT, 5);
    expect(layout.width).toBeGreaterThanOrEqual(w - 0.001);
    expect(layout.height).toBeGreaterThanOrEqual(h - 0.001);
    // No gaps at any edge.
    expect(layout.x).toBeLessThanOrEqual(0);
    expect(layout.x + layout.width).toBeGreaterThanOrEqual(w - 0.001);

    const mirror = regionRect(layout, MIRROR_REGION);
    expect(mirror.x).toBeGreaterThanOrEqual(0);
    expect(mirror.x + mirror.width).toBeLessThanOrEqual(w);
  });

  it('crops top/bottom evenly on screens wider than the image', () => {
    const layout = coverLayout(834, 1194); // tablet
    expect(layout.x).toBeCloseTo(0, 5);
    expect(layout.width).toBeCloseTo(834, 5);
    expect(layout.y).toBeLessThanOrEqual(0);
  });
});

describe('regionRect / visibleCenterX', () => {
  it('maps image fractions to screen points and centres on the visible part', () => {
    const layout = { x: -80, y: 0, width: 475, height: 844 };
    const wardrobe = regionRect(layout, WARDROBE_REGION);
    expect(wardrobe.x).toBeCloseTo(-80 + 0.068 * 475, 5);
    expect(wardrobe.y).toBeCloseTo(0.172 * 844, 5);
    const centre = visibleCenterX(wardrobe, 390);
    expect(centre).toBeCloseTo((0 + wardrobe.x + wardrobe.width) / 2, 5);
  });
});
