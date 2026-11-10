# Database, RLS & Storage

> Status: **`profiles` (0001, 0003, 0004) and `wardrobe_items` (0002, 0004) are implemented**;
> all other tables below are design. Never edit schema only via the dashboard.

## Implemented: `profiles` (migration 0001, 0003, 0004)
- Columns: `id` (PK, FK → `auth.users` on delete cascade), `display_name`, `gender` (text, `check (gender in ('female', 'male'))`), `role` (text, `check (role in ('user', 'admin'))`, default `'user'`), `settings`
  jsonb, `created_at`, `updated_at` (trigger-maintained).
- RLS enabled. Policies:
  - `profiles_select_admin`: authenticated users select their own row OR admins (`is_admin()`) select all profiles.
  - `profiles_update_admin`: users update their own row (cannot escalate role), admins update any row/role.
- Helper function `public.is_admin()` checks if `auth.uid()` has `role = 'admin'` with `security definer`.
- Trigger `on_auth_user_created` (SECURITY DEFINER, pinned search_path) inserts the row
  on signup, taking `display_name` and `gender` from signUp metadata.
- **Apply 0001:** paste `supabase/migrations/0001_profiles.sql` into Supabase Dashboard → SQL Editor → Run (idempotent).
- **Apply 0003:** paste `supabase/migrations/0003_profile_gender.sql` into Supabase Dashboard → SQL Editor → Run.
- **Apply 0004:** paste `supabase/migrations/0004_admin_role.sql` into Supabase Dashboard → SQL Editor → Run.
- **Promote first admin:** `update public.profiles set role = 'admin' where id = '<your-user-id>';`
- **Users created before the migration** have no profile row; backfill with:
  `insert into public.profiles (id) select id from auth.users on conflict do nothing;`

## Implemented: `wardrobe_items` (migration 0002, 0004)
- Columns: `id` (uuid PK default `gen_random_uuid()`), `user_id` (uuid FK → `auth.users` on delete cascade),
  `name` (text default 'Garment'), `category` (text), `confidence` (float), `crop_base64` (text data URI),
  `colors` (jsonb), `attributes` (jsonb), `created_at` (timestamptz), `updated_at` (timestamptz).
- Index: `idx_wardrobe_items_user_created` on `(user_id, created_at desc)`.
- RLS enabled. Policies:
  - Users select, insert, update, and delete their own rows (`user_id = auth.uid()`).
  - Admins (`is_admin()`) may **select** and **delete** all wardrobe items across all users for moderation.
- Trigger: `wardrobe_items_set_updated_at` maintains `updated_at`.
- Honesty / provenance (`AGENTS.md` §3): `attributes` JSONB stores `{ fabric, pattern, subtype, ai_original? }` where `ai_original` preserves the immutable model-predicted `{ category, subtype, fabric, pattern }` separately from user-corrected values edited via the Digital Wardrobe modal.
- **Apply:** paste `supabase/migrations/0002_wardrobe.sql` into Supabase Dashboard → SQL Editor → Run.

## Planned design

## Tables (planned)
| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id uuid PK → auth.users`, `display_name`, `settings jsonb`, timestamps | auto-created by trigger on signup |
| `body_scans` | `id`, `user_id`, `avatar_id?`, `front_path`, `back_path`, `face_path`, `validation_status`, `validation_report jsonb`, `processing_status`, `error`, `created_at` | paths, never public URLs |
| `avatars` | `id`, `user_id`, `status`, `base_model_id`, `generated_params jsonb`, `appearance_params jsonb`, `body_params jsonb`, `error`, timestamps | `generated_*` immutable → enables "reset" |
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
Private buckets: `scan-images`, `wardrobe-images`, `garment-assets`.
Path convention `{user_id}/…`; policy: `(storage.foldername(name))[1] = auth.uid()::text`.
Access via short-lived signed URLs (≤ 5 min). Size/MIME limits set on bucket and
re-checked in FastAPI.

## Verification (to be written in Phase 1+)
`supabase/tests/rls_isolation.sql` or pytest using two real test users: user B must get
0 rows / 403 for every table and bucket of user A.
