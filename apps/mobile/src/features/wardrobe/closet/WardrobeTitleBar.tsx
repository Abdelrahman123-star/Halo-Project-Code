/**
 * "My Wardrobe" + piece-count pill, a round refresh button, and the category
 * filter pills (All, Tops, Bottoms, Outerwear, Dresses). In development builds
 * only, a "Slots" pill draws the closet slot outlines for calibration.
 */
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import { PAGE_GUTTER, type ClosetPalette } from './closetTheme';
import { FILTER_OPTIONS, type ClosetFilter } from './garmentLogic';

function RefreshIcon() {
  const palette = useClosetPalette();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" stroke={palette.heading} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Pill({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const styles = usePaletteStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.pill, selected && styles.pillSelected, pressed && styles.pressed]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type WardrobeTitleBarProps = {
  count: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  filter: ClosetFilter;
  onFilterChange: (filter: ClosetFilter) => void;
  showSlotOutlines: boolean;
  onToggleSlotOutlines: () => void;
};

export function WardrobeTitleBar(props: WardrobeTitleBarProps) {
  const { count, isRefreshing, onRefresh, filter, onFilterChange, showSlotOutlines, onToggleSlotOutlines } = props;
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} accessibilityRole="header">
            My Wardrobe
          </Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
        <GlassIconButton onPress={onRefresh} accessibilityLabel="Refresh wardrobe" style={styles.glass}>
          {isRefreshing ? <ActivityIndicator size="small" color={palette.accent} /> : <RefreshIcon />}
        </GlassIconButton>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.pills}>
        {FILTER_OPTIONS.map((option) => (
          <Pill key={option.value} label={option.label} selected={filter === option.value} onPress={() => onFilterChange(option.value)} />
        ))}
        {__DEV__ ? (
          <Pill label="Slots" selected={showSlotOutlines} onPress={onToggleSlotOutlines} accessibilityLabel="Developer: show closet slot outlines" />
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    wrap: { gap: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: p.heading,
      letterSpacing: -0.4,
    },
    countPill: {
      minWidth: 28,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 11,
      alignItems: 'center',
      backgroundColor: p.glassStrong,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    countText: { fontSize: 12, fontWeight: '700', color: p.text },
    glass: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: p.glass,
      borderColor: p.glassBorder,
    },
    bleed: { marginHorizontal: -PAGE_GUTTER, flexGrow: 0 },
    pills: { paddingHorizontal: PAGE_GUTTER, gap: 8 },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 16,
      backgroundColor: p.glass,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    pillSelected: { backgroundColor: '#FFFFFF', borderColor: p.selectedBorder },
    pillText: { fontSize: 12.5, fontWeight: '600', color: p.muted },
    pillTextSelected: { color: p.text, fontWeight: '700' },
    pressed: { opacity: 0.75 },
  });
