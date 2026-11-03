/**
 * State and orchestration hook for the native Garment Recognition flow.
 * Captures or selects an image, resizes to max 1024px natively, and runs the analysis pipeline.
 */

import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import { analyzeGarment } from "@/features/garment/api/garmentApi";
import type { GarmentAnalysisResponse } from "@/features/garment/types/garment";

export interface UseGarmentAnalysisReturn {
  imageUri: string | null;
  isLoading: boolean;
  statusText: string;
  error: string | null;
  result: GarmentAnalysisResponse | null;
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  runAnalysis: () => Promise<void>;
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

export function useGarmentAnalysis(): UseGarmentAnalysisReturn {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Analyzing...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GarmentAnalysisResponse | null>(null);

  const pickFromCamera = useCallback(async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is required to photograph a garment.");
      return;
    }

    console.log("[HALO Garment] 📷 Launching camera...");
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!picked.canceled && picked.assets[0]) {
      try {
        const optimized = await optimizeSelectedAsset(picked.assets[0]);
        setImageUri(optimized.uri);
        setImageMimeType(picked.assets[0].mimeType ?? "image/jpeg");
        setImageBase64(optimized.base64);
        setResult(null);
      } catch (err) {
        console.error("[HALO Garment] Failed to process camera image:", err);
        setImageUri(picked.assets[0].uri);
      }
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        "Media library permission is required to select a garment photo.",
      );
      return;
    }

    console.log("[HALO Garment] 🖼️ Opening photo library...");
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!picked.canceled && picked.assets[0]) {
      try {
        const optimized = await optimizeSelectedAsset(picked.assets[0]);
        setImageUri(optimized.uri);
        setImageMimeType(picked.assets[0].mimeType ?? "image/jpeg");
        setImageBase64(optimized.base64);
        setResult(null);
      } catch (err) {
        console.error("[HALO Garment] Failed to process gallery image:", err);
        setImageUri(picked.assets[0].uri);
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
    setImageBase64(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setStatusText("Analyzing...");
  }, []);

  return {
    imageUri,
    isLoading,
    statusText,
    error,
    result,
    pickFromCamera,
    pickFromGallery,
    runAnalysis,
    reset,
  };
}
