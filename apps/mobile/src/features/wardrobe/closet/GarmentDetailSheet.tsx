/**
 * GarmentDetailSheet — pearl bottom sheet opened by tapping a garment: large
 * photo (Front | Back when a back photo exists) with AI attribute callouts,
 * "Try on my avatar", "Edit details", "In the wash" (a device-only mark) and
 * Delete (with confirmation). "Fix it" and "Edit details" open the existing
 * dropdown editor.
 *
 * Follow-up actions (edit, try on) run only after this sheet has closed: iOS
 * can't present a second modal while one is animating out, so they wait for
 * `onDismiss`; Android has no `onDismiss`, so they run right away.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { getCategoryLabel, type WardrobeItem } from '../types/wardrobe';
import { AttributeCallouts } from './AttributeCallouts';
import { AiChip, BasketIcon, ColourDots } from './cardParts';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';
import { PearlButton } from './PearlButton';
import { useReduceMotion } from './useReduceMotion';
import { attributeCallouts, stageTint } from './garmentLogic';

type Side = 'front' | 'back';

type GarmentDetailSheetProps = {
  item: WardrobeItem | null;
  onClose: () => void;
  onEdit: (item: WardrobeItem) => void;
  onTryOn: () => void;
  onDelete: (id: string) => Promise<boolean>;
  isInWash: boolean;
  onToggleWash: (id: string) => void;
};

export function GarmentDetailSheet({ item, onClose, onEdit, onTryOn, onDelete, isInWash, onToggleWash }: GarmentDetailSheetProps) {
  const reduceMotion = useReduceMotion();
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  const [side, setSide] = useState<Side>('front');
  const pendingAction = useRef<(() => void) | null>(null);
  // Keep the last item so the sheet's content doesn't vanish mid-close.
  const lastItem = useRef<WardrobeItem | null>(item);
  if (item) lastItem.current = item;
  const shown = lastItem.current;
  const visible = item !== null;

  function runPendingAction() {
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }

  useEffect(() => {
    if (visible) setSide('front');
    else if (Platform.OS !== 'ios') runPendingAction();
  }, [visible]);

  function closeThen(action: () => void) {
    pendingAction.current = action;
    onClose();
  }

  function confirmDelete(target: WardrobeItem) {
    Alert.alert('Delete this piece?', `"${target.name}" will be removed from your wardrobe.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void onDelete(target.id).then((deleted) => deleted && onClose());
        },
      },
    ]);
  }

  const hasBack = Boolean(shown?.back_crop_base64);
  const photoUri = shown ? ((side === 'back' && hasBack ? shown.back_crop_base64 : shown.crop_base64) ?? null) : null;

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
      onDismiss={Platform.OS === 'ios' ? runPendingAction : undefined}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close details" />
        {shown ? (
          <LinearGradient colors={palette.pearl} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.title} numberOfLines={2}>
                  {shown.name}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.sub}>{shown.attributes?.subtype?.predicted || getCategoryLabel(shown.category)}</Text>
                  <ColourDots item={shown} />
                  <AiChip confidence={shown.confidence} />
                </View>
              </View>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={styles.closeBtn}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 6l12 12M18 6L6 18" stroke={palette.heading} strokeWidth={2.2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {hasBack ? (
                <View style={styles.switch}>
                  {(['front', 'back'] as const).map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => setSide(value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: side === value }}
                      style={[styles.switchBtn, side === value && styles.switchSelected]}
                    >
                      <Text style={[styles.switchText, side === value && styles.switchTextSelected]}>{value === 'front' ? 'Front' : 'Back'}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <AttributeCallouts
                photoUri={photoUri}
                tint={stageTint(shown, palette.neutralStage)}
                callouts={attributeCallouts(shown)}
                onFix={() => closeThen(() => onEdit(shown))}
              />

              <PearlButton label="Try on my avatar" onPress={() => closeThen(onTryOn)} />
              <View style={styles.secondaryRow}>
                <Pressable
                  onPress={() => closeThen(() => onEdit(shown))}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>Edit details</Text>
                </Pressable>
                <Pressable
                  onPress={() => onToggleWash(shown.id)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isInWash }}
                  accessibilityLabel="In the wash"
                  style={({ pressed }) => [styles.secondary, isInWash && styles.secondaryOn, pressed && styles.pressed]}
                >
                  <BasketIcon size={14} />
                  <Text style={styles.secondaryText}>{isInWash ? 'In the wash ✓' : 'In the wash'}</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => confirmDelete(shown)}
                accessibilityRole="button"
                accessibilityLabel="Delete this piece"
                style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
              >
                <Text style={styles.deleteText}>Delete piece</Text>
              </Pressable>
            </ScrollView>
          </LinearGradient>
        ) : null}
      </View>
    </Modal>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: p.veil },
    sheet: {
      maxHeight: '90%',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 18,
      paddingTop: 10,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 12,
    },
    headerText: { flex: 1, gap: 4 },
    title: {
      fontSize: 21,
      fontWeight: '800',
      color: p.text,
      letterSpacing: -0.3,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    sub: { fontSize: 12.5, color: p.heading, textTransform: 'capitalize' },
    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: p.glassStrong,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    content: { gap: 16, paddingBottom: 36 },
    switch: {
      alignSelf: 'center',
      flexDirection: 'row',
      padding: 3,
      borderRadius: 18,
      backgroundColor: p.glass,
    },
    switchBtn: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 15 },
    switchSelected: { backgroundColor: '#FFFFFF' },
    switchText: { fontSize: 12.5, fontWeight: '600', color: p.muted },
    switchTextSelected: { color: p.text },
    secondaryRow: { flexDirection: 'row', gap: 10 },
    secondary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 44,
      borderRadius: 22,
      backgroundColor: p.glass,
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    secondaryOn: { backgroundColor: '#FFFFFF' },
    secondaryText: { fontSize: 13.5, fontWeight: '700', color: p.heading },
    delete: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 },
    deleteText: { fontSize: 14, fontWeight: '700', color: p.danger },
    pressed: { opacity: 0.6 },
  });
