/**
 * AddPieceSheet — pearl bottom sheet opened by "Add a Piece". Holds the Add to
 * Your Wardrobe heading, the Take a Photo / From Gallery cards and the
 * "For great 3D models" tips (closed until tapped).
 *
 * Choosing a source closes the sheet first and only then opens the picker:
 * on iOS a picker launched while the modal is still animating out can fail,
 * so it waits for `onDismiss`; Android has no `onDismiss`, so it runs right away.
 */
import React, { useEffect, useRef } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { GarmentOptionCard } from '@/features/garment/components/GarmentOptionCard';
import { PhotoCaptureGuide } from '@/features/garment/components/PhotoCaptureGuide';
import { useClosetPalette, usePaletteStyles } from '../closet/ClosetPaletteContext';
import type { ClosetPalette } from '../closet/closetTheme';
import { useReduceMotion } from '../closet/useReduceMotion';

export interface AddPieceSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
}

export function AddPieceSheet({ visible, onClose, onTakePhoto, onChooseFromGallery }: AddPieceSheetProps): React.JSX.Element {
  const pendingPick = useRef<(() => void) | null>(null);
  const reduceMotion = useReduceMotion();
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);

  function runPendingPick() {
    const pick = pendingPick.current;
    pendingPick.current = null;
    pick?.();
  }

  function choose(pick: () => void) {
    pendingPick.current = pick;
    onClose();
  }

  useEffect(() => {
    if (!visible && Platform.OS !== 'ios') runPendingPick();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
      onDismiss={Platform.OS === 'ios' ? runPendingPick : undefined}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />

        <LinearGradient colors={['#FFFFFF', palette.base]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Add to Your Wardrobe</Text>
              <Text style={styles.subtitle}>Scan or upload clothing to build your 3D digital closet.</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M6 6l12 12M18 6L6 18" stroke={palette.heading} strokeWidth={2.2} strokeLinecap="round" />
              </Svg>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.cardsRow}>
              <GarmentOptionCard type="camera" title="Take a Photo" subtitle="Live camera capture" onPress={() => choose(onTakePhoto)} />
              <GarmentOptionCard
                type="gallery"
                title="From Gallery"
                subtitle="Select saved photo"
                onPress={() => choose(onChooseFromGallery)}
              />
            </View>
            <PhotoCaptureGuide defaultExpanded={false} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
  // Bottom sheet over a soft veil.
  backdrop: { flex: 1, backgroundColor: p.veil, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '86%',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: p.glassBorder,
    shadowColor: p.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: p.outline, opacity: 0.6, marginBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  headerText: { flex: 1 },
  title: { fontSize: 21, fontWeight: '800', color: p.text, letterSpacing: -0.3 },
  subtitle: { marginTop: 3, fontSize: 12.5, lineHeight: 17, color: p.muted },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: p.glassStrong,
    borderWidth: 1,
    borderColor: p.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  content: { gap: 12 },
  cardsRow: { flexDirection: 'row', gap: 10 },
});
