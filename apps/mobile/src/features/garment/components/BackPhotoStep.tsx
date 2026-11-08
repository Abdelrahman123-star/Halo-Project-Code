/**
 * BackPhotoStep — step 2 of garment capture: an optional photo of the garment's
 * back. It textures the back of the 3D model instead of reusing the front.
 */
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface BackPhotoStepProps {
  backImageUri: string | null;
  disabled?: boolean;
  onPick: (source: 'camera' | 'gallery') => void;
  onRemove: () => void;
}

export function BackPhotoStep({ backImageUri, disabled = false, onPick, onRemove }: BackPhotoStepProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP 2</Text>
        </View>
        <Text style={styles.title}>Back of the garment</Text>
        {backImageUri ? <Text style={styles.added}>Added ✓</Text> : <Text style={styles.optional}>Recommended</Text>}
      </View>

      {backImageUri ? (
        <View style={styles.row}>
          <Image source={{ uri: backImageUri }} style={styles.thumb} resizeMode="contain" accessibilityLabel="Back photo preview" />
          <View style={styles.actionsCol}>
            <Pressable disabled={disabled} onPress={() => onPick('camera')} style={({ pressed }) => [styles.btn, pressed && styles.pressed]} accessibilityRole="button">
              <Text style={styles.btnText}>Retake back photo</Text>
            </Pressable>
            <Pressable disabled={disabled} onPress={onRemove} style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]} accessibilityRole="button">
              <Text style={styles.btnGhostText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.body}>
            Turn the garment over and lay it out exactly like the front — same spot, same light, whole piece in frame.
            Your 3D model then shows the real back instead of a copy of the front.
          </Text>
          <View style={styles.row}>
            <Pressable disabled={disabled} onPress={() => onPick('camera')} style={({ pressed }) => [styles.btn, styles.flex, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Take a photo of the back">
              <Text style={styles.btnText}>Take back photo</Text>
            </Pressable>
            <Pressable disabled={disabled} onPress={() => onPick('gallery')} style={({ pressed }) => [styles.btnGhost, styles.flex, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Choose the back photo from the gallery">
              <Text style={styles.btnGhostText}>From gallery</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 18, padding: 14, gap: 10, borderWidth: 1.2, borderColor: 'rgba(185, 170, 222, 0.45)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: 'rgba(104, 110, 232, 0.14)' },
  stepBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#5A3E91', letterSpacing: 0.5 },
  title: { flex: 1, fontSize: 14, fontWeight: '800', color: '#2E2242' },
  optional: { fontSize: 11, fontWeight: '700', color: '#8A7AA5' },
  added: { fontSize: 11, fontWeight: '800', color: '#2F855A' },
  body: { fontSize: 12, lineHeight: 17, color: '#6D5B85' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  thumb: { width: 92, height: 110, borderRadius: 12, backgroundColor: '#FFFFFF' },
  actionsCol: { flex: 1, gap: 8 },
  btn: { minHeight: 42, borderRadius: 14, backgroundColor: 'rgba(104, 110, 232, 0.12)', borderWidth: 1, borderColor: 'rgba(104, 110, 232, 0.3)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnText: { fontSize: 13, fontWeight: '700', color: '#5A3E91' },
  btnGhost: { minHeight: 42, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderWidth: 1, borderColor: 'rgba(217, 207, 241, 0.8)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnGhostText: { fontSize: 13, fontWeight: '700', color: '#6D5B85' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
