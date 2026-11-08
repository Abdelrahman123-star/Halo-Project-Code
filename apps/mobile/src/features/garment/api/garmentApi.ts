/**
 * Native In-App Garment Analysis Pipeline with Comprehensive Terminal Logging.
 * Calls Roboflow Serverless HTTPS API directly with base64 image data,
 * then executes in-memory pixel segmentation, white-background isolation, K-Means
 * color clustering, and attribute classification on-device. Zero disk writes.
 */

import { File as ExpoFile } from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import { classifyGarmentAttributes } from "@/features/garment/api/attributeClassifier";
import { extractGarmentColorsFromPixels } from "@/features/garment/api/colorExtractor";
import {
  cropAndCleanGarment,
  decodeJpegBase64,
  type RawPrediction,
} from "@/features/garment/api/imageProcessor";
import {
  GarmentAnalysisResponseSchema,
  type DetectedGarment,
  type GarmentAnalysisResponse,
} from "@/features/garment/types/garment";

const DEFAULT_ROBOFLOW_MODEL = "deepfashion2-m-10k/2";

export const ROBOFLOW_NOT_CONFIGURED_MESSAGE =
  "Garment recognition isn't set up in this app build (missing Roboflow API key).";

/**
 * Reads the Roboflow config from the environment. There is deliberately no built-in
 * fallback key: a missing key fails fast with a clear message instead of silently
 * using a shared secret.
 */
export function getRoboflowConfig(): { apiKey: string; modelId: string } {
  const apiKey = process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY?.trim() ?? "";
  if (!apiKey || apiKey.startsWith("your_")) {
    throw new Error(ROBOFLOW_NOT_CONFIGURED_MESSAGE);
  }
  const modelId =
    process.env.EXPO_PUBLIC_ROBOFLOW_MODEL_ID?.trim() || DEFAULT_ROBOFLOW_MODEL;
  return { apiKey, modelId };
}

async function resolveBase64(
  imageUri: string,
  imageBase64?: string | null,
): Promise<string> {
  if (imageBase64 && imageBase64.length > 0) {
    return imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  }

  if (imageUri.startsWith("data:image/")) {
    return imageUri.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  }

  // If local file URI, optimize resolution natively before sending to Roboflow
  if (imageUri.startsWith("file://") || imageUri.startsWith("content://")) {
    try {
      const manip = await manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.82, format: SaveFormat.JPEG, base64: true },
      );
      if (manip.base64) {
        return manip.base64;
      }
    } catch {
      // Fallback to direct file read if manipulator fails
    }
  }

  const file = new ExpoFile(imageUri);
  return await file.base64();
}

interface RoboflowResponse {
  predictions?: RawPrediction[];
  message?: string;
  error?: string;
}

export type ProgressCallback = (stage: string) => void;

/**
 * Analyzes a garment photo directly on-device + Roboflow Cloud HTTPS API.
 * Never depends on a local PC server or tunnel.
 */
export async function analyzeGarment(
  imageUri: string,
  _mimeType: string = "image/jpeg",
  imageBase64?: string | null,
  onProgress?: ProgressCallback,
): Promise<GarmentAnalysisResponse> {
  const startTime = Date.now();
  console.log("============================================================");
  console.log("[HALO Garment] 🚀 Garment Analysis Pipeline Started");
  console.log(`[HALO Garment] Input URI: ${imageUri.slice(0, 60)}...`);

  // Check configuration before any image work so a missing key fails immediately.
  const { apiKey, modelId } = getRoboflowConfig();

  onProgress?.("Preparing image...");
  const cleanBase64 = await resolveBase64(imageUri, imageBase64);
  if (!cleanBase64) {
    console.error("[HALO Garment] ❌ Failed to read image base64 data");
    throw new Error("Could not read image data from the selected photo.");
  }

  const payloadKb = Math.round((cleanBase64.length * 0.75) / 1024);
  console.log(`[HALO Garment] Image Payload Size: ~${payloadKb} KB`);

  // [1/4] Roboflow Detection
  const endpoint = `https://serverless.roboflow.com/${modelId}?api_key=${encodeURIComponent(apiKey)}`;
  console.log(`[HALO Garment] [1/4] Calling Roboflow (${modelId})...`);
  onProgress?.("Detecting garments with AI...");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  let response: Response;
  const netStart = Date.now();

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: cleanBase64,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[HALO Garment] ❌ Roboflow API timed out after 25s");
      throw new Error("Garment detection timed out after 25s. Check your internet.");
    }
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[HALO Garment] ❌ Network error reaching Roboflow: ${detail}`);
    throw new Error(`Network error (${detail}). Check your internet connection.`);
  } finally {
    clearTimeout(timeoutId);
  }

  const netTime = Date.now() - netStart;
  console.log(`[HALO Garment] Roboflow responded in ${netTime}ms with HTTP ${response.status}`);

  if (!response.ok) {
    let errorDetail = `Roboflow returned HTTP ${response.status}`;
    try {
      const errBody = (await response.json()) as RoboflowResponse;
      if (errBody.message || errBody.error) {
        errorDetail = errBody.message ?? errBody.error ?? errorDetail;
      }
    } catch {
      // keep fallback
    }
    console.error(`[HALO Garment] ❌ Roboflow error response: ${errorDetail}`);
    throw new Error(errorDetail);
  }

  const rawJson = (await response.json()) as RoboflowResponse;
  const predictions = Array.isArray(rawJson.predictions) ? rawJson.predictions : [];
  console.log(`[HALO Garment] Found ${predictions.length} garment prediction(s)`);

  // [2/4] Decode JPEG buffer
  onProgress?.("Decoding image pixels...");
  const decodeStart = Date.now();
  const decoded = decodeJpegBase64(cleanBase64);
  console.log(`[HALO Garment] [2/4] Decoded ${decoded.width}x${decoded.height} in ${Date.now() - decodeStart}ms`);

  // [3/4] Crop, isolate on white background, extract colors & attributes
  onProgress?.("Extracting colors and attributes...");
  const garments: DetectedGarment[] = predictions.map((pred, index) => {
    const category = pred.class ?? "Unknown";
    const rawConf = pred.confidence ?? 0;
    const confidence = Number(rawConf.toFixed(4));
    const confidencePct = Number((rawConf * 100).toFixed(1));

    const bbox = {
      x: Math.round(pred.x),
      y: Math.round(pred.y),
      width: Math.round(pred.width),
      height: Math.round(pred.height),
    };

    const colors = extractGarmentColorsFromPixels(
      decoded.data,
      decoded.width,
      decoded.height,
      bbox,
    );

    const croppedBase64Uri = cropAndCleanGarment(decoded, pred);
    const attributes = classifyGarmentAttributes(category, colors, confidencePct);

    console.log(
      `[HALO Garment]   -> Item #${index + 1}: ${category} (${confidencePct}%) · ` +
      `Colors: ${colors.map((c) => `${c.color_name} ${c.percentage}%`).join(", ")} · ` +
      `Subtype: ${attributes.subtype.predicted ?? "—"}`,
    );

    return {
      item_number: index + 1,
      category,
      confidence,
      crop_base64: croppedBase64Uri,
      colors,
      attributes,
    };
  });

  // [4/4] Final validation
  const parsed = GarmentAnalysisResponseSchema.parse({
    image_width: decoded.width,
    image_height: decoded.height,
    total_garments: garments.length,
    garments,
  });

  console.log(`[HALO Garment] ✅ Pipeline finished successfully in ${Date.now() - startTime}ms`);
  console.log("============================================================");
  return parsed;
}
