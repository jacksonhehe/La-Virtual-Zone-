# 🚀 Configuración de Supabase - La Virtual Zone

## 📋 Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración inicial

## 🔑 Paso 2: Obtener las claves API

Una vez creado el proyecto, ve a:
**Settings → API**

Copia los siguientes valores:

```bash
# URL de tu proyecto Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Clave anónima (public) - segura para usar en el frontend
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Clave de servicio (private) - usar solo en desarrollo para scripts de migración
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 📁 Paso 3: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copia y pega los valores obtenidos
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Mantén esto en false hasta que completes la configuración
VITE_USE_SUPABASE=false
```

## 🗄️ Paso 4: Configurar base de datos

Ejecuta los siguientes scripts SQL en el **SQL Editor** de Supabase:

### 4.1 Tabla de perfiles (extiende auth.users)

```sql
-- Crear tabla de perfiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  role text default 'user' check (role in ('user', 'dt', 'admin')),
  avatar text,
  xp integer default 0,
  club_id text,
  status text default 'active' check (status in ('active', 'suspended', 'banned', 'deleted')),
  bio text,
  location text,
  website text,
  favorite_team text,
  favorite_position text,
  suspended_until timestamp with time zone,
  suspended_reason text,
  ban_reason text,
  deleted_at timestamp with time zone,
  deleted_reason text,
  notifications boolean default true,
  last_login timestamp with time zone default now(),
  followers integer default 0,
  following integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Políticas de seguridad
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Función para manejar nuevos usuarios
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'username', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 4.2 Tabla de clubs

```sql
create table public.clubs (
  id text primary key,
  name text not null,
  logo text,
  founded_year integer,
  stadium text,
  budget bigint default 0,
  manager text,
  play_style text default 'Equilibrado',
  primary_color text default '#ffffff',
  secondary_color text default '#000000',
  description text,
  reputation integer default 0,
  fan_base integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.clubs enable row level security;
create policy "Clubs are viewable by everyone" on public.clubs for select using (true);
create policy "Only admins can insert clubs" on public.clubs for insert with check (auth.jwt() ->> 'role' = 'admin');
create policy "Only admins can update clubs" on public.clubs for update using (auth.jwt() ->> 'role' = 'admin');
```

### 4.3 Tabla de players

```sql
create table public.players (
  id text primary key,
  name text not null,
  age integer not null,
  position text not null,
  nationality text not null,
  club_id text references public.clubs(id),
  overall integer not null,
  potential integer not null,
  transfer_listed boolean default false,
  transfer_value bigint default 0,
  image text,
  attributes jsonb,
  skills jsonb,
  playing_styles jsonb,
  contract jsonb,
  form integer default 50,
  goals integer default 0,
  assists integer default 0,
  appearances integer default 0,
  matches integer default 0,
  dorsal integer default 0,
  injury_resistance integer default 50,
  height numeric,
  weight numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.players enable row level security;
create policy "Players are viewable by everyone" on public.players for select using (true);
create policy "Only admins can manage players" on public.players for all using (auth.jwt() ->> 'role' = 'admin');
```

### 4.4 Tabla de tournaments

```sql
create table public.tournaments (
  id text primary key,
  name text not null,
  type text check (type in ('league', 'cup', 'friendly')),
  logo text,
  start_date date not null,
  end_date date not null,
  status text default 'upcoming' check (status in ('upcoming', 'active', 'finished')),
  teams text[] default '{}',
  rounds integer default 1,
  matches jsonb default '[]',
  winner text,
  top_scorer jsonb,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tournaments enable row level security;
create policy "Tournaments are viewable by everyone" on public.tournaments for select using (true);
create policy "Only admins can manage tournaments" on public.tournaments for all using (auth.jwt() ->> 'role' = 'admin');
```

### 4.5 Tabla de matches

```sql
create table public.matches (
  id text primary key,
  tournament_id text references public.tournaments(id),
  round integer default 1,
  date timestamp with time zone not null,
  home_team text not null,
  away_team text not null,
  home_score integer,
  away_score integer,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  scorers jsonb default '[]',
  highlights text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.matches enable row level security;
create policy "Matches are viewable by everyone" on public.matches for select using (true);
create policy "Only admins can manage matches" on public.matches for all using (auth.jwt() ->> 'role' = 'admin');
```

### 4.6 Tabla de transfers

```sql
create table public.transfers (
  id text primary key,
  player_id text references public.players(id),
  player_name text not null,
  from_club text not null,
  to_club text not null,
  fee bigint not null,
  date timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.transfers enable row level security;
create policy "Transfers are viewable by everyone" on public.transfers for select using (true);
create policy "Only admins can manage transfers" on public.transfers for all using (auth.jwt() ->> 'role' = 'admin');
```

## 🔧 Paso 5: Probar la conexión

Una vez configurado todo:

1. Actualiza `.env.local` con tus claves reales
2. Cambia `VITE_USE_SUPABASE=true`
3. Reinicia el servidor de desarrollo
4. Verifica que no hay errores en la consola

## 📋 Próximos pasos

Una vez completada esta configuración base, continuaremos con:

1. **Migración de autenticación** (Supabase Auth)
2. **Actualización de servicios** (clubService, playerService, etc.)
3. **Implementación de sincronización** (online/offline)
4. **Migración de datos existentes**

¿Has completado la configuración de Supabase? ¿Necesitas ayuda con algún paso específico?
