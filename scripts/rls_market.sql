-- Create offers and transfers tables with RLS for bidirectional market sync
-- Adjust admin email as needed

create table if not exists public.offers (
  id text primary key,
  player_id text not null,
  player_name text not null,
  from_club text not null,
  to_club text not null,
  amount numeric not null default 0,
  status text not null default 'pending',
  user_id text,
  date timestamptz not null default now(),
  -- optional fields for counter-offers
  counter_amount numeric,
  counter_message text,
  updated_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id text primary key,
  player_id text not null,
  player_name text not null,
  from_club text not null,
  to_club text not null,
  fee numeric not null default 0,
  date timestamptz not null default now()
);

-- Enable RLS
alter table public.offers enable row level security;
alter table public.transfers enable row level security;

-- Read policies: allow everyone to read (anon + authenticated)
drop policy if exists "Public read offers" on public.offers;
create policy "Public read offers" on public.offers
  for select to anon, authenticated using (true);

drop policy if exists "Public read transfers" on public.transfers;
create policy "Public read transfers" on public.transfers
  for select to anon, authenticated using (true);

-- Only admin (by email) can write (authenticated JWT), and service_role can do all
-- Replace 'admin@lavirtualzone.com' with your admin email if needed
drop policy if exists "Admin write offers" on public.offers;
create policy "Admin write offers" on public.offers
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com')
  with check ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com');

drop policy if exists "Service role write offers" on public.offers;
create policy "Service role write offers" on public.offers
  for all to service_role using (true) with check (true);

drop policy if exists "Admin write transfers" on public.transfers;
create policy "Admin write transfers" on public.transfers
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com')
  with check ((auth.jwt() ->> 'email') = 'admin@lavirtualzone.com');

drop policy if exists "Service role write transfers" on public.transfers;
create policy "Service role write transfers" on public.transfers
  for all to service_role using (true) with check (true);

-- Triggers to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_offers_updated_at on public.offers;
create trigger set_offers_updated_at
before update on public.offers
for each row execute procedure public.set_updated_at();
