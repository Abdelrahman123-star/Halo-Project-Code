/**
 * A garment placed in a closet slot. "rod" = hanging: tall frosted card with a
 * thin static pearl line up to the rod. "shelf" = folded: shorter card standing
 * on the shelf with a corner sheen and a soft lilac shadow under it. Both show
 * the photo on a pastel stage tinted from the main colour, the "3D" badge, the
 * "AI · %" chip and the name underneath. Pieces in the wash are dimmed with a
 * basket mark. The card fades in when it appears (fade only, fine for Reduce Motion).
 */
import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FadeInView } from '@/features/home/components/FadeInView';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { getCategoryLabel, type WardrobeItem } from '../types/wardrobe';
import { AiChip, BasketIcon, StageSheen, ThreeDBadge } from './cardParts';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';
import { stageTint } from './garmentLogic';

export const SLOT_LABEL_HEIGHT = 15;

export type SlotVariant = 'rod' | 'shelf';

/** Thin static pearl line from the card's top up to the rod. */
export function RodLine({ length }: { length: number }) {
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  if (length <= 0) return null;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={['#FFFFFF', palette.pearl[1], palette.pearl[0]]}
      style={[styles.rodLine, { top: -length, height: length }]}
    />
  );
}

export function SlotLabel({ text }: { text: string }) {
  const styles = usePaletteStyles(makeStyles);
  return (
    <Text style={styles.label} numberOfLines={1}>
      {text}
    </Text>
  );
}

type GarmentSlotCardProps = {
  item: WardrobeItem;
  variant: SlotVariant;
  /** Distance (pt) from the slot's top up to the rod; rod cards only. */
  rodLineLength: number;
  inWash: boolean;
  onOpen: (item: WardrobeItem) => void;
};

function GarmentSlotCardBase({ item, variant, rodLineLength, inWash, onOpen }: GarmentSlotCardProps) {
  const subLabel = item.attributes?.subtype?.predicted || getCategoryLabel(item.category);
  const isRod = variant === 'rod';
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);

  return (
    <FadeInView fromTranslateY={0} style={[styles.fill, inWash && styles.washed]}>
      <Pressable
        onPress={() => onOpen(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${subLabel}${inWash ? ', in the wash' : ''}. Open details`}
        style={({ pressed }) => [styles.fill, pressed && styles.pressed]}
      >
        <View style={[styles.card, isRod ? styles.rodCard : styles.shelfCard]}>
          {isRod ? <RodLine length={rodLineLength} /> : null}
          <View style={[styles.stage, isRod ? styles.rodStage : styles.shelfStage, { backgroundColor: stageTint(item, palette.neutralStage) }]}>
            {item.crop_base64 ? (
              <Image source={{ uri: item.crop_base64 }} style={styles.photo} resizeMode="contain" accessible={false} />
            ) : (
              <HangerIcon size={22} color={palette.outline} />
            )}
            <StageSheen corner={!isRod} />
            <View style={styles.topRow}>
              {inWash ? (
                <View style={styles.wash} accessibilityLabel="In the wash">
                  <BasketIcon size={10} />
                </View>
              ) : (
                <View />
              )}
              {item.crop_base64 ? <ThreeDBadge /> : null}
            </View>
            <View style={styles.bottomRow}>
              <AiChip confidence={item.confidence} />
            </View>
          </View>
        </View>
        {isRod ? null : <View style={styles.shelfShadow} pointerEvents="none" />}
        <SlotLabel text={item.name} />
      </Pressable>
    </FadeInView>
  );
}

export const GarmentSlotCard = memo(GarmentSlotCardBase);

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    washed: { opacity: 0.5 },
    pressed: { transform: [{ scale: 0.97 }] },
    card: {
      flex: 1,
      padding: 3,
      backgroundColor: p.glass,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    rodCard: {
      borderRadius: 18,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 10,
      elevation: 3,
    },
    shelfCard: {
      borderRadius: 12,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 3,
    },
    stage: {
      flex: 1,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rodStage: { borderRadius: 15 },
    shelfStage: { borderRadius: 9 },
    photo: { width: '88%', height: '88%' },
    topRow: {
      position: 'absolute',
      top: 3,
      left: 3,
      right: 3,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bottomRow: { position: 'absolute', bottom: 3, left: 3 },
    wash: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: p.glassStrong,
    },
    rodLine: {
      position: 'absolute',
      alignSelf: 'center',
      width: 1.5,
      borderRadius: 1,
    },
    // Soft lilac pool of shadow where the folded piece meets the shelf.
    shelfShadow: {
      position: 'absolute',
      left: '12%',
      right: '12%',
      bottom: SLOT_LABEL_HEIGHT - 3,
      height: 6,
      borderRadius: 6,
      backgroundColor: p.shelfShadow,
      zIndex: -1,
    },
    label: {
      height: SLOT_LABEL_HEIGHT,
      marginTop: 1,
      fontSize: 9.5,
      lineHeight: 14,
      fontWeight: '600',
      color: p.text,
      textAlign: 'center',
    },
  });
