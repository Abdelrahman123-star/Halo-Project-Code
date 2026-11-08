/**
 * Zod schemas and TypeScript types for the garment analysis API response.
 * Mirrors the Pydantic schemas in services/api/app/ai/garment/schemas.py.
 */

import { z } from "zod";

export const ColorResultSchema = z.object({
  color_name: z.string(),
  hex: z.string(),
  rgb: z.array(z.number().int()).min(3).max(3),
  percentage: z.number(),
});

export const AttributeCandidateSchema = z.object({
  label: z.string(),
  confidence: z.number(),
});

export const AttributeGroupSchema = z.object({
  predicted: z.string().nullable(),
  confidence: z.number().nullable(),
  top_candidates: z.array(AttributeCandidateSchema),
});

export const GarmentAttributesSchema = z.object({
  fabric: AttributeGroupSchema,
  pattern: AttributeGroupSchema,
  subtype: AttributeGroupSchema,
});

export const DetectedGarmentSchema = z.object({
  item_number: z.number().int(),
  category: z.string(),
  confidence: z.number(),
  // base64 data URI string or null
  crop_base64: z.string().nullable(),
  // Cleaned crop of the same garment from the optional back photo.
  back_crop_base64: z.string().nullable().optional(),
  colors: z.array(ColorResultSchema),
  attributes: GarmentAttributesSchema,
});

export const GarmentAnalysisResponseSchema = z.object({
  image_width: z.number().int(),
  image_height: z.number().int(),
  total_garments: z.number().int(),
  garments: z.array(DetectedGarmentSchema),
});

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const ApiErrorSchema = z.object({
  error: ApiErrorDetailSchema,
});

// Inferred TypeScript types
export type ColorResult = z.infer<typeof ColorResultSchema>;
export type AttributeCandidate = z.infer<typeof AttributeCandidateSchema>;
export type AttributeGroup = z.infer<typeof AttributeGroupSchema>;
export type GarmentAttributes = z.infer<typeof GarmentAttributesSchema>;
export type DetectedGarment = z.infer<typeof DetectedGarmentSchema>;
export type GarmentAnalysisResponse = z.infer<typeof GarmentAnalysisResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
