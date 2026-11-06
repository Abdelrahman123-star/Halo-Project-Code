/**
 * Photo Quality Advisory Banner.
 * Displays real-time feedback on lighting conditions, edge clipping, and recommendations.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PhotoQualityReport } from "@/features/garment/types/quality";

interface PhotoQualityBannerProps {
  report: PhotoQualityReport;
  onRetake?: () => void;
}

export function PhotoQualityBanner({
  report,
  onRetake,
}: PhotoQualityBannerProps): React.JSX.Element {
  const isGood = report.severity === "good";
  const isCritical = report.severity === "critical";

  if (isGood) {
    return (
      <View style={[styles.container, styles.goodContainer]}>
        <View style={styles.headerRow}>
          <View style={styles.badgeGood}>
            <Text style={styles.badgeTextGood}>✨ Optimal Quality ({report.score}%)</Text>
          </View>
        </View>
        <Text style={styles.goodMessage}>
          Lighting and framing are well-balanced for accurate garment AI detection.
        </Text>
      </View>
    );
  }

  const containerStyle = isCritical ? styles.criticalContainer : styles.warningContainer;
  const badgeStyle = isCritical ? styles.badgeCritical : styles.badgeWarning;
  const badgeTextStyle = isCritical ? styles.badgeTextCritical : styles.badgeTextWarning;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>
            {isCritical ? "⚠️ Quality Alert" : "💡 Quality Suggestion"} ({report.score}%)
          </Text>
        </View>
        {onRetake ? (
          <Pressable onPress={onRetake} style={styles.retakeBtn}>
            <Text style={styles.retakeBtnText}>📸 Retake</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.issueList}>
        {report.issues.map((issue) => (
          <View key={issue.id} style={styles.issueItem}>
            <Text style={styles.issueTitle}>{issue.title}</Text>
            <Text style={styles.issueMessage}>{issue.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  goodContainer: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  warningContainer: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  criticalContainer: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeGood: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTextGood: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  badgeWarning: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTextWarning: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b45309",
  },
  badgeCritical: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTextCritical: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b91c1c",
  },
  goodMessage: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 16,
  },
  issueList: {
    gap: 6,
  },
  issueItem: {
    gap: 2,
  },
  issueTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  issueMessage: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
  },
  retakeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  retakeBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0f172a",
  },
});

