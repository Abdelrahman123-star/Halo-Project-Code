/**
 * AddPieceTile — the first tile in the Digital Wardrobe grid. Built from the
 * same structure and styling as SavedGarmentTile (image stage, name, sub-label,
 * footer) so it sits naturally among the saved pieces, but with an empty dashed
 * stage and a soft "+".
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface AddPieceTileProps {
  onPress: () => void;
}

export function AddPieceTile({ onPress }: AddPieceTileProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add a piece to your wardrobe"
      style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(246, 242, 255, 0.86)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGrad}
      >
        <View style={styles.imageStage}>
          <LinearGradient colors={['#EFE9FD', '#E2D7FC']} style={styles.plusOrb}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke="#644498" strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </LinearGradient>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.name}>Add a Piece</Text>
          <Text style={styles.category}>Photo or gallery</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.hint}>Tap to add</Text>
          <View style={styles.sourceIcons}>
            <View style={styles.sourceBadge}>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"
                  stroke="#6B5299"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Circle cx={12} cy={12.5} r={3.2} stroke="#6B5299" strokeWidth={2} />
              </Svg>
            </View>
            <View style={styles.sourceBadge}>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <Rect x={3.5} y={4.5} width={17} height={15} rx={2.5} stroke="#6B5299" strokeWidth={2} />
                <Path d="M3.5 16l5-5 4 4 2.5-2.5 5.5 5.5" stroke="#6B5299" strokeWidth={2} strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// Dimensions mirror SavedGarmentTile so the tile lines up with the grid.
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
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  cardGrad: { padding: 11, gap: 8 },
  imageStage: {
    width: '100%',
    height: 128,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 123, 239, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.92)',
  },
  infoBox: { gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: '#2E2242', letterSpacing: -0.1 },
  category: { fontSize: 11.5, color: '#76648E' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 148, 195, 0.16)',
  },
  hint: { fontSize: 10.5, fontWeight: '600', color: '#8B7BEF' },
  sourceIcons: { flexDirection: 'row', gap: 5 },
  sourceBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(139, 123, 239, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
