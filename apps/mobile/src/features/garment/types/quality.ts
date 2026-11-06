/**
 * Zod schemas and TypeScript types for Garment Photo Quality Assessment.
 * Evaluates exposure/lighting, contrast, and edge truncation/framing.
 */

import { z } from "zod";

export const LightingStatusSchema = z.enum([
  "optimal",
  "underexposed", // too dark
  "overexposed", // too bright / glare
  "low_contrast", // flat lighting / hazy
]);

export type LightingStatus = z.infer<typeof LightingStatusSchema>;

export const FramingStatusSchema = z.enum([
  "optimal",
  "clipped_top",
  "clipped_bottom",
  "clipped_left",
  "clipped_right",
  "clipped_multiple",
  "too_small",
  "unknown",
]);

export type FramingStatus = z.infer<typeof FramingStatusSchema>;

export const QualitySeveritySchema = z.enum(["good", "warning", "critical"]);

export type QualitySeverity = z.infer<typeof QualitySeveritySchema>;

export const QualityIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  severity: QualitySeveritySchema,
});

export type QualityIssue = z.infer<typeof QualityIssueSchema>;

export const PhotoQualityReportSchema = z.object({
  score: z.number().int().min(0).max(100),
  severity: QualitySeveritySchema,
  lighting: z.object({
    status: LightingStatusSchema,
    averageLuma: z.number(),
    description: z.string(),
  }),
  framing: z.object({
    status: FramingStatusSchema,
    description: z.string(),
    truncatedEdges: z.array(z.string()),
  }),
  issues: z.array(QualityIssueSchema),
  canProceed: z.boolean(),
});

export type PhotoQualityReport = z.infer<typeof PhotoQualityReportSchema>;

