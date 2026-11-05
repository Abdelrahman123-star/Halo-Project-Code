/**
 * In-memory Fashion Color Extraction using K-Means and Redmean perceptual color matching.
 * Operates directly on decoded RGBA pixel buffers on-device; zero disk writes.
 */

import type { ColorResult } from "@/features/garment/types/garment";

export const FASHION_PALETTE: Record<string, [number, number, number]> = {
  Black: [20, 20, 20],
  White: [245, 245, 245],
  "Off-White / Cream": [240, 235, 220],
  Charcoal: [55, 55, 55],
  Gray: [130, 130, 130],
  "Light Gray": [195, 195, 195],
  "Navy Blue": [25, 35, 65],
  "Denim Blue": [55, 85, 130],
  "Light Denim Blue": [120, 155, 190],
  "Royal Blue": [30, 80, 200],
  "Sky Blue": [135, 206, 235],
  "Baby Blue / Pastel Blue": [180, 215, 238],
  "Powder Blue": [165, 210, 230],
  "Cyan / Turquoise": [0, 185, 205],
  "Olive Green": [75, 85, 45],
  "Military Khaki": [115, 115, 85],
  "Forest Green": [35, 75, 45],
  "Emerald Green": [40, 140, 75],
  Beige: [225, 210, 180],
  "Camel / Tan": [185, 140, 90],
  Brown: [100, 60, 35],
  "Burgundy / Wine": [110, 25, 45],
  Red: [205, 35, 35],
  "Coral / Peach": [240, 130, 110],
  "Pink / Pastel Pink": [235, 180, 190],
  "Hot Pink / Magenta": [215, 45, 120],
  "Lavender / Lilac": [190, 170, 220],
  Purple: [115, 45, 130],
  "Mustard Yellow": [210, 160, 40],
  Yellow: [250, 220, 50],
  Orange: [230, 105, 30],
  Rust: [160, 65, 35],
};

/**
 * Finds the closest fashion color name using the human-perception redmean metric.
 */
export function matchColorName(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  let bestName = "Unknown";
  let minDist = Infinity;

  for (const [name, [cr, cg, cb]] of Object.entries(FASHION_PALETTE)) {
    const rBar = 0.5 * (r + cr);
    const dR = r - cr;
    const dG = g - cg;
    const dB = b - cb;
    const dist = Math.sqrt(
      (2 + rBar / 256) * dR * dR +
        4 * dG * dG +
        (2 + (255 - rBar) / 256) * dB * dB,
    );
    if (dist < minDist) {
      minDist = dist;
      bestName = name;
    }
  }

  return bestName;
}

function toHexByte(n: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(n)));
  return clamped.toString(16).padStart(2, "0");
}

/**
 * Deterministic K-Means clustering on an array of [R, G, B] pixels.
 */
function runKMeans(
  pixels: [number, number, number][],
  k: number,
  maxIter: number = 20,
): { centroids: [number, number, number][]; counts: number[] } {
  const n = pixels.length;
  const actualK = Math.min(k, n);
  const centroids: [number, number, number][] = [];

  // Deterministic initialization spread evenly across the pixel list
  for (let i = 0; i < actualK; i++) {
    const idx = Math.floor((i * n) / actualK);
    centroids.push([...pixels[idx]]);
  }

  const labels = new Int32Array(n).fill(-1);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    for (let i = 0; i < n; i++) {
      const [r, g, b] = pixels[i];
      let bestCluster = 0;
      let bestDist = Infinity;

      for (let c = 0; c < actualK; c++) {
        const [cr, cg, cb] = centroids[c];
        const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }

      if (labels[i] !== bestCluster) {
        labels[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed) break;

    const sums = Array.from({ length: actualK }, () => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      sums[c][0] += pixels[i][0];
      sums[c][1] += pixels[i][1];
      sums[c][2] += pixels[i][2];
      sums[c][3] += 1;
    }

    for (let c = 0; c < actualK; c++) {
      if (sums[c][3] > 0) {
        centroids[c] = [
          sums[c][0] / sums[c][3],
          sums[c][1] / sums[c][3],
          sums[c][2] / sums[c][3],
        ];
      }
    }
  }

  const counts = new Array<number>(actualK).fill(0);
  for (let i = 0; i < n; i++) {
    counts[labels[i]]++;
  }

  return { centroids, counts };
}

/**
 * Extracts dominant garment colors from an RGBA image buffer within a bounding box.
 * Zooms in by cropMarginPct (15%) to sample garment fabric rather than background edges.
 */
export function extractGarmentColorsFromPixels(
  rgbaData: Uint8Array,
  imgWidth: number,
  imgHeight: number,
  bbox: { x: number; y: number; width: number; height: number },
  nClusters: number = 3,
  cropMarginPct: number = 0.15,
): ColorResult[] {
  const effW = bbox.width * (1.0 - cropMarginPct);
  const effH = bbox.height * (1.0 - cropMarginPct);

  const x1 = Math.max(0, Math.floor(bbox.x - effW / 2));
  const y1 = Math.max(0, Math.floor(bbox.y - effH / 2));
  const x2 = Math.min(imgWidth, Math.floor(bbox.x + effW / 2));
  const y2 = Math.min(imgHeight, Math.floor(bbox.y + effH / 2));

  if (x2 <= x1 || y2 <= y1) return [];

  const boxW = x2 - x1;
  const boxH = y2 - y1;
  const stepX = Math.max(1, Math.floor(boxW / 80));
  const stepY = Math.max(1, Math.floor(boxH / 80));

  const sampledPixels: [number, number, number][] = [];
  for (let py = y1; py < y2; py += stepY) {
    for (let px = x1; px < x2; px += stepX) {
      const offset = (py * imgWidth + px) * 4;
      sampledPixels.push([
        rgbaData[offset],
        rgbaData[offset + 1],
        rgbaData[offset + 2],
      ]);
    }
  }

  if (sampledPixels.length === 0) return [];

  const { centroids, counts } = runKMeans(sampledPixels, nClusters);
  const total = sampledPixels.length;

  const indices = centroids.map((_, idx) => idx);
  indices.sort((a, b) => counts[b] - counts[a]);

  const results: ColorResult[] = [];
  for (const idx of indices) {
    if (counts[idx] === 0) continue;
    const [r, g, b] = centroids[idx].map((v) => Math.round(v)) as [
      number,
      number,
      number,
    ];
    const hex = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
    const percentage = Number(((counts[idx] / total) * 100).toFixed(1));
    results.push({
      color_name: matchColorName([r, g, b]),
      hex,
      rgb: [r, g, b],
      percentage,
    });
  }

  return results;
}

