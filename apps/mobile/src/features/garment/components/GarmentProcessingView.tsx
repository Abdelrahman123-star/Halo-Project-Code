/**
 * GarmentProcessingView — Displays real-time AI analysis & wardrobe save status,
 * detected garment cards, instant dropdown edit access, and honest manual fallback.
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
import Svg, { Path } from 'react-native-svg';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import { GarmentDetectedCard } from '@/features/garment/components/GarmentDetectedCard';
import { GarmentRoadmapCard } from '@/features/garment/components/GarmentRoadmapCard';
import type { GarmentAnalysisResponse } from '@/features/garment/types/garment';
import type { WardrobeItem } from '@/features/wardrobe/types/wardrobe';

interface GarmentProcessingViewProps {
  isLoading: boolean;
  isSaving?: boolean;
  statusText: string;
  error: string | null;
  result: GarmentAnalysisResponse | null;
  savedBatch?: WardrobeItem[];
  onRetry: () => void;
  onReset: () => void;
  onEditSavedItem?: (item: WardrobeItem) => void;
  onManualSave?: () => void;
}

export function GarmentProcessingView({
  isLoading,
  isSaving = false,
  statusText,
  error,
  result,
  savedBatch = [],
  onRetry,
  onReset,
  onEditSavedItem,
  onManualSave,
}: GarmentProcessingViewProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {isLoading ? (
        <FrostedGlassCard variant="panel" style={styles.loadingCard}>
          <View style={styles.spinnerCircle}>
            <ActivityIndicator size="large" color="#686EE8" />
          </View>
          <Text style={styles.loadingTitle}>Analyzing & Saving Garment</Text>
          <Text style={styles.loadingSubtitle}>{statusText}</Text>

          <View style={styles.pipelineSteps}>
            <View style={styles.stepRow}>
              <View style={styles.stepDotActive} />
              <Text style={styles.stepText}>Image Preprocessing & Segmentation</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepDotActive} />
              <Text style={styles.stepText}>Color & Attribute Classification</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepDotPulse} />
              <Text style={styles.stepText}>Saving & Starting 3D Conversion</Text>
            </View>
          </View>
        </FrostedGlassCard>
      ) : null}

      {!isLoading && error ? (
        <FrostedGlassCard variant="card" style={styles.errorCard}>
          <Text style={styles.errorTitle}>Analysis Encountered An Issue</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <View style={styles.errorActions}>
            <Pressable onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
              <Text style={styles.retryBtnText}>Try Again</Text>
            </Pressable>
            <Pressable onPress={onReset} style={styles.cancelBtn} accessibilityRole="button">
              <Text style={styles.cancelBtnText}>Back to Wardrobe</Text>
            </Pressable>
          </View>
        </FrostedGlassCard>
      ) : null}

      {!isLoading && result ? (
        <View style={styles.resultBox}>
          {result.total_garments === 0 ? (
            <FrostedGlassCard variant="card" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Garment Automatically Detected</Text>
              <Text style={styles.emptySubtitle}>
                CV could not isolate a clear garment shape. Retake it laid flat on a plain background with the whole piece in frame, or save this photo manually and pick its category.
              </Text>
              {onManualSave ? (
                <Pressable onPress={onManualSave} disabled={isSaving} style={styles.primaryPill} accessibilityRole="button">
                  <LinearGradient colors={['#686EE8', '#9475F5']} style={styles.primaryPillGrad}>
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryPillTextLight}>Save Manually & Choose Category</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              ) : null}
              <Pressable onPress={onReset} style={styles.secondaryPill} accessibilityRole="button">
                <Text style={styles.secondaryPillText}>Try Another Photo</Text>
              </Pressable>
            </FrostedGlassCard>
          ) : (
            <>
              <View style={styles.savedBanner}>
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color="#686EE8" />
                    <Text style={styles.savedBannerText}>Saving to your Digital Wardrobe...</Text>
                  </>
                ) : (
                  <>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke="#2F855A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.savedBannerSuccess}>
                      Saved {savedBatch.length || result.total_garments} {result.total_garments === 1 ? 'piece' : 'pieces'} to your Digital Wardrobe
                    </Text>
                  </>
                )}
              </View>

              {result.garments.map((g, idx) => {
                const correspondingSaved = savedBatch[idx];
                return (
                  <View key={g.item_number} style={styles.detectedWrap}>
                    <GarmentDetectedCard garment={g} />
                    {correspondingSaved && onEditSavedItem ? (
                      <Pressable
                        onPress={() => onEditSavedItem(correspondingSaved)}
                        accessibilityRole="button"
                        style={styles.editInlineBtn}
                      >
                        <Text style={styles.editInlineText}>✦ View 3D Model & Details</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}

              <GarmentRoadmapCard />

              <Pressable onPress={onReset} style={styles.primaryPill} accessibilityRole="button">
                <LinearGradient colors={['#686EE8', '#9475F5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryPillGrad}>
                  <Text style={styles.primaryPillTextLight}>Done · View in My Wardrobe</Text>
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
  container: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center', gap: 16 },
  loadingCard: { width: '100%', padding: 24, alignItems: 'center', gap: 12 },
  spinnerCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(139, 123, 239, 0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  loadingTitle: { fontSize: 18, fontWeight: '800', color: '#2E2242' },
  loadingSubtitle: { fontSize: 13, color: '#6D5B85', textAlign: 'center' },
  pipelineSteps: { width: '100%', marginTop: 12, gap: 8, paddingHorizontal: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#686EE8' },
  stepDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9CFF1', borderWidth: 1.5, borderColor: '#686EE8' },
  stepText: { fontSize: 12.5, color: '#3D3055', fontWeight: '600' },
  errorCard: { width: '100%', padding: 20, gap: 10 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#C53030' },
  errorBody: { fontSize: 13, color: '#6D5B85', lineHeight: 18 },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  retryBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 16, backgroundColor: '#686EE8' },
  retryBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  cancelBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.85)' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#5A4A7A' },
  resultBox: { width: '100%', gap: 14 },
  savedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(95, 168, 127, 0.35)' },
  savedBannerText: { fontSize: 13, fontWeight: '600', color: '#4F3E6A' },
  savedBannerSuccess: { fontSize: 13, fontWeight: '700', color: '#276749' },
  detectedWrap: { gap: 8 },
  editInlineBtn: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.88)', borderWidth: 1, borderColor: 'rgba(139, 123, 239, 0.35)' },
  editInlineText: { fontSize: 12.5, fontWeight: '700', color: '#5A3E91' },
  emptyCard: { padding: 20, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#2E2242', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#6D5B85', textAlign: 'center', lineHeight: 19 },
  primaryPill: { width: '100%', borderRadius: 18, overflow: 'hidden', marginTop: 4, shadowColor: '#686EE8', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  primaryPillGrad: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryPillTextLight: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  secondaryPill: { minHeight: 46, width: '100%', borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.86)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.96)', alignItems: 'center', justifyContent: 'center' },
  secondaryPillText: { fontSize: 14, fontWeight: '700', color: '#5A4A7A' },
});
