/**
 * In-Memory Garment Photo Quality Assessment Engine.
 * Evaluates exposure/lighting, dynamic range, and garment framing/edge-truncation.
 * Pure TypeScript, zero external dependencies, runs in <25ms on RGBA buffers.
 */

import {
  PhotoQualityReportSchema,
  type FramingStatus,
  type LightingStatus,
  type PhotoQualityReport,
  type QualityIssue,
  type QualitySeverity,
} from "@/features/garment/types/quality";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InspectOptions {
  channels?: 3 | 4; // 3 for RGB, 4 for RGBA (default 4)
  stride?: number; // pixel step for fast sampling (default 4)
  bbox?: BoundingBox; // optional detection bounding box for edge-truncation check
}

/**
 * Inspects a decoded image buffer and returns a comprehensive quality report.
 */
export function inspectPhotoQuality(
  pixelData: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  options: InspectOptions = {},
): PhotoQualityReport {
  const channels = options.channels ?? 4;
  const stride = options.stride ?? 4;
  const bbox = options.bbox;

  let totalLuma = 0;
  let totalLumaSq = 0;
  let shadowCount = 0;
  let highlightCount = 0;
  let sampleCount = 0;

  const totalPixels = width * height;
  const step = Math.max(1, stride);

  for (let i = 0; i < totalPixels; i += step) {
    const offset = i * channels;
    const r = pixelData[offset] ?? 0;
    const g = pixelData[offset + 1] ?? 0;
    const b = pixelData[offset + 2] ?? 0;

    // ITU-R BT.601 perceptual luminance
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    totalLuma += luma;
    totalLumaSq += luma * luma;

    if (luma < 25) shadowCount++;
    if (luma > 235) highlightCount++;
    sampleCount++;
  }

  const avgLuma = sampleCount > 0 ? totalLuma / sampleCount : 128;
  const variance =
    sampleCount > 0 ? totalLumaSq / sampleCount - avgLuma * avgLuma : 0;
  const stdDevLuma = Math.sqrt(Math.max(0, variance));
  const shadowRatio = sampleCount > 0 ? shadowCount / sampleCount : 0;
  const highlightRatio = sampleCount > 0 ? highlightCount / sampleCount : 0;

  const issues: QualityIssue[] = [];
  let score = 100;

  // --- 1. Lighting Assessment ---
  let lightingStatus: LightingStatus = "optimal";
  let lightingDesc = "Lighting is well-balanced.";

  if (avgLuma < 50 || shadowRatio > 0.45) {
    lightingStatus = "underexposed";
    lightingDesc = "Photo is too dark. Fabric textures and dark colors may be hard to distinguish.";
    score -= 35;
    issues.push({
      id: "underexposed",
      title: "Low Lighting 💡",
      message: "The photo is quite dark. Turn on room lights or take the photo in a brighter spot.",
      severity: avgLuma < 35 ? "critical" : "warning",
    });
  } else if (avgLuma > 215 || highlightRatio > 0.35) {
    lightingStatus = "overexposed";
    lightingDesc = "Photo is overexposed. Glare or direct flash may wash out colors.";
    score -= 35;
    issues.push({
      id: "overexposed",
      title: "Harsh Glare / Overexposure ☀️",
      message: "The photo is washed out. Avoid direct flash or harsh reflection directly on the fabric.",
      severity: avgLuma > 230 ? "critical" : "warning",
    });
  } else if (stdDevLuma < 22) {
    lightingStatus = "low_contrast";
    lightingDesc = "Lighting has low contrast. Garment edges may blend with the background.";
    score -= 15;
    issues.push({
      id: "low_contrast",
      title: "Low Contrast 🌫️",
      message: "Use a contrasting background (e.g. light garment on dark surface, or vice versa).",
      severity: "warning",
    });
  }

  // --- 2. Framing & Truncation Assessment ---
  let framingStatus: FramingStatus = "optimal";
  let framingDesc = "Garment is well-centered in frame.";
  const truncatedEdges: string[] = [];

  if (bbox && width > 0 && height > 0) {
    const xMin = bbox.x - bbox.width / 2;
    const xMax = bbox.x + bbox.width / 2;
    const yMin = bbox.y - bbox.height / 2;
    const yMax = bbox.y + bbox.height / 2;

    const marginThreshold = 0.04; // 4% border margin
    const leftMargin = xMin / width;
    const rightMargin = (width - xMax) / width;
    const topMargin = yMin / height;
    const bottomMargin = (height - yMax) / height;

    if (topMargin < marginThreshold) truncatedEdges.push("top (collar/neckline)");
    if (bottomMargin < marginThreshold) truncatedEdges.push("bottom (hem)");
    if (leftMargin < marginThreshold) truncatedEdges.push("left sleeve/side");
    if (rightMargin < marginThreshold) truncatedEdges.push("right sleeve/side");

    const areaRatio = (bbox.width * bbox.height) / (width * height);

    if (truncatedEdges.length >= 2) {
      framingStatus = "clipped_multiple";
      framingDesc = `Garment is cut off on ${truncatedEdges.join(" and ")}.`;
      score -= 30;
      issues.push({
        id: "clipped_multiple",
        title: "Garment Not Fully in Frame 📐",
        message: `Parts of the garment are cut off on the ${truncatedEdges.join(", ")}. Step back to include the entire item.`,
        severity: "warning",
      });
    } else if (truncatedEdges.length === 1) {
      const edge = truncatedEdges[0];
      framingStatus = edge.includes("top")
        ? "clipped_top"
        : edge.includes("bottom")
          ? "clipped_bottom"
          : edge.includes("left")
            ? "clipped_left"
            : "clipped_right";
      framingDesc = `Garment is cut off at the ${edge}.`;
      score -= 20;
      issues.push({
        id: "clipped_edge",
        title: "Garment Edge Cut Off 📐",
        message: `The garment is touching the edge at the ${edge}. Step back slightly so it fits completely.`,
        severity: "warning",
      });
    } else if (areaRatio < 0.08) {
      framingStatus = "too_small";
      framingDesc = "Garment is too far away in the frame.";
      score -= 15;
      issues.push({
        id: "too_small",
        title: "Garment Too Far Away 🔍",
        message: "The clothing item is quite small in the frame. Move closer or zoom slightly.",
        severity: "warning",
      });
    }
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(score)));
  let severity: QualitySeverity = "good";
  if (finalScore < 50 || issues.some((i) => i.severity === "critical")) {
    severity = "critical";
  } else if (finalScore < 80 || issues.length > 0) {
    severity = "warning";
  }

  const report: PhotoQualityReport = {
    score: finalScore,
    severity,
    lighting: {
      status: lightingStatus,
      averageLuma: Math.round(avgLuma),
      description: lightingDesc,
    },
    framing: {
      status: framingStatus,
      description: framingDesc,
      truncatedEdges,
    },
    issues,
    canProceed: true, // Non-blocking: user can always choose to proceed
  };

  return PhotoQualityReportSchema.parse(report);
}

