/**
 * WardrobeDetailModal — Frosted luxury garment detail & dropdown editor sheet.
 * Displays the automatic 3D model, garment hero summary, editable name, dropdown selectors
 * (Category, Subtype, Fabric, Pattern), Save, and two-step Delete.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { WardrobeDropdownField } from '@/features/wardrobe/components/WardrobeDropdownField';
import { WardrobeModalHero } from '@/features/wardrobe/components/WardrobeModalHero';
import { Wardrobe3DSection } from '@/features/garment3d/components/Wardrobe3DSection';
import {
  COMMON_FABRICS, COMMON_PATTERNS, getCategoryOption, WARDROBE_CATEGORIES,
  type UpdateWardrobeItemInput, type WardrobeItem,
} from '@/features/wardrobe/types/wardrobe';

type OpenMenu = 'category' | 'subtype' | 'fabric' | 'pattern' | null;

export interface WardrobeDetailModalProps {
  visible: boolean;
  item: WardrobeItem | null;
  onClose: () => void;
  onSave: (id: string, updates: UpdateWardrobeItemInput) => Promise<unknown>;
  onDelete?: (id: string) => Promise<boolean>;
}

const CATEGORY_OPTS = WARDROBE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
const FABRIC_OPTS = [
  { value: '', label: 'Unknown / Unspecified' },
  ...COMMON_FABRICS.map((f) => ({ value: f, label: f })),
];
const PATTERN_OPTS = [
  { value: '', label: 'Unknown / Unspecified' },
  ...COMMON_PATTERNS.map((p) => ({ value: p, label: p })),
];

export function WardrobeDetailModal({
  visible,
  item,
  onClose,
  onSave,
  onDelete,
}: WardrobeDetailModalProps): React.JSX.Element | null {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subtype, setSubtype] = useState('');
  const [fabric, setFabric] = useState('');
  const [pattern, setPattern] = useState('');
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (item && visible) {
      setName(item.name);
      setCategory(item.category);
      setSubtype(item.attributes?.subtype?.predicted ?? '');
      setFabric(item.attributes?.fabric?.predicted ?? '');
      setPattern(item.attributes?.pattern?.predicted ?? '');
      setOpenMenu(null);
      setConfirmDelete(false);
    }
  }, [item, visible]);

  if (!item) return null;

  const subtypeOptions = [
    { value: '', label: 'Unspecified' },
    ...(getCategoryOption(category)?.subtypes ?? []).map((s) => ({ value: s, label: s })),
  ];

  async function handleSave() {
    if (!item) return;
    setIsSaving(true);
    try {
      const orig = item.attributes;
      await onSave(item.id, {
        name: name.trim() || item.name,
        category,
        attributes: {
          ai_original: orig?.ai_original,
          subtype: { predicted: subtype || null, confidence: orig?.subtype?.confidence ?? null, top_candidates: orig?.subtype?.top_candidates ?? [] },
          fabric: { predicted: fabric || null, confidence: orig?.fabric?.confidence ?? null, top_candidates: orig?.fabric?.top_candidates ?? [] },
          pattern: { predicted: pattern || null, confidence: orig?.pattern?.confidence ?? null, top_candidates: orig?.pattern?.top_candidates ?? [] },
        },
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePress() {
    if (!item || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      if (await onDelete(item.id)) onClose();
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close modal" />
        <LinearGradient colors={['#FAF8FF', '#EEF2FB']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.badgeTop}>GARMENT DETAILS & EDIT</Text>
              <Text style={styles.sheetTitle} numberOfLines={1}>{item.name}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#5A4A7A" strokeWidth={2.2} strokeLinecap="round" />
              </Svg>
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Wardrobe3DSection key={item.id} item={item} />
            <WardrobeModalHero item={item} />

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Garment Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter garment name"
                placeholderTextColor="#9A8BB2"
                accessibilityLabel="Garment Name"
                style={styles.textInput}
              />
            </View>

            <WardrobeDropdownField
              label="Category"
              selectedValue={category}
              options={CATEGORY_OPTS}
              isOpen={openMenu === 'category'}
              onToggle={() => setOpenMenu(openMenu === 'category' ? null : 'category')}
              onSelect={(val) => {
                setCategory(val);
                setSubtype(getCategoryOption(val)?.subtypes[0] ?? '');
                setOpenMenu(null);
              }}
            />
            <WardrobeDropdownField
              label="Style / Subtype"
              selectedValue={subtype}
              placeholder="Unspecified"
              options={subtypeOptions}
              isOpen={openMenu === 'subtype'}
              onToggle={() => setOpenMenu(openMenu === 'subtype' ? null : 'subtype')}
              onSelect={(val) => { setSubtype(val); setOpenMenu(null); }}
            />
            <WardrobeDropdownField
              label="Fabric"
              selectedValue={fabric}
              placeholder="Unknown / Unspecified"
              options={FABRIC_OPTS}
              isOpen={openMenu === 'fabric'}
              onToggle={() => setOpenMenu(openMenu === 'fabric' ? null : 'fabric')}
              onSelect={(val) => { setFabric(val); setOpenMenu(null); }}
            />
            <WardrobeDropdownField
              label="Pattern"
              selectedValue={pattern}
              placeholder="Unknown / Unspecified"
              options={PATTERN_OPTS}
              isOpen={openMenu === 'pattern'}
              onToggle={() => setOpenMenu(openMenu === 'pattern' ? null : 'pattern')}
              onSelect={(val) => { setPattern(val); setOpenMenu(null); }}
            />
          </ScrollView>

          <View style={styles.footer}>
            {onDelete ? (
              <Pressable
                onPress={handleDeletePress}
                disabled={isDeleting || isSaving}
                accessibilityRole="button"
                accessibilityLabel={confirmDelete ? 'Confirm delete garment' : 'Delete garment'}
                style={[styles.deleteBtn, confirmDelete && styles.deleteBtnConfirm]}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#C53030" />
                ) : (
                  <Text style={[styles.deleteText, confirmDelete && styles.deleteTextConfirm]}>
                    {confirmDelete ? 'Confirm?' : 'Delete'}
                  </Text>
                )}
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={isSaving || isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Save garment changes"
              style={styles.savePressable}
            >
              <LinearGradient colors={['#686EE8', '#9475F5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGrad}>
                {isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(32, 22, 50, 0.48)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.95)' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(107, 82, 153, 0.22)', marginTop: -8, marginBottom: 12 },
  badgeTop: { fontSize: 10, fontWeight: '700', color: '#6B5299', letterSpacing: 0.7 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#2E2242', maxWidth: 260, marginTop: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.88)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.96)', alignItems: 'center', justifyContent: 'center' },
  scroll: { maxHeight: 490 },
  scrollContent: { gap: 13, paddingBottom: 12 },
  fieldGroup: { gap: 5 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#4F3E6A', letterSpacing: 0.2 },
  textInput: { minHeight: 46, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.92)', borderWidth: 1.2, borderColor: 'rgba(185, 170, 222, 0.55)', paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontWeight: '600', color: '#2E2242' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(165, 148, 195, 0.22)' },
  deleteBtn: { minHeight: 48, paddingHorizontal: 16, borderRadius: 16, backgroundColor: 'rgba(224, 109, 99, 0.12)', borderWidth: 1, borderColor: 'rgba(224, 109, 99, 0.3)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnConfirm: { backgroundColor: '#E06D63', borderColor: '#E06D63' },
  deleteText: { fontSize: 13.5, fontWeight: '700', color: '#C53030' },
  deleteTextConfirm: { color: '#FFFFFF' },
  savePressable: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#686EE8', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 3 },
  saveGrad: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  saveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
});
