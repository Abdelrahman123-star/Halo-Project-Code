/**
 * State and orchestration hook for the native Garment Recognition flow.
 * Captures or selects the FRONT photo (required) and an optional BACK photo,
 * resizes to max 1024px, inspects front photo quality, and runs the analysis
 * pipeline on both. Each front garment is paired with its back view.
 */

import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import { pairBackCrops } from "@/features/garment/api/backPhotoMatcher";
import { analyzeGarment } from "@/features/garment/api/garmentApi";
import { decodeJpegBase64 } from "@/features/garment/api/imageProcessor";
import { inspectPhotoQuality } from "@/features/garment/api/qualityInspector";
import type { GarmentAnalysisResponse } from "@/features/garment/types/garment";
import type { PhotoQualityReport } from "@/features/garment/types/quality";

type PhotoSource = "camera" | "gallery";

interface PickedPhoto {
  uri: string;
  base64: string;
  mimeType: string;
}

export interface UseGarmentAnalysisReturn {
  imageUri: string | null;
  imageBase64: string | null;
  originalUri: string | null;
  sourceType: PhotoSource | null;
  backImageUri: string | null;
  isLoading: boolean;
  statusText: string;
  error: string | null;
  result: GarmentAnalysisResponse | null;
  qualityReport: PhotoQualityReport | null;
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  pickBackPhoto: (source: PhotoSource) => Promise<void>;
  clearBackPhoto: () => void;
  runAnalysis: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

async function optimizeSelectedAsset(asset: ImagePicker.ImagePickerAsset): Promise<PickedPhoto> {
  const maxDim = 1024;
  const origW = asset.width ?? maxDim;
  const origH = asset.height ?? maxDim;
  const actions =
    origW > maxDim || origH > maxDim
      ? [origW >= origH ? { resize: { width: maxDim } } : { resize: { height: maxDim } }]
      : [];
  const manipulated = await manipulateAsync(asset.uri, actions, {
    compress: 0.82,
    format: SaveFormat.JPEG,
    base64: true,
  });
  console.log(`[HALO Garment] ✅ Photo ready: ${manipulated.width}x${manipulated.height}`);
  return { uri: manipulated.uri, base64: manipulated.base64 ?? "", mimeType: "image/jpeg" };
}

/** Opens the camera or gallery. Returns null if cancelled; throws a user-facing message on denial. */
async function pickPhoto(source: PhotoSource): Promise<PickedPhoto | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      source === "camera"
        ? "Camera permission is required to photograph a garment. Please enable it in Settings."
        : "Media library permission is required to select a garment photo. Please enable it in Settings.",
    );
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.85 };
  const picked =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (picked.canceled || !picked.assets[0]) return null;
  try {
    return await optimizeSelectedAsset(picked.assets[0]);
  } catch (err) {
    console.error("[HALO Garment] Failed to optimise photo, using original:", err);
    return { uri: picked.assets[0].uri, base64: "", mimeType: picked.assets[0].mimeType ?? "image/jpeg" };
  }
}

function assessQuality(base64: string): PhotoQualityReport | null {
  try {
    const decoded = decodeJpegBase64(base64);
    return inspectPhotoQuality(decoded.data, decoded.width, decoded.height);
  } catch (err) {
    console.warn("[HALO Garment] Quality inspection skipped:", err);
    return null;
  }
}

export function useGarmentAnalysis(): UseGarmentAnalysisReturn {
  const [front, setFront] = useState<PickedPhoto | null>(null);
  const [back, setBack] = useState<PickedPhoto | null>(null);
  const [sourceType, setSourceType] = useState<PhotoSource | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Analyzing...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GarmentAnalysisResponse | null>(null);
  const [qualityReport, setQualityReport] = useState<PhotoQualityReport | null>(null);

  const pickFront = useCallback(async (source: PhotoSource) => {
    setError(null);
    try {
      const photo = await pickPhoto(source);
      if (!photo) return;
      setFront(photo);
      setBack(null);
      setSourceType(source);
      setResult(null);
      setQualityReport(photo.base64 ? assessQuality(photo.base64) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the photo.");
    }
  }, []);

  const pickBackPhoto = useCallback(async (source: PhotoSource) => {
    setError(null);
    try {
      const photo = await pickPhoto(source);
      if (photo) setBack(photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the photo.");
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!front) {
      setError("Please capture or select an image first.");
      return;
    }
    setIsLoading(true);
    setStatusText("Preparing image...");
    setError(null);
    try {
      const frontResult = await analyzeGarment(front.uri, front.mimeType, front.base64, (stage) =>
        setStatusText(`Front · ${stage}`),
      );
      if (!back) {
        setResult(frontResult);
        return;
      }
      try {
        const backResult = await analyzeGarment(back.uri, back.mimeType, back.base64, (stage) =>
          setStatusText(`Back · ${stage}`),
        );
        setResult({ ...frontResult, garments: pairBackCrops(frontResult.garments, backResult.garments) });
      } catch (err) {
        // The back photo is optional: keep the front result rather than failing the save.
        console.warn("[HALO Garment] Back photo analysis failed:", err instanceof Error ? err.message : err);
        setResult(frontResult);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze garment.";
      console.error("[HALO Garment] ❌ Analysis error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
      setStatusText("Analyzing...");
    }
  }, [front, back]);

  const reset = useCallback(() => {
    setFront(null);
    setBack(null);
    setSourceType(null);
    setResult(null);
    setQualityReport(null);
    setError(null);
    setIsLoading(false);
    setStatusText("Analyzing...");
  }, []);

  return {
    imageUri: front?.uri ?? null,
    imageBase64: front?.base64 || null,
    originalUri: front?.uri ?? null,
    sourceType,
    backImageUri: back?.uri ?? null,
    isLoading,
    statusText,
    error,
    result,
    qualityReport,
    pickFromCamera: () => pickFront("camera"),
    pickFromGallery: () => pickFront("gallery"),
    pickBackPhoto,
    clearBackPhoto: () => setBack(null),
    runAnalysis,
    clearError: () => setError(null),
    reset,
  };
}
