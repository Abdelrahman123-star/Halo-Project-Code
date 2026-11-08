/**
 * Viewfinder Framing Guide Overlay.
 * Displays safe-zone corner brackets, alignment guides, and live capture tips
 * to ensure users capture full garments with proper lighting.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function CameraFramingOverlay(): React.JSX.Element {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Corner Brackets */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      {/* Center crosshair */}
      <View style={styles.crosshairH} />
      <View style={styles.crosshairV} />

      {/* Floating Guidance Badge */}
      <View style={styles.guideBadge}>
        <Text style={styles.guideText}>📐 Whole garment inside the brackets, laid flat</Text>
      </View>
    </View>
  );
}

const BRACKET_SIZE = 24;
const BRACKET_THICKNESS = 3;
const BRACKET_COLOR = "rgba(255, 255, 255, 0.85)";

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    margin: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    justifyContent: "space-between",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    borderColor: BRACKET_COLOR,
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderBottomRightRadius: 10,
  },
  crosshairH: {
    position: "absolute",
    top: "50%",
    width: 16,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  crosshairV: {
    position: "absolute",
    left: "50%",
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  guideBadge: {
    position: "absolute",
    bottom: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  guideText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
