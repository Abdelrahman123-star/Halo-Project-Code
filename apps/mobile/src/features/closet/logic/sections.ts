/**
 * Closet section grouping and category mapping logic.
 */

import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";

export type ClosetSectionKey = "tops" | "bottoms" | "outerwear_dresses";

export interface ClosetSectionMeta {
  key: ClosetSectionKey;
  title: string;
  subtitle: string;
  icon: string;
}

export const CLOSET_SECTIONS: ClosetSectionMeta[] = [
  {
    key: "tops",
    title: "Tops & Shirts",
    subtitle: "T-shirts, button-ups, knitwear",
    icon: "👕",
  },
  {
    key: "bottoms",
    title: "Pants & Skirts",
    subtitle: "Jeans, trousers, shorts, skirts",
    icon: "👖",
  },
  {
    key: "outerwear_dresses",
    title: "Outerwear & Dresses",
    subtitle: "Jackets, coats, vests, dresses",
    icon: "🧥",
  },
];

/**
 * Maps a wardrobe category string to one of the 3 closet sections.
 */
export function getSectionForCategory(category: string): ClosetSectionKey {
  const norm = category.toLowerCase().trim();

  if (
    norm.includes("short_sleeved_shirt") ||
    norm.includes("long_sleeved_shirt") ||
    norm.includes("shirt") ||
    norm.includes("tee") ||
    norm.includes("top") ||
    norm.includes("sweater") ||
    norm.includes("hoodie")
  ) {
    return "tops";
  }

  if (
    norm.includes("trouser") ||
    norm.includes("pants") ||
    norm.includes("jean") ||
    norm.includes("short") ||
    norm.includes("skirt")
  ) {
    return "bottoms";
  }

  // Jackets, coats, vests, dresses, or fallback
  return "outerwear_dresses";
}

export interface GroupedClosetSections {
  tops: WardrobeItem[];
  bottoms: WardrobeItem[];
  outerwear_dresses: WardrobeItem[];
}

/**
 * Groups wardrobe items into section arrays.
 */
export function groupItemsIntoSections(items: WardrobeItem[]): GroupedClosetSections {
  const grouped: GroupedClosetSections = {
    tops: [],
    bottoms: [],
    outerwear_dresses: [],
  };

  for (const item of items) {
    const sec = getSectionForCategory(item.category);
    grouped[sec].push(item);
  }

  return grouped;
}

