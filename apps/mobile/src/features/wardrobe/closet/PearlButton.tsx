/** Full-width gradient button in the active closet palette (same shape as the auth pearl button). */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';

export function PearlButton({ label, onPress }: { label: string; onPress: () => void }) {
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.shadow, pressed && styles.pressed]}>
      <LinearGradient colors={palette.pearl} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    shadow: {
      borderRadius: 26,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 4,
    },
    pressed: { transform: [{ scale: 0.97 }] },
    button: {
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.95)',
    },
    label: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.4,
      color: p.onPearl,
    },
  });
