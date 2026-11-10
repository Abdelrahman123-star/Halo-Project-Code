/**
 * Hook for managing the user's personal Digital Wardrobe state.
 * Orchestrates fetching, auto-saving analyzed garments, manual additions,
 * editing metadata, and deleting items. 3D models are built on-device at view time.
 */

import { useCallback, useEffect, useState } from "react";
import type { DetectedGarment } from "@/features/garment/types/garment";
import {
  deleteWardrobeItem,
  fetchWardrobeItems,
  insertWardrobeItem,
  updateWardrobeItem,
} from "@/features/wardrobe/api/wardrobeApi";
import {
  getCategoryLabel,
  type UpdateWardrobeItemInput,
  type WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);
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

      try {
        const subtype = garment.attributes.subtype.predicted;
        const itemName = subtype || getCategoryLabel(garment.category);

        const saved = await insertWardrobeItem({
          name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
          category: garment.category,
          confidence: garment.confidence,
          crop_base64: garment.crop_base64,
          back_crop_base64: garment.back_crop_base64 ?? null,
          colors: garment.colors,
          attributes: garment.attributes,
        });
        setItems((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
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
    async (garments: DetectedGarment[]): Promise<WardrobeItem[]> => {
      if (garments.length === 0) return [];
      setIsSavingBatch(true);
      const savedBatch: WardrobeItem[] = [];
      try {
        for (const garment of garments) {
          const saved = await saveGarment(garment);
          if (saved) savedBatch.push(saved);
        }
        return savedBatch;
      } finally {
        setIsSavingBatch(false);
      }
    },
    [saveGarment],
  );

  const saveManualPhoto = useCallback(
    async (
      cropBase64: string,
      category: string = "short_sleeved_shirt",
      name: string = "New Wardrobe Piece",
    ): Promise<WardrobeItem | null> => {
      setIsSavingBatch(true);
      setError(null);
      try {
        const saved = await insertWardrobeItem({
          name,
          category,
          confidence: null,
          crop_base64: cropBase64,
          colors: [],
          attributes: {
            fabric: { predicted: null, confidence: null, top_candidates: [] },
            pattern: { predicted: null, confidence: null, top_candidates: [] },
            subtype: { predicted: null, confidence: null, top_candidates: [] },
          },
        });
        setItems((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
        return saved;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to save garment photo.";
        setError(message);
        return null;
      } finally {
        setIsSavingBatch(false);
      }
    },
    [],
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
    isSavingBatch,
    savingItemNumber,
    savedItemNumbers,
    error,
    refreshWardrobe: loadWardrobe,
    saveGarment,
    saveAllGarments,
    saveManualPhoto,
    editItem,
    removeItem,
  };
}
