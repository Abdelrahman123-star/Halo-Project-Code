/**
 * State and orchestration hook for the native Garment Recognition flow.
 * Captures or selects an image, resizes to max 1024px, inspects photo quality
 * (lighting, contrast, edge clipping), and runs the analysis pipeline.
 */

import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import { analyzeGarment } from "@/features/garment/api/garmentApi";
import { decodeJpegBase64 } from "@/features/garment/api/imageProcessor";
import { inspectPhotoQuality } from "@/features/garment/api/qualityInspector";
import type { GarmentAnalysisResponse } from "@/features/garment/types/garment";
import type { PhotoQualityReport } from "@/features/garment/types/quality";

export interface UseGarmentAnalysisReturn {
  imageUri: string | null;
  originalUri: string | null;
  sourceType: "camera" | "gallery" | null;
  isLoading: boolean;
  statusText: string;
  error: string | null;
  result: GarmentAnalysisResponse | null;
  qualityReport: PhotoQualityReport | null;
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  runAnalysis: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

async function optimizeSelectedAsset(
  asset: ImagePicker.ImagePickerAsset,
): Promise<{ uri: string; base64: string }> {
  const maxDim = 1024;
  const origW = asset.width ?? 1024;
  const origH = asset.height ?? 1024;

  const actions =
    origW > maxDim || origH > maxDim
      ? [
          origW >= origH
            ? { resize: { width: maxDim } }
            : { resize: { height: maxDim } },
        ]
      : [];

  console.log(
    `[HALO Garment] 📐 Optimizing photo (original: ${origW}x${origH}, max: ${maxDim}px)...`,
  );

  const manipulated = await manipulateAsync(asset.uri, actions, {
    compress: 0.82,
    format: SaveFormat.JPEG,
    base64: true,
  });

  const kb = Math.round(((manipulated.base64?.length ?? 0) * 0.75) / 1024);
  console.log(
    `[HALO Garment] ✅ Photo ready: ${manipulated.width}x${manipulated.height} (~${kb} KB)`,
  );

  return {
    uri: manipulated.uri,
    base64: manipulated.base64 ?? "",
  };
}

function assessQuality(base64: string): PhotoQualityReport | null {
  try {
    const decoded = decodeJpegBase64(base64);
    const report = inspectPhotoQuality(decoded.data, decoded.width, decoded.height);
    console.log(
      `[HALO Garment] 🔍 Quality Check: Score ${report.score}% · Lighting: ${report.lighting.status}`,
    );
    if (report.issues.length > 0) {
      console.warn(
        `[HALO Garment] ⚠️ Quality Notice: ${report.issues.map((i) => i.title).join(", ")}`,
      );
    }
    return report;
  } catch (err) {
    console.warn("[HALO Garment] Quality inspection skipped:", err);
    return null;
  }
}

export function useGarmentAnalysis(): UseGarmentAnalysisReturn {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"camera" | "gallery" | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Analyzing...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GarmentAnalysisResponse | null>(null);
  const [qualityReport, setQualityReport] = useState<PhotoQualityReport | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const pickFromCamera = useCallback(async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is required to photograph a garment. Please enable it in Settings.");
      return;
    }

    console.log("[HALO Garment] 📷 Launching camera...");
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!picked.canceled && picked.assets[0]) {
      const rawUri = picked.assets[0].uri;
      setOriginalUri(rawUri);
      setSourceType("camera");
      try {
        const optimized = await optimizeSelectedAsset(picked.assets[0]);
        setImageUri(optimized.uri);
        setImageMimeType(picked.assets[0].mimeType ?? "image/jpeg");
        setImageBase64(optimized.base64);
        setResult(null);

        if (optimized.base64) {
          const report = assessQuality(optimized.base64);
          setQualityReport(report);
        }
      } catch (err) {
        console.error("[HALO Garment] Failed to process camera image:", err);
        setImageUri(rawUri);
      }
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        "Media library permission is required to select a garment photo. Please enable it in Settings.",
      );
      return;
    }

    console.log("[HALO Garment] 🖼️ Opening photo library...");
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!picked.canceled && picked.assets[0]) {
      const rawUri = picked.assets[0].uri;
      setOriginalUri(rawUri);
      setSourceType("gallery");
      try {
        const optimized = await optimizeSelectedAsset(picked.assets[0]);
        setImageUri(optimized.uri);
        setImageMimeType(picked.assets[0].mimeType ?? "image/jpeg");
        setImageBase64(optimized.base64);
        setResult(null);

        if (optimized.base64) {
          const report = assessQuality(optimized.base64);
          setQualityReport(report);
        }
      } catch (err) {
        console.error("[HALO Garment] Failed to process gallery image:", err);
        setImageUri(rawUri);
      }
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!imageUri) {
      setError("Please capture or select an image first.");
      return;
    }

    setIsLoading(true);
    setStatusText("Preparing image...");
    setError(null);

    try {
      const analysis = await analyzeGarment(
        imageUri,
        imageMimeType,
        imageBase64,
        (stage) => setStatusText(stage),
      );
      setResult(analysis);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to analyze garment.";
      console.error("[HALO Garment] ❌ Analysis error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
      setStatusText("Analyzing...");
    }
  }, [imageUri, imageMimeType, imageBase64]);

  const reset = useCallback(() => {
    setImageUri(null);
    setOriginalUri(null);
    setSourceType(null);
    setImageBase64(null);
    setResult(null);
    setQualityReport(null);
    setError(null);
    setIsLoading(false);
    setStatusText("Analyzing...");
  }, []);

  return {
    imageUri,
    originalUri,
    sourceType,
    isLoading,
    statusText,
    error,
    result,
    qualityReport,
    pickFromCamera,
    pickFromGallery,
    runAnalysis,
    clearError,
    reset,
  };
}
