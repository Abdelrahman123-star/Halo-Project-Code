/** Small overlays around the closet: position dots, the first-visit swipe hint and the centred message card. */
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRightIcon } from '@/features/home/components/HomeIcons';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';

export const DOTS_HEIGHT = 22;

export function ClosetDots({ count, active }: { count: number; active: number }) {
  const styles = usePaletteStyles(makeStyles);
  return (
    <View style={styles.dots} accessibilityLabel={`Closet section ${active + 1} of ${count}`}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.dot, index === active && styles.dotActive]} />
      ))}
    </View>
  );
}

/** "Swipe to explore ›" — fades out once `visible` turns false. */
export function SwipeHint({ visible }: { visible: boolean }) {
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 400 : 300,
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);
  return (
    <Animated.View pointerEvents="none" style={[styles.hint, { opacity }]}>
      <Text style={styles.hintText}>Swipe to explore</Text>
      <ChevronRightIcon size={13} color={palette.heading} />
    </Animated.View>
  );
}

export function ClosetMessage({ title, subtitle, onPress }: { title: string; subtitle: string; onPress?: () => void }) {
  const styles = usePaletteStyles(makeStyles);
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : 'text'} style={styles.message}>
      <Text style={styles.messageTitle}>{title}</Text>
      <Text style={styles.messageSub}>{subtitle}</Text>
    </Pressable>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    dots: {
      height: DOTS_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: p.heading,
      opacity: 0.25,
    },
    dotActive: { width: 16, opacity: 1 },
    hint: {
      position: 'absolute',
      right: 14,
      top: '46%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingLeft: 12,
      paddingRight: 8,
      paddingVertical: 7,
      borderRadius: 16,
      backgroundColor: p.glassStrong,
      borderWidth: 1,
      borderColor: p.glassBorder,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    hintText: { fontSize: 12, fontWeight: '600', color: p.heading },
    message: {
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: 20,
      backgroundColor: p.glassStrong,
      borderWidth: 1,
      borderColor: p.glassBorder,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 4,
    },
    messageTitle: { fontSize: 16, fontWeight: '800', color: p.heading },
    messageSub: { fontSize: 12.5, color: p.muted },
  });
