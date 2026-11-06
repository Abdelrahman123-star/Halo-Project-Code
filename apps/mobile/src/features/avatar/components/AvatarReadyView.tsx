/**
 * Shown after "Create My Avatar". PROTOTYPE: displays the fixed sample
 * preview avatar (not generated from the user's photos) and says so plainly.
 */
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { PreviewAvatarFigure } from './PreviewAvatarFigure';
import { SoftButton } from './SoftButton';

const RING_SIZE = 300;

const GLOW_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#E4D6FA', opacity: 0.8 },
  { offset: 0.6, color: '#F3D3E8', opacity: 0.3 },
  { offset: 1, color: '#EEF0FA', opacity: 0 },
];

type AvatarReadyViewProps = {
  onGoHome: () => void;
  onReviewPhotos: () => void;
};

export function AvatarReadyView({ onGoHome, onReviewPhotos }: AvatarReadyViewProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true }));
      loop.start();
    });
    return () => loop?.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.layer} pointerEvents="none">
          <SoftGlow id="ready-glow" size={RING_SIZE} stops={GLOW_STOPS} />
        </View>
        <Animated.View style={[styles.layer, { transform: [{ rotate }] }]} pointerEvents="none">
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Defs>
              <LinearGradient id="ready-ring" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F2C4E2" />
                <Stop offset="0.5" stopColor="#B9A8F3" />
                <Stop offset="1" stopColor="#BCD6F6" stopOpacity={0.2} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_SIZE / 2 - 4}
              stroke="url(#ready-ring)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="260 800"
              fill="none"
            />
          </Svg>
        </Animated.View>
        <PreviewAvatarFigure height={RING_SIZE - 30} />
      </View>

      <View style={styles.copy}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Preview avatar</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Meet your HALO avatar
        </Text>
        <Text style={styles.message}>
          Your photos are ready! For now you get this preview avatar. Your personalized avatar, built from your
          photos, is coming soon.
        </Text>
      </View>

      <View style={styles.actions}>
        <AuthButton label="Back to home" onPress={onGoHome} />
        <SoftButton label="Review my photos" onPress={onReviewPhotos} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 22, paddingTop: 4 },
  hero: { height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute' },
  copy: { alignItems: 'center', gap: 10 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  pillText: { fontSize: 12, fontWeight: '700', color: dashboardTheme.accent, letterSpacing: 0.3 },
  title: { fontSize: 28, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.4, textAlign: 'center' },
  message: { fontSize: 15, lineHeight: 22, color: dashboardTheme.muted, textAlign: 'center', maxWidth: 320 },
  actions: { gap: 12 },
});
