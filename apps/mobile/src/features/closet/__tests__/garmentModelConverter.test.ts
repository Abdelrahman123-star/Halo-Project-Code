import {
  buildGarment3DTemplate,
  convertWardrobeItemToRack3D,
  isLowerBodyCategory,
  mapCategoryToTemplateMesh,
} from "@/features/closet/logic/garmentModelConverter";
import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";

describe("Garment Model Converter", () => {
  const sampleTop: WardrobeItem = {
    id: "00000000-0000-0000-0000-000000000001",
    user_id: "00000000-0000-0000-0000-000000000099",
    name: "Summer Graphic Tee",
    category: "short_sleeved_shirt",
    confidence: 0.95,
    crop_base64: "data:image/jpeg;base64,sampleCrop",
    colors: [{ color_name: "Blue", hex: "#0000ff", rgb: [0, 0, 255], percentage: 80 }],
    attributes: {
      fabric: { predicted: "cotton", confidence: 90, top_candidates: [] },
      pattern: { predicted: "solid", confidence: 85, top_candidates: [] },
      subtype: { predicted: "Crewneck", confidence: 92, top_candidates: [] },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const samplePants: WardrobeItem = {
    id: "00000000-0000-0000-0000-000000000002",
    user_id: "00000000-0000-0000-0000-000000000099",
    name: "Classic Blue Jeans",
    category: "trousers",
    confidence: 0.92,
    crop_base64: "data:image/jpeg;base64,jeansCrop",
    colors: [{ color_name: "Denim Blue", hex: "#1e3a8a", rgb: [30, 58, 138], percentage: 90 }],
    attributes: {
      fabric: { predicted: "denim", confidence: 95, top_candidates: [] },
      pattern: { predicted: "solid", confidence: 90, top_candidates: [] },
      subtype: { predicted: "Straight Jeans", confidence: 90, top_candidates: [] },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("identifies lower body categories", () => {
    expect(isLowerBodyCategory("trousers")).toBe(true);
    expect(isLowerBodyCategory("denim_shorts")).toBe(true);
    expect(isLowerBodyCategory("mini_skirt")).toBe(true);
    expect(isLowerBodyCategory("short_sleeved_shirt")).toBe(false);
    expect(isLowerBodyCategory("jacket")).toBe(false);
  });

  it("maps categories to template mesh types", () => {
    expect(mapCategoryToTemplateMesh("short_sleeved_shirt")).toBe("top_tshirt");
    expect(mapCategoryToTemplateMesh("long_sleeved_shirt")).toBe("top_longsleeve");
    expect(mapCategoryToTemplateMesh("trousers")).toBe("bottom_pants");
    expect(mapCategoryToTemplateMesh("jacket")).toBe("outerwear_jacket");
    expect(mapCategoryToTemplateMesh("dress")).toBe("dress");
  });

  it("converts wardrobe items into 3D rack garments with textures", () => {
    const rackTop = convertWardrobeItemToRack3D(sampleTop);
    expect(rackTop.id).toBe(sampleTop.id);
    expect(rackTop.name).toBe("Summer Graphic Tee");
    expect(rackTop.kind).toBe("shirt");
    expect(rackTop.texture).toBe(sampleTop.crop_base64);
    expect(rackTop.side).toBe(sampleTop.crop_base64);

    const rackPants = convertWardrobeItemToRack3D(samplePants);
    expect(rackPants.kind).toBe("pants");
  });

  it("builds 3D template mesh definition", () => {
    const template = buildGarment3DTemplate(sampleTop);
    expect(template.meshType).toBe("top_tshirt");
    expect(template.baseColor).toBe("#0000ff");
    expect(template.textureUri).toBe(sampleTop.crop_base64);
  });
});

