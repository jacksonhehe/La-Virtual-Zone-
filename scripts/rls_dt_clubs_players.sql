-- Permitir a DT gestionar SOLO su club y sus jugadores
-- Ejecutar en Supabase SQL Editor (despues de rls_clubs_players.sql)

-- Asegurar RLS activo
alter table public.clubs enable row level security;
alter table public.players enable row level security;

-- Helper: obtener club_id del usuario autenticado desde profiles
create or replace function public.current_user_club_id()
returns text
language sql
stable
as $$
  select p.club_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

-- Helper: validar si usuario es dt/admin (por perfil)
create or replace function public.current_user_is_dt_or_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('dt', 'admin')
  )
$$;

-- CLUBS: DT/Admin autenticado puede actualizar solo su club
drop policy if exists "DT update own club" on public.clubs;
create policy "DT update own club"
on public.clubs
for update
to authenticated
using (
  public.current_user_is_dt_or_admin()
  and id = public.current_user_club_id()
)
with check (
  public.current_user_is_dt_or_admin()
  and id = public.current_user_club_id()
);

-- PLAYERS: DT/Admin puede actualizar jugadores de su club
-- y permitir salida a libres (club_id null / libre / free)
drop policy if exists "DT update own players" on public.players;
create policy "DT update own players"
on public.players
for update
to authenticated
using (
  public.current_user_is_dt_or_admin()
  and club_id = public.current_user_club_id()
)
with check (
  public.current_user_is_dt_or_admin()
  and (
    club_id = public.current_user_club_id()
    or club_id is null
    or club_id in ('libre', 'free')
  )
);

-- Nota:
-- 1) No se agrega INSERT/DELETE para DT, solo UPDATE.
-- 2) Admin por email y service_role ya definidos en rls_clubs_players.sql siguen vigentes.
