/**
 * Building blocks of "Your Style Orbit": the glowing centre, a floating
 * garment frame and a category pearl.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { WardrobeItem } from '../types/wardrobe';
import type { CategoryPoint, OrbitSlot } from './orbitLayout';
import { PEARL_HAIRLINE } from './pearlWhite';
import { piecesLabel } from './wardrobeInsights';

const CENTRE_GLOW: readonly GlowStop[] = [
  { offset: 0, color: '#F2C4E2', opacity: 0.55 },
  { offset: 0.5, color: '#D5C6F6', opacity: 0.35 },
  { offset: 1, color: '#BCD6F6', opacity: 0 },
];

// ── Centre ──────────────────────────────────────────────────────────────────

type OrbitCentreProps = {
  x: number;
  y: number;
  diameter: number;
  breath: Animated.Value;
  title: string;
  subtitle: string;
  count: number;
  /** When set, the centre becomes a "back to All" control. */
  onShowAll?: () => void;
};

export function OrbitCentre({ x, y, diameter, breath, title, subtitle, count, onShowAll }: OrbitCentreProps) {
  const glowSize = diameter * 2;
  const glowScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const glowOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <View pointerEvents="box-none" style={[styles.centreWrap, { left: x - diameter / 2, top: y - diameter / 2, width: diameter, height: diameter }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.absolute, { left: (diameter - glowSize) / 2, top: (diameter - glowSize) / 2, opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
      >
        <SoftGlow id="orbit-centre-glow" size={glowSize} stops={CENTRE_GLOW} />
      </Animated.View>
      <Pressable
        disabled={!onShowAll}
        onPress={onShowAll}
        accessibilityRole={onShowAll ? 'button' : 'summary'}
        accessibilityLabel={onShowAll ? `${title}, ${piecesLabel(count)}. Show all pieces` : `${title}, ${piecesLabel(count)}`}
        style={({ pressed }) => [styles.centre, { width: diameter, height: diameter, borderRadius: diameter / 2 }, pressed && styles.pressed]}
      >
        <Text style={styles.centreTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.centreSub}>{subtitle}</Text>
        <Text style={styles.centreCount}>{piecesLabel(count).toUpperCase()}</Text>
        {onShowAll ? <Text style={styles.centreBack}>‹ All</Text> : null}
      </Pressable>
    </View>
  );
}

// ── Floating garment ────────────────────────────────────────────────────────

type OrbitGarmentProps = {
  item: WardrobeItem;
  slot: OrbitSlot;
  emphasized: boolean;
  /** Category selected: emphasised pieces come forward, others recede. */
  hasSelection: boolean;
  float: Animated.Value;
  /** Alternates float direction so pieces drift independently. */
  phase: number;
  reduceMotion: boolean;
  onOpen: (item: WardrobeItem) => void;
};

export function OrbitGarment({ item, slot, emphasized, hasSelection, float, phase, reduceMotion, onOpen }: OrbitGarmentProps) {
  const focus = useRef(new Animated.Value(1)).current;
  const tap = useRef(new Animated.Value(1)).current;
  const target = !hasSelection ? 1 : emphasized ? 1.12 : 0.78;

  useEffect(() => {
    Animated.spring(focus, { toValue: target, friction: 7, tension: 60, useNativeDriver: true }).start();
  }, [focus, target]);

  function open() {
    if (reduceMotion) {
      onOpen(item);
      return;
    }
    // Gently enlarge, then open the details as it settles back.
    Animated.timing(tap, { toValue: 1.18, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
      onOpen(item);
      Animated.timing(tap, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  const drift = 3 + (phase % 3);
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: phase % 2 ? [-drift, drift] : [drift, -drift] });
  const opacity = focus.interpolate({ inputRange: [0.78, 1, 1.12], outputRange: [0.4, 1, 1], extrapolate: 'clamp' });
  const scale = Animated.multiply(focus, tap);

  return (
    <Animated.View
      style={[
        styles.absolute,
        { left: slot.x - slot.size / 2, top: slot.y - slot.size / 2, width: slot.size, height: slot.size, zIndex: emphasized ? 2 : 1 },
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}. Open details`}
        style={({ pressed }) => [styles.frame, { borderRadius: slot.size * 0.2 }, pressed && styles.pressed]}
      >
        {item.crop_base64 ? (
          <Image source={{ uri: item.crop_base64 }} style={styles.photo} resizeMode="contain" accessible={false} />
        ) : (
          <HangerIcon size={slot.size * 0.36} color="#B9A8F3" />
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Category pearl ──────────────────────────────────────────────────────────

const PEARL_COLOURS: Record<CategoryPoint['group'], string> = {
  tops: '#B9A8F3',
  bottoms: '#A3CFF6',
  dresses: '#F2C4E2',
  outerwear: '#F2D3B8',
};

type CategoryPearlProps = {
  point: CategoryPoint;
  count: number;
  selected: boolean;
  breath: Animated.Value;
  onPress: () => void;
};

export function CategoryPearl({ point, count, selected, breath, onPress }: CategoryPearlProps) {
  const press = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(lift, { toValue: selected ? 1 : 0, friction: 7, useNativeDriver: true }).start();
  }, [lift, selected]);

  const colour = PEARL_COLOURS[point.group];
  const scale = Animated.multiply(press, lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }));
  const glowOpacity = Animated.add(lift.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] }), breath.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }));
  const spring = (toValue: number) => Animated.spring(press, { toValue, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  const glowStops: readonly GlowStop[] = [
    { offset: 0, color: colour, opacity: 0.9 },
    { offset: 1, color: colour, opacity: 0 },
  ];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => spring(0.85)}
      onPressOut={() => spring(1)}
      hitSlop={14}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${point.label}, ${piecesLabel(count)}`}
      style={[styles.pearlHit, { left: point.x - 22, top: point.y - 22 }]}
    >
      <Animated.View style={[styles.absolute, styles.pearlGlow, { opacity: glowOpacity }]}>
        <SoftGlow id={`pearl-${point.group}`} size={44} stops={glowStops} />
      </Animated.View>
      <Animated.View style={[styles.pearl, { backgroundColor: colour, transform: [{ scale }] }]}>
        <View style={styles.pearlShine} />
      </Animated.View>
      <View style={[styles.pearlLabel, point.labelSide === 'right' ? styles.labelRight : styles.labelLeft]} pointerEvents="none">
        <Text style={[styles.pearlText, selected && styles.pearlTextSelected]}>{point.label.toUpperCase()}</Text>
        <Text style={[styles.pearlCount, selected && styles.pearlTextSelected]}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  pressed: { opacity: 0.85 },
  centreWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PEARL_HAIRLINE,
    shadowColor: '#B9A3E8',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    paddingHorizontal: 8,
  },
  centreTitle: { fontSize: 19, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3 },
  centreSub: { fontSize: 11, fontStyle: 'italic', color: dashboardTheme.muted, marginTop: 1 },
  centreCount: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.2, color: dashboardTheme.accent, marginTop: 5 },
  centreBack: { fontSize: 10.5, fontWeight: '700', color: dashboardTheme.accent, marginTop: 4 },
  // Subtle white frame that blends into the white page; the shadow makes it float.
  frame: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C78B3',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  photo: { width: '86%', height: '86%' },
  pearlHit: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pearlGlow: { left: 0, top: 0 },
  pearl: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C78B3',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  pearlShine: { position: 'absolute', top: 2, left: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.85)' },
  pearlLabel: { position: 'absolute', flexDirection: 'row', alignItems: 'baseline', gap: 4, width: 120 },
  labelRight: { left: 38 },
  labelLeft: { right: 38, justifyContent: 'flex-end' },
  pearlText: { fontSize: 10, fontWeight: '600', letterSpacing: 1.3, color: dashboardTheme.muted },
  pearlCount: { fontSize: 10, fontWeight: '700', color: dashboardTheme.muted },
  pearlTextSelected: { color: dashboardTheme.plum, fontWeight: '800' },
});
