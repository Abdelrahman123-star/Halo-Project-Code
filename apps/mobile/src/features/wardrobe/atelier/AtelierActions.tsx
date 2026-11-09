/**
 * The wardrobe's two "add" entry points: the floating pearl "+" button and the
 * empty-wardrobe invitation. Both open the existing Add a Piece sheet.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { useReduceMotion } from './pearlMotion';

const SIZE = 58;

// Iridescent light inside the pearl: white core shading through blush, lavender, powder blue.
const IRIDESCENT_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#FFFFFF', opacity: 0.9 },
  { offset: 0.35, color: '#F7C6E3', opacity: 0.65 },
  { offset: 0.68, color: '#C9B8F5', opacity: 0.5 },
  { offset: 1, color: '#A9CFF6', opacity: 0 },
];

/** Thin plus with a tiny four-point sparkle at its upper right — "add" as a little pearl portal. */
function SparklePlus() {
  const sparkle = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path d="M11.5 6.8v10.4M6.3 12h10.4" stroke="#4E3A6E" strokeWidth={1.6} strokeLinecap="round" />
      <Path d={sparkle(18.4, 5.6, 3.1)} fill="#FFFFFF" stroke="#4E3A6E" strokeWidth={0.9} strokeLinejoin="round" />
    </Svg>
  );
}

export function FloatingAddButton({ bottom, onPress }: { bottom: number; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const breath = useRef(new Animated.Value(0.5)).current;
  const reduceMotion = useReduceMotion();
  const spring = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  useEffect(() => {
    if (reduceMotion) {
      breath.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath, reduceMotion]);

  const glowOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const glowScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });

  return (
    <Animated.View style={[styles.fabWrap, { bottom, transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => spring(0.92)}
        onPressOut={() => spring(1)}
        accessibilityRole="button"
        accessibilityLabel="Add a piece"
        style={styles.fabShadow}
      >
        <LinearGradient colors={['#F4CFE6', '#DCCFF8', '#C6DDF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
          {/* Soft iridescent glow, breathing gently inside the pearl. */}
          <Animated.View pointerEvents="none" style={[styles.innerGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
            <SoftGlow id="add-pearl-glow" size={SIZE} stops={IRIDESCENT_STOPS} />
          </Animated.View>
          {/* Glassy pearl highlight. */}
          <View pointerEvents="none" style={styles.highlight} />
          <SparklePlus />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const RING: readonly GlowStop[] = [
  { offset: 0, color: '#FFFFFF', opacity: 0.9 },
  { offset: 0.5, color: '#E6DAFA', opacity: 0.55 },
  { offset: 1, color: '#EEF2FB', opacity: 0 },
];

export function WardrobeEmptyState({ reduceMotion, onAdd }: { reduceMotion: boolean; onAdd: () => void }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, reduceMotion]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={styles.empty}>
      <View style={styles.illustration}>
        <View style={styles.ringGlow} pointerEvents="none">
          <SoftGlow id="wardrobe-empty-ring" size={170} stops={RING} />
        </View>
        <View style={styles.pearlRing} />
        <Animated.View style={{ transform: [{ translateY }] }}>
          <HangerIcon size={46} color={dashboardTheme.accent} />
        </Animated.View>
      </View>
      <Text style={styles.emptyTitle}>Your Style Story Starts Here</Text>
      <Text style={styles.emptyText}>Add your favourite pieces and build your personal digital wardrobe.</Text>
      <View style={styles.emptyButton}>
        <AuthButton label="Add Your First Piece" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', right: 20 },
  fabShadow: {
    borderRadius: SIZE / 2,
    shadowColor: '#B9A3E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Thin translucent white edge; the glow is clipped to the pearl.
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  // Offset up-left so the iridescence shifts across the pearl instead of sitting dead centre.
  innerGlow: { position: 'absolute', left: -8, top: -10 },
  highlight: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 20,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    transform: [{ rotate: '-22deg' }],
  },
  empty: { alignItems: 'center', paddingTop: 18, paddingBottom: 8, gap: 10 },
  illustration: { width: 170, height: 150, alignItems: 'center', justifyContent: 'center' },
  ringGlow: { position: 'absolute', top: -10 },
  pearlRing: { position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 1.5, borderColor: 'rgba(213, 198, 246, 0.9)' },
  emptyTitle: { fontSize: 21, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3, textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 20, color: dashboardTheme.muted, textAlign: 'center', maxWidth: 290 },
  emptyButton: { alignSelf: 'stretch', marginTop: 8 },
});
