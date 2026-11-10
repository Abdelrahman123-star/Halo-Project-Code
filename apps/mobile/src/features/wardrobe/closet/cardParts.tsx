/** Small pieces shared by the closet cards and the detail sheet. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import type { WardrobeItem } from '../types/wardrobe';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';
import { toPercent } from './garmentLogic';

export function ColourDots({ item, max = 4 }: { item: WardrobeItem; max?: number }) {
  const styles = usePaletteStyles(makeStyles);
  if (!item.colors?.length) return null;
  return (
    <View style={styles.dots}>
      {item.colors.slice(0, max).map((colour, index) => (
        <View key={`${colour.hex}-${index}`} style={[styles.dot, { backgroundColor: colour.hex }]} />
      ))}
    </View>
  );
}

/** Fixed diagonal light — static, so it's fine with Reduce Motion. `corner` keeps it to the top-left. */
export function StageSheen({ corner = false }: { corner?: boolean }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
      locations={corner ? [0, 0.16, 0.34] : [0.3, 0.46, 0.62]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function AiChip({ confidence }: { confidence: number | null | undefined }) {
  const styles = usePaletteStyles(makeStyles);
  const percent = toPercent(confidence);
  if (percent == null) return null;
  return (
    <View style={styles.aiChip} accessibilityLabel={`AI confidence ${percent} percent`}>
      <Text style={styles.aiChipText}>AI · {percent}%</Text>
    </View>
  );
}

export function ThreeDBadge() {
  const styles = usePaletteStyles(makeStyles);
  return (
    <View style={styles.badge3d} accessibilityLabel="3D model available">
      <Text style={styles.badge3dText}>3D</Text>
    </View>
  );
}

export function BasketIcon({ size = 12, color }: { size?: number; color?: string }) {
  const palette = useClosetPalette();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10h16l-1.6 9.2a1.5 1.5 0 0 1-1.5 1.3H7.1a1.5 1.5 0 0 1-1.5-1.3L4 10zM8 10l3-6M16 10l-3-6M9 14v3M12 14v3M15 14v3"
        stroke={color ?? palette.accent}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    dots: { flexDirection: 'row', gap: 3 },
    // Hairline edge so white garments still show a dot.
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: 'rgba(30, 30, 50, 0.25)',
    },
    aiChip: {
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    aiChipText: {
      fontSize: 8.5,
      fontWeight: '700',
      color: p.heading,
      letterSpacing: 0.2,
    },
    badge3d: {
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 6,
      backgroundColor: p.glassStrong,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    badge3dText: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: p.accent,
    },
  });
