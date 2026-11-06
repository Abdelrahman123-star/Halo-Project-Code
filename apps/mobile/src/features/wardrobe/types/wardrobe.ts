/**
 * Zod schemas and TypeScript types for Digital Wardrobe items.
 */

import { z } from "zod";
import {
  ColorResultSchema,
  GarmentAttributesSchema,
} from "@/features/garment/types/garment";

export const WardrobeItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  confidence: z.number().nullable().optional(),
  crop_base64: z.string().nullable().optional(),
  colors: z.array(ColorResultSchema).default([]),
  attributes: GarmentAttributesSchema.optional().default({
    fabric: { predicted: null, confidence: null, top_candidates: [] },
    pattern: { predicted: null, confidence: null, top_candidates: [] },
    subtype: { predicted: null, confidence: null, top_candidates: [] },
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
  colors: z.array(ColorResultSchema).default([]),
  attributes: GarmentAttributesSchema.optional(),
});

export type CreateWardrobeItemInput = z.infer<typeof CreateWardrobeItemInputSchema>;

export const UpdateWardrobeItemInputSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  colors: z.array(ColorResultSchema).optional(),
  attributes: GarmentAttributesSchema.optional(),
});

export type UpdateWardrobeItemInput = z.infer<typeof UpdateWardrobeItemInputSchema>;

export interface CategoryOption {
  value: string;
  label: string;
  icon: string;
  subtypes: string[];
}

export const WARDROBE_CATEGORIES: CategoryOption[] = [
  {
    value: "short_sleeved_shirt",
    label: "T-Shirt / Top",
    icon: "👕",
    subtypes: ["Crewneck T-shirt", "Polo Shirt", "Ribbed Top", "Graphic Tee", "Crop Top"],
  },
  {
    value: "long_sleeved_shirt",
    label: "Long Sleeve / Sweater",
    icon: "👔",
    subtypes: ["Button-up Shirt", "Knit Sweater", "Hoodie Sweatshirt", "Long Sleeve Tee"],
  },
  {
    value: "trousers",
    label: "Pants & Trousers",
    icon: "👖",
    subtypes: ["Denim Jeans", "Tailored Chinos", "Cargo Pants", "Sweatpants Joggers", "Wide-leg Pants"],
  },
  {
    value: "shorts",
    label: "Shorts",
    icon: "🩳",
    subtypes: ["Denim Shorts", "Chino Shorts", "Athletic Shorts", "Linen Shorts"],
  },
  {
    value: "skirt",
    label: "Skirt",
    icon: "👗",
    subtypes: ["Mini Skirt", "Midi Skirt", "Pleated Skirt", "Denim Skirt"],
  },
  {
    value: "long_sleeved_outwear",
    label: "Jacket & Coat",
    icon: "🧥",
    subtypes: ["Denim Jacket", "Leather Jacket", "Puffer Jacket", "Trench Coat", "Tailored Blazer"],
  },
  {
    value: "short_sleeved_outwear",
    label: "Vest / Sleeveless Outwear",
    icon: "🦺",
    subtypes: ["Utility Vest", "Puffer Vest", "Sweater Vest"],
  },
  {
    value: "dress",
    label: "Dress",
    icon: "👗",
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
