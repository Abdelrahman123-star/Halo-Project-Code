-- 0003_profile_gender.sql
-- Adds binary gender column to public.profiles and updates handle_new_user trigger.
-- Run in Supabase Dashboard -> SQL Editor (or `supabase db push`).

alter table public.profiles
  add column if not exists gender text check (gender in ('female', 'male'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.raw_user_meta_data ->> 'gender'
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    gender = coalesce(excluded.gender, public.profiles.gender);
  return new;
end $$;

