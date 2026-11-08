import { boxSum } from "@/features/garment/api/imageFilters";
import {
  MAX_GARMENT_CHANNEL,
  applyStudioCleanup,
  type RgbaImage,
} from "@/features/garment/api/studioCleanup";

type Painter = (x: number, y: number) => [number, number, number] | null;

/** Builds an RGBA image + garment mask; `paint` returns null for background. */
function makeImage(width: number, height: number, paint: Painter): { image: RgbaImage; mask: Uint8Array } {
  const data = new Uint8Array(width * height * 4).fill(255);
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rgb = paint(x, y);
      if (!rgb) continue;
      const i = y * width + x;
      data.set([rgb[0], rgb[1], rgb[2], 255], i * 4);
      mask[i] = 1;
    }
  }
  return { image: { width, height, data }, mask };
}

function garmentLuminances(img: RgbaImage): number[] {
  const values: number[] = [];
  for (let i = 0; i < img.width * img.height; i++) {
    const [r, g, b] = [img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2]];
    if (r === 255 && g === 255 && b === 255) continue;
    values.push(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return values;
}

function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length);
}

const inGarment = (x: number, y: number) => x >= 15 && x < 75 && y >= 10 && y < 110;

describe("boxSum", () => {
  it("sums each clipped window", () => {
    const values = Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const sums = boxSum(values, 3, 3, 1);
    expect(sums[4]).toBe(45); // centre sees everything
    expect(sums[0]).toBe(1 + 2 + 4 + 5); // corner window is clipped
  });
});

describe("applyStudioCleanup", () => {
  it("frames the garment on pure white at 4:5 and caps garment pixels below white", () => {
    const { image, mask } = makeImage(90, 120, (x, y) => (inGarment(x, y) ? [250, 250, 250] : null));
    const out = applyStudioCleanup(image, mask);

    expect(out.width / out.height).toBeCloseTo(0.8, 1);
    expect(Array.from(out.data.slice(0, 4))).toEqual([255, 255, 255, 255]);
    const centre = ((out.height >> 1) * out.width + (out.width >> 1)) * 4;
    expect(out.data[centre]).toBeLessThanOrEqual(MAX_GARMENT_CHANNEL);
  });

  it("softens low-contrast crease shading", () => {
    const creased: Painter = (x, y) => {
      if (!inGarment(x, y)) return null;
      const shade = Math.floor(y / 3) % 2 === 0 ? 12 : -12; // fine crease stripes
      return [130 + shade, 100 + shade, 80 + shade];
    };
    const { image, mask } = makeImage(90, 120, creased);
    const before = stdDev(garmentLuminances(image));
    const after = stdDev(garmentLuminances(applyStudioCleanup(image, mask)));
    expect(after).toBeLessThan(before * 0.6);
  });

  it("keeps high-contrast print edges", () => {
    const printed: Painter = (x, y) => {
      if (!inGarment(x, y)) return null;
      return x < 45 ? [20, 20, 25] : [220, 215, 205];
    };
    const { image, mask } = makeImage(90, 120, printed);
    const lum = garmentLuminances(applyStudioCleanup(image, mask));
    expect(Math.min(...lum)).toBeLessThan(60);
    expect(Math.max(...lum)).toBeGreaterThan(170);
  });

  it("returns the input untouched when there is no garment mask", () => {
    const { image, mask } = makeImage(10, 10, () => null);
    expect(applyStudioCleanup(image, mask)).toBe(image);
  });
});
