/**
 * Garment Recognition Screen (`/test-garment`).
 * Allows capturing or selecting a garment image, running the native in-memory
 * recognition pipeline, and inspecting cropped garments, colors, and attributes.
 */

import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GarmentCard } from "@/features/garment/components/GarmentCard";
import { useGarmentAnalysis } from "@/features/garment/hooks/useGarmentAnalysis";

export default function TestGarmentScreen(): React.JSX.Element {
  const {
    imageUri,
    isLoading,
    statusText,
    error,
    result,
    pickFromCamera,
    pickFromGallery,
    runAnalysis,
    reset,
  } = useGarmentAnalysis();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Garment Recognition</Text>
        <Text style={styles.subtitle}>
          Capture or pick a photo of clothing to detect garments, isolate them on
          a clean white background, extract dominant colors, and classify
          attributes in memory.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={pickFromCamera}
          disabled={isLoading}
        >
          <Text style={styles.secondaryBtnText}>Take Photo</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={pickFromGallery}
          disabled={isLoading}
        >
          <Text style={styles.secondaryBtnText}>Choose Gallery</Text>
        </Pressable>
      </View>

      {imageUri ? (
        <View style={styles.previewSection}>
          <Image
            source={{ uri: imageUri }}
            style={styles.sourcePreview}
            resizeMode="contain"
          />

          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.actionBtn,
                styles.primaryBtn,
                isLoading && styles.disabledBtn,
              ]}
              onPress={runAnalysis}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingInline}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.primaryBtnText}>{statusText}</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>Analyze Garment</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.actionBtn, styles.clearBtn]}
              onPress={reset}
              disabled={isLoading}
            >
              <Text style={styles.clearBtnText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsHeader}>
            Detected Garments: {result.total_garments}
          </Text>

          {result.total_garments === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No garments were detected in this image. Try a clearer photo.
              </Text>
            </View>
          ) : (
            result.garments.map((item) => (
              <GarmentCard key={item.item_number} garment={item} />
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  headerBlock: { gap: 4 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#475569", lineHeight: 18 },
  buttonRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: { backgroundColor: "#2563eb" },
  primaryBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  secondaryBtnText: { color: "#0f172a", fontWeight: "600", fontSize: 14 },
  clearBtn: {
    flex: 0.4,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clearBtnText: { color: "#475569", fontWeight: "600", fontSize: 14 },
  disabledBtn: { opacity: 0.6 },
  loadingInline: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewSection: { gap: 12 },
  sourcePreview: {
    width: "100%",
    height: 240,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  errorTitle: { fontSize: 13, fontWeight: "700", color: "#991b1b" },
  errorText: { fontSize: 13, color: "#b91c1c" },
  resultsSection: { gap: 14 },
  resultsHeader: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: { fontSize: 14, color: "#64748b", textAlign: "center" },
});
