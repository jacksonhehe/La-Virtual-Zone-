-- Habilitar RLS en tablas principales
alter table clubs     enable row level security;
alter table players   enable row level security;
alter table transfers enable row level security;
alter table admin_state enable row level security;
alter table ui_state enable row level security;

-- Política genérica: usuario ve su data o es ADMIN
create policy "Users read own clubs or ADMIN"
on clubs for select
using (
  owner_id = auth.uid() or (auth.jwt() ->> 'role') = 'ADMIN'
);

create policy "Users manage own admin_state"
on admin_state for all
using (user_id = auth.uid());
-- (Repetir reglas equivalentes en players, transfers, ui_state)
