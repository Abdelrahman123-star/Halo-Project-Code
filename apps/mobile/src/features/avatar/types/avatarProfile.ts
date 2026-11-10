/**
 * Zod schemas for POST /v1/avatar/preprocess (see services/api/app/ai/avatar/schemas.py).
 * Only the fields the app reads are declared; unknown keys are stripped. Unknown or
 * low-confidence measurements arrive as null and must be shown as "not measured".
 */
import { z } from 'zod';

const nullableNumber = z.number().nullable();

export const ScanViewSchema = z.enum(['front', 'back', 'face']);
export type ScanView = z.infer<typeof ScanViewSchema>;

export const ValidationIssueSchema = z.object({
  view: ScanViewSchema,
  code: z.string(),
  severity: z.enum(['error', 'warning']),
  message: z.string(),
});
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

const ViewValidationSchema = z.object({
  quality: z.object({
    width: z.number(),
    height: z.number(),
    brightness: z.number(),
    sharpness: z.number(),
  }),
  person_detected: z.boolean().nullable().optional(),
  full_body_visible: z.boolean().nullable().optional(),
  face_detected: z.boolean().nullable().optional(),
  face_size_ratio: nullableNumber.optional(),
});

export const ValidationReportSchema = z.object({
  passed: z.boolean(),
  views: z.object({ front: ViewValidationSchema, back: ViewValidationSchema, face: ViewValidationSchema }),
  issues: z.array(ValidationIssueSchema),
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;

const BodyLandmarkRatiosSchema = z.object({
  shoulder_to_height: nullableNumber,
  hip_to_height: nullableNumber,
  torso_to_height: nullableNumber,
  upper_arm_to_height: nullableNumber,
  lower_arm_to_height: nullableNumber,
  upper_leg_to_height: nullableNumber,
  lower_leg_to_height: nullableNumber,
});

const TorsoProportionsSchema = z.object({
  waist_to_shoulder: nullableNumber,
  waist_to_hip: nullableNumber,
  shoulder_to_hip: nullableNumber,
});

const BodyViewSchema = z.object({
  mean_visibility: z.number(),
  landmarks: z.array(z.object({ x: z.number(), y: z.number() })),
});

export const AvatarProfileSchema = z.object({
  profile_version: z.string(),
  pipeline_version: z.string(),
  body: z.object({
    landmark_ratios: BodyLandmarkRatiosSchema,
    torso: TorsoProportionsSchema,
    views: z.object({ front: BodyViewSchema, back: BodyViewSchema.optional() }),
  }),
  face: z.object({
    ratios: z.object({
      face_width_to_height: nullableNumber,
      eye_distance_to_face_width: nullableNumber,
      nose_width_to_face_width: nullableNumber,
      lip_width_to_face_width: nullableNumber,
    }),
    landmarks: z.array(z.object({ x: z.number(), y: z.number() })),
  }),
});
export type AvatarProfile = z.infer<typeof AvatarProfileSchema>;

export const AvatarPreprocessResponseSchema = z.object({
  // null when the server has no service-role key yet and did not save to the database
  avatar_id: z.string().nullable(),
  scan_id: z.string().nullable(),
  saved: z.boolean(),
  user_id: z.string(),
  status: z.literal('ready'),
  created_at: z.string(),
  profile: AvatarProfileSchema,
  validation: ValidationReportSchema,
  timings: z.object({ total_ms: z.number() }),
});
export type AvatarPreprocessResponse = z.infer<typeof AvatarPreprocessResponseSchema>;

/** docs/API.md error shape. */
export const ApiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
