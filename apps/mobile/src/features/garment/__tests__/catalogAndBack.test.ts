import { pairBackCrops } from "@/features/garment/api/backPhotoMatcher";
import { applyCatalogGrade, illuminantFromBackground } from "@/features/garment/api/catalogGrade";
import type { DetectedGarment } from "@/features/garment/types/garment";

function garment(item_number: number, category: string, confidence: number, crop: string | null): DetectedGarment {
  const empty = { predicted: null, confidence: null, top_candidates: [] };
  return {
    item_number,
    category,
    confidence,
    crop_base64: crop,
    colors: [],
    attributes: { fabric: empty, pattern: empty, subtype: empty },
  };
}

describe("pairBackCrops", () => {
  it("prefers the same category, then the highest confidence, and uses each back once", () => {
    const front = [garment(1, "short_sleeved_shirt", 0.9, "F1"), garment(2, "trousers", 0.8, "F2")];
    const back = [
      garment(1, "trousers", 0.7, "B-trousers"),
      garment(2, "short_sleeved_shirt", 0.6, "B-shirt-low"),
      garment(3, "short_sleeved_shirt", 0.95, "B-shirt-high"),
    ];
    const paired = pairBackCrops(front, back);
    expect(paired[0].back_crop_base64).toBe("B-shirt-high");
    expect(paired[1].back_crop_base64).toBe("B-trousers");
  });

  it("falls back to the same group and leaves unmatched garments without a back", () => {
    const front = [garment(1, "long_sleeved_shirt", 0.9, "F1"), garment(2, "skirt", 0.9, "F2")];
    const back = [garment(1, "short_sleeved_shirt", 0.8, "B-top")];
    const paired = pairBackCrops(front, back);
    expect(paired[0].back_crop_base64).toBe("B-top");
    expect(paired[1].back_crop_base64).toBeNull();
  });
});

describe("catalog grade", () => {
  it("only trusts light, neutral backgrounds for white balance", () => {
    expect(illuminantFromBackground(240 * 100, 230 * 100, 200 * 100, 100)).not.toBeNull();
    expect(illuminantFromBackground(60 * 100, 60 * 100, 60 * 100, 100)).toBeNull(); // too dark
    expect(illuminantFromBackground(250 * 100, 120 * 100, 120 * 100, 100)).toBeNull(); // coloured
    expect(illuminantFromBackground(0, 0, 0, 3)).toBeNull(); // too few samples
  });

  it("removes a warm colour cast measured from the background", () => {
    const n = 16;
    const channels = [new Float32Array(n).fill(0.6), new Float32Array(n).fill(0.55), new Float32Array(n).fill(0.45)];
    const mask = new Uint8Array(n).fill(1);
    const warmLight = illuminantFromBackground(250 * 100, 235 * 100, 200 * 100, 100);
    expect(warmLight).not.toBeNull();
    applyCatalogGrade(channels, mask, 4, 4, warmLight);
    const castBefore = 0.6 - 0.45;
    const castAfter = channels[0][5] - channels[2][5];
    expect(castAfter).toBeLessThan(castBefore);
  });
});
