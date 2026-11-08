/**
 * SavedWardrobeSection — Inline Digital Wardrobe collection rendered directly
 * beneath the garment capture options on `/(app)/garment`.
 * Includes category filter pills, empty state with CTA, and 2-column Bento grid.
 */
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { AddPieceTile } from '@/features/wardrobe/components/AddPieceTile';
import { SavedGarmentTile } from '@/features/wardrobe/components/SavedGarmentTile';
import {
  getCategoryGroup,
  type WardrobeFilterGroup,
  type WardrobeItem,
} from '@/features/wardrobe/types/wardrobe';

const FILTER_TABS: { key: WardrobeFilterGroup; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'dresses', label: 'Dresses' },
];

export interface SavedWardrobeSectionProps {
  items: WardrobeItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectItem: (item: WardrobeItem) => void;
  onTakeFirstPhoto?: () => void;
  /** Shows an "Add a Piece" tile first in the grid. */
  onAddPiece?: () => void;
}

export function SavedWardrobeSection({
  items,
  isLoading,
  onRefresh,
  onSelectItem,
  onTakeFirstPhoto,
  onAddPiece,
}: SavedWardrobeSectionProps): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<WardrobeFilterGroup>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((i) => getCategoryGroup(i.category) === activeFilter);
  }, [items, activeFilter]);

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.titleLine}>
            <Text style={styles.sectionTitle}>My Wardrobe</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{items.length}</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>
            Your style, your collection.
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Refresh my wardrobe"
          style={({ pressed }) => [styles.refreshBtn, pressed && styles.btnPressed]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#6B5299" />
          ) : (
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
                stroke="#6B5299"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </Pressable>
      </View>

      {/* Filter Pills (when user has garments) */}
      {items.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Loading Skeleton State */}
      {isLoading && items.length === 0 ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#6B5299" />
          <Text style={styles.loadingText}>Loading your digital wardrobe...</Text>
        </View>
      ) : null}

      {/* Empty State */}
      {!isLoading && items.length === 0 ? (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(246, 242, 255, 0.82)']}
          style={styles.emptyCard}
        >
          <LinearGradient colors={['#EFE9FD', '#E2D7FC']} style={styles.emptyOrb}>
            <HangerIcon size={28} color="#644498" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Saved Garments Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap below to take a photo or choose one from your gallery. Every analyzed garment will appear right here.
          </Text>
          {onTakeFirstPhoto ? (
            <Pressable
              onPress={onTakeFirstPhoto}
              accessibilityRole="button"
              accessibilityLabel="Add your first piece"
              style={({ pressed }) => [styles.emptyCta, pressed && styles.btnPressed]}
            >
              <Text style={styles.emptyCtaText}>+ Add a Piece</Text>
            </Pressable>
          ) : null}
        </LinearGradient>
      ) : null}

      {/* Filtered Empty State */}
      {!isLoading && items.length > 0 && filteredItems.length === 0 ? (
        <View style={styles.filterEmptyBox}>
          <Text style={styles.filterEmptyText}>
            No garments in this category yet.
          </Text>
        </View>
      ) : null}

      {/* 2-Column Bento Garment Grid — "Add a Piece" always leads it */}
      {filteredItems.length > 0 ? (
        <View style={styles.grid}>
          {onAddPiece ? <AddPieceTile onPress={onAddPiece} /> : null}
          {filteredItems.map((item) => (
            <SavedGarmentTile
              key={item.id}
              item={item}
              onSelect={onSelectItem}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerLeft: { flex: 1, gap: 2 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#2E2242', letterSpacing: -0.3 },
  countPill: { backgroundColor: 'rgba(139, 123, 239, 0.16)', paddingHorizontal: 9, paddingVertical: 2.5, borderRadius: 10 },
  countText: { fontSize: 12, fontWeight: '700', color: '#644498' },
  sectionSub: { fontSize: 12.5, color: '#6D5B85' },
  refreshBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#8C78B3', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  btnPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  filtersRow: { gap: 8, paddingVertical: 2 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.76)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.94)' },
  filterPillActive: { backgroundColor: '#686EE8', borderColor: '#686EE8' },
  filterText: { fontSize: 12.5, fontWeight: '600', color: '#6B5299' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '700' },
  loadingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.78)' },
  loadingText: { fontSize: 13, fontWeight: '600', color: '#6D5B85' },
  emptyCard: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 22, borderRadius: 24, borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.96)', gap: 10, shadowColor: '#8C78B3', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.09, shadowRadius: 16, elevation: 3 },
  emptyOrb: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.92)', marginBottom: 2 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#2E2242' },
  emptySubtitle: { fontSize: 13, lineHeight: 19, color: '#6D5B85', textAlign: 'center', maxWidth: 290 },
  emptyCta: { marginTop: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, backgroundColor: 'rgba(139, 123, 239, 0.15)', borderWidth: 1, borderColor: 'rgba(139, 123, 239, 0.28)' },
  emptyCtaText: { fontSize: 13, fontWeight: '700', color: '#5A3E91' },
  filterEmptyBox: { padding: 20, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.75)', alignItems: 'center' },
  filterEmptyText: { fontSize: 13, color: '#6D5B85', fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
});

