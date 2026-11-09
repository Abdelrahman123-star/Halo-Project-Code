/**
 * Smaller wardrobe-atelier sections: the editorial introduction, category
 * pills, "Your Colour Story" swatches and the "Create an Outfit" teaser.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { WardrobeFilterGroup } from '../types/wardrobe';
import { piecesLabel, type ColourSwatch } from './wardrobeInsights';

// ── Introduction ────────────────────────────────────────────────────────────

export function WardrobeIntro({ count, reduceMotion }: { count: number; reduceMotion: boolean }) {
  const sparkle = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (reduceMotion) {
      sparkle.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0.45, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, sparkle]);

  return (
    <View style={styles.intro}>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          My Wardrobe
        </Text>
        <Animated.View style={{ opacity: sparkle, transform: [{ scale: sparkle }] }} accessible={false}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2.5l1.8 6.7 6.7 1.8-6.7 1.8L12 19.5l-1.8-6.7L3.5 11l6.7-1.8z" fill="#D5C6F6" stroke="#B9A8F3" strokeWidth={1} strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </View>
      <Text style={styles.subtitle}>Every piece tells your story.</Text>
      {count > 0 ? <Text style={styles.count}>{piecesLabel(count).toUpperCase()} IN YOUR COLLECTION</Text> : null}
    </View>
  );
}

// ── Category pills ──────────────────────────────────────────────────────────

const CATEGORY_TABS: { key: WardrobeFilterGroup; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'dresses', label: 'Dresses' },
];

type CategoryPillsProps = { active: WardrobeFilterGroup; onChange: (group: WardrobeFilterGroup) => void };

export function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
      {CATEGORY_TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            {isActive ? (
              <LinearGradient colors={['#A49EF2', '#8B7BEF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.pill, styles.pillActive]}>
                <Text style={[styles.pillText, styles.pillTextActive]}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{tab.label}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Your Colour Story ───────────────────────────────────────────────────────

type ColourStoryProps = {
  swatches: readonly ColourSwatch[];
  activeKey: string | null;
  onToggle: (key: string) => void;
};

export function ColourStory({ swatches, activeKey, onToggle }: ColourStoryProps) {
  const active = swatches.find((swatch) => swatch.key === activeKey);
  return (
    <View style={styles.colourCard}>
      <View style={styles.colourHeader}>
        <Text style={styles.sectionTitle}>Your Colour Story</Text>
        <Text style={styles.sectionSub}>{active ? `Showing ${active.name.toLowerCase()} pieces · tap again to clear` : 'The shades that make up your wardrobe.'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchRow}>
        {swatches.map((swatch) => {
          const isActive = swatch.key === activeKey;
          return (
            <Pressable
              key={swatch.key}
              onPress={() => onToggle(swatch.key)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${swatch.name}, ${swatch.garmentCount} ${swatch.garmentCount === 1 ? 'piece' : 'pieces'}. Filter by this colour`}
              style={[styles.swatchRing, isActive && styles.swatchRingActive]}
            >
              <View style={[styles.swatch, { backgroundColor: swatch.hex }]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Create an Outfit (not built yet) ────────────────────────────────────────

export function OutfitTeaser() {
  return (
    <View style={styles.outfit} accessible accessibilityLabel="Create an Outfit. Coming soon" accessibilityState={{ disabled: true }}>
      <View style={styles.outfitIcon}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M8 5.5a2 2 0 1 1 2 2v1.3L16.5 13H3.5L10 8.8" stroke={dashboardTheme.accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M13 10.5a2 2 0 1 1 2 2v1.3l5.8 3.7H11.5" stroke="#C9A2D9" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <View style={styles.outfitCopy}>
        <Text style={styles.outfitTitle}>Create an Outfit</Text>
        <Text style={styles.outfitSub}>Bring your favourite pieces together.</Text>
      </View>
      <View style={styles.soonPill}>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>
    </View>
  );
}

const glassCard = {
  borderRadius: 22,
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.95)',
  shadowColor: '#8C78B3',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  intro: { gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 30, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, fontStyle: 'italic', color: dashboardTheme.muted },
  count: { marginTop: 4, fontSize: 10.5, fontWeight: '700', letterSpacing: 1.4, color: dashboardTheme.accent },
  pills: { gap: 8, paddingVertical: 2 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  pill: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  pillActive: { borderColor: 'rgba(255, 255, 255, 0.6)' },
  pillText: { fontSize: 13, fontWeight: '600', color: dashboardTheme.plum },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },
  colourCard: { ...glassCard, paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  colourHeader: { gap: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: dashboardTheme.text },
  sectionSub: { fontSize: 11.5, color: dashboardTheme.muted },
  swatchRow: { gap: 10, paddingVertical: 2, paddingHorizontal: 2 },
  swatchRing: { padding: 2, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(185, 168, 243, 0.45)' },
  swatchRingActive: { borderWidth: 2, borderColor: dashboardTheme.accent, transform: [{ scale: 1.08 }] },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#FFFFFF' },
  outfit: { ...glassCard, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  outfitIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(185, 168, 243, 0.2)' },
  outfitCopy: { flex: 1, gap: 2 },
  outfitTitle: { fontSize: 14, fontWeight: '700', color: dashboardTheme.text },
  outfitSub: { fontSize: 11.5, color: dashboardTheme.muted },
  soonPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderWidth: 1, borderColor: 'rgba(185, 168, 243, 0.4)' },
  soonText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, color: dashboardTheme.accent },
});
