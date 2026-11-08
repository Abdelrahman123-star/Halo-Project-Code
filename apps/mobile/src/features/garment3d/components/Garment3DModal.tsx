/**
 * Garment3DModal — full-screen view of the on-device 3D garment with
 * garment meta-info. Opened from the 3D section of WardrobeDetailModal.
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getCategoryLabel, type WardrobeItem } from '@/features/wardrobe/types/wardrobe';
import { Garment3DView } from '@/three/garment/Garment3DView';
import type { GarmentShapeProfile } from '@/three/garment/garmentMesh';

interface Garment3DModalProps {
  visible: boolean;
  item: WardrobeItem;
  cropBase64: string;
  profile: GarmentShapeProfile;
  onClose: () => void;
}

export function Garment3DModal({
  visible,
  item,
  cropBase64,
  profile,
  onClose,
}: Garment3DModalProps): React.JSX.Element | null {
  if (!visible) return null;

  const subtype = item.attributes?.subtype?.predicted ?? getCategoryLabel(item.category);
  const dominantColor = item.colors?.[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.badgeText}>3D GARMENT MODEL</Text>
            <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close 3D viewer"
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="#B8AED8"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        {/* 3D Viewer */}
        <View style={styles.viewerWrap}>
          <Garment3DView
            cropBase64={cropBase64}
            backCropBase64={item.back_crop_base64}
            profile={profile}
            backgroundColor="#F1EEF6"
          />
        </View>

        {/* Meta footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCategory}>{subtype}</Text>
          {dominantColor ? (
            <View style={styles.colorRow}>
              <View style={[styles.colorDot, { backgroundColor: dominantColor.hex }]} />
              <Text style={styles.colorLabel}>{dominantColor.color_name}</Text>
            </View>
          ) : null}
          <Text style={styles.disclaimer}>
            Built on your phone · Shape estimated from {item.back_crop_base64 ? 'front + back photos' : 'the front photo (back estimated)'} · Not rigged
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0A1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184, 174, 216, 0.14)',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#686EE8', letterSpacing: 0.8 },
  title: { fontSize: 20, fontWeight: '800', color: '#FFFDF8', marginTop: 2 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(184, 174, 216, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184, 174, 216, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerWrap: { flex: 1, margin: 12, borderRadius: 20, overflow: 'hidden' },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(184, 174, 216, 0.14)',
  },
  footerCategory: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFDF8',
    textTransform: 'capitalize',
  },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorLabel: { fontSize: 12.5, color: '#B8AED8', fontWeight: '500' },
  disclaimer: {
    fontSize: 10.5,
    color: 'rgba(184, 174, 216, 0.5)',
    fontStyle: 'italic',
    lineHeight: 15,
  },
});

