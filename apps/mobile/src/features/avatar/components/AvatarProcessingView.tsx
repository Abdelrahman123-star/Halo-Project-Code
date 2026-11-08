/**
 * Shown while the photos are prepared and analysed. The phase text reflects the
 * real client-side phase; the server's internal steps are listed as information,
 * not ticked off, because the app cannot observe them.
 */
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { DashboardCard } from '@/features/home/dashboard/DashboardCard';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { PreprocessPhase } from '../api/avatarApi';
import { CaptureGuide } from './CaptureGuides';

const GLOW_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#E4D6FA', opacity: 0.85 },
  { offset: 0.6, color: '#F3D3E8', opacity: 0.35 },
  { offset: 1, color: '#EEF0FA', opacity: 0 },
];

const PHASE_TEXT: Record<PreprocessPhase, string> = {
  preparing: 'Preparing your photos…',
  analyzing: 'Analysing your body and face…',
};

const SERVER_STEPS = [
  'Photo quality: light, sharpness, framing',
  'Body landmarks: 33 points, front and back',
  'Silhouette: shoulders, waist and hips',
  'Face landmarks: 478 points',
] as const;

export function AvatarProcessingView({ phase }: { phase: PreprocessPhase }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => loop?.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.hero}>
        <Animated.View style={[styles.layer, { transform: [{ scale }] }]} pointerEvents="none">
          <SoftGlow id="processing-glow" size={240} stops={GLOW_STOPS} />
        </Animated.View>
        <CaptureGuide kind="front" height={180} variant="illustration" idSuffix="processing" />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title} accessibilityRole="header">
          Building your profile
        </Text>
        <View style={styles.phaseRow}>
          <ActivityIndicator color={dashboardTheme.accent} />
          <Text style={styles.phase}>{PHASE_TEXT[phase]}</Text>
        </View>
        <Text style={styles.hint}>This usually takes a few seconds. Please keep the app open.</Text>
      </View>

      <DashboardCard style={styles.card}>
        <Text style={styles.cardTitle}>What HALO checks</Text>
        {SERVER_STEPS.map((step) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.dot} />
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </DashboardCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  hero: { height: 220, alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute' },
  copy: { alignItems: 'center', gap: 10 },
  title: { fontSize: 26, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3, textAlign: 'center' },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phase: { fontSize: 15, fontWeight: '600', color: dashboardTheme.text },
  hint: { fontSize: 13, color: dashboardTheme.muted, textAlign: 'center' },
  card: { gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: dashboardTheme.text },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: dashboardTheme.accent },
  stepText: { flex: 1, fontSize: 13, color: dashboardTheme.muted },
});
