/**
 * GarmentProcessingView — displays real-time AI analysis progress,
 * detected garment features on luxury frosted-glass cards, and honest
 * 3D pipeline roadmap status per HALO AGENTS.md §3.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import { GarmentDetectedCard } from '@/features/garment/components/GarmentDetectedCard';
import { GarmentRoadmapCard } from '@/features/garment/components/GarmentRoadmapCard';
import type { GarmentAnalysisResponse } from '@/features/garment/types/garment';
import { luxuryPastel } from '@/shared/theme/tokens';

interface GarmentProcessingViewProps {
  isLoading: boolean;
  statusText: string;
  error: string | null;
  result: GarmentAnalysisResponse | null;
  onRetry: () => void;
  onReset: () => void;
}

export function GarmentProcessingView({
  isLoading,
  statusText,
  error,
  result,
  onRetry,
  onReset,
}: GarmentProcessingViewProps): React.JSX.Element {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Loading In-Progress Card */}
      {isLoading ? (
        <FrostedGlassCard variant="panel" style={styles.loadingCard}>
          <View style={styles.spinnerCircle}>
            <ActivityIndicator size="large" color={luxuryPastel.dustyMauve} />
          </View>
          <Text style={styles.loadingTitle}>Analyzing Your Garment</Text>
          <Text style={styles.loadingSubtitle}>{statusText}</Text>

          <View style={styles.pipelineSteps}>
            <View style={styles.stepRow}>
              <View style={styles.stepDotActive} />
              <Text style={styles.stepText}>Image Preprocessing & Resizing</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepDotActive} />
              <Text style={styles.stepText}>Garment Segmentation & Detection</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepDotPulse} />
              <Text style={styles.stepText}>Color & Attribute Classification</Text>
            </View>
          </View>
        </FrostedGlassCard>
      ) : null}

      {/* Error Card */}
      {!isLoading && error ? (
        <FrostedGlassCard variant="card" style={styles.errorCard}>
          <Text style={styles.errorTitle}>Analysis Encountered An Issue</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <View style={styles.errorActions}>
            <Pressable onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
              <Text style={styles.retryBtnText}>Try Again</Text>
            </Pressable>
            <Pressable onPress={onReset} style={styles.cancelBtn} accessibilityRole="button">
              <Text style={styles.cancelBtnText}>Choose Another Photo</Text>
            </Pressable>
          </View>
        </FrostedGlassCard>
      ) : null}

      {/* Result Presentation */}
      {!isLoading && result ? (
        <View style={styles.resultBox}>
          {result.total_garments === 0 ? (
            <FrostedGlassCard variant="card" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Garment Detected</Text>
              <Text style={styles.emptySubtitle}>
                We could not clearly detect a clothing item in this image. For best
                results, photograph the garment flat with bright, even lighting.
              </Text>
              <Pressable onPress={onReset} style={styles.primaryPill}>
                <Text style={styles.primaryPillText}>Take Another Photo</Text>
              </Pressable>
            </FrostedGlassCard>
          ) : (
            <>
              {result.garments.map((g) => (
                <GarmentDetectedCard key={g.item_number} garment={g} />
              ))}

              <GarmentRoadmapCard />

              <Pressable onPress={onReset} style={styles.primaryPill} accessibilityRole="button">
                <LinearGradient colors={['#C4AEE8', '#D9CFF1']} style={styles.primaryPillGrad}>
                  <Text style={styles.primaryPillText}>Add Another Piece</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  spinnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(217, 207, 241, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: luxuryPastel.textSecondary,
    textAlign: 'center',
  },
  pipelineSteps: {
    width: '100%',
    marginTop: 14,
    gap: 8,
    paddingHorizontal: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#77708F',
  },
  stepDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9CFF1',
    borderWidth: 1.5,
    borderColor: '#77708F',
  },
  stepText: {
    fontSize: 12,
    color: luxuryPastel.textMauve,
    fontWeight: '500',
  },
  errorCard: {
    width: '100%',
    padding: 20,
    gap: 10,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#B85042' },
  errorBody: { fontSize: 13, color: luxuryPastel.textSecondary, lineHeight: 18 },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: '#D9CFF1' },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: luxuryPastel.textMauve },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  cancelBtnText: { fontSize: 13, color: luxuryPastel.textSecondary },
  resultBox: { width: '100%', gap: 16 },
  emptyCard: { padding: 20, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: luxuryPastel.textMauve },
  emptySubtitle: { fontSize: 13, color: luxuryPastel.textSecondary, textAlign: 'center', lineHeight: 18 },
  primaryPill: { width: '100%', borderRadius: 9999, overflow: 'hidden', marginTop: 8 },
  primaryPillGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryPillText: { fontSize: 15, fontWeight: '700', color: luxuryPastel.textMauve },
});
