/**
 * Component for displaying an individual detected garment's details:
 * Category, confidence, base64 crop preview, dominant colors, and fabric/pattern attributes.
 * Optionally includes a "Save to Wardrobe" action.
 */

import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  ColorResult,
  DetectedGarment,
} from "@/features/garment/types/garment";

export function ColorSwatch({ color }: { color: ColorResult }) {
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatchBox, { backgroundColor: color.hex }]} />
      <Text style={styles.swatchText}>
        {color.color_name} · {color.hex} · {color.percentage.toFixed(1)}%
      </Text>
    </View>
  );
}

interface GarmentCardProps {
  garment: DetectedGarment;
  onSave?: (garment: DetectedGarment) => Promise<unknown>;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function GarmentCard({
  garment,
  onSave,
  isSaving,
  isSaved,
}: GarmentCardProps) {
  const { fabric, pattern, subtype } = garment.attributes;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTexts}>
          <Text style={styles.cardTitle}>
            #{garment.item_number} — {garment.category.replace(/_/g, " ").toUpperCase()}
          </Text>
          <Text style={styles.cardMeta}>
            Confidence: {(garment.confidence * 100).toFixed(1)}%
          </Text>
        </View>

        {onSave ? (
          <Pressable
            style={[
              styles.saveBtn,
              isSaved && styles.savedBtn,
              isSaving && styles.savingBtn,
            ]}
            onPress={() => onSave(garment)}
            disabled={isSaving || isSaved}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={[styles.saveBtnText, isSaved && styles.savedBtnText]}>
                {isSaved ? "Saved ✓" : "Save to Wardrobe"}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>

      {/* Crop preview (base64 data URI) */}
      {garment.crop_base64 ? (
        <Image
          source={{ uri: garment.crop_base64 }}
          style={styles.cropPreview}
          resizeMode="contain"
          accessibilityLabel={`Cropped garment ${garment.item_number}`}
        />
      ) : null}

      {/* Colors */}
      <Text style={styles.sectionLabel}>🎨 Dominant Colors</Text>
      {garment.colors.map((c, i) => (
        <ColorSwatch key={i} color={c} />
      ))}

      {/* Attributes */}
      <Text style={styles.sectionLabel}>🧵 Fabric</Text>
      <Text style={styles.attrText}>
        {subtype.predicted ?? "—"}{" "}
        {subtype.confidence != null ? `(${subtype.confidence.toFixed(1)}%)` : ""}
      </Text>
      <Text style={styles.attrText}>
        Material: {fabric.predicted ?? "—"}{" "}
        {fabric.confidence != null ? `· ${fabric.confidence.toFixed(1)}%` : ""}
      </Text>

      <Text style={styles.sectionLabel}>🔲 Pattern</Text>
      <Text style={styles.attrText}>
        {pattern.predicted ?? "—"}{" "}
        {pattern.confidence != null ? `(${pattern.confidence.toFixed(1)}%)` : ""}
      </Text>

      {/* Top subtype candidates */}
      {subtype.top_candidates.length > 1 && (
        <>
          <Text style={styles.sectionLabel}>📋 Subtype Candidates</Text>
          {subtype.top_candidates.slice(0, 3).map((c, i) => (
            <Text key={i} style={styles.candidateText}>
              {i + 1}. {c.label} — {c.confidence.toFixed(1)}%
            </Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTexts: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1a0533", marginBottom: 2 },
  cardMeta: { fontSize: 12, color: "#888" },
  saveBtn: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  savedBtn: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  savingBtn: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  savedBtnText: {
    color: "#059669",
  },
  cropPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#f0ebfa",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5b21b6",
    marginTop: 10,
    marginBottom: 4,
  },
  attrText: { fontSize: 13, color: "#333", marginBottom: 2 },
  candidateText: { fontSize: 12, color: "#555" },
  swatchRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  swatchBox: { width: 20, height: 20, borderRadius: 4, marginRight: 8 },
  swatchText: { fontSize: 12, color: "#444" },
});
