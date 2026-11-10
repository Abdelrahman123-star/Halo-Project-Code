/**
 * Builds a closed, textured 3D garment mesh from the cleaned FRONT photo (and
 * optionally the BACK photo), entirely on-device.
 *
 * Method ("ghost mannequin" inflation): the outline comes from the front photo;
 * every part (torso, sleeve, leg) becomes a tube with a ROUND cross-section
 * across its narrow direction (see tubeDepth), flattened per garment type, so
 * hems and shoulders keep their depth. Front and back shells meet at the outline. The back shell shows the mirrored back photo,
 * aligned by bounding box; without one it reuses the front photo.
 *
 * Honest limits: an estimate from two silhouettes, NOT a 3D scan; back photo
 * alignment is by bounding box; the mesh is not rigged.
 */

import {
  findInsideVertices,
  garmentPixelBounds,
  smoothDepth,
  tubeDepth,
  snapOutlineVertex,
} from "@/three/garment/garmentOutline";

export interface RgbaPixels {
  width: number;
  height: number;
  data: Uint8Array;
}

export type GarmentShapeProfile = "top" | "outerwear" | "bottom" | "dress";

/**
 * Depth of the round cross-section relative to its width (1 = circular).
 * Torsos are flatter than a cylinder; trouser legs are close to round.
 */
export const SHAPE_PROFILES: Record<GarmentShapeProfile, { depthRatio: number }> = {
  top: { depthRatio: 0.55 },
  outerwear: { depthRatio: 0.62 },
  bottom: { depthRatio: 0.8 },
  dress: { depthRatio: 0.5 },
};

export interface GarmentMeshData {
  positions: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array | Uint32Array;
  /** Indices [0, frontIndexCount) are the front shell; the rest is the back. */
  frontIndexCount: number;
  /** True when the back shell's UVs point into the separate back photo. */
  usesBackPhoto: boolean;
}

export interface BuildGarmentMeshOptions {
  back?: RgbaPixels | null;
  gridColumns?: number;
}

const DEFAULT_GRID_COLUMNS = 80;
const MIN_INSIDE_VERTICES = 24;

/** Maps a front-photo pixel to the mirrored back photo (the back is seen from behind). */
function backPhotoMapper(
  back: RgbaPixels | null | undefined,
  front: { minX: number; minY: number; maxX: number; maxY: number },
): ((x: number, y: number) => [number, number]) | null {
  if (!back) return null;
  const bounds = garmentPixelBounds(back);
  if (!bounds) return null;
  const frontW = Math.max(1, front.maxX - front.minX);
  const frontH = Math.max(1, front.maxY - front.minY);
  return (x, y) => {
    const fx = (x - front.minX) / frontW;
    const fy = (y - front.minY) / frontH;
    const bx = bounds.maxX - fx * (bounds.maxX - bounds.minX);
    const by = bounds.minY + fy * (bounds.maxY - bounds.minY);
    return [bx / (back.width - 1), by / (back.height - 1)];
  };
}

export function buildGarmentMesh(
  img: RgbaPixels,
  profile: GarmentShapeProfile,
  options: BuildGarmentMeshOptions = {},
): GarmentMeshData | null {
  if (img.width < 2 || img.height < 2) return null;
  const cols = options.gridColumns ?? DEFAULT_GRID_COLUMNS;
  const rows = Math.max(2, Math.round((cols * img.height) / img.width));
  const vw = cols + 1;
  const vh = rows + 1;
  const inside = findInsideVertices(img, cols, rows);
  let insideCount = 0;
  for (let k = 0; k < inside.length; k++) insideCount += inside[k];
  if (insideCount < MIN_INSIDE_VERTICES) return null;

  const depth = smoothDepth(tubeDepth(inside, vw, vh), inside, vw, vh);
  const { depthRatio } = SHAPE_PROFILES[profile];
  const stepX = (img.width - 1) / cols;
  const stepY = (img.height - 1) / rows;

  // Outline vertices are snapped onto the real garment edge (smooth silhouette).
  const pixelX = new Float32Array(vw * vh);
  const pixelY = new Float32Array(vw * vh);
  const texX = new Float32Array(vw * vh);
  const texY = new Float32Array(vw * vh);
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (let j = 0; j < vh; j++) {
    for (let i = 0; i < vw; i++) {
      const k = j * vw + i;
      if (!inside[k]) continue;
      const [px, py, tx, ty] = snapOutlineVertex(img, inside, vw, vh, i, j, stepX, stepY);
      pixelX[k] = px;
      pixelY[k] = py;
      texX[k] = tx;
      texY[k] = ty;
      box.minX = Math.min(box.minX, px);
      box.maxX = Math.max(box.maxX, px);
      box.minY = Math.min(box.minY, py);
      box.maxY = Math.max(box.maxY, py);
    }
  }
  const worldScale = 2 / Math.max(1, box.maxY - box.minY); // garment height = 2 units
  const centerX = (box.minX + box.maxX) / 2;
  const centerY = (box.minY + box.maxY) / 2;
  const toBack = backPhotoMapper(options.back, box);

  const vertexIndex = new Int32Array(vw * vh).fill(-1);
  const positions = new Float32Array(insideCount * 2 * 3);
  const uvs = new Float32Array(insideCount * 2 * 2);
  let next = 0;
  for (let j = 0; j < vh; j++) {
    for (let i = 0; i < vw; i++) {
      const k = j * vw + i;
      if (!inside[k]) continue;
      const z = depth[k] * depthRatio * stepX * worldScale;
      const x = (pixelX[k] - centerX) * worldScale;
      const y = -(pixelY[k] - centerY) * worldScale;
      // Texture uploaded without flipY: v = 0 is the photo's top row.
      const u = texX[k] / (img.width - 1);
      const v = texY[k] / (img.height - 1);
      vertexIndex[k] = next;
      positions.set([x, y, z], next * 3);
      positions.set([x, y, -z], (next + insideCount) * 3);
      uvs.set([u, v], next * 2);
      uvs.set(toBack ? toBack(texX[k], texY[k]) : [u, v], (next + insideCount) * 2);
      next++;
    }
  }

  const front: number[] = [];
  const back: number[] = [];
  // Counter-clockwise when seen from +z for the front; reversed for the back.
  const emit = (a: number, b: number, c: number) => {
    const ax = positions[a * 3];
    const ay = positions[a * 3 + 1];
    const cross =
      (positions[b * 3] - ax) * (positions[c * 3 + 1] - ay) -
      (positions[b * 3 + 1] - ay) * (positions[c * 3] - ax);
    const [p, q] = cross >= 0 ? [b, c] : [c, b];
    front.push(a, p, q);
    back.push(a + insideCount, q + insideCount, p + insideCount);
  };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tl = vertexIndex[j * vw + i];
      const tr = vertexIndex[j * vw + i + 1];
      const bl = vertexIndex[(j + 1) * vw + i];
      const br = vertexIndex[(j + 1) * vw + i + 1];
      const corners = [tl, tr, br, bl].filter((v) => v >= 0);
      if (corners.length === 4) {
        emit(tl, bl, tr);
        emit(tr, bl, br);
      } else if (corners.length === 3) {
        emit(corners[0], corners[1], corners[2]); // smooths diagonal outline steps
      }
    }
  }
  if (front.length === 0) return null;

  const all = [...front, ...back];
  return {
    positions,
    uvs,
    // 16-bit indices are the most widely supported on mobile GPUs.
    indices: insideCount * 2 < 65535 ? Uint16Array.from(all) : Uint32Array.from(all),
    frontIndexCount: front.length,
    usesBackPhoto: toBack !== null,
  };
}
