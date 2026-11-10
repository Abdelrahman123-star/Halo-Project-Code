/**
 * WardrobeCloset — the browsing view of the Digital Wardrobe: the title bar
 * (count, refresh, category pills) above a horizontally scrolling closet made
 * of images, with the user's saved garments placed in its slots. The closet set
 * follows the Bedroom / Bathroom gender rule.
 */
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useUserGender } from '@/features/profile/hooks/useUserGender';
import type { WardrobeItem } from '../types/wardrobe';
import { ClosetScroller } from './ClosetScroller';
import { closetSceneFor } from './closetSlots';
import { useClosetPalette } from './ClosetPaletteContext';
import { PAGE_GUTTER } from './closetTheme';
import { FILTER_OPTIONS, filterByGroup, type ClosetFilter } from './garmentLogic';
import { WardrobeTitleBar } from './WardrobeTitleBar';

type WardrobeClosetProps = {
  items: readonly WardrobeItem[];
  isLoading: boolean;
  washIds: ReadonlySet<string>;
  onRefresh: () => void;
  onOpenItem: (item: WardrobeItem) => void;
  onAddPiece: () => void;
};

export function WardrobeCloset({ items, isLoading, washIds, onRefresh, onOpenItem, onAddPiece }: WardrobeClosetProps) {
  const scene = closetSceneFor(useUserGender());
  const palette = useClosetPalette();
  const [filter, setFilter] = useState<ClosetFilter>('all');
  const [showSlotOutlines, setShowSlotOutlines] = useState(false);
  const visible = useMemo(() => filterByGroup(items, filter), [items, filter]);

  const filterLabel = FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? '';
  let message: {
    title: string;
    subtitle: string;
    onPress?: () => void;
  } | null = null;
  if (!isLoading && items.length === 0) {
    message = {
      title: 'Your closet is waiting',
      subtitle: 'Add your first piece',
      onPress: onAddPiece,
    };
  } else if (items.length > 0 && visible.length === 0) {
    message = {
      title: `No ${filterLabel.toLowerCase()} yet`,
      subtitle: 'Try another category',
      onPress: () => setFilter('all'),
    };
  }

  return (
    <View style={styles.root}>
      <View style={styles.titleBar}>
        <WardrobeTitleBar
          count={items.length}
          isRefreshing={isLoading}
          onRefresh={onRefresh}
          filter={filter}
          onFilterChange={setFilter}
          showSlotOutlines={showSlotOutlines}
          onToggleSlotOutlines={() => setShowSlotOutlines((on) => !on)}
        />
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={palette.accent} />
          <Text style={[styles.loadingText, { color: palette.muted }]}>Opening your wardrobe…</Text>
        </View>
      ) : (
        <ClosetScroller
          items={visible}
          scene={scene}
          washIds={washIds}
          message={message}
          showSlotOutlines={showSlotOutlines}
          onOpen={onOpenItem}
          onAddPiece={onAddPiece}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 12 },
  titleBar: { paddingHorizontal: PAGE_GUTTER },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13 },
});
