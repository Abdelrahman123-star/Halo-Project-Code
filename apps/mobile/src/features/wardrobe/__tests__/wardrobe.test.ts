import {
  CreateWardrobeItemInputSchema,
  UpdateWardrobeItemInputSchema,
  WardrobeItemSchema,
} from "@/features/wardrobe/types/wardrobe";
import {
  deleteWardrobeItem,
  fetchWardrobeItems,
  insertWardrobeItem,
  updateWardrobeItem,
} from "@/features/wardrobe/api/wardrobeApi";
import { supabase } from "@/shared/lib/supabase";

jest.mock("@/shared/lib/supabase", () => {
  const mSelect = jest.fn();
  const mOrder = jest.fn();
  const mInsert = jest.fn();
  const mDelete = jest.fn();
  const mUpdate = jest.fn();
  const mEq = jest.fn();
  const mSingle = jest.fn();

  return {
    supabase: {
      from: jest.fn(() => ({
        select: mSelect,
        insert: mInsert,
        delete: mDelete,
        update: mUpdate,
      })),
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    },
    __mocks: { mSelect, mOrder, mInsert, mDelete, mUpdate, mEq, mSingle },
  };
});

describe("Wardrobe Schemas", () => {
  it("validates a proper WardrobeItem", () => {
    const raw = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      user_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      name: "Denim Jeans",
      category: "trousers",
      confidence: 0.94,
      crop_base64: "data:image/jpeg;base64,abc",
      colors: [
        {
          color_name: "Blue",
          hex: "#0000ff",
          rgb: [0, 0, 255],
          percentage: 100,
        },
      ],
      attributes: {
        fabric: { predicted: "denim", confidence: 90, top_candidates: [] },
        pattern: { predicted: "solid", confidence: 85, top_candidates: [] },
        subtype: {
          predicted: "straight-leg denim jeans",
          confidence: 88,
          top_candidates: [],
        },
      },
      created_at: "2026-11-05T12:00:00Z",
      updated_at: "2026-11-05T12:00:00Z",
    };

    const parsed = WardrobeItemSchema.parse(raw);
    expect(parsed.name).toBe("Denim Jeans");
    expect(parsed.category).toBe("trousers");
    expect(parsed.confidence).toBe(0.94);
    expect(parsed.colors).toHaveLength(1);
  });

  it("validates CreateWardrobeItemInputSchema with defaults", () => {
    const parsed = CreateWardrobeItemInputSchema.parse({
      category: "short_sleeved_shirt",
    });
    expect(parsed.name).toBe("Garment");
    expect(parsed.category).toBe("short_sleeved_shirt");
    expect(parsed.colors).toEqual([]);
  });

  it("validates UpdateWardrobeItemInputSchema with partial updates", () => {
    const parsed = UpdateWardrobeItemInputSchema.parse({
      name: "Updated Denim Jacket",
      category: "long_sleeved_outwear",
    });
    expect(parsed.name).toBe("Updated Denim Jacket");
    expect(parsed.category).toBe("long_sleeved_outwear");
    expect(parsed.attributes).toBeUndefined();
  });

  it("rejects invalid UUID in WardrobeItemSchema", () => {
    expect(() =>
      WardrobeItemSchema.parse({
        id: "not-a-uuid",
        user_id: "123",
        name: "Test",
        category: "shirt",
        created_at: "now",
        updated_at: "now",
      }),
    ).toThrow();
  });
});

describe("wardrobeApi", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { __mocks } = jest.requireMock("@/shared/lib/supabase") as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and parses wardrobe items ordered by date", async () => {
    const mockItems = [
      {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
        user_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
        name: "Jacket",
        category: "outwear",
        confidence: 0.91,
        crop_base64: null,
        colors: [],
        attributes: {
          fabric: { predicted: null, confidence: null, top_candidates: [] },
          pattern: { predicted: null, confidence: null, top_candidates: [] },
          subtype: { predicted: null, confidence: null, top_candidates: [] },
        },
        created_at: "2026-11-05T10:00:00Z",
        updated_at: "2026-11-05T10:00:00Z",
      },
    ];

    __mocks.mSelect.mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
    });

    const items = await fetchWardrobeItems();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Jacket");
  });

  it("inserts a wardrobe item with the logged-in user id", async () => {
    const fakeUser = { id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55" };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: fakeUser },
      error: null,
    });

    const insertedRow = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
      user_id: fakeUser.id,
      name: "Tee",
      category: "shirt",
      confidence: 0.95,
      crop_base64: "data:image/jpeg;base64,zzz",
      colors: [],
      attributes: {
        fabric: { predicted: null, confidence: null, top_candidates: [] },
        pattern: { predicted: null, confidence: null, top_candidates: [] },
        subtype: { predicted: null, confidence: null, top_candidates: [] },
      },
      created_at: "2026-11-05T11:00:00Z",
      updated_at: "2026-11-05T11:00:00Z",
    };

    __mocks.mInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: insertedRow, error: null }),
      }),
    });

    const result = await insertWardrobeItem({
      name: "Tee",
      category: "shirt",
      confidence: 0.95,
      crop_base64: "data:image/jpeg;base64,zzz",
      colors: [],
    });

    expect(result.id).toBe(insertedRow.id);
    expect(result.name).toBe("Tee");
  });

  it("updates an existing wardrobe item via Supabase", async () => {
    const updatedRow = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
      user_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
      name: "Polo Shirt",
      category: "short_sleeved_shirt",
      confidence: 0.98,
      crop_base64: null,
      colors: [],
      attributes: {
        fabric: { predicted: "cotton", confidence: 95, top_candidates: [] },
        pattern: { predicted: "solid", confidence: 90, top_candidates: [] },
        subtype: { predicted: "Polo Shirt", confidence: 100, top_candidates: [] },
      },
      created_at: "2026-11-05T11:00:00Z",
      updated_at: "2026-11-06T12:00:00Z",
    };

    __mocks.mUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: updatedRow, error: null }),
        }),
      }),
    });

    const result = await updateWardrobeItem("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99", {
      name: "Polo Shirt",
      category: "short_sleeved_shirt",
    });

    expect(result.id).toBe(updatedRow.id);
    expect(result.name).toBe("Polo Shirt");
    expect(result.category).toBe("short_sleeved_shirt");
  });

  it("deletes a wardrobe item by id", async () => {
    __mocks.mDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    await expect(deleteWardrobeItem("item-123")).resolves.toBeUndefined();
  });
});
