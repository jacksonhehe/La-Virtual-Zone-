-- Create public.clubs and public.players with admin-only write policies
-- Run in Supabase SQL editor

-- Create clubs table
create table if not exists public.clubs (
  id text primary key,
  name text not null,
  logo text,
  foundedYear int,
  stadium text,
  budget numeric,
  manager text,
  playStyle text,
  primaryColor text,
  secondaryColor text,
  description text,
  reputation int,
  fanBase int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.clubs enable row level security;

-- Create players table
create table if not exists public.players (
  id text primary key,
  name text not null,
  age int not null,
  position text not null,
  nationality text not null,
  club_id text references public.clubs(id) on delete set null,
  overall int not null,
  potential int not null,
  transfer_listed boolean not null default false,
  transfer_value numeric not null default 0,
  image text not null default '',
  attributes jsonb,
  skills jsonb not null default '[]'::jsonb,
  playing_styles jsonb not null default '[]'::jsonb,
  contract jsonb not null default '{}'::jsonb,
  form int not null default 3,
  goals int not null default 0,
  assists int not null default 0,
  appearances int not null default 0,
  matches int not null default 0,
  dorsal int not null default 1,
  injury_resistance int not null default 50,
  height int,
  weight int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.players enable row level security;

-- Helper function for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_clubs_updated_at on public.clubs;
create trigger set_clubs_updated_at before update on public.clubs for each row execute procedure public.set_updated_at();

drop trigger if exists set_players_updated_at on public.players;
create trigger set_players_updated_at before update on public.players for each row execute procedure public.set_updated_at();

-- Policies
-- Everyone can read
drop policy if exists "Public read clubs" on public.clubs;
create policy "Public read clubs" on public.clubs for select to anon, authenticated using (true);

drop policy if exists "Public read players" on public.players;
create policy "Public read players" on public.players for select to anon, authenticated using (true);

-- Only admin (by email) or service_role can write
-- Replace with your admin email if different
do $$ begin
  if not exists (select 1) then null; end if;
end $$;

drop policy if exists "Admin write clubs" on public.clubs;
create policy "Admin write clubs" on public.clubs for all to authenticated using ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com') with check ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com');

drop policy if exists "Service role write clubs" on public.clubs;
create policy "Service role write clubs" on public.clubs for all to service_role using (true) with check (true);

drop policy if exists "Admin write players" on public.players;
create policy "Admin write players" on public.players for all to authenticated using ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com') with check ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com');

drop policy if exists "Service role write players" on public.players;
create policy "Service role write players" on public.players for all to service_role using (true) with check (true);

