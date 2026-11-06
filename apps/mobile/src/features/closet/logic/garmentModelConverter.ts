/**
 * Converts user's 2D wardrobe items into 3D rack garment models and textures.
 * Formats front, side, and side-left views so items hang naturally on the 3D rail.
 */

import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";

export interface Rack3DGarment {
  id: string;
  name: string;
  price: string;
  texture: string;
  side: string;
  sideLeft: string;
  kind?: "pants" | "shirt";
  attributes?: Record<string, unknown>;
}

export interface Garment3DTemplateMesh {
  id: string;
  name: string;
  category: string;
  meshType: "top_tshirt" | "top_longsleeve" | "bottom_pants" | "outerwear_jacket" | "dress";
  baseColor: string;
  textureUri: string | null;
}

/**
 * Determines whether a wardrobe category belongs to lower body (pants/shorts/skirt).
 */
export function isLowerBodyCategory(category: string): boolean {
  const norm = category.toLowerCase().trim();
  if (
    norm.includes("shirt") ||
    norm.includes("top") ||
    norm.includes("tee") ||
    norm.includes("hoodie") ||
    norm.includes("sweater")
  ) {
    return false;
  }
  return (
    norm.includes("trouser") ||
    norm.includes("pants") ||
    norm.includes("jean") ||
    norm.includes("shorts") ||
    norm.includes("skirt")
  );
}

/**
 * Maps a category string to a template 3D mesh type (per THREED_PIPELINE.md).
 */
export function mapCategoryToTemplateMesh(category: string): Garment3DTemplateMesh["meshType"] {
  const norm = category.toLowerCase().trim();
  if (isLowerBodyCategory(norm)) return "bottom_pants";
  if (norm.includes("jacket") || norm.includes("outwear") || norm.includes("coat")) return "outerwear_jacket";
  if (norm.includes("dress")) return "dress";
  if (norm.includes("long")) return "top_longsleeve";
  return "top_tshirt";
}

/**
 * Converts a saved Digital Wardrobe item into a 3D Rack Garment model.
 * Maps the isolated crop to front and side hanging profiles.
 */
export function convertWardrobeItemToRack3D(item: WardrobeItem): Rack3DGarment {
  const isPants = isLowerBodyCategory(item.category);
  const fallbackTexture = isPants
    ? "/shirts/brown-pleated-trousers.webp"
    : "/shirts/race-knit-polo.webp";

  const texture = item.crop_base64 || fallbackTexture;
  const displayName = item.name || "Custom Garment";
  const categoryLabel = item.category.replace(/_/g, " ");

  return {
    id: item.id,
    name: displayName,
    price: categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1),
    texture,
    side: texture,
    sideLeft: texture,
    kind: isPants ? "pants" : "shirt",
    attributes: item.attributes,
  };
}

/**
 * Builds a template-based 3D mesh definition ready for 3D avatar & rail rendering.
 */
export function buildGarment3DTemplate(item: WardrobeItem): Garment3DTemplateMesh {
  const dominantColor = item.colors?.[0]?.hex || "#ffffff";
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    meshType: mapCategoryToTemplateMesh(item.category),
    baseColor: dominantColor,
    textureUri: item.crop_base64 || null,
  };
}
