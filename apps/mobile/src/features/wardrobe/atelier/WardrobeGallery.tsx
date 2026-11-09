/**
 * The collection, laid out like a fashion gallery: two columns, the right one
 * set slightly lower so the grid reads as an editorial spread rather than a
 * shop grid. Photos all use the same white stage so it stays orderly.
 * Pieces are revealed in pages so a large wardrobe stays smooth.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { WardrobeItem } from '../types/wardrobe';
import { GarmentCard } from './GarmentCard';

const PAGE_SIZE = 24;
const COLUMN_GAP = 12;
const COLUMN_OFFSET = 26;

type WardrobeGalleryProps = {
  items: readonly WardrobeItem[];
  /** Changes when filters change, so paging restarts. */
  resetKey: string;
  reduceMotion: boolean;
  onOpen: (item: WardrobeItem) => void;
};

export function WardrobeGallery({ items, resetKey, reduceMotion, onOpen }: WardrobeGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => setVisibleCount(PAGE_SIZE), [resetKey]);

  const visible = items.slice(0, visibleCount);
  const left = visible.filter((_, index) => index % 2 === 0);
  const right = visible.filter((_, index) => index % 2 === 1);
  const remaining = items.length - visible.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((item) => (
            <GarmentCard key={item.id} item={item} index={visible.indexOf(item)} reduceMotion={reduceMotion} onOpen={onOpen} />
          ))}
        </View>
        <View style={[styles.column, styles.columnOffset]}>
          {right.map((item) => (
            <GarmentCard key={item.id} item={item} index={visible.indexOf(item)} reduceMotion={reduceMotion} onOpen={onOpen} />
          ))}
        </View>
      </View>

      {remaining > 0 ? (
        <Pressable
          onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
          accessibilityRole="button"
          accessibilityLabel={`Show ${Math.min(remaining, PAGE_SIZE)} more pieces`}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Text style={styles.moreText}>Show more pieces · {remaining}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  columns: { flexDirection: 'row', gap: COLUMN_GAP, alignItems: 'flex-start' },
  column: { flex: 1, gap: COLUMN_GAP },
  columnOffset: { paddingTop: COLUMN_OFFSET },
  more: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  moreText: { fontSize: 12.5, fontWeight: '700', color: dashboardTheme.accent, letterSpacing: 0.2 },
});
