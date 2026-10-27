# ADR-0005: Data model — separate AI output from user corrections

- **Status:** Proposed
- **Decision:** `wardrobe_items.ai_output` (JSONB, written only by the backend) and
  `user_corrections` (JSONB, written by the user via RLS). Effective value =
  correction if present, else AI output. Same for avatars: `generated_params` immutable,
  `appearance_params`/`body_params` editable, enabling "reset to generated".
- **Why:** satisfies the "never overwrite model output / allow corrections" rule, keeps
  evaluation data for the thesis, and avoids extra tables (KISS).
- **Trade-off:** JSONB is less strictly typed → validate with zod (mobile) and Pydantic
  (backend) at the boundaries. Outfit garments are normalized in `outfit_items`.
