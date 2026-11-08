/**
 * Offline storage cache for Digital Wardrobe items.
 * Uses AsyncStorage to guarantee seamless local functionality even when
 * offline or when network/ISP blocks Supabase.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  WardrobeItemSchema,
  type UpdateWardrobeItemInput,
  type WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

const LOCAL_STORAGE_KEY = "@halo_wardrobe_items_cache";

export async function getLocalItems(): Promise<WardrobeItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => WardrobeItemSchema.parse(item))
      : [];
  } catch {
    return [];
  }
}

export async function setLocalItems(items: WardrobeItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore local storage write error
  }
}

export async function upsertLocalItem(item: WardrobeItem): Promise<void> {
  const existing = await getLocalItems();
  const filtered = existing.filter((i) => i.id !== item.id);
  await setLocalItems([item, ...filtered]);
}

export async function updateLocalItem(
  itemId: string,
  updates: UpdateWardrobeItemInput,
): Promise<WardrobeItem> {
  const existing = await getLocalItems();
  const found = existing.find((i) => i.id === itemId);

  if (!found) {
    throw new Error(`Item ${itemId} not found in local wardrobe.`);
  }

  const updatedItem: WardrobeItem = {
    ...found,
    name: updates.name ?? found.name,
    category: updates.category ?? found.category,
    attributes: updates.attributes ?? found.attributes,
    colors: updates.colors ?? found.colors,
    updated_at: new Date().toISOString(),
  };

  await setLocalItems(
    existing.map((item) => (item.id === itemId ? updatedItem : item)),
  );
  return updatedItem;
}

export async function deleteLocalItem(itemId: string): Promise<void> {
  const existing = await getLocalItems();
  await setLocalItems(existing.filter((i) => i.id !== itemId));
}
