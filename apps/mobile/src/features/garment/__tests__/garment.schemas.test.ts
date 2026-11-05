/**
 * Unit tests for Zod garment schemas.
 * Validates that valid API responses pass and invalid ones are rejected.
 */

import {
  GarmentAnalysisResponseSchema,
  ColorResultSchema,
  AttributeGroupSchema,
  DetectedGarmentSchema,
} from "@/features/garment/types/garment";

const validColor = {
  color_name: "Denim Blue",
  hex: "#3755a0",
  rgb: [55, 85, 160],
  percentage: 72.3,
};

const validAttributeGroup = {
  predicted: "denim",
  confidence: 81.2,
  top_candidates: [{ label: "denim", confidence: 81.2 }],
};

const validGarment = {
  item_number: 1,
  category: "trousers",
  confidence: 0.94,
  crop_base64: "data:image/jpeg;base64,abc123",
  colors: [validColor],
  attributes: {
    fabric: validAttributeGroup,
    pattern: validAttributeGroup,
    subtype: validAttributeGroup,
  },
};

const validResponse = {
  image_width: 1080,
  image_height: 1440,
  total_garments: 1,
  garments: [validGarment],
};

describe("ColorResultSchema", () => {
  it("parses a valid color result", () => {
    expect(() => ColorResultSchema.parse(validColor)).not.toThrow();
  });

  it("rejects rgb with wrong length", () => {
    expect(() =>
      ColorResultSchema.parse({ ...validColor, rgb: [55, 85] }),
    ).toThrow();
  });

  it("rejects missing hex", () => {
    const { hex: _hex, ...rest } = validColor;
    expect(() => ColorResultSchema.parse(rest)).toThrow();
  });
});

describe("AttributeGroupSchema", () => {
  it("parses valid attribute group", () => {
    expect(() => AttributeGroupSchema.parse(validAttributeGroup)).not.toThrow();
  });

  it("allows null predicted and confidence", () => {
    const result = AttributeGroupSchema.parse({
      predicted: null,
      confidence: null,
      top_candidates: [],
    });
    expect(result.predicted).toBeNull();
    expect(result.confidence).toBeNull();
  });
});

describe("DetectedGarmentSchema", () => {
  it("parses a valid garment", () => {
    expect(() => DetectedGarmentSchema.parse(validGarment)).not.toThrow();
  });

  it("allows null crop_base64", () => {
    const result = DetectedGarmentSchema.parse({ ...validGarment, crop_base64: null });
    expect(result.crop_base64).toBeNull();
  });

  it("rejects missing category", () => {
    const { category: _c, ...rest } = validGarment;
    expect(() => DetectedGarmentSchema.parse(rest)).toThrow();
  });
});

describe("GarmentAnalysisResponseSchema", () => {
  it("parses a full valid response", () => {
    const result = GarmentAnalysisResponseSchema.parse(validResponse);
    expect(result.total_garments).toBe(1);
    expect(result.garments[0].category).toBe("trousers");
  });

  it("parses empty garments list", () => {
    const result = GarmentAnalysisResponseSchema.parse({
      ...validResponse,
      total_garments: 0,
      garments: [],
    });
    expect(result.garments).toHaveLength(0);
  });

  it("rejects missing image_width", () => {
    const { image_width: _w, ...rest } = validResponse;
    expect(() => GarmentAnalysisResponseSchema.parse(rest)).toThrow();
  });
});

