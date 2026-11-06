/**
 * Card displaying an individual saved wardrobe item.
 * Features cropped garment preview, category, confidence badge, colors,
 * fabric/pattern attributes, edit modal trigger, and delete action.
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EditWardrobeModal } from "@/features/wardrobe/components/EditWardrobeModal";
import type {
  UpdateWardrobeItemInput,
  WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (id: string, updates: UpdateWardrobeItemInput) => Promise<unknown>;
}

export function WardrobeItemCard({
  item,
  onDelete,
  onEdit,
}: WardrobeItemCardProps): React.JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
  };

  const confidencePct = item.confidence
    ? Math.round(item.confidence * 100)
    : null;

  const fabric = item.attributes?.fabric?.predicted;
  const pattern = item.attributes?.pattern?.predicted;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.crop_base64 ? (
          <Image
            source={{ uri: item.crop_base64 }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>🧥</Text>
          </View>
        )}

        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {confidencePct !== null ? (
              <View style={styles.confBadge}>
                <Text style={styles.confText}>{confidencePct}%</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.category}>
            {item.category.replace(/_/g, " ")} · {formattedDate}
          </Text>

          {item.colors && item.colors.length > 0 ? (
            <View style={styles.swatchRow}>
              {item.colors.slice(0, 3).map((c, i) => (
                <View
                  key={i}
                  style={[styles.colorDot, { backgroundColor: c.hex }]}
                />
              ))}
              <Text style={styles.colorName} numberOfLines={1}>
                {item.colors[0]?.color_name}
              </Text>
            </View>
          ) : null}

          {fabric || pattern ? (
            <Text style={styles.meta} numberOfLines={1}>
              {[fabric, pattern].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          {onEdit && (
            <Pressable
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
              accessibilityLabel="Edit item"
            >
              <Text style={styles.editBtnText}>✏️</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityLabel="Delete item"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={styles.deleteBtnText}>✕</Text>
            )}
          </Pressable>
        </View>
      </View>

      <EditWardrobeModal
        visible={isEditing}
        item={item}
        onClose={() => setIsEditing(false)}
        onSave={async (id, updates) => {
          if (onEdit) await onEdit(id, updates);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 26,
  },
  details: {
    flex: 1,
    gap: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  confBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  category: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "capitalize",
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  colorDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  colorName: {
    fontSize: 11,
    color: "#475569",
  },
  meta: {
    fontSize: 11,
    color: "#94a3b8",
  },
  actions: {
    flexDirection: "column",
    gap: 6,
    alignItems: "center",
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    fontSize: 13,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
