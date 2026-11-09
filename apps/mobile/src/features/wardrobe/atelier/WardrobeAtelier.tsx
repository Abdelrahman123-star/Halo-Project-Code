/**
 * WardrobeAtelier — the browsing view of the Digital Wardrobe, presented like a
 * personal fashion magazine: editorial introduction, "The Style Edit" (latest
 * addition), the "Create an Outfit" teaser, category pills, "Your Colour Story"
 * (real detected colours, tap to filter) and the two-column gallery.
 * Capture / analysis / save stay in the screen and the Add a Piece sheet.
 */
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { FadeInView } from '@/features/home/components/FadeInView';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { WardrobeFilterGroup, WardrobeItem } from '../types/wardrobe';
import { WardrobeEmptyState } from './AtelierActions';
import { CategoryPills, ColourStory, OutfitTeaser, WardrobeIntro } from './AtelierSections';
import { useReduceMotion } from './pearlMotion';
import { StyleEditFeature } from './StyleEditFeature';
import { WardrobeGallery } from './WardrobeGallery';
import { buildColourStory, filterGarments, latestGarment } from './wardrobeInsights';

type WardrobeAtelierProps = {
  items: readonly WardrobeItem[];
  isLoading: boolean;
  onOpenItem: (item: WardrobeItem) => void;
  onAddPiece: () => void;
};

export function WardrobeAtelier({ items, isLoading, onOpenItem, onAddPiece }: WardrobeAtelierProps) {
  const reduceMotion = useReduceMotion();
  const [group, setGroup] = useState<WardrobeFilterGroup>('all');
  const [colour, setColour] = useState<string | null>(null);

  const featured = useMemo(() => latestGarment(items), [items]);
  const swatches = useMemo(() => buildColourStory(items), [items]);
  const filtered = useMemo(() => filterGarments(items, group, colour), [items, group, colour]);
  const filterKey = `${group}|${colour ?? ''}`;

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
      <View style={styles.stack}>
        <FadeInView fromTranslateY={10}>
          <WardrobeIntro count={0} reduceMotion={reduceMotion} />
        </FadeInView>
        <FadeInView delayMs={80} fromTranslateY={14}>
          <WardrobeEmptyState reduceMotion={reduceMotion} onAdd={onAddPiece} />
        </FadeInView>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <FadeInView fromTranslateY={10}>
        <WardrobeIntro count={items.length} reduceMotion={reduceMotion} />
      </FadeInView>

      {featured ? (
        <FadeInView delayMs={70} fromTranslateY={14}>
          <StyleEditFeature item={featured} reduceMotion={reduceMotion} onOpen={onOpenItem} />
        </FadeInView>
      ) : null}

      <FadeInView delayMs={120} fromTranslateY={12}>
        <OutfitTeaser />
      </FadeInView>

      <FadeInView delayMs={160} fromTranslateY={12} style={styles.filters}>
        <CategoryPills active={group} onChange={setGroup} />
        {swatches.length > 0 ? (
          <ColourStory swatches={swatches} activeKey={colour} onToggle={(key) => setColour((current) => (current === key ? null : key))} />
        ) : null}
      </FadeInView>

      {filtered.length > 0 ? (
        // Keyed by the filters so switching category / colour fades the gallery in again.
        <FadeInView key={filterKey} fromTranslateY={10}>
          <WardrobeGallery items={filtered} resetKey={filterKey} reduceMotion={reduceMotion} onOpen={onOpenItem} />
        </FadeInView>
      ) : (
        <View style={styles.noMatch}>
          <Text style={styles.noMatchText}>No pieces match this selection yet.</Text>
          <Pressable
            onPress={() => {
              setGroup('all');
              setColour(null);
            }}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.clear}>Clear filters</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 18 },
  filters: { gap: 12 },
  loading: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  loadingText: { fontSize: 13, color: dashboardTheme.muted },
  noMatch: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 22,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  noMatchText: { fontSize: 13, color: dashboardTheme.muted },
  clear: { fontSize: 13, fontWeight: '700', color: dashboardTheme.accent },
});
