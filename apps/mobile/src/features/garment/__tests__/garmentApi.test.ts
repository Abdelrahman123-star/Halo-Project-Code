import * as jpeg from "jpeg-js";

import { classifyGarmentAttributes } from "@/features/garment/api/attributeClassifier";
import {
  extractGarmentColorsFromPixels,
  matchColorName,
} from "@/features/garment/api/colorExtractor";
import {
  analyzeGarment,
  ROBOFLOW_NOT_CONFIGURED_MESSAGE,
} from "@/features/garment/api/garmentApi";
import {
  base64ToUint8Array,
  cropAndCleanGarment,
  decodeJpegBase64,
  isLowerBodyGarment,
  isPointInPolygon,
  uint8ArrayToBase64,
} from "@/features/garment/api/imageProcessor";

function createTestJpegBase64(
  width: number,
  height: number,
  rgb: [number, number, number],
): string {
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = rgb[0];
    rgba[i * 4 + 1] = rgb[1];
    rgba[i * 4 + 2] = rgb[2];
    rgba[i * 4 + 3] = 255;
  }
  const encoded = jpeg.encode({ data: rgba, width, height }, 90);
  return uint8ArrayToBase64(encoded.data);
}

describe("Garment native in-app pipeline", () => {
  const originalKey = process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY;

  beforeEach(() => {
    // Test-only placeholder; real keys come from the developer's untracked .env.
    process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY = "test-roboflow-key";
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY = originalKey;
  });

  it("fails fast with a clear message when the Roboflow key is missing", async () => {
    delete process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY;
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock;

    await expect(
      analyzeGarment("file:///memory/shirt.jpg", "image/jpeg", "abc"),
    ).rejects.toThrow(ROBOFLOW_NOT_CONFIGURED_MESSAGE);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats the .env.example placeholder as a missing key", async () => {
    process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY = "your_roboflow_api_key_here";
    await expect(
      analyzeGarment("file:///memory/shirt.jpg", "image/jpeg", "abc"),
    ).rejects.toThrow(ROBOFLOW_NOT_CONFIGURED_MESSAGE);
  });

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("matches perceptual fashion colors accurately", () => {
    expect(matchColorName([20, 20, 20])).toBe("Black");
    expect(matchColorName([245, 245, 245])).toBe("White");
    expect(matchColorName([55, 85, 130])).toBe("Denim Blue");
    expect(matchColorName([205, 35, 35])).toBe("Red");
  });

  it("extracts dominant garment colors from RGBA pixel buffers", () => {
    const b64 = createTestJpegBase64(40, 40, [205, 35, 35]);
    const decoded = decodeJpegBase64(b64);

    const colors = extractGarmentColorsFromPixels(
      decoded.data,
      decoded.width,
      decoded.height,
      { x: 20, y: 20, width: 30, height: 30 },
    );

    expect(colors.length).toBeGreaterThanOrEqual(1);
    expect(colors[0].color_name).toBe("Red");
    expect(colors[0].percentage).toBeGreaterThan(80);
  });

  it("round-trips base64 and isolates garment polygon onto a white background", () => {
    const raw = new Uint8Array([10, 20, 30, 40, 50]);
    const b64 = uint8ArrayToBase64(raw);
    expect(Array.from(base64ToUint8Array(b64))).toEqual(Array.from(raw));

    expect(
      isPointInPolygon(15, 15, [
        [10, 10],
        [20, 10],
        [20, 20],
        [10, 20],
      ]),
    ).toBe(true);
    expect(
      isPointInPolygon(5, 5, [
        [10, 10],
        [20, 10],
        [20, 20],
        [10, 20],
      ]),
    ).toBe(false);

    expect(isLowerBodyGarment("short_sleeved_shirt")).toBe(false);
    expect(isLowerBodyGarment("trousers")).toBe(true);

    const imgB64 = createTestJpegBase64(40, 40, [30, 80, 200]);
    const decoded = decodeJpegBase64(imgB64);
    const cropUri = cropAndCleanGarment(decoded, {
      x: 20,
      y: 20,
      width: 20,
      height: 20,
      points: [
        { x: 12, y: 12 },
        { x: 28, y: 12 },
        { x: 28, y: 28 },
        { x: 12, y: 28 },
      ],
    });
    expect(cropUri.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("classifies attributes from category and dominant colors", () => {
    const attrs = classifyGarmentAttributes(
      "trousers",
      [
        {
          color_name: "Denim Blue",
          hex: "#375582",
          rgb: [55, 85, 130],
          percentage: 88.0,
        },
      ],
      91.2,
    );

    expect(attrs.fabric.predicted).toBe("denim");
    expect(attrs.pattern.predicted).toBe("solid plain");
    expect(attrs.subtype.predicted).toBe("straight-leg denim jeans");
  });

  it("executes analyzeGarment end-to-end with in-memory JPEG and Roboflow response", async () => {
    const testB64 = createTestJpegBase64(60, 60, [55, 85, 130]);

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        predictions: [
          {
            x: 30,
            y: 30,
            width: 40,
            height: 40,
            confidence: 0.924,
            class: "short_sleeved_shirt",
            points: [
              { x: 12, y: 12 },
              { x: 48, y: 12 },
              { x: 48, y: 48 },
              { x: 12, y: 48 },
            ],
          },
        ],
      }),
    });

    const result = await analyzeGarment(
      "file:///memory/shirt.jpg",
      "image/jpeg",
      testB64,
    );

    expect(result.total_garments).toBe(1);
    expect(result.image_width).toBe(60);
    expect(result.image_height).toBe(60);
    expect(result.garments[0].category).toBe("short_sleeved_shirt");
    expect(result.garments[0].confidence).toBeCloseTo(0.924, 3);
    expect(
      result.garments[0].crop_base64?.startsWith("data:image/jpeg;base64,"),
    ).toBe(true);
    expect(result.garments[0].colors[0].color_name).toBe("Denim Blue");
    expect(result.garments[0].attributes.subtype.predicted).toBe(
      "crewneck t-shirt",
    );
  });

  it("surfaces cloud API errors cleanly", async () => {
    const testB64 = createTestJpegBase64(20, 20, [20, 20, 20]);

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        message: "Invalid API key",
      }),
    });

    await expect(
      analyzeGarment("file:///memory/shirt.jpg", "image/jpeg", testB64),
    ).rejects.toThrow("Invalid API key");
  });
});
