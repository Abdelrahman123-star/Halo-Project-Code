/**
 * 3D Walk-in Digital Closet Screen (`/closet`).
 * Interactive 3D wardrobe with opening doors, sliding clothes rail,
 * section switcher, and garment inspection overlay.
 */

import "@/shared/lib/polyfills";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { CLOSET_SECTIONS } from "@/features/closet/logic/sections";
import { useClosetSections } from "@/features/closet/hooks/useClosetSections";
import { EditWardrobeModal } from "@/features/wardrobe/components/EditWardrobeModal";
import { ClosetScene } from "@/three/closet/ClosetScene";
import { BOTTOM_NAV_CLEARANCE } from "@/features/home/components/HomeBottomNav";

export default function ClosetScreen(): React.JSX.Element {
  const router = useRouter();
  const [quality, setQuality] = useState<"light" | "standard">("standard");
  const [isEditing, setIsEditing] = useState(false);

  const {
    sections,
    activeSection,
    activeSectionMeta,
    activeItems,
    selectedItem,
    selectedItemId,
    doorsOpen,
    setActiveSection,
    setSelectedItemId,
    toggleDoors,
    editItem,
  } = useClosetSections();

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹ Back</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>3D Digital Closet</Text>
          <Text style={styles.headerSubtitle}>
            {doorsOpen ? activeSectionMeta.title : "Walk-in Wardrobe"}
          </Text>
        </View>
        <Pressable
          onPress={() => setQuality((q) => (q === "light" ? "standard" : "light"))}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>{quality === "light" ? "⚡ Light" : "💎 HD"}</Text>
        </Pressable>
      </View>

      {/* 3D Scene Viewport */}
      <View style={styles.sceneContainer}>
        <ClosetScene
          items={activeItems}
          doorsOpen={doorsOpen}
          selectedId={selectedItemId}
          quality={quality}
          onToggleDoors={toggleDoors}
          onSelect={(id) => setSelectedItemId(id)}
        />

        {/* Door Tap Prompt */}
        {!doorsOpen && (
          <Pressable style={styles.doorPrompt} onPress={toggleDoors}>
            <Text style={styles.doorPromptIcon}>✨</Text>
            <Text style={styles.doorPromptTitle}>Tap to Open Wardrobe</Text>
            <Text style={styles.doorPromptSub}>Explore your personalized 3D clothing rail</Text>
          </Pressable>
        )}

        {/* Empty Rail Advice */}
        {doorsOpen && activeItems.length === 0 && (
          <View style={styles.emptyNotice}>
            <Text style={styles.emptyTitle}>This rail is currently empty</Text>
            <Pressable
              style={styles.scanBtn}
              onPress={() => router.push("/(app)/garment")}
            >
              <Text style={styles.scanBtnText}>+ Scan Clothes to Hang Here</Text>
            </Pressable>
          </View>
        )}

        {/* Inspection Card Overlay */}
        {doorsOpen && selectedItem && (
          <View style={styles.inspectCard}>
            <View style={styles.inspectInfo}>
              <Text style={styles.inspectName} numberOfLines={1}>{selectedItem.name}</Text>
              <Text style={styles.inspectMeta}>
                {selectedItem.category.replace(/_/g, " ")} · {selectedItem.attributes?.subtype?.predicted || "Garment"}
              </Text>
            </View>
            <View style={styles.inspectActions}>
              <Pressable style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </Pressable>
              <Pressable style={styles.dismissBtn} onPress={() => setSelectedItemId(null)}>
                <Text style={styles.dismissBtnText}>✕</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Section Switching Tabs */}
      {doorsOpen && (
        <View style={styles.tabBar}>
          {CLOSET_SECTIONS.map((sec) => {
            const count = sections[sec.key].length;
            const isActive = activeSection === sec.key;
            return (
              <Pressable
                key={sec.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => {
                  setSelectedItemId(null);
                  setActiveSection(sec.key);
                }}
              >
                <Text style={styles.tabIcon}>{sec.icon}</Text>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {sec.title.split(" ")[0]} ({count})
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Reused Edit Modal */}
      {selectedItem && (
        <EditWardrobeModal
          visible={isEditing}
          item={selectedItem}
          onClose={() => setIsEditing(false)}
          onSave={async (id, updates) => {
            await editItem(id, updates);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0c10" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  headerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)" },
  headerBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
  headerTitleWrap: { alignItems: "center" },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  headerSubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 },
  sceneContainer: { flex: 1, position: "relative" },
  doorPrompt: { position: "absolute", bottom: BOTTOM_NAV_CLEARANCE + 12, alignSelf: "center", backgroundColor: "rgba(15,23,42,0.85)", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  doorPromptIcon: { fontSize: 22, marginBottom: 4 },
  doorPromptTitle: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  doorPromptSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },
  emptyNotice: { position: "absolute", top: 30, alignSelf: "center", backgroundColor: "rgba(15,23,42,0.85)", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, alignItems: "center", gap: 8 },
  emptyTitle: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  scanBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  scanBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 12 },
  inspectCard: { position: "absolute", bottom: BOTTOM_NAV_CLEARANCE, left: 16, right: 16, backgroundColor: "rgba(15,23,42,0.92)", borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(59,130,246,0.4)" },
  inspectInfo: { flex: 1, gap: 2 },
  inspectName: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  inspectMeta: { color: "rgba(255,255,255,0.65)", fontSize: 12, textTransform: "capitalize" },
  inspectActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  editBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  dismissBtn: { padding: 6, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)" },
  dismissBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  tabBar: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, gap: 8, backgroundColor: "#111218", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)" },
  tabActive: { backgroundColor: "#2563eb" },
  tabIcon: { fontSize: 14 },
  tabText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#ffffff", fontWeight: "700" },
});

