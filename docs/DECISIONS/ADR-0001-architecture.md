# ADR-0001: Overall architecture — Supabase-first, FastAPI only for AI/server work

- **Status:** Proposed (accept after Phase 1)
- **Context:** Small student team, free-tier preference, mobile only, sensitive images.
- **Options:** (a) Everything in FastAPI + own Postgres/auth; (b) Supabase-first + thin
  FastAPI; (c) Supabase Edge Functions only.
- **Decision:** (b). Supabase provides auth, DB, storage and RLS; FastAPI handles model
  inference and server-side validation, verifying Supabase JWTs.
- **Why:** less code to write/secure; RLS enforces ownership at the data layer; Python
  is required for CV models (Edge Functions can't run them).
- **Trade-offs:** two systems to configure; backend must use the service role carefully
  (always filter by the verified `user_id`).
- **Consequences:** simple CRUD never gets a custom endpoint (see ARCHITECTURE.md).
