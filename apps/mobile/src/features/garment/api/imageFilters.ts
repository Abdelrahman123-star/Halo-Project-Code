/**
 * Generic image-filter helpers for studioCleanup.ts: integral-image box sums
 * and a low-resolution working grid (block downsample + bilinear upsample).
 */

/** Sum of `values` over the (2r+1)² window around each pixel, clipped at borders. */
export function boxSum(values: Float32Array, width: number, height: number, radius: number): Float32Array {
  const stride = width + 1;
  const integral = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += values[y * width + x];
      integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + rowSum;
    }
  }
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius) + 1;
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius) + 1;
      out[y * width + x] =
        integral[y1 * stride + x1] - integral[y0 * stride + x1] -
        integral[y1 * stride + x0] + integral[y0 * stride + x0];
    }
  }
  return out;
}

/** Mean of `values` over garment pixels only (mask-normalised box filter). */
export function maskedMean(
  values: Float32Array,
  maskSum: Float32Array,
  width: number,
  height: number,
  radius: number,
): Float32Array {
  const sums = boxSum(values, width, height, radius);
  for (let i = 0; i < sums.length; i++) sums[i] = maskSum[i] > 0 ? sums[i] / maskSum[i] : 0;
  return sums;
}

/**
 * Filters run on a ~300 px grid and their coefficients are upsampled
 * ("Fast Guided Filter", He & Sun 2015): ~10× faster on phones, and edges stay
 * sharp because the final step uses the full-resolution guide.
 */
export const WORKING_SIZE = 300;

export interface LowResGrid {
  width: number;
  height: number;
  factor: number;
  weight: Float32Array; // fraction of garment pixels in each block
}

export function makeGrid(width: number, height: number, mask: Uint8Array): LowResGrid {
  const factor = Math.max(1, Math.round(Math.max(width, height) / WORKING_SIZE));
  const lw = Math.ceil(width / factor);
  const lh = Math.ceil(height / factor);
  const weight = new Float32Array(lw * lh);
  const counts = new Float32Array(lw * lh);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const k = Math.floor(y / factor) * lw + Math.floor(x / factor);
      counts[k]++;
      if (mask[y * width + x]) weight[k]++;
    }
  }
  for (let k = 0; k < weight.length; k++) weight[k] = counts[k] > 0 ? weight[k] / counts[k] : 0;
  return { width: lw, height: lh, factor, weight };
}

/** Garment-only block average of a full-resolution per-pixel value. */
export function downsample(grid: LowResGrid, width: number, height: number, mask: Uint8Array, value: (i: number) => number): Float32Array {
  const sums = new Float32Array(grid.width * grid.height);
  const counts = new Float32Array(grid.width * grid.height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i]) continue;
      const k = Math.floor(y / grid.factor) * grid.width + Math.floor(x / grid.factor);
      sums[k] += value(i);
      counts[k]++;
    }
  }
  for (let k = 0; k < sums.length; k++) sums[k] = counts[k] > 0 ? sums[k] / counts[k] : 0;
  return sums;
}

/** Bilinear upsample of a low-res field back to full resolution. */
export function upsample(grid: LowResGrid, low: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  const { width: lw, height: lh, factor } = grid;
  for (let y = 0; y < height; y++) {
    const gy = Math.min(lh - 1, Math.max(0, (y + 0.5) / factor - 0.5));
    const y0 = Math.floor(gy);
    const y1 = Math.min(lh - 1, y0 + 1);
    const fy = gy - y0;
    for (let x = 0; x < width; x++) {
      const gx = Math.min(lw - 1, Math.max(0, (x + 0.5) / factor - 0.5));
      const x0 = Math.floor(gx);
      const x1 = Math.min(lw - 1, x0 + 1);
      const fx = gx - x0;
      const top = low[y0 * lw + x0] * (1 - fx) + low[y0 * lw + x1] * fx;
      const bottom = low[y1 * lw + x0] * (1 - fx) + low[y1 * lw + x1] * fx;
      out[y * width + x] = top * (1 - fy) + bottom * fy;
    }
  }
  return out;
}

export function weighted(values: Float32Array, weight: Float32Array): Float32Array {
  const out = new Float32Array(values.length);
  for (let k = 0; k < values.length; k++) out[k] = values[k] * weight[k];
  return out;
}
