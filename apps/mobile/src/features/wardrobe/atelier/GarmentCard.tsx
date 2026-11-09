/**
 * One piece in the wardrobe gallery: an editorial index number, the garment
 * photo on its white stage, name, category/subtype, colour dots, a 3D badge
 * (only when a 3D model can be built — i.e. the piece has a photo) and a
 * delicate edit mark. Tapping plays the pearl-open effect, then opens details.
 */
import React, { memo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { getCategoryLabel, type WardrobeItem } from '../types/wardrobe';
import { PhotoStage, usePearlOpen } from './pearlMotion';
import { PEARL_HAIRLINE, PEARL_TINT } from './pearlWhite';

export const GARMENT_STAGE_HEIGHT = 168;

type GarmentCardProps = {
  item: WardrobeItem;
  /** Position in the gallery, shown as "01", "02"… */
  index: number;
  reduceMotion: boolean;
  onOpen: (item: WardrobeItem) => void;
};

export function EditMark() {
  return (
    <View style={styles.editMark}>
      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
        <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={dashboardTheme.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export function ColourDots({ item, max = 4 }: { item: WardrobeItem; max?: number }) {
  if (!item.colors?.length) return null;
  return (
    <View style={styles.dots}>
      {item.colors.slice(0, max).map((colour, index) => (
        <View key={`${colour.hex}-${index}`} style={[styles.dot, { backgroundColor: colour.hex }]} />
      ))}
    </View>
  );
}

function GarmentCardBase({ item, index, reduceMotion, onOpen }: GarmentCardProps) {
  const { outline, shimmer, play } = usePearlOpen(reduceMotion);
  const subLabel = item.attributes?.subtype?.predicted || getCategoryLabel(item.category);

  return (
    <Pressable
      onPress={() => play(() => onOpen(item))}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${subLabel}. Open details`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Animated.View pointerEvents="none" style={[styles.outline, { opacity: outline }]} />

      <PhotoStage height={GARMENT_STAGE_HEIGHT} shimmer={shimmer}>
        {item.crop_base64 ? (
          <Image source={{ uri: item.crop_base64 }} style={styles.photo} resizeMode="contain" accessible={false} />
        ) : (
          <HangerIcon size={30} color="#B9A8F3" />
        )}
        <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
        {item.crop_base64 ? (
          <View style={styles.badge3d} accessibilityLabel="3D model available">
            <Text style={styles.badge3dText}>3D</Text>
          </View>
        ) : null}
      </PhotoStage>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subLabel}
        </Text>
        <View style={styles.footer}>
          <ColourDots item={item} />
          <EditMark />
        </View>
      </View>
    </Pressable>
  );
}

export const GarmentCard = memo(GarmentCardBase);

const styles = StyleSheet.create({
  // No card: the photo's white stage sits directly on the white page.
  card: { borderRadius: 16 },
  pressed: { transform: [{ scale: 0.98 }] },
  outline: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 18, borderWidth: 1.5, borderColor: '#B9A8F3' },
  photo: { width: '88%', height: '88%' },
  index: { position: 'absolute', top: 8, left: 10, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: '#B3A6C9' },
  badge3d: {
    position: 'absolute',
    top: 7,
    right: 7,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: PEARL_HAIRLINE,
    backgroundColor: PEARL_TINT,
  },
  badge3dText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, color: dashboardTheme.accent },
  info: { paddingHorizontal: 2, paddingTop: 10, gap: 2 },
  name: { fontSize: 13, fontWeight: '600', color: dashboardTheme.text, letterSpacing: 0.1 },
  sub: { fontSize: 11, color: dashboardTheme.muted, textTransform: 'capitalize', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, minHeight: 18 },
  dots: { flexDirection: 'row', gap: 3 },
  // Discreet: small dots with a hairline edge so white garments still show a dot.
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(61, 48, 85, 0.25)' },
  // Minimal edit control: just the fine pencil.
  editMark: { width: 18, height: 18, marginLeft: 'auto', alignItems: 'center', justifyContent: 'center', opacity: 0.75 },
});
