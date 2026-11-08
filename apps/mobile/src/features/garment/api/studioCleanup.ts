/**
 * On-device "studio" cleanup for a segmented garment crop. No network, no model.
 *
 * 1. Wrinkle softening — a luminance-guided filter (He et al., "Guided Image
 *    Filtering") restricted to garment pixels: low-contrast crease shading is
 *    smoothed while high-contrast detail (seams, prints, logos) is kept.
 * 2. Shading flattening — divides out large-scale lighting / fold shadows by
 *    normalising local mean luminance toward the garment's global mean.
 * 3. Pure-white background + consistent centred 4:5 framing.
 *
 * Honest limit: creases are SOFTENED, not removed. True wrinkle removal needs a
 * generative model.
 */

import { applyCatalogGrade, type Illuminant } from "@/features/garment/api/catalogGrade";
import {
  boxSum,
  downsample,
  makeGrid,
  maskedMean,
  upsample,
  weighted,
  type LowResGrid,
} from "@/features/garment/api/imageFilters";

export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8Array;
}

/**
 * Garment pixels are capped just below white so the background (exactly 255)
 * stays separable later — the 3D builder relies on this to find the outline.
 */
export const MAX_GARMENT_CHANNEL = 246;

const OUTPUT_ASPECT = 4 / 5; // width : height, same for every wardrobe item
const FRAME_PADDING = 0.08;
const MAX_OUTPUT_HEIGHT = 1000;
const GUIDED_EPS = 0.004; // variance below this (≈ ±6% luminance) is treated as crease
const SOFTEN_STRENGTH = 0.85;
/**
 * Shading is flattened at two scales: broad lighting gradients and mid-size
 * folds. Gains are clamped so prints and real colour changes are not erased.
 */
const FLATTEN_PASSES = [
  { radiusFraction: 0.06, strength: 0.5, minGain: 0.8, maxGain: 1.25 },
  { radiusFraction: 0.025, strength: 0.6, minGain: 0.85, maxGain: 1.18 },
] as const;

function luminance(data: Uint8Array, i: number): number {
  return (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
}

function softenWrinkles(image: RgbaImage, mask: Uint8Array, grid: LowResGrid): Float32Array[] {
  const { width, height, data } = image;
  const count = width * height;
  const { width: lw, height: lh, weight } = grid;
  const radius = Math.max(2, Math.round((Math.max(width, height) * 0.012) / grid.factor));
  const maskSum = boxSum(weight, lw, lh, radius);
  const guideLow = downsample(grid, width, height, mask, (i) => luminance(data, i));
  const meanI = maskedMean(weighted(guideLow, weight), maskSum, lw, lh, radius);
  const corrI = maskedMean(weighted(guideLow.map((v) => v * v), weight), maskSum, lw, lh, radius);

  const guideFull = new Float32Array(count);
  for (let i = 0; i < count; i++) if (mask[i]) guideFull[i] = luminance(data, i);

  const channels: Float32Array[] = [];
  for (let c = 0; c < 3; c++) {
    const pLow = downsample(grid, width, height, mask, (i) => data[i * 4 + c] / 255);
    const ipLow = downsample(grid, width, height, mask, (i) => guideFull[i] * (data[i * 4 + c] / 255));
    const meanP = maskedMean(weighted(pLow, weight), maskSum, lw, lh, radius);
    const corrIP = maskedMean(weighted(ipLow, weight), maskSum, lw, lh, radius);
    const a = new Float32Array(lw * lh);
    const b = new Float32Array(lw * lh);
    for (let k = 0; k < a.length; k++) {
      const varI = corrI[k] - meanI[k] * meanI[k];
      a[k] = (corrIP[k] - meanI[k] * meanP[k]) / (varI + GUIDED_EPS);
      b[k] = meanP[k] - a[k] * meanI[k];
    }
    const meanA = upsample(grid, maskedMean(weighted(a, weight), maskSum, lw, lh, radius), width, height);
    const meanB = upsample(grid, maskedMean(weighted(b, weight), maskSum, lw, lh, radius), width, height);
    const out = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      if (!mask[i]) continue;
      const original = data[i * 4 + c] / 255;
      const filtered = meanA[i] * guideFull[i] + meanB[i];
      out[i] = original + (filtered - original) * SOFTEN_STRENGTH;
    }
    channels.push(out);
  }
  return channels;
}

function flattenShading(
  channels: Float32Array[],
  mask: Uint8Array,
  width: number,
  height: number,
  grid: LowResGrid,
  pass: (typeof FLATTEN_PASSES)[number],
): void {
  const count = width * height;
  const lum = new Float32Array(count);
  let total = 0;
  let pixels = 0;
  for (let i = 0; i < count; i++) {
    if (!mask[i]) continue;
    lum[i] = 0.299 * channels[0][i] + 0.587 * channels[1][i] + 0.114 * channels[2][i];
    total += lum[i];
    pixels++;
  }
  if (pixels === 0) return;
  const globalMean = total / pixels;
  const { width: lw, height: lh, weight } = grid;
  const radius = Math.max(2, Math.round((Math.max(width, height) * pass.radiusFraction) / grid.factor));
  const lumLow = downsample(grid, width, height, mask, (i) => lum[i]);
  const localLow = maskedMean(weighted(lumLow, weight), boxSum(weight, lw, lh, radius), lw, lh, radius);
  const gainLow = new Float32Array(localLow.length);
  for (let k = 0; k < gainLow.length; k++) {
    const ratio = globalMean / Math.max(localLow[k], 0.04);
    gainLow[k] = Math.min(pass.maxGain, Math.max(pass.minGain, Math.pow(ratio, pass.strength)));
  }
  const gain = upsample(grid, gainLow, width, height);
  for (let i = 0; i < count; i++) {
    if (!mask[i]) continue;
    for (let c = 0; c < 3; c++) channels[c][i] *= gain[i];
  }
}

function maskBounds(mask: Uint8Array, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/** Bilinear sample of the cleaned garment (white outside) into a centred 4:5 canvas. */
function frameOnWhite(
  pixels: Uint8Array,
  width: number,
  height: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): RgbaImage {
  const garmentW = bounds.maxX - bounds.minX + 1;
  const garmentH = bounds.maxY - bounds.minY + 1;
  const usable = 1 - FRAME_PADDING * 2;
  let canvasH = Math.max(garmentH / usable, garmentW / usable / OUTPUT_ASPECT);
  let scale = 1;
  if (canvasH > MAX_OUTPUT_HEIGHT) {
    scale = MAX_OUTPUT_HEIGHT / canvasH;
    canvasH = MAX_OUTPUT_HEIGHT;
  }
  const outH = Math.max(1, Math.round(canvasH));
  const outW = Math.max(1, Math.round(canvasH * OUTPUT_ASPECT));
  const out = new Uint8Array(outW * outH * 4).fill(255);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  for (let oy = 0; oy < outH; oy++) {
    const sy = centerY + (oy - outH / 2) / scale;
    if (sy < 0 || sy > height - 1) continue;
    const y0 = Math.floor(sy);
    const y1 = Math.min(height - 1, y0 + 1);
    const fy = sy - y0;
    for (let ox = 0; ox < outW; ox++) {
      const sx = centerX + (ox - outW / 2) / scale;
      if (sx < 0 || sx > width - 1) continue;
      const x0 = Math.floor(sx);
      const x1 = Math.min(width - 1, x0 + 1);
      const fx = sx - x0;
      const dst = (oy * outW + ox) * 4;
      for (let c = 0; c < 3; c++) {
        const top = pixels[(y0 * width + x0) * 4 + c] * (1 - fx) + pixels[(y0 * width + x1) * 4 + c] * fx;
        const bottom = pixels[(y1 * width + x0) * 4 + c] * (1 - fx) + pixels[(y1 * width + x1) * 4 + c] * fx;
        out[dst + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }
  return { width: outW, height: outH, data: out };
}

/**
 * Runs the full studio cleanup. `mask[i] = 1` marks garment pixels (from the
 * segmentation polygon). `illuminant` is the measured background colour used
 * for white balance (null = skip). Returns the input unchanged if the mask is empty.
 */
export function applyStudioCleanup(
  image: RgbaImage,
  mask: Uint8Array,
  illuminant: Illuminant | null = null,
): RgbaImage {
  const { width, height } = image;
  const bounds = maskBounds(mask, width, height);
  if (!bounds) return image;

  const grid = makeGrid(width, height, mask);
  const channels = softenWrinkles(image, mask, grid);
  for (const pass of FLATTEN_PASSES) flattenShading(channels, mask, width, height, grid, pass);
  applyCatalogGrade(channels, mask, width, height, illuminant);

  const cleaned = new Uint8Array(width * height * 4).fill(255);
  for (let i = 0; i < width * height; i++) {
    if (!mask[i]) continue;
    for (let c = 0; c < 3; c++) {
      const value = Math.round(channels[c][i] * 255);
      cleaned[i * 4 + c] = Math.min(MAX_GARMENT_CHANNEL, Math.max(0, value));
    }
  }
  return frameOnWhite(cleaned, width, height, bounds);
}
