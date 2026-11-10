/**
 * Catalog-style colour grade for a cleaned garment (on-device, no model):
 * white balance from the real background, gentle levels stretch, a small
 * saturation lift and an unsharp mask. Channels are 0–1 floats, edited in place.
 *
 * White balance is taken ONLY from the background around the garment (when it is
 * light and neutral, e.g. a white sheet), never from the garment, so a red shirt
 * is not "corrected" toward grey.
 */

import { boxSum } from "@/features/garment/api/imageFilters";

export interface Illuminant {
  r: number;
  g: number;
  b: number;
}

const WB_STRENGTH = 0.7;
const LEVELS_STRENGTH = 0.5;
const SATURATION_BOOST = 1.1;
const SHARPEN_AMOUNT = 0.45;

/** Average background colour → illuminant, or null if the background is too dark/coloured to trust. */
export function illuminantFromBackground(sumR: number, sumG: number, sumB: number, count: number): Illuminant | null {
  if (count < 50) return null;
  const r = sumR / count / 255;
  const g = sumG / count / 255;
  const b = sumB / count / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum < 0.45 || max - min > 0.25 * max) return null;
  return { r, g, b };
}

function whiteBalance(channels: Float32Array[], mask: Uint8Array, light: Illuminant): void {
  const grey = (light.r + light.g + light.b) / 3;
  const gains = [light.r, light.g, light.b].map((c) => {
    const full = grey / Math.max(c, 0.05);
    return Math.min(1.25, Math.max(0.8, 1 + (full - 1) * WB_STRENGTH));
  });
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    for (let c = 0; c < 3; c++) channels[c][i] *= gains[c];
  }
}

function luminanceAt(channels: Float32Array[], i: number): number {
  return 0.299 * channels[0][i] + 0.587 * channels[1][i] + 0.114 * channels[2][i];
}

/** Partial stretch of the garment's 1st–99th luminance percentile; skipped for flat single-colour items. */
function levels(channels: Float32Array[], mask: Uint8Array): void {
  const histogram = new Uint32Array(256);
  let total = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    histogram[Math.min(255, Math.max(0, Math.round(luminanceAt(channels, i) * 255)))]++;
    total++;
  }
  if (total === 0) return;
  const percentile = (p: number) => {
    let seen = 0;
    for (let v = 0; v < 256; v++) {
      seen += histogram[v];
      if (seen >= total * p) return v / 255;
    }
    return 1;
  };
  const lo = percentile(0.01);
  const hi = percentile(0.99);
  if (hi - lo < 0.08) return;
  const targetLo = 0.04;
  const targetHi = 0.94;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const l = luminanceAt(channels, i);
    const stretched = targetLo + ((l - lo) / (hi - lo)) * (targetHi - targetLo);
    const next = l + (Math.min(1, Math.max(0, stretched)) - l) * LEVELS_STRENGTH;
    const gain = l > 0.002 ? next / l : 1;
    for (let c = 0; c < 3; c++) channels[c][i] *= gain;
  }
}

function saturate(channels: Float32Array[], mask: Uint8Array): void {
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const l = luminanceAt(channels, i);
    for (let c = 0; c < 3; c++) channels[c][i] = l + (channels[c][i] - l) * SATURATION_BOOST;
  }
}

function sharpen(channels: Float32Array[], mask: Uint8Array, width: number, height: number): void {
  const lum = new Float32Array(mask.length);
  const maskF = new Float32Array(mask.length);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    lum[i] = luminanceAt(channels, i);
    maskF[i] = 1;
  }
  const sums = boxSum(lum, width, height, 1);
  const counts = boxSum(maskF, width, height, 1);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || counts[i] === 0 || lum[i] < 0.002) continue;
    const blurred = sums[i] / counts[i];
    const gain = (lum[i] + (lum[i] - blurred) * SHARPEN_AMOUNT) / lum[i];
    for (let c = 0; c < 3; c++) channels[c][i] *= Math.min(1.5, Math.max(0.6, gain));
  }
}

export function applyCatalogGrade(
  channels: Float32Array[],
  mask: Uint8Array,
  width: number,
  height: number,
  illuminant: Illuminant | null,
): void {
  if (illuminant) whiteBalance(channels, mask, illuminant);
  levels(channels, mask);
  saturate(channels, mask);
  sharpen(channels, mask, width, height);
}
