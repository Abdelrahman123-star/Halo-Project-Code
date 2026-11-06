import {
  getSectionForCategory,
  groupItemsIntoSections,
  CLOSET_SECTIONS,
} from "@/features/closet/logic/sections";
import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";

describe("Closet Sections Logic", () => {
  it("defines 3 closet sections with metadata", () => {
    expect(CLOSET_SECTIONS).toHaveLength(3);
    expect(CLOSET_SECTIONS.map((s) => s.key)).toEqual([
      "tops",
      "bottoms",
      "outerwear_dresses",
    ]);
  });

  it("maps categories correctly to sections", () => {
    expect(getSectionForCategory("short_sleeved_shirt")).toBe("tops");
    expect(getSectionForCategory("long_sleeved_shirt")).toBe("tops");
    expect(getSectionForCategory("hoodie")).toBe("tops");
    expect(getSectionForCategory("trousers")).toBe("bottoms");
    expect(getSectionForCategory("shorts")).toBe("bottoms");
    expect(getSectionForCategory("skirt")).toBe("bottoms");
    expect(getSectionForCategory("long_sleeved_outwear")).toBe("outerwear_dresses");
    expect(getSectionForCategory("dress")).toBe("outerwear_dresses");
    expect(getSectionForCategory("unknown_garment")).toBe("outerwear_dresses");
  });

  it("groups items into proper sections", () => {
    const mockItem = (id: string, category: string): WardrobeItem => ({
      id: `00000000-0000-0000-0000-00000000000${id}`,
      user_id: "00000000-0000-0000-0000-000000000099",
      name: `Item ${id}`,
      category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      colors: [],
      attributes: {
        fabric: { predicted: null, confidence: null, top_candidates: [] },
        pattern: { predicted: null, confidence: null, top_candidates: [] },
        subtype: { predicted: null, confidence: null, top_candidates: [] },
      },
    });

    const items: WardrobeItem[] = [
      mockItem("1", "short_sleeved_shirt"),
      mockItem("2", "trousers"),
      mockItem("3", "long_sleeved_outwear"),
      mockItem("4", "dress"),
    ];

    const grouped = groupItemsIntoSections(items);
    expect(grouped.tops).toHaveLength(1);
    expect(grouped.tops[0].id).toBe(items[0].id);
    expect(grouped.bottoms).toHaveLength(1);
    expect(grouped.bottoms[0].id).toBe(items[1].id);
    expect(grouped.outerwear_dresses).toHaveLength(2);
  });
});

