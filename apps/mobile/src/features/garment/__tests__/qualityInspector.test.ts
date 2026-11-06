import { inspectPhotoQuality } from "@/features/garment/api/qualityInspector";

describe("qualityInspector", () => {
  const width = 100;
  const height = 100;

  // Helper to create RGBA buffer with constant color
  function createSolidBuffer(r: number, g: number, b: number): Uint8Array {
    const buf = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      buf[i * 4] = r;
      buf[i * 4 + 1] = g;
      buf[i * 4 + 2] = b;
      buf[i * 4 + 3] = 255;
    }
    return buf;
  }

  // Helper to create balanced buffer with variance across pixels
  function createBalancedBuffer(): Uint8Array {
    const buf = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const val = (i % 10 < 5 ? 70 : 170);
      buf[i * 4] = val;
      buf[i * 4 + 1] = val;
      buf[i * 4 + 2] = val;
      buf[i * 4 + 3] = 255;
    }
    return buf;
  }

  it("detects optimal lighting and framing for a well-centered garment", () => {
    const pixels = createBalancedBuffer();
    const bbox = { x: 50, y: 50, width: 60, height: 60 };

    const report = inspectPhotoQuality(pixels, width, height, { bbox });

    expect(report.lighting.status).toBe("optimal");
    expect(report.framing.status).toBe("optimal");
    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.severity).toBe("good");
    expect(report.canProceed).toBe(true);
  });

  it("detects underexposure when the photo is too dark", () => {
    const pixels = createSolidBuffer(20, 20, 20); // very dark
    const bbox = { x: 50, y: 50, width: 60, height: 60 };

    const report = inspectPhotoQuality(pixels, width, height, { bbox });

    expect(report.lighting.status).toBe("underexposed");
    expect(report.score).toBeLessThan(75);
    expect(report.issues.some((i) => i.id === "underexposed")).toBe(true);
  });

  it("detects overexposure when the photo is washed out", () => {
    const pixels = createSolidBuffer(250, 250, 250); // overexposed white
    const bbox = { x: 50, y: 50, width: 60, height: 60 };

    const report = inspectPhotoQuality(pixels, width, height, { bbox });

    expect(report.lighting.status).toBe("overexposed");
    expect(report.score).toBeLessThan(75);
    expect(report.issues.some((i) => i.id === "overexposed")).toBe(true);
  });

  it("detects clipped top edge when garment collar/neckline touches frame", () => {
    const pixels = createBalancedBuffer();
    // Bbox near y = 0 (top margin < 4%)
    const bbox = { x: 50, y: 26, width: 50, height: 50 }; // yMin = 26 - 25 = 1 (1%)

    const report = inspectPhotoQuality(pixels, width, height, { bbox });

    expect(report.framing.status).toBe("clipped_top");
    expect(report.framing.truncatedEdges).toContain("top (collar/neckline)");
    expect(report.issues.some((i) => i.id === "clipped_edge")).toBe(true);
  });

  it("detects multiple clipped edges when garment is cut off top and bottom", () => {
    const pixels = createBalancedBuffer();
    // Bbox filling almost entire height
    const bbox = { x: 50, y: 50, width: 50, height: 98 };

    const report = inspectPhotoQuality(pixels, width, height, { bbox });

    expect(report.framing.status).toBe("clipped_multiple");
    expect(report.framing.truncatedEdges.length).toBeGreaterThanOrEqual(2);
    expect(report.issues.some((i) => i.id === "clipped_multiple")).toBe(true);
  });

  it("detects garment too far away in the frame", () => {
    const pixels = createBalancedBuffer();
    // Area = 15 * 15 = 225 out of 10,000 (2.25% < 8%)
    const bbox = { x: 50, y: 50, width: 15, height: 15 };

    const report = inspectPhotoQuality(pixels, width, height, { bbox });

    expect(report.framing.status).toBe("too_small");
    expect(report.issues.some((i) => i.id === "too_small")).toBe(true);
  });

  it("works seamlessly without bbox for instant pre-flight check", () => {
    const pixels = createBalancedBuffer();

    const report = inspectPhotoQuality(pixels, width, height);

    expect(report.lighting.status).toBe("optimal");
    expect(report.framing.status).toBe("optimal");
    expect(report.canProceed).toBe(true);
  });
});
