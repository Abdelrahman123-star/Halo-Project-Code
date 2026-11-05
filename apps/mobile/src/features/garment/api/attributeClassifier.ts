/**
 * On-device Garment Attribute Classifier.
 * Computes fabric, pattern, and subtype rankings from DeepFashion2 detection
 * class, aspect ratio, and extracted pixel color distribution.
 * (Honesty note: On-device heuristic fallback when Fashion-CLIP PyTorch weights
 * are not running locally; documented in docs/AI_MODELS.md).
 */

import type {
  AttributeCandidate,
  AttributeGroup,
  ColorResult,
  GarmentAttributes,
} from "@/features/garment/types/garment";

export const SUBTYPE_TAXONOMY: Record<string, string[]> = {
  outwear: [
    "bomber jacket",
    "trench coat",
    "denim jacket",
    "puffer jacket",
    "leather jacket",
    "tailored blazer",
    "cardigan",
    "windbreaker",
  ],
  shorts: [
    "casual cotton shorts",
    "chino shorts",
    "denim shorts",
    "linen shorts",
    "athletic running shorts",
    "tailored high-waist shorts",
  ],
  trousers: [
    "straight-leg denim jeans",
    "skinny jeans",
    "cargo pants",
    "tailored trousers chinos",
    "sweatpants joggers",
    "wide-leg trousers",
  ],
  shirt: [
    "crewneck t-shirt",
    "ribbed short-sleeve top",
    "button-up shirt blouse",
    "polo shirt",
    "knit sweater",
    "tank top",
    "hoodie sweatshirt",
  ],
  dress: [
    "casual summer sundress",
    "slip dress",
    "cocktail dress",
    "maxi dress",
  ],
  default: [
    "casual top",
    "jacket",
    "trousers",
    "shorts",
    "sweater",
    "dress",
  ],
};

export function pickSubtypeKey(broadCategory: string): string {
  const bl = broadCategory.toLowerCase();
  if (bl.includes("dress")) return "dress";
  if (
    bl.includes("shirt") ||
    bl.includes("top") ||
    bl.includes("vest") ||
    bl.includes("sling")
  ) {
    return "shirt";
  }
  if (bl.includes("shorts")) return "shorts";
  if (bl.includes("outwear") || bl.includes("jacket") || bl.includes("coat")) {
    return "outwear";
  }
  if (
    bl.includes("trouser") ||
    bl.includes("pant") ||
    bl.includes("jean") ||
    bl.includes("skirt")
  ) {
    return "trousers";
  }
  return "default";
}

function buildAttributeGroup(
  candidates: AttributeCandidate[],
  topCount: number,
): AttributeGroup {
  const sliced = candidates.slice(0, topCount);
  return {
    predicted: sliced[0]?.label ?? null,
    confidence: sliced[0]?.confidence ?? null,
    top_candidates: sliced,
  };
}

export function classifyGarmentAttributes(
  broadCategory: string,
  colors: ColorResult[],
  detConfidencePct: number = 85.0,
): GarmentAttributes {
  const bl = broadCategory.toLowerCase();
  const subtypeKey = pickSubtypeKey(broadCategory);
  const topColor = colors[0];
  const secondColor = colors[1];
  const topPct = topColor?.percentage ?? 100;
  const topColorName = (topColor?.color_name ?? "").toLowerCase();

  // 1. Pattern inference from K-Means color distribution
  let patternCandidates: AttributeCandidate[];
  if (topPct >= 62) {
    const solidConf = Math.min(96, Math.round((topPct * 0.95 + 15) * 10) / 10);
    const secondConf = Math.max(2, Number((100 - solidConf).toFixed(1)));
    patternCandidates = [
      { label: "solid plain", confidence: solidConf },
      { label: "graphic logo print", confidence: secondConf },
    ];
  } else if (secondColor && topPct + secondColor.percentage >= 82) {
    patternCandidates = [
      { label: "striped pattern", confidence: 54.5 },
      { label: "solid plain", confidence: 31.0 },
    ];
  } else {
    patternCandidates = [
      { label: "plaid tartan", confidence: 46.0 },
      { label: "floral print", confidence: 32.5 },
    ];
  }

  // 2. Fabric inference from category & color profile
  const isDenimTone = topColorName.includes("denim") || topColorName.includes("navy");
  const isLeatherTone =
    (topColorName === "black" || topColorName === "brown") &&
    subtypeKey === "outwear";

  let fabricCandidates: AttributeCandidate[];
  if (subtypeKey === "trousers" && isDenimTone) {
    fabricCandidates = [
      { label: "denim", confidence: 84.5 },
      { label: "cotton jersey", confidence: 9.5 },
      { label: "corduroy", confidence: 6.0 },
    ];
  } else if (subtypeKey === "shorts" && isDenimTone) {
    fabricCandidates = [
      { label: "denim", confidence: 78.0 },
      { label: "cotton jersey", confidence: 14.0 },
      { label: "linen weave", confidence: 8.0 },
    ];
  } else if (isLeatherTone) {
    fabricCandidates = [
      { label: "genuine leather", confidence: 64.0 },
      { label: "nylon synthetic", confidence: 22.0 },
      { label: "denim", confidence: 14.0 },
    ];
  } else if (subtypeKey === "outwear") {
    fabricCandidates = [
      { label: "nylon synthetic", confidence: 52.0 },
      { label: "cotton jersey", confidence: 28.0 },
      { label: "fleece", confidence: 20.0 },
    ];
  } else if (subtypeKey === "dress") {
    fabricCandidates = [
      { label: "silk satin", confidence: 48.5 },
      { label: "cotton jersey", confidence: 31.5 },
      { label: "linen weave", confidence: 20.0 },
    ];
  } else {
    fabricCandidates = [
      { label: "cotton jersey", confidence: 76.5 },
      { label: "linen weave", confidence: 13.5 },
      { label: "knitted wool", confidence: 10.0 },
    ];
  }

  // 3. Subtype inference from DeepFashion2 class + color
  const taxonomyList =
    SUBTYPE_TAXONOMY[subtypeKey] ?? SUBTYPE_TAXONOMY.default;
  let primarySubtype = taxonomyList[0];

  if (bl.includes("short_sleeved_shirt")) {
    primarySubtype = "crewneck t-shirt";
  } else if (bl.includes("long_sleeved_shirt")) {
    primarySubtype = "button-up shirt blouse";
  } else if (bl.includes("vest") || bl.includes("sling")) {
    primarySubtype = "tank top";
  } else if (subtypeKey === "trousers" && isDenimTone) {
    primarySubtype = "straight-leg denim jeans";
  } else if (subtypeKey === "trousers") {
    primarySubtype = "tailored trousers chinos";
  } else if (subtypeKey === "shorts" && isDenimTone) {
    primarySubtype = "denim shorts";
  } else if (subtypeKey === "outwear" && isDenimTone) {
    primarySubtype = "denim jacket";
  }

  const orderedSubtypes = [
    primarySubtype,
    ...taxonomyList.filter((item) => item !== primarySubtype),
  ];
  const baseSubConf = Math.min(92, Math.max(58, Number((detConfidencePct * 0.88).toFixed(1))));
  const rem1 = Number(((100 - baseSubConf) * 0.6).toFixed(1));
  const rem2 = Number((100 - baseSubConf - rem1).toFixed(1));

  const subtypeCandidates: AttributeCandidate[] = [
    { label: orderedSubtypes[0], confidence: baseSubConf },
    { label: orderedSubtypes[1] ?? orderedSubtypes[0], confidence: rem1 },
    { label: orderedSubtypes[2] ?? orderedSubtypes[0], confidence: rem2 },
  ];

  return {
    fabric: buildAttributeGroup(fabricCandidates, 3),
    pattern: buildAttributeGroup(patternCandidates, 2),
    subtype: buildAttributeGroup(subtypeCandidates, 3),
  };
}

