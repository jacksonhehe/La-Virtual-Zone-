-- Habilitar RLS en tablas principales
alter table clubs       enable row level security;
alter table players     enable row level security;
alter table transfers   enable row level security;
alter table admin_state enable row level security;
alter table ui_state    enable row level security;

-- Política: dueños o rol ADMIN pueden operar
create policy "Owner or ADMIN on clubs"
  on clubs for all
  using (owner_id = auth.uid() OR (auth.jwt() ->> 'role') = 'ADMIN');

create policy "Owner or ADMIN on players"
  on players for all
  using (owner_id = auth.uid() OR (auth.jwt() ->> 'role') = 'ADMIN');

create policy "Owner or ADMIN on transfers"
  on transfers for all
  using (owner_id = auth.uid() OR (auth.jwt() ->> 'role') = 'ADMIN');

create policy "Owner or ADMIN on admin_state"
  on admin_state for all
  using (user_id = auth.uid() OR (auth.jwt() ->> 'role') = 'ADMIN');

create policy "Owner or ADMIN on ui_state"
  on ui_state for all
  using (user_id = auth.uid() OR (auth.jwt() ->> 'role') = 'ADMIN');
