-- Habilitar RLS
alter table clubs     enable row level security;
alter table players   enable row level security;
alter table transfers enable row level security;

-- Política: usuarios ven registros propios o cualquier cosa si son ADMIN
create policy "Users can read own data"
  on clubs
  for select
  using (
    auth.role() = 'authenticated' and owner_id = auth.uid()
    or auth.jwt() ->> 'role' = 'ADMIN'
  );

create policy "Users can read own players"
  on players
  for select
  using (
    auth.role() = 'authenticated' and owner_id = auth.uid()
    or auth.jwt() ->> 'role' = 'ADMIN'
  );

create policy "Users can read own transfers"
  on transfers
  for select
  using (
    auth.role() = 'authenticated' and owner_id = auth.uid()
    or auth.jwt() ->> 'role' = 'ADMIN'
  );
