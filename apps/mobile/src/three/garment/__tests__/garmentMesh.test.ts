import { buildGarmentMesh, type RgbaPixels } from "@/three/garment/garmentMesh";
import { bleedBackground, tubeDepth } from "@/three/garment/garmentOutline";

type Paint = (x: number, y: number) => [number, number, number] | null;

function makePixels(width: number, height: number, paint: Paint): RgbaPixels {
  const data = new Uint8Array(width * height * 4).fill(255);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rgb = paint(x, y);
      if (rgb) data.set([rgb[0], rgb[1], rgb[2], 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

const rectangleGarment: Paint = (x, y) => (x >= 20 && x < 140 && y >= 20 && y < 180 ? [60, 90, 160] : null);

/** Wide body (x 60–140) with a thin "sleeve" strip sticking out to the left. */
const bodyWithSleeve: Paint = (x, y) => {
  const body = x >= 60 && x < 140 && y >= 20 && y < 180;
  const sleeve = x >= 8 && x < 60 && y >= 30 && y < 50;
  return body || sleeve ? [200, 60, 60] : null;
};

function zValues(positions: Float32Array, from: number, to: number): number[] {
  const out: number[] = [];
  for (let v = from; v < to; v++) out.push(positions[v * 3 + 2]);
  return out;
}

describe("garment outline helpers", () => {
  it("tube depth is 0 on the outline and deepest across the narrow direction", () => {
    const vw = 11;
    const vh = 31; // tall part: a vertical tube, measured across the rows
    const depth = tubeDepth(new Uint8Array(vw * vh).fill(1), vw, vh);
    expect(depth[0]).toBe(0);
    const centre = depth[15 * vw + 5];
    expect(centre).toBeCloseTo(5, 5); // radius = (11 vertices - 1) / 2
    expect(depth[2 * vw + 5]).toBeCloseTo(centre, 5); // near the hem: same depth, no taper
  });

  it("fills the white background with the garment colour for textures", () => {
    const filled = bleedBackground(makePixels(10, 10, (x) => (x < 5 ? [100, 50, 20] : null)));
    expect(Array.from(filled.data.slice(9 * 4, 9 * 4 + 3))).toEqual([100, 50, 20]);
  });
});

describe("buildGarmentMesh", () => {
  const pixels = makePixels(160, 200, rectangleGarment);

  it("builds closed front/back shells with the garment 2 units tall", () => {
    const mesh = buildGarmentMesh(pixels, "top", { gridColumns: 40 });
    if (!mesh) throw new Error("mesh expected");
    const vertexCount = mesh.positions.length / 3;
    const half = vertexCount / 2;
    expect(mesh.indices.length).toBe(mesh.frontIndexCount * 2);
    const frontZ = zValues(mesh.positions, 0, half);
    const backZ = zValues(mesh.positions, half, vertexCount);
    expect(Math.max(...frontZ)).toBeGreaterThan(0);
    expect(Math.min(...frontZ)).toBe(0);
    expect(backZ.every((z, k) => z === -frontZ[k])).toBe(true);
    let minY = Infinity;
    let maxY = -Infinity;
    for (let v = 0; v < vertexCount; v++) {
      minY = Math.min(minY, mesh.positions[v * 3 + 1]);
      maxY = Math.max(maxY, mesh.positions[v * 3 + 1]);
    }
    expect(maxY - minY).toBeGreaterThan(1.8);
    expect(maxY - minY).toBeLessThanOrEqual(2.05);
    expect(mesh.usesBackPhoto).toBe(false);
  });

  it("winds front triangles toward the viewer (+z)", () => {
    const mesh = buildGarmentMesh(pixels, "top", { gridColumns: 40 });
    if (!mesh) throw new Error("mesh expected");
    const [a, b, c] = [mesh.indices[0], mesh.indices[1], mesh.indices[2]];
    const p = (i: number, k: number) => mesh.positions[i * 3 + k];
    const cross = (p(b, 0) - p(a, 0)) * (p(c, 1) - p(a, 1)) - (p(b, 1) - p(a, 1)) * (p(c, 0) - p(a, 0));
    expect(cross).toBeGreaterThan(0);
  });

  it("keeps hem depth instead of tapering to a point (ghost mannequin)", () => {
    const mesh = buildGarmentMesh(pixels, "top", { gridColumns: 40 });
    if (!mesh) throw new Error("mesh expected");
    const half = mesh.positions.length / 6;
    let centreZ = 0;
    let hemZ = 0;
    for (let v = 0; v < half; v++) {
      const [x, y, z] = [mesh.positions[v * 3], mesh.positions[v * 3 + 1], mesh.positions[v * 3 + 2]];
      if (Math.abs(x) > 0.05) continue;
      if (Math.abs(y) < 0.05) centreZ = Math.max(centreZ, z);
      if (y < -0.8 && y > -0.9) hemZ = Math.max(hemZ, z);
    }
    expect(hemZ).toBeGreaterThan(centreZ * 0.7);
  });

  it("gives thin parts (sleeves) a shallower round section than the body", () => {
    const mesh = buildGarmentMesh(makePixels(160, 200, bodyWithSleeve), "top", { gridColumns: 80 });
    if (!mesh) throw new Error("mesh expected");
    const half = mesh.positions.length / 6;
    let sleeveMax = 0;
    let bodyMax = 0;
    for (let v = 0; v < half; v++) {
      const [x, z] = [mesh.positions[v * 3], mesh.positions[v * 3 + 2]];
      if (x < -0.35) sleeveMax = Math.max(sleeveMax, z);
      else if (x > 0.1) bodyMax = Math.max(bodyMax, z);
    }
    expect(sleeveMax).toBeGreaterThan(0);
    expect(sleeveMax).toBeLessThan(bodyMax * 0.5);
  });

  it("keeps white prints inside the garment instead of punching holes", () => {
    const withWhitePrint = makePixels(160, 200, (x, y) => {
      const base = rectangleGarment(x, y);
      return base && x >= 60 && x < 100 && y >= 80 && y < 120 ? [255, 255, 255] : base;
    });
    const solid = buildGarmentMesh(pixels, "top", { gridColumns: 40 });
    const printed = buildGarmentMesh(withWhitePrint, "top", { gridColumns: 40 });
    expect(printed?.positions.length).toBe(solid?.positions.length);
  });

  it("maps the back shell onto the mirrored back photo", () => {
    const back = makePixels(100, 120, (x, y) => (x >= 10 && x < 90 && y >= 10 && y < 110 ? [30, 30, 30] : null));
    const mesh = buildGarmentMesh(pixels, "top", { back, gridColumns: 40 });
    if (!mesh) throw new Error("mesh expected");
    expect(mesh.usesBackPhoto).toBe(true);
    const half = mesh.positions.length / 6;
    // Front-left vertex (smallest x) must land on the RIGHT side of the back photo.
    let leftmost = 0;
    for (let v = 1; v < half; v++) if (mesh.positions[v * 3] < mesh.positions[leftmost * 3]) leftmost = v;
    const backU = mesh.uvs[(leftmost + half) * 2];
    expect(backU).toBeGreaterThan(0.8);
  });

  it("returns null when no garment is visible", () => {
    expect(buildGarmentMesh(makePixels(50, 50, () => null), "top", { gridColumns: 20 })).toBeNull();
  });
});
