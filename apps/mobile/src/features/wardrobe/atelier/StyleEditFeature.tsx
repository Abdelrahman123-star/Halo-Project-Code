/**
 * "The Style Edit" — an editorial feature of the user's latest addition:
 * a large white photo stage, its name and category, with a soft pearl glow
 * behind the card (the photo itself stays on white). Tapping opens details.
 */
import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { ChevronRightIcon, HangerIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { getCategoryLabel, type WardrobeItem } from '../types/wardrobe';
import { ColourDots } from './GarmentCard';
import { PhotoStage, usePearlOpen } from './pearlMotion';

const PEARL_GLOW: readonly GlowStop[] = [
  { offset: 0, color: '#F2C4E2', opacity: 0.75 },
  { offset: 0.45, color: '#D5C6F6', opacity: 0.45 },
  { offset: 1, color: '#BCD6F6', opacity: 0 },
];

type StyleEditFeatureProps = {
  item: WardrobeItem;
  reduceMotion: boolean;
  onOpen: (item: WardrobeItem) => void;
};

export function StyleEditFeature({ item, reduceMotion, onOpen }: StyleEditFeatureProps) {
  const { outline, shimmer, play } = usePearlOpen(reduceMotion);
  const subtype = item.attributes?.subtype?.predicted;
  const category = getCategoryLabel(item.category);

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} pointerEvents="none">
        <SoftGlow id="style-edit-glow" size={260} stops={PEARL_GLOW} />
      </View>

      <Pressable
        onPress={() => play(() => onOpen(item))}
        accessibilityRole="button"
        accessibilityLabel={`Your latest addition, ${item.name}. Open details`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <Animated.View pointerEvents="none" style={[styles.outline, { opacity: outline }]} />

        <View style={styles.stageColumn}>
          <PhotoStage height={196} shimmer={shimmer}>
            {item.crop_base64 ? (
              <Image source={{ uri: item.crop_base64 }} style={styles.photo} resizeMode="contain" accessible={false} />
            ) : (
              <HangerIcon size={36} color="#B9A8F3" />
            )}
          </PhotoStage>
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>THE STYLE EDIT</Text>
          <Text style={styles.kicker}>Your latest addition</Text>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {subtype ? `${subtype} · ${category}` : category}
          </Text>
          <ColourDots item={item} max={5} />
          <View style={styles.link}>
            <Text style={styles.linkText}>View details</Text>
            <ChevronRightIcon size={13} color={dashboardTheme.accent} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  glow: { position: 'absolute', top: -70, right: -80 },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 10,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 4,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  outline: { ...StyleSheet.absoluteFill, borderRadius: 26, borderWidth: 1.5, borderColor: '#B9A8F3' },
  stageColumn: { width: '47%' },
  photo: { width: '90%', height: '90%' },
  copy: { flex: 1, paddingVertical: 8, gap: 4, justifyContent: 'center' },
  eyebrow: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.6, color: dashboardTheme.accent },
  kicker: { fontSize: 12, fontStyle: 'italic', color: dashboardTheme.muted },
  name: { marginTop: 4, fontSize: 19, fontWeight: '700', lineHeight: 23, color: dashboardTheme.plum, letterSpacing: -0.3 },
  category: { fontSize: 12, color: dashboardTheme.muted, textTransform: 'capitalize', marginBottom: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 8 },
  linkText: { fontSize: 12, fontWeight: '700', color: dashboardTheme.accent },
});
