/** One closet image at an exact size, with its placed cards (and DEV slot outlines) on top. */
import React, { memo } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import type { WardrobeItem } from '../types/wardrobe';
import { AddPieceCard } from './AddPieceCard';
import type { ClosetSegmentLayout } from './closetPacking';
import type { ClosetSlot, ClosetSlotMap } from './closetSlots';
import { GarmentSlotCard } from './GarmentSlotCard';

type ClosetSegmentProps = {
  image: ImageSourcePropType;
  slotMap: ClosetSlotMap;
  rodY: number;
  width: number;
  height: number;
  layout: ClosetSegmentLayout<WardrobeItem>;
  washIds: ReadonlySet<string>;
  showSlotOutlines: boolean;
  onOpen: (item: WardrobeItem) => void;
  onAddPiece: () => void;
};

function slotFrame(slot: ClosetSlot, width: number, height: number) {
  return {
    left: (slot.x - slot.w / 2) * width,
    top: (slot.y - slot.h / 2) * height,
    width: slot.w * width,
    height: slot.h * height,
  };
}

function ClosetSegmentBase({ image, slotMap, rodY, width, height, layout, washIds, showSlotOutlines, onOpen, onAddPiece }: ClosetSegmentProps) {
  const rodLine = (slot: ClosetSlot) => (slot.y - slot.h / 2 - rodY) * height;

  return (
    <View style={{ width, height }}>
      {/* The parent sizes this at the image's exact ratio, so `cover` never crops or stretches. */}
      <Image source={image} style={{ width, height }} resizeMode="cover" fadeDuration={0} accessible={false} />

      {showSlotOutlines
        ? slotMap[layout.kind].map((slot, index) => (
            <View key={`outline-${index}`} pointerEvents="none" style={[styles.outline, slotFrame(slot, width, height)]}>
              <Text style={styles.outlineText}>{`${slot.zone} ${index}`}</Text>
            </View>
          ))
        : null}

      {/* Keyed by slot + piece, so a piece that moves (filter, new piece) remounts and fades in. */}
      {layout.placed.map(({ slot, key, content }) => (
        <View key={content.kind === 'add' ? 'add' : `${key}:${content.item.id}`} style={[styles.slot, slotFrame(slot, width, height)]}>
          {content.kind === 'add' ? (
            <AddPieceCard onPress={onAddPiece} rodLineLength={rodLine(slot)} />
          ) : (
            <GarmentSlotCard
              item={content.item}
              variant={slot.zone === 'rod' ? 'rod' : 'shelf'}
              rodLineLength={rodLine(slot)}
              inWash={washIds.has(content.item.id)}
              onOpen={onOpen}
            />
          )}
        </View>
      ))}
    </View>
  );
}

export const ClosetSegment = memo(ClosetSegmentBase);

const styles = StyleSheet.create({
  slot: { position: 'absolute' },
  outline: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 120, 0.8)',
    backgroundColor: 'rgba(255, 0, 120, 0.12)',
  },
  outlineText: { fontSize: 8, color: '#B0005A' },
});
