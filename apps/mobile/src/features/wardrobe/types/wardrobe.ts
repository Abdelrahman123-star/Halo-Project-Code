/**
 * Zod schemas, TypeScript types, and category metadata for Digital Wardrobe items.
 * Preserves immutable `ai_original` predictions separately from user-edited metadata (AGENTS.md §3).
 */

import { z } from "zod";
import {
  AttributeGroupSchema,
  ColorResultSchema,
} from "@/features/garment/types/garment";

export const AiOriginalMetadataSchema = z.object({
  category: z.string(),
  subtype: z.string().nullable().default(null),
  fabric: z.string().nullable().default(null),
  pattern: z.string().nullable().default(null),
});

export type AiOriginalMetadata = z.infer<typeof AiOriginalMetadataSchema>;

const EmptyAttrGroup = {
  predicted: null,
  confidence: null,
  top_candidates: [],
};

export const WardrobeAttributesSchema = z.object({
  fabric: AttributeGroupSchema.default(EmptyAttrGroup),
  pattern: AttributeGroupSchema.default(EmptyAttrGroup),
  subtype: AttributeGroupSchema.default(EmptyAttrGroup),
  ai_original: AiOriginalMetadataSchema.optional(),
});

export type WardrobeAttributes = z.infer<typeof WardrobeAttributesSchema>;

export const WardrobeItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  confidence: z.number().nullable().optional(),
  crop_base64: z.string().nullable().optional(),
  // Back view of the garment (migration 0003). Used to texture the back of the 3D model.
  back_crop_base64: z.string().nullable().optional(),
  colors: z.array(ColorResultSchema).default([]),
  attributes: WardrobeAttributesSchema.optional().default({
    fabric: EmptyAttrGroup,
    pattern: EmptyAttrGroup,
    subtype: EmptyAttrGroup,
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;

export const CreateWardrobeItemInputSchema = z.object({
  name: z.string().min(1).default("Garment"),
  category: z.string().min(1),
  confidence: z.number().nullable().optional(),
  crop_base64: z.string().nullable().optional(),
  back_crop_base64: z.string().nullable().optional(),
  colors: z.array(ColorResultSchema).default([]),
  attributes: WardrobeAttributesSchema.optional(),
});

export type CreateWardrobeItemInput = z.infer<typeof CreateWardrobeItemInputSchema>;

export const UpdateWardrobeItemInputSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  colors: z.array(ColorResultSchema).optional(),
  attributes: WardrobeAttributesSchema.optional(),
});

export type UpdateWardrobeItemInput = z.infer<typeof UpdateWardrobeItemInputSchema>;

export type WardrobeFilterGroup = "all" | "tops" | "bottoms" | "outerwear" | "dresses";

export interface CategoryOption {
  value: string;
  label: string;
  group: Exclude<WardrobeFilterGroup, "all">;
  icon: string;
  subtypes: string[];
}

export const WARDROBE_CATEGORIES: CategoryOption[] = [
  {
    value: "short_sleeved_shirt",
    label: "T-Shirt / Top",
    group: "tops",
    icon: "top",
    subtypes: ["Crewneck T-shirt", "Polo Shirt", "Ribbed Top", "Graphic Tee", "Crop Top", "Vest / Tank"],
  },
  {
    value: "long_sleeved_shirt",
    label: "Long Sleeve / Sweater",
    group: "tops",
    icon: "shirt",
    subtypes: ["Button-up Shirt", "Knit Sweater", "Hoodie Sweatshirt", "Long Sleeve Tee", "Cardigan"],
  },
  {
    value: "trousers",
    label: "Pants & Trousers",
    group: "bottoms",
    icon: "trousers",
    subtypes: ["Straight-leg Denim Jeans", "Tailored Chinos", "Cargo Pants", "Sweatpants Joggers", "Wide-leg Pants"],
  },
  {
    value: "shorts",
    label: "Shorts",
    group: "bottoms",
    icon: "shorts",
    subtypes: ["Denim Shorts", "Chino Shorts", "Athletic Shorts", "Linen Shorts"],
  },
  {
    value: "skirt",
    label: "Skirt",
    group: "bottoms",
    icon: "skirt",
    subtypes: ["Mini Skirt", "Midi Skirt", "Pleated Skirt", "Denim Skirt"],
  },
  {
    value: "long_sleeved_outwear",
    label: "Jacket & Coat",
    group: "outerwear",
    icon: "jacket",
    subtypes: ["Denim Jacket", "Leather Jacket", "Puffer Jacket", "Trench Coat", "Tailored Blazer"],
  },
  {
    value: "short_sleeved_outwear",
    label: "Vest / Sleeveless Outwear",
    group: "outerwear",
    icon: "vest",
    subtypes: ["Utility Vest", "Puffer Vest", "Sweater Vest"],
  },
  {
    value: "dress",
    label: "Dress",
    group: "dresses",
    icon: "dress",
    subtypes: ["Summer Sundress", "Slip Dress", "Maxi Dress", "Cocktail Dress"],
  },
];

export const COMMON_FABRICS = [
  "cotton",
  "denim",
  "linen",
  "leather",
  "wool",
  "polyester",
  "silk",
  "corduroy",
  "fleece",
];

export const COMMON_PATTERNS = [
  "solid plain",
  "striped",
  "plaid",
  "floral",
  "graphic print",
  "houndstooth",
];

export function getCategoryOption(categoryValue: string): CategoryOption | undefined {
  const normalized = categoryValue.toLowerCase();
  const exact = WARDROBE_CATEGORIES.find((c) => c.value === normalized);
  if (exact) return exact;
  if (normalized.includes("dress")) {
    return WARDROBE_CATEGORIES.find((c) => c.value === "dress");
  }
  if (normalized === "vest" || normalized === "sling") {
    return WARDROBE_CATEGORIES.find((c) => c.value === "short_sleeved_shirt");
  }
  return undefined;
}

export function getCategoryLabel(categoryValue: string): string {
  const found = getCategoryOption(categoryValue);
  if (found) return found.label;
  const cleaned = categoryValue.replace(/_/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Garment";
}

export function getCategoryGroup(categoryValue: string): Exclude<WardrobeFilterGroup, "all"> {
  const found = getCategoryOption(categoryValue);
  if (found) return found.group;
  const lower = categoryValue.toLowerCase();
  if (lower.includes("dress")) return "dresses";
  if (lower.includes("outwear") || lower.includes("jacket") || lower.includes("coat")) return "outerwear";
  if (lower.includes("trouser") || lower.includes("pant") || lower.includes("short") || lower.includes("skirt")) {
    return "bottoms";
  }
  return "tops";
}
