-- Enable RLS for profiles and create sane defaults
-- Run this in Supabase SQL Editor on your project

-- 1) Ensure table exists (skip if you already have it)
-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   username text UNIQUE NOT NULL,
--   email text NOT NULL,
--   role text DEFAULT 'user' CHECK (role IN ('user','dt','admin')),
--   avatar text,
--   club_id text,
--   status text DEFAULT 'active' CHECK (status IN ('active','suspended','banned','deleted')),
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now(),
--   bio text,
--   location text,
--   website text,
--   favorite_team text,
--   favorite_position text,
--   suspended_until timestamptz,
--   suspended_reason text,
--   ban_reason text,
--   deleted_at timestamptz,
--   deleted_reason text,
--   notifications boolean DEFAULT true,
--   last_login text,
--   followers int DEFAULT 0,
--   following int DEFAULT 0
-- );

-- 2) Enable RLS
alter table public.profiles enable row level security;

-- 3) Policies
-- Read: anyone can read public profiles
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
on public.profiles for select
to anon, authenticated
using (true);

-- Update: a user can update only their own row
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Insert: created by trigger after signup; allow only service role
drop policy if exists "Service role can insert profiles" on public.profiles;
create policy "Service role can insert profiles"
on public.profiles for insert
to service_role
with check (true);

-- Delete: only service role (admins via dashboard)
drop policy if exists "Service role can delete profiles" on public.profiles;
create policy "Service role can delete profiles"
on public.profiles for delete
to service_role
using (true);

-- 4) Update trigger for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 5) Optional: create profile on auth sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, split_part(new.email, '@', 1), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

