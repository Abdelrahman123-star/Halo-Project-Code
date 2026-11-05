"""
Fashion-CLIP Zero-Shot Attribute Classifier.
Singleton instance loaded once at startup; all inference is in-memory.
"""

from __future__ import annotations

import warnings
from typing import Any

import torch
from PIL import Image

warnings.filterwarnings("ignore", category=UserWarning)

from app.ai.garment.schemas import AttributeCandidate, AttributeGroup

FABRIC_CANDIDATES: list[str] = [
    "denim",
    "cotton jersey",
    "genuine leather",
    "nylon synthetic",
    "knitted wool",
    "silk satin",
    "linen weave",
    "corduroy",
    "fleece",
    "velvet",
]

PATTERN_CANDIDATES: list[str] = [
    "solid plain",
    "plaid tartan",
    "striped pattern",
    "floral print",
    "graphic logo print",
    "camouflage pattern",
    "polka dot",
]

# Maps broad Roboflow category → fine-grained subtype list
SUBTYPE_TAXONOMY: dict[str, list[str]] = {
    "outwear": [
        "bomber jacket",
        "trench coat",
        "denim jacket",
        "puffer jacket",
        "leather jacket",
        "tailored blazer",
        "cardigan",
        "windbreaker",
    ],
    "shorts": [
        "casual cotton shorts",
        "chino shorts",
        "denim shorts",
        "linen shorts",
        "athletic running shorts",
        "tailored high-waist shorts",
    ],
    "trousers": [
        "straight-leg denim jeans",
        "skinny jeans",
        "cargo pants",
        "tailored trousers chinos",
        "sweatpants joggers",
        "wide-leg trousers",
    ],
    "shirt": [
        "ribbed short-sleeve top",
        "crewneck t-shirt",
        "button-up shirt blouse",
        "polo shirt",
        "knit sweater",
        "tank top",
        "hoodie sweatshirt",
    ],
    "dress": [
        "casual summer sundress",
        "slip dress",
        "cocktail dress",
        "maxi dress",
    ],
    "default": [
        "casual top",
        "jacket",
        "trousers",
        "shorts",
        "sweater",
        "dress",
    ],
}


def _pick_subtype_key(broad_category: str | None) -> str:
    """Maps a Roboflow broad category string to a SUBTYPE_TAXONOMY key."""
    if not broad_category:
        return "default"
    bl = broad_category.lower()
    if "dress" in bl:
        return "dress"
    if "shirt" in bl or "top" in bl or "vest" in bl or "sling" in bl:
        return "shirt"
    if "shorts" in bl:
        return "shorts"
    if "outwear" in bl or "jacket" in bl or "coat" in bl:
        return "outwear"
    if "trouser" in bl or "pant" in bl or "jean" in bl or "skirt" in bl:
        return "trousers"
    return "default"


class FashionCLIPClassifier:
    """Manages the local OpenCLIP model and runs zero-shot fashion classification."""

    def __init__(self, model_name: str = "ViT-B-32", pretrained: str = "openai") -> None:
        self._model_name = model_name
        self._pretrained = pretrained
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        self._model: Any = None
        self._preprocess: Any = None
        self._tokenizer: Any = None
        self._load_model()

    def _load_model(self) -> None:
        import open_clip  # imported lazily to avoid load time at module import

        try:
            self._model, _, self._preprocess = open_clip.create_model_and_transforms(
                self._model_name, pretrained=self._pretrained, device=self._device
            )
            self._tokenizer = open_clip.get_tokenizer(self._model_name)
        except Exception:
            # Fallback to the canonical public checkpoint
            self._model, _, self._preprocess = open_clip.create_model_and_transforms(
                "ViT-B-32", pretrained="openai", device=self._device
            )
            self._tokenizer = open_clip.get_tokenizer("ViT-B-32")

        self._model.eval()

    def _zero_shot_rank(
        self,
        image: Image.Image,
        candidates: list[str],
        prompt_prefix: str = "a photo of ",
    ) -> list[AttributeCandidate]:
        """Ranks candidate labels by cosine similarity softmax against the image embedding."""
        prompts = [f"{prompt_prefix}{c}" for c in candidates]
        image_input = self._preprocess(image).unsqueeze(0).to(self._device)
        text_tokens = self._tokenizer(prompts).to(self._device)

        with torch.no_grad():
            img_feat = self._model.encode_image(image_input)
            txt_feat = self._model.encode_text(text_tokens)
            img_feat /= img_feat.norm(dim=-1, keepdim=True)
            txt_feat /= txt_feat.norm(dim=-1, keepdim=True)
            logits = (100.0 * img_feat @ txt_feat.T).squeeze(0)
            probs = logits.softmax(dim=-1).cpu().tolist()

        ranked = [
            AttributeCandidate(label=label, confidence=round(prob * 100, 1))
            for label, prob in zip(candidates, probs)
        ]
        ranked.sort(key=lambda x: x.confidence, reverse=True)
        return ranked

    def classify_garment(
        self,
        cropped_image: Image.Image,
        broad_category: str | None = None,
    ) -> dict[str, AttributeGroup]:
        """Returns fabric, pattern, and subtype AttributeGroups for a cropped garment."""
        fabric_ranked = self._zero_shot_rank(
            cropped_image, FABRIC_CANDIDATES, prompt_prefix="clothing made of "
        )
        pattern_ranked = self._zero_shot_rank(
            cropped_image, PATTERN_CANDIDATES, prompt_prefix="clothing with "
        )

        subtype_key = _pick_subtype_key(broad_category)
        subtypes = SUBTYPE_TAXONOMY.get(subtype_key, SUBTYPE_TAXONOMY["default"])
        subtype_ranked = self._zero_shot_rank(
            cropped_image, subtypes, prompt_prefix="a fashion photo of "
        )

        return {
            "fabric": AttributeGroup(
                predicted=fabric_ranked[0].label if fabric_ranked else None,
                confidence=fabric_ranked[0].confidence if fabric_ranked else None,
                top_candidates=fabric_ranked[:3],
            ),
            "pattern": AttributeGroup(
                predicted=pattern_ranked[0].label if pattern_ranked else None,
                confidence=pattern_ranked[0].confidence if pattern_ranked else None,
                top_candidates=pattern_ranked[:2],
            ),
            "subtype": AttributeGroup(
                predicted=subtype_ranked[0].label if subtype_ranked else None,
                confidence=subtype_ranked[0].confidence if subtype_ranked else None,
                top_candidates=subtype_ranked[:3],
            ),
        }


# Module-level singleton — loaded once per process lifetime
_CLASSIFIER: FashionCLIPClassifier | None = None


def get_classifier() -> FashionCLIPClassifier:
    """Returns the module-level FashionCLIP singleton, initializing it on first call."""
    global _CLASSIFIER
    if _CLASSIFIER is None:
        _CLASSIFIER = FashionCLIPClassifier()
    return _CLASSIFIER

