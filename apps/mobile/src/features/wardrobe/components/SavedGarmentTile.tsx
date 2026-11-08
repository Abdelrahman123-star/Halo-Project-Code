/**
 * SavedGarmentTile — Memoized Bento garment card for the inline Digital Wardrobe grid.
 * Tapping opens WardrobeDetailModal for full inspection and dropdown editing.
 */
import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { getCategoryLabel, type WardrobeItem } from '@/features/wardrobe/types/wardrobe';

export interface SavedGarmentTileProps {
  item: WardrobeItem;
  onSelect: (item: WardrobeItem) => void;
}

function SavedGarmentTileBase({
  item,
  onSelect,
}: SavedGarmentTileProps): React.JSX.Element {
  const confPct = item.confidence != null ? Math.round(item.confidence * 100) : null;
  const subtype = item.attributes?.subtype?.predicted;
  const subLabel = subtype || getCategoryLabel(item.category);

  return (
    <Pressable
      onPress={() => onSelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`Inspect and edit ${item.name}`}
      style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(246, 242, 255, 0.86)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGrad}
      >
        <View style={styles.imageStage}>
          {item.crop_base64 ? (
            <Image
              source={{ uri: item.crop_base64 }}
              style={styles.image}
              resizeMode="contain"
              accessibilityLabel={item.name}
            />
          ) : (
            <HangerIcon size={30} color="#8B7BEF" />
          )}

          {confPct !== null ? (
            <View style={styles.confPill}>
              <Text style={styles.confText}>{confPct}%</Text>
            </View>
          ) : null}

          {item.crop_base64 ? (
            <View style={styles.badge3dPos} accessibilityLabel="3D model available">
              <Text style={styles.badge3dText}>3D</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {subLabel}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.swatchRow}>
            {item.colors && item.colors.length > 0 ? (
              item.colors.slice(0, 3).map((c, idx) => (
                <View
                  key={`${c.hex}-${idx}`}
                  style={[styles.colorDot, { backgroundColor: c.hex }]}
                />
              ))
            ) : (
              <Text style={styles.tapHint}>Tap to edit</Text>
            )}
          </View>

          <View style={styles.editBadge}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                stroke="#6B5299"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export const SavedGarmentTile = memo(SavedGarmentTileBase);

const styles = StyleSheet.create({
  cardWrap: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.96)',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  cardGrad: {
    padding: 11,
    gap: 8,
  },
  imageStage: {
    width: '100%',
    height: 128,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  confPill: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(139, 123, 239, 0.28)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badge3dPos: {
    position: 'absolute',
    top: 7,
    left: 7,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    backgroundColor: 'rgba(104, 110, 232, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(104, 110, 232, 0.3)',
  },
  badge3dText: { fontSize: 9.5, fontWeight: '800', color: '#5A3E91', letterSpacing: 0.4 },
  confText: { fontSize: 10, fontWeight: '700', color: '#644498' },
  infoBox: { gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: '#2E2242', letterSpacing: -0.1 },
  category: { fontSize: 11.5, color: '#76648E', textTransform: 'capitalize' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 148, 195, 0.16)',
  },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  tapHint: { fontSize: 10.5, fontWeight: '600', color: '#8B7BEF' },
  editBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(139, 123, 239, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

