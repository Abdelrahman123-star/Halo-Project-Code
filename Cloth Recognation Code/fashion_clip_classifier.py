"""
Local Fashion-CLIP Zero-Shot Attribute Classifier.
Uses Marqo-FashionCLIP or OpenCLIP for offline fabric, pattern, and subtype inference.
"""

import os
import torch
from PIL import Image
from typing import Dict, List, Any, Optional

# Predefined fashion taxonomies
FABRIC_CANDIDATES = [
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

PATTERN_CANDIDATES = [
    "solid plain",
    "plaid tartan",
    "striped pattern",
    "floral print",
    "graphic logo print",
    "camouflage pattern",
    "polka dot",
]

SUBTYPE_TAXONOMY = {
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


class FashionCLIPClassifier:
    """Manages the local CLIP model and zero-shot fashion classification."""

    def __init__(self, model_name: str = "ViT-B-32", pretrained: str = "openai"):
        self.model_name = model_name
        self.pretrained = pretrained
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self._load_model()

    def _load_model(self):
        """Loads model into memory."""
        import warnings
        warnings.filterwarnings("ignore", category=UserWarning)
        import open_clip

        print(f"[*] Loading local CLIP model ({self.model_name}/{self.pretrained}) on {self.device}...")
        try:
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                self.model_name, pretrained=self.pretrained, device=self.device
            )
            self.tokenizer = open_clip.get_tokenizer(self.model_name)
            print("[+] Local Fashion-CLIP model loaded successfully!")
        except Exception as e:
            print(f"[!] Warning: Could not load '{self.model_name}' ({e}). Retrying with default...")
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                "ViT-B-32", pretrained="openai", device=self.device
            )
            self.tokenizer = open_clip.get_tokenizer("ViT-B-32")
            print("[+] Fallback CLIP ViT-B-32 loaded successfully!")

        self.model.eval()

    def _zero_shot_rank(self, image: Image.Image, candidates: List[str], prompt_prefix: str = "a photo of ") -> List[Dict[str, Any]]:
        """Ranks candidate labels for a cropped image using cosine similarity and softmax."""
        prompts = [f"{prompt_prefix}{c}" for c in candidates]
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        text_tokens = self.tokenizer(prompts).to(self.device)

        with torch.no_grad():
            image_features = self.model.encode_image(image_input)
            text_features = self.model.encode_text(text_tokens)

            # Normalize embeddings
            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)

            # Softmax similarity
            logits = (100.0 * image_features @ text_features.T).squeeze(0)
            probs = logits.softmax(dim=-1).cpu().tolist()

        ranked = []
        for label, prob in zip(candidates, probs):
            ranked.append({"label": label, "confidence": round(prob * 100, 1)})
        ranked.sort(key=lambda x: x["confidence"], reverse=True)
        return ranked

    def classify_garment(self, cropped_image: Image.Image, broad_category: Optional[str] = None) -> Dict[str, Any]:
        """Classifies fabric, pattern, and subtype for a cropped clothing image."""
        # 1. Fabric / Material
        fabric_ranking = self._zero_shot_rank(
            cropped_image,
            FABRIC_CANDIDATES,
            prompt_prefix="clothing made of "
        )

        # 2. Pattern
        pattern_ranking = self._zero_shot_rank(
            cropped_image,
            PATTERN_CANDIDATES,
            prompt_prefix="clothing with "
        )

        # 3. Subtype based on category hint
        cat_key = "default"
        if broad_category:
            bl = broad_category.lower()
            if "dress" in bl:
                cat_key = "dress"
            elif "shirt" in bl or "top" in bl or "vest" in bl or "sling" in bl:
                cat_key = "shirt"
            elif "shorts" in bl:
                cat_key = "shorts"
            elif "outwear" in bl or "jacket" in bl or "coat" in bl:
                cat_key = "outwear"
            elif "trouser" in bl or "pants" in bl or "jeans" in bl or "skirt" in bl:
                cat_key = "trousers"

        subtypes = SUBTYPE_TAXONOMY.get(cat_key, SUBTYPE_TAXONOMY["default"])
        subtype_ranking = self._zero_shot_rank(
            cropped_image,
            subtypes,
            prompt_prefix="a fashion photo of "
        )

        return {
            "fabric": {
                "predicted": fabric_ranking[0]["label"],
                "confidence": fabric_ranking[0]["confidence"],
                "top_candidates": fabric_ranking[:3],
            },
            "pattern": {
                "predicted": pattern_ranking[0]["label"],
                "confidence": pattern_ranking[0]["confidence"],
                "top_candidates": pattern_ranking[:2],
            },
            "subtype": {
                "predicted": subtype_ranking[0]["label"],
                "confidence": subtype_ranking[0]["confidence"],
                "top_candidates": subtype_ranking[:3],
            },
        }


# Singleton instance helper
_GLOBAL_CLASSIFIER = None

def get_fashion_clip_classifier(model_name: str = "ViT-B-32", pretrained: str = "openai") -> FashionCLIPClassifier:
    global _GLOBAL_CLASSIFIER
    if _GLOBAL_CLASSIFIER is None:
        _GLOBAL_CLASSIFIER = FashionCLIPClassifier(model_name=model_name, pretrained=pretrained)
    return _GLOBAL_CLASSIFIER
