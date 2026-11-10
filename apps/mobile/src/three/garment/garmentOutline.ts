/**
 * Garment outline helpers for garmentMesh.ts: background detection (pure white
 * connected to the border), tube depth per part, depth smoothing, texture
 * background bleed, and snapping outline vertices onto the real garment edge.
 */

import type { RgbaPixels } from "@/three/garment/garmentMesh";

const BACKGROUND_MIN_CHANNEL = 250;
const DEPTH_SMOOTHING_PASSES = 3;
/** Pixels the outline texture lookup is pulled inward, so it never samples the white background. */
const TEXTURE_INSET_PX = 3;

export function isBackgroundPixel(img: RgbaPixels, px: number, py: number): boolean {
  const i = (py * img.width + px) * 4;
  return (
    img.data[i] >= BACKGROUND_MIN_CHANNEL &&
    img.data[i + 1] >= BACKGROUND_MIN_CHANNEL &&
    img.data[i + 2] >= BACKGROUND_MIN_CHANNEL
  );
}

/** Background = near-white vertices connected to the grid border (keeps white prints inside). */
export function findInsideVertices(img: RgbaPixels, cols: number, rows: number): Uint8Array {
  const vw = cols + 1;
  const vh = rows + 1;
  const candidate = new Uint8Array(vw * vh);
  for (let j = 0; j < vh; j++) {
    const py = Math.min(img.height - 1, Math.round((j / rows) * (img.height - 1)));
    for (let i = 0; i < vw; i++) {
      const px = Math.min(img.width - 1, Math.round((i / cols) * (img.width - 1)));
      candidate[j * vw + i] = isBackgroundPixel(img, px, py) ? 1 : 0;
    }
  }
  const background = new Uint8Array(vw * vh);
  const stack: number[] = [];
  const push = (idx: number) => {
    if (candidate[idx] && !background[idx]) {
      background[idx] = 1;
      stack.push(idx);
    }
  };
  for (let i = 0; i < vw; i++) {
    push(i);
    push((vh - 1) * vw + i);
  }
  for (let j = 0; j < vh; j++) {
    push(j * vw);
    push(j * vw + vw - 1);
  }
  while (stack.length > 0) {
    const idx = stack.pop() as number;
    const i = idx % vw;
    const j = (idx - i) / vw;
    if (i > 0) push(idx - 1);
    if (i < vw - 1) push(idx + 1);
    if (j > 0) push(idx - vw);
    if (j < vh - 1) push(idx + vw);
  }
  const inside = new Uint8Array(vw * vh);
  for (let k = 0; k < inside.length; k++) inside[k] = background[k] ? 0 : 1;
  return inside;
}

/**
 * "Ghost mannequin" depth: every garment part is treated as a tube along its
 * long direction. For each vertex we take the inside run through it along the
 * row and along the column; the SHORTER run is the tube's width (torso and legs
 * → across; sleeves → up/down). Depth is a circle across that width, so hems
 * and shoulders keep their depth instead of tapering to a point. Outline
 * vertices are pinned to 0 so the front and back shells still meet.
 */
export function tubeDepth(inside: Uint8Array, vw: number, vh: number): Float32Array {
  const rowStart = new Int32Array(vw * vh);
  const rowEnd = new Int32Array(vw * vh);
  const colStart = new Int32Array(vw * vh);
  const colEnd = new Int32Array(vw * vh);
  for (let j = 0; j < vh; j++) {
    let i = 0;
    while (i < vw) {
      if (!inside[j * vw + i]) { i++; continue; }
      const runStart = i;
      while (i < vw && inside[j * vw + i]) i++;
      for (let r = runStart; r < i; r++) { rowStart[j * vw + r] = runStart; rowEnd[j * vw + r] = i - 1; }
    }
  }
  for (let i = 0; i < vw; i++) {
    let j = 0;
    while (j < vh) {
      if (!inside[j * vw + i]) { j++; continue; }
      const runStart = j;
      while (j < vh && inside[j * vw + i]) j++;
      for (let r = runStart; r < j; r++) { colStart[r * vw + i] = runStart; colEnd[r * vw + i] = j - 1; }
    }
  }
  const depth = new Float32Array(vw * vh);
  for (let j = 0; j < vh; j++) {
    for (let i = 0; i < vw; i++) {
      const k = j * vw + i;
      if (!inside[k] || isOutlineVertex(inside, vw, vh, i, j)) continue;
      const rowHalf = (rowEnd[k] - rowStart[k]) / 2;
      const colHalf = (colEnd[k] - colStart[k]) / 2;
      const acrossRow = rowHalf <= colHalf;
      const radius = acrossRow ? rowHalf : colHalf;
      const d = acrossRow ? Math.min(i - rowStart[k], rowEnd[k] - i) : Math.min(j - colStart[k], colEnd[k] - j);
      depth[k] = Math.sqrt(Math.max(0, d * (2 * radius - d)));
    }
  }
  return depth;
}

function isOutlineVertex(inside: Uint8Array, vw: number, vh: number, i: number, j: number): boolean {
  return (
    i === 0 || j === 0 || i === vw - 1 || j === vh - 1 ||
    !inside[j * vw + i - 1] || !inside[j * vw + i + 1] || !inside[(j - 1) * vw + i] || !inside[(j + 1) * vw + i]
  );
}

/** Smooths a depth field while keeping the outline (value 0) pinned, so front and back still meet. */
export function smoothDepth(depth: Float32Array, inside: Uint8Array, vw: number, vh: number): Float32Array {
  return smoothInterior(depth, inside, vw, vh, DEPTH_SMOOTHING_PASSES);
}

/** Bounding box of non-background pixels (the garment) in a cleaned crop. */
export function garmentPixelBounds(img: RgbaPixels): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = img.width;
  let minY = img.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (isBackgroundPixel(img, x, y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/**
 * Texture copy whose white background is replaced by the garment's average
 * colour, so any slight front/back outline mismatch shows fabric, not white.
 */
export function bleedBackground(img: RgbaPixels): RgbaPixels {
  const data = Uint8Array.from(img.data);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (isBackgroundPixel(img, x, y)) continue;
      const i = (y * img.width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (n === 0) return img;
  const fill = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (!isBackgroundPixel(img, x, y)) continue;
      data.set(fill, (y * img.width + x) * 4);
    }
  }
  return { width: img.width, height: img.height, data };
}

/**
 * A few 3×3 averaging passes over interior vertices remove the terracing a
 * grid distance field produces; the outline (distance 0) is kept fixed.
 */
function smoothInterior(dist: Float32Array, inside: Uint8Array, vw: number, vh: number, passes: number): Float32Array {
  let current = dist;
  for (let pass = 0; pass < passes; pass++) {
    const next = new Float32Array(current.length);
    for (let j = 0; j < vh; j++) {
      for (let i = 0; i < vw; i++) {
        const k = j * vw + i;
        if (!inside[k] || current[k] === 0) continue;
        let sum = 0;
        let n = 0;
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            const ni = i + di;
            const nj = j + dj;
            if (ni < 0 || nj < 0 || ni >= vw || nj >= vh) continue;
            sum += current[nj * vw + ni];
            n++;
          }
        }
        next[k] = sum / n;
      }
    }
    current = next;
  }
  return current;
}


/**
 * For an outline vertex, walks toward each outside neighbour and moves the
 * vertex to the last garment pixel (averaged over directions). Returns
 * [x, y, textureX, textureY] in pixels; interior vertices are returned as-is.
 */
export function snapOutlineVertex(
  img: RgbaPixels,
  inside: Uint8Array,
  vw: number,
  vh: number,
  i: number,
  j: number,
  stepX: number,
  stepY: number,
): [number, number, number, number] {
  const ox = i * stepX;
  const oy = j * stepY;
  let sumX = 0;
  let sumY = 0;
  let hits = 0;
  let inwardX = 0;
  let inwardY = 0;
  const directions: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [di, dj] of directions) {
    const ni = i + di;
    const nj = j + dj;
    const outside = ni < 0 || nj < 0 || ni >= vw || nj >= vh || !inside[nj * vw + ni];
    if (!outside) continue;
    inwardX -= di;
    inwardY -= dj;
    const length = di !== 0 ? stepX : stepY;
    let lastX = ox;
    let lastY = oy;
    for (let d = 1; d <= length; d++) {
      const px = Math.round(ox + di * d);
      const py = Math.round(oy + dj * d);
      if (px < 0 || py < 0 || px >= img.width || py >= img.height || isBackgroundPixel(img, px, py)) break;
      lastX = px;
      lastY = py;
    }
    sumX += lastX;
    sumY += lastY;
    hits++;
  }
  if (hits === 0) return [ox, oy, ox, oy];
  const sx = sumX / hits;
  const sy = sumY / hits;
  // Always pull the texture lookup toward the garment interior; edge pixels are blended with white.
  const inwardLength = Math.hypot(inwardX, inwardY);
  if (inwardLength === 0) return [sx, sy, sx, sy];
  const tx = Math.min(img.width - 1, Math.max(0, sx + (inwardX / inwardLength) * TEXTURE_INSET_PX));
  const ty = Math.min(img.height - 1, Math.max(0, sy + (inwardY / inwardLength) * TEXTURE_INSET_PX));
  return [sx, sy, tx, ty];
}
