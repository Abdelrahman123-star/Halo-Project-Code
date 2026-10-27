# Database, RLS & Storage

> Status: **only `profiles` is implemented** (`supabase/migrations/0001_profiles.sql`);
> all other tables below are design. Never edit schema only via the dashboard.

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
- **Verified:** ⬜ not yet applied/tested against a real project by the agent. RLS
  two-user test still to be written.

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
