-- 0002_wardrobe.sql
-- Creates the wardrobe_items table, indexes, and RLS policies.
-- Run once in Supabase Dashboard -> SQL Editor (or `supabase db push` with the CLI).
-- Idempotent so it can be re-run safely.

create table if not exists public.wardrobe_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null default 'Garment',
  category     text not null,
  confidence   double precision,
  crop_base64  text,
  colors       jsonb not null default '[]'::jsonb,
  attributes   jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for speedy retrieval of a user's garments ordered by newest first
create index if not exists idx_wardrobe_items_user_created
  on public.wardrobe_items (user_id, created_at desc);

-- Enable Row Level Security (RLS)
alter table public.wardrobe_items enable row level security;

-- Ownership policies: Authenticated users can only select, insert, update, and delete their own items
drop policy if exists "wardrobe_items_select_own" on public.wardrobe_items;
create policy "wardrobe_items_select_own" on public.wardrobe_items
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "wardrobe_items_insert_own" on public.wardrobe_items;
create policy "wardrobe_items_insert_own" on public.wardrobe_items
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "wardrobe_items_update_own" on public.wardrobe_items;
create policy "wardrobe_items_update_own" on public.wardrobe_items
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "wardrobe_items_delete_own" on public.wardrobe_items;
create policy "wardrobe_items_delete_own" on public.wardrobe_items
  for delete to authenticated
  using (user_id = auth.uid());

-- Maintain updated_at timestamp automatically on updates
drop trigger if exists wardrobe_items_set_updated_at on public.wardrobe_items;
create trigger wardrobe_items_set_updated_at
  before update on public.wardrobe_items
  for each row execute function public.set_updated_at();

