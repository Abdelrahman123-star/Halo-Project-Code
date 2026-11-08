/**
 * Pairs each garment detected in the FRONT photo with the same garment in the
 * optional BACK photo. Preference: same category, then same category group
 * (tops / bottoms / outerwear / dresses); ties go to the highest confidence.
 * Each back detection is used at most once; unmatched fronts get no back photo.
 */

import type { DetectedGarment } from "@/features/garment/types/garment";
import { getCategoryGroup } from "@/features/wardrobe/types/wardrobe";

function matchScore(front: DetectedGarment, back: DetectedGarment): number {
  if (!back.crop_base64) return -1;
  if (back.category === front.category) return 2 + back.confidence;
  if (getCategoryGroup(back.category) === getCategoryGroup(front.category)) return 1 + back.confidence;
  return -1;
}

export function pairBackCrops(front: DetectedGarment[], back: DetectedGarment[]): DetectedGarment[] {
  const used = new Set<number>();
  return front.map((garment) => {
    let bestIndex = -1;
    let bestScore = -1;
    back.forEach((candidate, index) => {
      if (used.has(index)) return;
      const score = matchScore(garment, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    if (bestIndex < 0) return { ...garment, back_crop_base64: null };
    used.add(bestIndex);
    return { ...garment, back_crop_base64: back[bestIndex].crop_base64 };
  });
}
