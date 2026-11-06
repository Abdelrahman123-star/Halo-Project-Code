/**
 * Garment Recognition & Digital Wardrobe Screen (`/test-garment`).
 * Captures clothing photos, provides live framing guidance & quality checks,
 * runs recognition, and persists garments to the digital wardrobe.
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CameraFramingOverlay } from "@/features/garment/components/CameraFramingOverlay";
import { GarmentCard } from "@/features/garment/components/GarmentCard";
import { PhotoQualityBanner } from "@/features/garment/components/PhotoQualityBanner";
import { useGarmentAnalysis } from "@/features/garment/hooks/useGarmentAnalysis";
import { WardrobeItemCard } from "@/features/wardrobe/components/WardrobeItemCard";
import { useWardrobe } from "@/features/wardrobe/hooks/useWardrobe";

export default function TestGarmentScreen(): React.JSX.Element {
  const {
    imageUri,
    isLoading: isAnalyzing,
    statusText,
    error: analysisError,
    result,
    qualityReport,
    pickFromCamera,
    pickFromGallery,
    runAnalysis,
    reset,
  } = useGarmentAnalysis();

  const {
    items: wardrobeItems,
    isLoading: loadingWardrobe,
    savingItemNumber,
    savedItemNumbers,
    error: wardrobeError,
    refreshWardrobe,
    saveGarment,
    saveAllGarments,
    editItem,
    removeItem,
  } = useWardrobe();

  // Automatically save garments to the wardrobe whenever analysis produces results
  const [autoSavedResult, setAutoSavedResult] = useState<typeof result>(null);

  useEffect(() => {
    if (result && result !== autoSavedResult && result.garments.length > 0) {
      setAutoSavedResult(result);
      console.log(`[HALO Wardrobe] ⚡ Auto-saving ${result.garments.length} detected garment(s)...`);
      saveAllGarments(result.garments);
    }
  }, [result, autoSavedResult, saveAllGarments]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Garment Recognition & Wardrobe</Text>
        <Text style={styles.subtitle}>
          Capture clothes to detect garments, inspect lighting & framing, and
          save crops directly to your digital wardrobe.
        </Text>
      </View>

      {wardrobeError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Wardrobe Database Error</Text>
          <Text style={styles.errorText}>{wardrobeError}</Text>
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={pickFromCamera}
          disabled={isAnalyzing}
        >
          <Text style={styles.secondaryBtnText}>Take Photo</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={pickFromGallery}
          disabled={isAnalyzing}
        >
          <Text style={styles.secondaryBtnText}>Choose Gallery</Text>
        </Pressable>
      </View>

      {imageUri ? (
        <View style={styles.previewSection}>
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.sourcePreview}
              resizeMode="contain"
            />
            <CameraFramingOverlay />
          </View>

          {qualityReport ? (
            <PhotoQualityBanner
              report={qualityReport}
              onRetake={pickFromCamera}
            />
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.actionBtn,
                styles.primaryBtn,
                isAnalyzing && styles.disabledBtn,
              ]}
              onPress={runAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
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
              disabled={isAnalyzing}
            >
              <Text style={styles.clearBtnText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {analysisError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Analysis Error</Text>
          <Text style={styles.errorText}>{analysisError}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsHeader}>
            Detected Garments ({result.total_garments})
          </Text>

          {result.total_garments === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No garments detected. Try a clearer photo with flat lighting.
              </Text>
            </View>
          ) : (
            result.garments.map((item) => (
              <GarmentCard
                key={item.item_number}
                garment={item}
                onSave={saveGarment}
                isSaving={savingItemNumber === item.item_number}
                isSaved={savedItemNumbers.has(item.item_number)}
              />
            ))
          )}
        </View>
      ) : null}

      {/* Wardrobe Persistence Section */}
      <View style={styles.wardrobeSection}>
        <View style={styles.wardrobeHeaderRow}>
          <Text style={styles.wardrobeHeader}>👗 My Wardrobe ({wardrobeItems.length})</Text>
          <Pressable onPress={refreshWardrobe} style={styles.refreshBtn} disabled={loadingWardrobe}>
            {loadingWardrobe ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text style={styles.refreshBtnText}>↻ Refresh</Text>
            )}
          </Pressable>
        </View>

        {wardrobeItems.length === 0 && !loadingWardrobe ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Your wardrobe is empty. Analyze clothing above and items will be saved here automatically!
            </Text>
          </View>
        ) : (
          <View style={styles.wardrobeList}>
            {wardrobeItems.map((item) => (
              <WardrobeItemCard
                key={item.id}
                item={item}
                onDelete={removeItem}
                onEdit={editItem}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 64, gap: 16 },
  headerBlock: { gap: 4 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#475569", lineHeight: 18 },
  buttonRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  primaryBtn: { backgroundColor: "#2563eb" },
  primaryBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  secondaryBtn: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#cbd5e1" },
  secondaryBtnText: { color: "#0f172a", fontWeight: "600", fontSize: 14 },
  clearBtn: { flex: 0.4, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  clearBtnText: { color: "#475569", fontWeight: "600", fontSize: 14 },
  disabledBtn: { opacity: 0.6 },
  loadingInline: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewSection: { gap: 12 },
  previewContainer: { position: "relative", width: "100%", height: 240, backgroundColor: "#e2e8f0", borderRadius: 12, overflow: "hidden" },
  sourcePreview: { width: "100%", height: "100%" },
  errorBox: { backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 10, padding: 12, gap: 4 },
  errorTitle: { fontSize: 13, fontWeight: "700", color: "#991b1b" },
  errorText: { fontSize: 13, color: "#b91c1c" },
  resultsSection: { gap: 14 },
  resultsHeader: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  emptyBox: { backgroundColor: "#ffffff", borderRadius: 10, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  emptyText: { fontSize: 14, color: "#64748b", textAlign: "center" },
  wardrobeSection: { marginTop: 10, gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  wardrobeHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wardrobeHeader: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  refreshBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: "#e0e7ff" },
  refreshBtnText: { fontSize: 12, fontWeight: "600", color: "#4338ca" },
  wardrobeList: { gap: 10 },
});
