/**
 * Hook for managing the user's personal Digital Wardrobe state.
 * Orchestrates fetching, saving, and deleting wardrobe items with terminal logging.
 */

import { useCallback, useEffect, useState } from "react";
import type { DetectedGarment } from "@/features/garment/types/garment";
import {
  deleteWardrobeItem,
  fetchWardrobeItems,
  insertWardrobeItem,
  updateWardrobeItem,
} from "@/features/wardrobe/api/wardrobeApi";
import type {
  UpdateWardrobeItemInput,
  WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savingItemNumber, setSavingItemNumber] = useState<number | null>(null);
  const [savedItemNumbers, setSavedItemNumbers] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadWardrobe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWardrobeItems();
      setItems(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load wardrobe.";
      console.error("[HALO Wardrobe] ❌ loadWardrobe error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWardrobe();
  }, [loadWardrobe]);

  const saveGarment = useCallback(
    async (garment: DetectedGarment): Promise<WardrobeItem | null> => {
      setSavingItemNumber(garment.item_number);
      setError(null);
      console.log(`[HALO Wardrobe] ⏳ Processing save for garment #${garment.item_number}...`);

      try {
        const subtype = garment.attributes.subtype.predicted;
        const itemName = subtype || garment.category.replace(/_/g, " ");

        const saved = await insertWardrobeItem({
          name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
          category: garment.category,
          confidence: garment.confidence,
          crop_base64: garment.crop_base64,
          colors: garment.colors,
          attributes: garment.attributes,
        });

        setItems((prev) => [saved, ...prev]);
        setSavedItemNumbers((prev) => new Set([...prev, garment.item_number]));
        return saved;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to save garment.";
        console.error(`[HALO Wardrobe] ❌ Failed to save garment #${garment.item_number}:`, message);
        setError(message);
        return null;
      } finally {
        setSavingItemNumber(null);
      }
    },
    [],
  );

  const saveAllGarments = useCallback(
    async (garments: DetectedGarment[]): Promise<void> => {
      console.log(`[HALO Wardrobe] ⚡ Auto-saving ${garments.length} detected garment(s)...`);
      for (const garment of garments) {
        await saveGarment(garment);
      }
    },
    [saveGarment],
  );

  const editItem = useCallback(
    async (
      itemId: string,
      updates: UpdateWardrobeItemInput,
    ): Promise<WardrobeItem | null> => {
      setError(null);
      try {
        const updated = await updateWardrobeItem(itemId, updates);
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? updated : item)),
        );
        return updated;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update wardrobe item.";
        console.error(`[HALO Wardrobe] ❌ Failed to update item ${itemId}:`, message);
        setError(message);
        return null;
      }
    },
    [],
  );

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    setError(null);
    try {
      await deleteWardrobeItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete garment.";
      console.error(`[HALO Wardrobe] ❌ Failed to remove item ${itemId}:`, message);
      setError(message);
      return false;
    }
  }, []);

  return {
    items,
    isLoading,
    savingItemNumber,
    savedItemNumbers,
    error,
    refreshWardrobe: loadWardrobe,
    saveGarment,
    saveAllGarments,
    editItem,
    removeItem,
  };
}
