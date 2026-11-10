-- 0004_admin_role.sql
-- Adds role column to public.profiles and grants admin permissions across profiles and wardrobe.

alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- Helper to check if current user is an admin
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Allow authenticated users to view their own profile OR admins to view all profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (is_admin() or id = auth.uid());

-- Allow users to update their own profile (cannot change role), and admins to update any profile
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (is_admin() or id = auth.uid())
  with check (
    is_admin() or (id = auth.uid() and role = 'user')
  );

-- Allow admins to view all wardrobe items across all users
drop policy if exists "wardrobe_items_select_admin" on public.wardrobe_items;
create policy "wardrobe_items_select_admin" on public.wardrobe_items
  for select to authenticated
  using (is_admin() or user_id = auth.uid());

-- Allow admins to delete/moderate wardrobe items
drop policy if exists "wardrobe_items_delete_admin" on public.wardrobe_items;
create policy "wardrobe_items_delete_admin" on public.wardrobe_items
  for delete to authenticated
  using (is_admin() or user_id = auth.uid());

