/**
 * All pieces — the full wardrobe collection, opened from the orbit's
 * "View all" button (optionally pre-filtered by `?group=tops|bottoms|…`).
 * Same pearl-white editorial gallery; tapping a piece opens the existing
 * detail / edit sheet.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOTTOM_NAV_CLEARANCE } from '@/features/home/components/HomeBottomNav';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { useReduceMotion } from '@/features/wardrobe/atelier/pearlMotion';
import { PEARL_HAIRLINE, PEARL_TINT, PEARL_WHITE } from '@/features/wardrobe/atelier/pearlWhite';
import { GROUP_TITLES } from '@/features/wardrobe/atelier/WardrobeAtelier';
import { WardrobeGallery } from '@/features/wardrobe/atelier/WardrobeGallery';
import { filterGarments, piecesLabel } from '@/features/wardrobe/atelier/wardrobeInsights';
import { WardrobeDetailModal } from '@/features/wardrobe/components/WardrobeDetailModal';
import { useWardrobe } from '@/features/wardrobe/hooks/useWardrobe';
import type { WardrobeFilterGroup } from '@/features/wardrobe/types/wardrobe';
import { Banner } from '@/shared/ui/Banner';

function parseGroup(value: unknown): WardrobeFilterGroup {
  return typeof value === 'string' && value in GROUP_TITLES ? (value as WardrobeFilterGroup) : 'all';
}

export default function WardrobePiecesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ group?: string }>();
  const [group, setGroup] = useState<WardrobeFilterGroup>(parseGroup(params.group));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const reduceMotion = useReduceMotion();
  const { items, isLoading, error, refreshWardrobe, editItem, removeItem } = useWardrobe();

  // The hook loads on mount; reload when returning to this screen.
  const hasFocusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) void refreshWardrobe();
      hasFocusedOnce.current = true;
    }, [refreshWardrobe]),
  );

  const pieces = useMemo(() => filterGarments(items, group), [items, group]);
  const selectedItem = selectedItemId ? items.find((item) => item.id === selectedItemId) ?? null : null;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/garment');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Back to wardrobe" hitSlop={8} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <ChevronLeftIcon size={18} color={dashboardTheme.plum} />
            <Text style={styles.backText}>Wardrobe</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading && items.length > 0} onRefresh={refreshWardrobe} tintColor={dashboardTheme.accent} />}
        >
          <View style={styles.titleBlock}>
            <Text style={styles.title} accessibilityRole="header">
              {GROUP_TITLES[group]}
            </Text>
            <View style={styles.titleMeta}>
              <Text style={styles.count}>{piecesLabel(pieces.length).toUpperCase()}</Text>
              {group !== 'all' ? (
                <Pressable onPress={() => setGroup('all')} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.link}>Show all</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {error ? <Banner tone="error" message={error} /> : null}

          {pieces.length > 0 ? (
            <WardrobeGallery items={pieces} resetKey={group} reduceMotion={reduceMotion} onOpen={(item) => setSelectedItemId(item.id)} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{isLoading ? 'Opening your wardrobe…' : 'No pieces here yet.'}</Text>
            </View>
          )}
        </ScrollView>

        <WardrobeDetailModal
          visible={selectedItem !== null}
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          onSave={editItem}
          onDelete={removeItem}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PEARL_WHITE },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6, flexDirection: 'row' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: PEARL_TINT,
    borderWidth: 1,
    borderColor: PEARL_HAIRLINE,
  },
  backText: { fontSize: 13, fontWeight: '600', color: dashboardTheme.plum },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: BOTTOM_NAV_CLEARANCE + 24, gap: 22 },
  titleBlock: { gap: 4 },
  title: { fontSize: 28, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.5 },
  titleMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  count: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1.3, color: dashboardTheme.accent },
  link: { fontSize: 12.5, fontWeight: '700', color: dashboardTheme.accent },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, color: dashboardTheme.muted },
});
