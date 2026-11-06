/**
 * Hook managing closet state, section switching, and item selection.
 */

import { useMemo, useState } from "react";
import {
  type ClosetSectionKey,
  CLOSET_SECTIONS,
  groupItemsIntoSections,
} from "@/features/closet/logic/sections";
import { useWardrobe } from "@/features/wardrobe/hooks/useWardrobe";
import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";

export function useClosetSections() {
  const {
    items,
    isLoading,
    error,
    refreshWardrobe,
    editItem,
    removeItem,
  } = useWardrobe();

  const [activeSection, setActiveSection] = useState<ClosetSectionKey>("tops");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [doorsOpen, setDoorsOpen] = useState<boolean>(false);

  const sections = useMemo(() => groupItemsIntoSections(items), [items]);
  const activeItems = sections[activeSection];

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find((i) => i.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const activeSectionMeta = useMemo(() => {
    return CLOSET_SECTIONS.find((s) => s.key === activeSection) ?? CLOSET_SECTIONS[0];
  }, [activeSection]);

  const toggleDoors = () => {
    setDoorsOpen((prev) => !prev);
  };

  const selectItem = (id: string | null) => {
    setSelectedItemId(id);
  };

  return {
    items,
    sections,
    activeSection,
    activeSectionMeta,
    activeItems,
    selectedItem,
    selectedItemId,
    doorsOpen,
    isLoading,
    error,
    setActiveSection,
    setSelectedItemId: selectItem,
    setDoorsOpen,
    toggleDoors,
    refreshWardrobe,
    editItem,
    removeItem,
  };
}

