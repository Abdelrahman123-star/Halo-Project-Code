# Database, RLS & Storage

> Status: **`profiles` (0001) and `wardrobe_items` (0002) are implemented**; `avatars` + `body_scans`
> (0003) are written but **must be applied manually** (see below); all other tables below are design. Never edit schema only via the dashboard.

## Implemented: `profiles` (migration 0001)
- Columns: `id` (PK, FK → `auth.users` on delete cascade), `display_name`, `settings`
  jsonb, `created_at`, `updated_at` (trigger-maintained).
- RLS enabled. Policies: authenticated users may **select** and **update** only their
  own row (`id = auth.uid()`). No client insert/delete policy.
- Trigger `on_auth_user_created` (SECURITY DEFINER, pinned search_path) inserts the row
  on signup, taking `display_name` from signUp metadata.
- **Apply:** paste the file into Supabase Dashboard → SQL Editor → Run (idempotent).
- **Users created before the migration** have no profile row; backfill with:
  `insert into public.profiles (id) select id from auth.users on conflict do nothing;`

## Implemented: `wardrobe_items` (migration 0002)
- Columns: `id` (uuid PK default `gen_random_uuid()`), `user_id` (uuid FK → `auth.users` on delete cascade),
  `name` (text default 'Garment'), `category` (text), `confidence` (float), `crop_base64` (text data URI),
  `colors` (jsonb), `attributes` (jsonb), `created_at` (timestamptz), `updated_at` (timestamptz).
- Index: `idx_wardrobe_items_user_created` on `(user_id, created_at desc)`.
- RLS enabled. Policies: authenticated users may **select**, **insert**, **update**, and **delete** only their
  own rows (`user_id = auth.uid()`).
- Trigger: `wardrobe_items_set_updated_at` maintains `updated_at`.
- **Apply:** paste `supabase/migrations/0002_wardrobe.sql` into Supabase Dashboard → SQL Editor → Run.

## Written, apply manually: `avatars` + `body_scans` (migration 0003)
File: `supabase/migrations/0003_avatars.sql` (idempotent; needs `public.set_updated_at()` from 0001).
- `avatars`: `id`, `user_id` (FK → `auth.users`, cascade), `status` (`queued|processing|ready|failed`),
  `base_model_id` (null until 3D), `generated_params` jsonb (the unified avatar profile — model output),
  `appearance_params` / `body_params` jsonb (user edits, empty for now), `error`, timestamps.
  Index `(user_id, created_at desc)`; trigger keeps `updated_at`.
- `body_scans`: `id`, `user_id`, `avatar_id` (FK → avatars, on delete set null), `validation_status`
  (`passed|failed`), `validation_report` jsonb, `processing_status`, `processing_ms`, `pipeline_version`,
  `error`, `created_at`. **No image path columns: photos are never stored** (ADR-0006).
  Index `(user_id, created_at desc)`.
- RLS on both. Clients: **select** and **delete** own rows; **no insert**; on `avatars` only
  `appearance_params` / `body_params` are updatable (column grant), so model output stays immutable
  (ADR-0005). Rows are written by FastAPI with the service role (bypasses RLS).
- Each successful scan inserts a new avatar row; the newest is the current one. Deleting the avatar in
  the app deletes the user's `body_scans` and `avatars` rows.
- **Apply:** Supabase Dashboard → SQL Editor → New query → paste the file → Run.
- **Verify (SQL Editor):**
  ```sql
  select tablename, rowsecurity from pg_tables where tablename in ('avatars', 'body_scans');
  select tablename, policyname, cmd from pg_policies where tablename in ('avatars', 'body_scans');
  ```
  Expect `rowsecurity = true` for both; select/update/delete policies on avatars, select/delete on body_scans.

## Planned design

## Tables (planned)
| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id uuid PK → auth.users`, `display_name`, `settings jsonb`, timestamps | auto-created by trigger on signup |
| `body_scans` | see migration 0003 above | implemented without image paths (photos not retained) |
| `avatars` | see migration 0003 above | `generated_params` immutable for clients → enables "reset" |
| `wardrobe_items` | `id`, `user_id`, `name`, `category`, `original_path`, `segmented_path?`, `ai_output jsonb`, `user_corrections jsonb`, `garment_asset jsonb?`, `processing_status`, `error`, timestamps | model output kept separate from corrections |
| `outfits` | `id`, `user_id`, `avatar_id`, `name`, `preview_path?`, timestamps | |
| `outfit_items` | `outfit_id`, `wardrobe_item_id`, `slot` | PK `(outfit_id, slot)`; normalizes the garment list |
| `garment_categories` | `slug PK`, `label`, `template_id?`, `sort_order` | extendable without code change |

Constraints: FKs `ON DELETE CASCADE` from `auth.users`; CHECK on status enums
(`queued|processing|ready|failed`); indexes on `(user_id, created_at desc)`,
`(user_id, category)`.

## RLS policy pattern
Every user table: `ENABLE ROW LEVEL SECURITY`; policies for select/insert/update/delete
`USING (user_id = auth.uid())` and `WITH CHECK (user_id = auth.uid())`.
`outfit_items` checks ownership via parent outfit. `garment_categories` is read-only for
authenticated users. Server-side updates of `ai_output` / `status` use the service role.

## Storage
Private buckets (planned): `wardrobe-images`, `garment-assets`. (`scan-images` dropped: scan photos are not retained, ADR-0006.)
Path convention `{user_id}/…`; policy: `(storage.foldername(name))[1] = auth.uid()::text`.
Access via short-lived signed URLs (≤ 5 min). Size/MIME limits set on bucket and
re-checked in FastAPI.

## Verification (to be written in Phase 1+)
`supabase/tests/rls_isolation.sql` or pytest using two real test users: user B must get
0 rows / 403 for every table and bucket of user A.
