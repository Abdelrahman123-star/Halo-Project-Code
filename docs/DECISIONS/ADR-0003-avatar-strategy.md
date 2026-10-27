# ADR-0003: Avatar generation strategy

- **Status:** Proposed
- **Context:** One photo set cannot reliably yield a production 3D human; no budget for
  paid avatar APIs; must be honest about personalization.
- **Options:** (a) Photo-to-3D reconstruction models (heavy GPU, unreliable);
  (b) third-party avatar SDK (licence/availability/privacy risk — verify current status);
  (c) rigged parametric base model + landmark-derived proportions + user-editable look.
- **Decision:** (c).
- **Why:** feasible, demonstrable, deterministic, privacy-preserving, garments can share
  one skeleton.
- **Consequences:** Personalisation limited to body-proportion morphs and suggested
  colours; documented in THREED_PIPELINE.md. Reconstruction is future work.
- **Open risk:** finding a licensed base model with morph targets (Spike C).
