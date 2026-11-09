/** Wardrobe page background and header (back pill, HALO logo, profile button) in the active closet palette. */
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { ChevronLeftIcon, ProfileIcon } from '@/features/home/components/HomeIcons';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';

/** Women's: the static lilac blob background. Men's: a soft steel wash like the closet walls. */
export function WardrobeBackground() {
  const palette = useClosetPalette();
  if (!palette.backgroundWash) return <PastelBlobBackground animated={false} showOrb={false} />;
  return <LinearGradient pointerEvents="none" colors={palette.backgroundWash} style={StyleSheet.absoluteFill} />;
}

type WardrobeHeaderProps = {
  backLabel: string;
  onBack: () => void;
  /** Shown only while browsing. */
  onOpenProfile: (() => void) | null;
};

export function WardrobeHeader({ backLabel, onBack, onOpenProfile }: WardrobeHeaderProps) {
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
      >
        <ChevronLeftIcon size={18} color={palette.heading} />
        <Text style={styles.backBtnText}>{backLabel}</Text>
      </Pressable>

      <Image source={require('../../../../assets/halo-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="HALO Logo" />

      <View style={styles.headerSide}>
        {onOpenProfile ? (
          <GlassIconButton onPress={onOpenProfile} accessibilityLabel="Open your profile" style={styles.glass}>
            <ProfileIcon size={18} color={palette.text} />
          </GlassIconButton>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    // Sits lower on the page, with a larger logo.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 44,
      paddingBottom: 10,
    },
    backBtn: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 22,
      backgroundColor: p.glass,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    backBtnText: { fontSize: 13, fontWeight: '600', color: p.heading },
    btnPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
    logo: { width: 136, height: 56 },
    // Same width as the back pill, so the logo stays centred.
    headerSide: { width: 84, alignItems: 'flex-end' },
    glass: {
      backgroundColor: p.glass,
      borderColor: p.glassBorder,
      shadowColor: p.shadow,
    },
  });
