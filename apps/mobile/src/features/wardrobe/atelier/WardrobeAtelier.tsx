/**
 * WardrobeAtelier — the browsing view of the Digital Wardrobe. "Your Style
 * Orbit" is the page: a glowing centre with up to 8 floating pieces and the
 * category pearls, drawn edge to edge. Under it, a pearl button opens the
 * full collection ("View all pieces", or the selected category) on its own
 * screen, so every piece stays reachable however large the wardrobe is.
 * Capture / analysis / save stay in the screen and the Add a Piece sheet.
 */
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authTheme } from '@/features/auth/components/AuthComponents';
import { FadeInView } from '@/features/home/components/FadeInView';
import { ChevronRightIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { WardrobeFilterGroup, WardrobeItem } from '../types/wardrobe';
import { WardrobeEmptyState } from './AtelierActions';
import { useReduceMotion } from './pearlMotion';
import { StyleOrbit } from './StyleOrbit';
import { filterGarments } from './wardrobeInsights';

export const GROUP_TITLES: Record<WardrobeFilterGroup, string> = {
  all: 'All pieces',
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
};

/** Matches the screen's horizontal padding, so the orbit can run edge to edge. */
const PAGE_GUTTER = 20;

type WardrobeAtelierProps = {
  items: readonly WardrobeItem[];
  isLoading: boolean;
  onOpenItem: (item: WardrobeItem) => void;
  onAddPiece: () => void;
  /** Opens the full collection screen, pre-filtered to the orbit's selected category. */
  onViewAll: (group: WardrobeFilterGroup) => void;
};

export function WardrobeAtelier({ items, isLoading, onOpenItem, onAddPiece, onViewAll }: WardrobeAtelierProps) {
  const reduceMotion = useReduceMotion();
  const [group, setGroup] = useState<WardrobeFilterGroup>('all');
  const count = useMemo(() => filterGarments(items, group).length, [items, group]);

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={dashboardTheme.accent} />
        <Text style={styles.loadingText}>Opening your wardrobe…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <FadeInView fromTranslateY={14}>
        <WardrobeEmptyState reduceMotion={reduceMotion} onAdd={onAddPiece} />
      </FadeInView>
    );
  }

  const buttonLabel = group === 'all' ? `View all pieces · ${count}` : `View all ${GROUP_TITLES[group]} · ${count}`;

  return (
    <View style={styles.stack}>
      <FadeInView fromTranslateY={0} fromScale={0.96} style={styles.orbitBleed}>
        <StyleOrbit items={items} group={group} onGroupChange={setGroup} reduceMotion={reduceMotion} onOpen={onOpenItem} />
      </FadeInView>

      <FadeInView delayMs={180} fromTranslateY={10}>
        <Pressable
          onPress={() => onViewAll(group)}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          style={({ pressed }) => [styles.viewAllShadow, pressed && styles.pressed]}
        >
          <LinearGradient colors={authTheme.pearlBtnGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.viewAll}>
            <Text style={styles.viewAllText}>{buttonLabel}</Text>
            <ChevronRightIcon size={15} color={authTheme.pearlBtnText} />
          </LinearGradient>
        </Pressable>
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 18, alignItems: 'center' },
  orbitBleed: { alignSelf: 'stretch', marginHorizontal: -PAGE_GUTTER },
  viewAllShadow: {
    borderRadius: 24,
    shadowColor: '#B9A3E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  viewAllText: { fontSize: 14, fontWeight: '700', color: authTheme.pearlBtnText, letterSpacing: 0.3 },
  loading: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  loadingText: { fontSize: 13, color: dashboardTheme.muted },
});
