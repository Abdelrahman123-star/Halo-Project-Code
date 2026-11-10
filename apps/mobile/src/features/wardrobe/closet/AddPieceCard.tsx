/** "Add a Piece" — always in the first rod slot of the closet. Opens the Add a Piece sheet. */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { usePaletteStyles, useClosetPalette } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';
import { RodLine, SlotLabel } from './GarmentSlotCard';

export function AddPieceCard({ onPress, rodLineLength }: { onPress: () => void; rodLineLength: number }) {
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add a piece, from a photo or your gallery"
      style={({ pressed }) => [styles.fill, pressed && styles.pressed]}
    >
      <View style={styles.card}>
        <RodLine length={rodLineLength} />
        <View style={styles.stage}>
          <LinearGradient colors={palette.addCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.plusCircle}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
            </Svg>
          </LinearGradient>
          <Text style={styles.sub} numberOfLines={2}>
            Photo or gallery
          </Text>
        </View>
      </View>
      <SlotLabel text="Add a Piece" />
    </Pressable>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
    card: {
      flex: 1,
      padding: 3,
      borderRadius: 18,
      backgroundColor: p.glass,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    stage: {
      flex: 1,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: p.outline,
      backgroundColor: p.addStage,
    },
    plusCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.9)',
    },
    sub: {
      fontSize: 9.5,
      color: p.muted,
      textAlign: 'center',
      paddingHorizontal: 4,
    },
  });
