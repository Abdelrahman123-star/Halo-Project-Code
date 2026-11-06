/**
 * Modal for editing an existing wardrobe item.
 * Features category dropdown selection, subtype chips, and attribute tuning.
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  COMMON_FABRICS,
  COMMON_PATTERNS,
  WARDROBE_CATEGORIES,
  type UpdateWardrobeItemInput,
  type WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

interface EditWardrobeModalProps {
  visible: boolean;
  item: WardrobeItem | null;
  onClose: () => void;
  onSave: (id: string, updates: UpdateWardrobeItemInput) => Promise<unknown>;
}

export function EditWardrobeModal({
  visible,
  item,
  onClose,
  onSave,
}: EditWardrobeModalProps): React.JSX.Element | null {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subtype, setSubtype] = useState("");
  const [fabric, setFabric] = useState("");
  const [pattern, setPattern] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item && visible) {
      setName(item.name);
      setCategory(item.category);
      setSubtype(item.attributes?.subtype?.predicted ?? "");
      setFabric(item.attributes?.fabric?.predicted ?? "");
      setPattern(item.attributes?.pattern?.predicted ?? "");
      setIsDropdownOpen(false);
    }
  }, [item, visible]);

  if (!item) return null;

  const currentCategory = WARDROBE_CATEGORIES.find((c) => c.value === category);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: UpdateWardrobeItemInput = {
        name: name.trim() || item.name,
        category,
        attributes: {
          ...item.attributes,
          subtype: {
            predicted: subtype || null,
            confidence: subtype ? 100 : null,
            top_candidates: [],
          },
          fabric: {
            predicted: fabric || null,
            confidence: fabric ? 100 : null,
            top_candidates: [],
          },
          pattern: {
            predicted: pattern || null,
            confidence: pattern ? 100 : null,
            top_candidates: [],
          },
        },
      };
      await onSave(item.id, updates);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.title}>Edit Wardrobe Item</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.previewRow}>
              {item.crop_base64 ? (
                <Image source={{ uri: item.crop_base64 }} style={styles.thumb} resizeMode="contain" />
              ) : (
                <View style={[styles.thumb, styles.noThumb]}><Text style={styles.noThumbText}>🧥</Text></View>
              )}
              <View style={styles.nameField}>
                <Text style={styles.fieldLabel}>Item Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Garment Name" />
              </View>
            </View>

            {/* Category Dropdown */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Category (tap to change)</Text>
              <Pressable
                style={styles.dropdownTrigger}
                onPress={() => setIsDropdownOpen((prev) => !prev)}
              >
                <Text style={styles.dropdownValue}>
                  {currentCategory ? `${currentCategory.icon} ${currentCategory.label}` : "Select category"}
                </Text>
                <Text style={styles.dropdownArrow}>{isDropdownOpen ? "▲" : "▼"}</Text>
              </Pressable>

              {isDropdownOpen && (
                <View style={styles.dropdownList}>
                  {WARDROBE_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.value}
                      style={[styles.dropdownItem, category === cat.value && styles.dropdownItemActive]}
                      onPress={() => {
                        setCategory(cat.value);
                        setSubtype(cat.subtypes[0] ?? "");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat.icon} {cat.label}</Text>
                      {category === cat.value && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Subtypes Chips */}
            {currentCategory?.subtypes && currentCategory.subtypes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.fieldLabel}>Style / Subtype</Text>
                <View style={styles.chipsWrap}>
                  {currentCategory.subtypes.map((st) => (
                    <Pressable
                      key={st}
                      style={[styles.chip, subtype === st && styles.chipActive]}
                      onPress={() => setSubtype(subtype === st ? "" : st)}
                    >
                      <Text style={[styles.chipText, subtype === st && styles.chipTextActive]}>{st}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Fabric Chips */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Fabric</Text>
              <View style={styles.chipsWrap}>
                {COMMON_FABRICS.map((f) => (
                  <Pressable
                    key={f}
                    style={[styles.chip, fabric.toLowerCase() === f && styles.chipActive]}
                    onPress={() => setFabric(fabric.toLowerCase() === f ? "" : f)}
                  >
                    <Text style={[styles.chipText, fabric.toLowerCase() === f && styles.chipTextActive]}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Pattern Chips */}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Pattern</Text>
              <View style={styles.chipsWrap}>
                {COMMON_PATTERNS.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.chip, pattern.toLowerCase() === p && styles.chipActive]}
                    onPress={() => setPattern(pattern.toLowerCase() === p ? "" : p)}
                  >
                    <Text style={[styles.chipText, pattern.toLowerCase() === p && styles.chipTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onClose} disabled={isSaving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#ffffff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%", padding: 18, gap: 14 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  closeBtn: { padding: 6, borderRadius: 16, backgroundColor: "#f1f5f9" },
  closeBtnText: { fontSize: 14, color: "#64748b", fontWeight: "700" },
  body: { maxHeight: 460 },
  previewRow: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 14 },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0" },
  noThumb: { alignItems: "center", justifyContent: "center" },
  noThumbText: { fontSize: 26 },
  nameField: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#64748b", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: "#0f172a", backgroundColor: "#fff" },
  section: { marginBottom: 14 },
  dropdownTrigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#2563eb", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#eff6ff" },
  dropdownValue: { fontSize: 14, fontWeight: "600", color: "#1e40af" },
  dropdownArrow: { fontSize: 12, color: "#2563eb" },
  dropdownList: { marginTop: 6, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, backgroundColor: "#fff", overflow: "hidden" },
  dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemActive: { backgroundColor: "#dbeafe" },
  dropdownItemText: { fontSize: 13, color: "#1e293b", fontWeight: "500" },
  checkmark: { fontSize: 13, color: "#2563eb", fontWeight: "700" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  chipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { fontSize: 12, color: "#475569", textTransform: "capitalize" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cancelBtn: { backgroundColor: "#f1f5f9" },
  cancelText: { color: "#475569", fontWeight: "600", fontSize: 14 },
  saveBtn: { backgroundColor: "#2563eb" },
  saveText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
});

