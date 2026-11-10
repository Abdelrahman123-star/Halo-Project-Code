-- 0003_avatars.sql
-- Creates the avatars and body_scans tables for avatar preprocessing (front/back/face photos).
-- Run once in Supabase Dashboard -> SQL Editor (or `supabase db push` with the CLI).
-- Idempotent so it can be re-run safely. Requires 0001 (public.set_updated_at()).
--
-- Privacy: photos are NOT stored. Only the derived profile (avatars.generated_params) and the
-- validation report (body_scans.validation_report) are kept. Rows are written only by the
-- FastAPI backend with the service-role key; users can read and delete their own rows.

-- ── avatars ──────────────────────────────────────────────────────────────────
create table if not exists public.avatars (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  status            text not null default 'ready'
                    check (status in ('queued', 'processing', 'ready', 'failed')),
  -- null until a 3D base model is chosen (future phase)
  base_model_id     text,
  -- model output: the unified avatar profile. Immutable for clients (see grants below).
  generated_params  jsonb not null default '{}'::jsonb,
  -- user-editable overrides (ADR-0005); empty until the customisation UI exists
  appearance_params jsonb not null default '{}'::jsonb,
  body_params       jsonb not null default '{}'::jsonb,
  error             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_avatars_user_created
  on public.avatars (user_id, created_at desc);

alter table public.avatars enable row level security;

drop policy if exists "avatars_select_own" on public.avatars;
create policy "avatars_select_own" on public.avatars
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "avatars_update_own" on public.avatars;
create policy "avatars_update_own" on public.avatars
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "avatars_delete_own" on public.avatars;
create policy "avatars_delete_own" on public.avatars
  for delete to authenticated using (user_id = auth.uid());

-- No insert policy: only the backend (service role, bypasses RLS) creates avatars.
-- Column-level grants: clients may only change the editable params, never the model output.
revoke insert, update on public.avatars from anon, authenticated;
grant update (appearance_params, body_params) on public.avatars to authenticated;

drop trigger if exists avatars_set_updated_at on public.avatars;
create trigger avatars_set_updated_at
  before update on public.avatars
  for each row execute function public.set_updated_at();

-- ── body_scans ───────────────────────────────────────────────────────────────
create table if not exists public.body_scans (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  -- set when the scan produced an avatar; a deleted avatar keeps the scan record
  avatar_id         uuid references public.avatars (id) on delete set null,
  validation_status text not null check (validation_status in ('passed', 'failed')),
  validation_report jsonb not null default '{}'::jsonb,
  processing_status text not null
                    check (processing_status in ('queued', 'processing', 'ready', 'failed')),
  processing_ms     integer,
  pipeline_version  text not null,
  error             text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_body_scans_user_created
  on public.body_scans (user_id, created_at desc);

alter table public.body_scans enable row level security;

drop policy if exists "body_scans_select_own" on public.body_scans;
create policy "body_scans_select_own" on public.body_scans
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "body_scans_delete_own" on public.body_scans;
create policy "body_scans_delete_own" on public.body_scans
  for delete to authenticated using (user_id = auth.uid());

-- Scan records are written only by the backend; clients cannot insert or edit them.
revoke insert, update on public.body_scans from anon, authenticated;
