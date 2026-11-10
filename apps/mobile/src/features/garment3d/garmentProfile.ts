/**
 * Maps a wardrobe category to the 3D thickness profile used by the on-device
 * garment mesh builder.
 */

import type { GarmentShapeProfile } from "@/three/garment/garmentMesh";
import { getCategoryGroup } from "@/features/wardrobe/types/wardrobe";

const PROFILE_BY_GROUP: Record<ReturnType<typeof getCategoryGroup>, GarmentShapeProfile> = {
  tops: "top",
  bottoms: "bottom",
  outerwear: "outerwear",
  dresses: "dress",
};

export function getGarmentShapeProfile(category: string): GarmentShapeProfile {
  return PROFILE_BY_GROUP[getCategoryGroup(category)];
}
