/**
 * The wardrobe's two "add" entry points: the floating pearl "+" button and the
 * empty-wardrobe invitation. Both open the existing Add a Piece sheet.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { AuthButton, authTheme } from '@/features/auth/components/AuthComponents';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';

const SIZE = 58;

export function FloatingAddButton({ bottom, onPress }: { bottom: number; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

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
        <LinearGradient colors={authTheme.pearlBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke={authTheme.pearlBtnText} strokeWidth={2} strokeLinecap="round" />
          </Svg>
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  empty: { alignItems: 'center', paddingTop: 18, paddingBottom: 8, gap: 10 },
  illustration: { width: 170, height: 150, alignItems: 'center', justifyContent: 'center' },
  ringGlow: { position: 'absolute', top: -10 },
  pearlRing: { position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 1.5, borderColor: 'rgba(213, 198, 246, 0.9)' },
  emptyTitle: { fontSize: 21, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3, textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 20, color: dashboardTheme.muted, textAlign: 'center', maxWidth: 290 },
  emptyButton: { alignSelf: 'stretch', marginTop: 8 },
});
