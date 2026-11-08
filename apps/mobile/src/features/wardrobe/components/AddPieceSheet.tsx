/**
 * AddPieceSheet — bottom sheet opened by "Add a Piece". Holds the Add to Your
 * Wardrobe heading, the Take a Photo / From Gallery cards and the
 * "For great 3D models" capture guide (the existing components, unchanged).
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

export interface AddPieceSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
}

export function AddPieceSheet({ visible, onClose, onTakePhoto, onChooseFromGallery }: AddPieceSheetProps): React.JSX.Element {
  const pendingPick = useRef<(() => void) | null>(null);

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
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onDismiss={Platform.OS === 'ios' ? runPendingPick : undefined}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />

        <LinearGradient colors={['#FAF8FF', '#EEF2FB']} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <View style={styles.suiteBadge}>
                <View style={styles.suiteBadgeDot} />
                <Text style={styles.suiteBadgeText}>AI CURATION · DIGITAL WARDROBE</Text>
              </View>
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
                <Path d="M6 6l12 12M18 6L6 18" stroke="#6B5299" strokeWidth={2.2} strokeLinecap="round" />
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
            <PhotoCaptureGuide />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

// Sheet styling matches WardrobeDetailModal so the two read as one family.
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(32, 22, 50, 0.48)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(107, 82, 153, 0.22)', marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  headerText: { flex: 1 },
  suiteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 207, 241, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
  },
  suiteBadgeDot: { width: 5.5, height: 5.5, borderRadius: 3, backgroundColor: '#8B7BEF', marginRight: 5 },
  suiteBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#6B5299', letterSpacing: 0.6 },
  title: { fontSize: 21, fontWeight: '800', color: '#34264C', letterSpacing: -0.3 },
  subtitle: { marginTop: 3, fontSize: 12.5, lineHeight: 17, color: '#76648E' },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  content: { gap: 12, paddingBottom: 4 },
  cardsRow: { flexDirection: 'row', gap: 10 },
});
