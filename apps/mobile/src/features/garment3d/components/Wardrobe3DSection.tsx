/**
 * Wardrobe3DSection — the garment's 3D model inside WardrobeDetailModal.
 * Built instantly on the phone from the saved photo; no API or upload involved.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Garment3DModal } from '@/features/garment3d/components/Garment3DModal';
import { getGarmentShapeProfile } from '@/features/garment3d/garmentProfile';
import type { WardrobeItem } from '@/features/wardrobe/types/wardrobe';
import { Garment3DView } from '@/three/garment/Garment3DView';

export interface Wardrobe3DSectionProps {
  item: WardrobeItem;
}

export function Wardrobe3DSection({ item }: Wardrobe3DSectionProps): React.JSX.Element {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const profile = getGarmentShapeProfile(item.category);

  if (!item.crop_base64) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>3D Model</Text>
        <Text style={styles.subtitle}>This piece has no photo, so no 3D model can be built.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>3D Model</Text>
        <Pressable
          onPress={() => setIsFullScreen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open 3D model full screen"
          style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Full screen</Text>
        </Pressable>
      </View>
      <View style={styles.viewerBox}>
        {/* Only one GL view at a time: the inline one unmounts while full screen is open. */}
        {!isFullScreen ? (
          <Garment3DView cropBase64={item.crop_base64} backCropBase64={item.back_crop_base64} profile={profile} />
        ) : null}
      </View>
      <Text style={styles.subtitle}>
        {item.back_crop_base64
          ? 'Built on your phone from your front and back photos.'
          : 'Built on your phone from the front photo · back estimated. Add a back photo when you scan for a full 3D item.'}
      </Text>
      <Garment3DModal
        visible={isFullScreen}
        item={item}
        cropBase64={item.crop_base64}
        profile={profile}
        onClose={() => setIsFullScreen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(185, 170, 222, 0.45)',
    gap: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '800', color: '#2E2242', letterSpacing: -0.2 },
  subtitle: { fontSize: 11.5, color: '#76648E', lineHeight: 16 },
  viewerBox: { height: 320, borderRadius: 16, overflow: 'hidden' },
  linkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(104, 110, 232, 0.1)',
  },
  linkText: { fontSize: 12, fontWeight: '700', color: '#5A3E91' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
