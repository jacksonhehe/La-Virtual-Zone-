# La Virtual Zone

La Virtual Zone is a web platform for managing PES 2021 leagues and tournaments. It is built with React, TypeScript, and Vite.

## Prerequisites

Before running the project, make sure you have **Node.js** installed. Install the dependencies once and reuse them for any script:

```bash
npm install
```

Before starting the development server, run the `supabase/migrations/create_users_table.sql` migration to create the `users` table.

## Configuración

1. Copia `.env.example` a `.env` en la raíz del proyecto.
2. En tu panel de Supabase ve a **Settings → API** y copia la `Project URL` y la clave anónima.
3. Asigna la URL a `SUPABASE_URL` (backend) y `VITE_SUPABASE_URL` (frontend); la clave anónima a `VITE_SUPABASE_ANON_KEY` en el archivo `.env`. Estas variables definen la conexión principal a la base de datos y reemplazan la configuración previa basada en `DATABASE_URL`.
4. Ejecuta la migración `supabase/migrations/create_users_table.sql` en tu proyecto de Supabase antes de iniciar la aplicación.


El archivo `src/supabaseClient.ts` utiliza estas variables para crear el cliente de Supabase que se consume en la aplicación.

## Supabase Setup

La aplicación utiliza Supabase para sincronizar en tiempo real los datos de algunos recursos. Crea las tablas `clubes`, `jugadores`, `torneos`, `fixtures` y `ofertas` dentro de tu proyecto de Supabase. El panel de administración también persiste su estado en la base de datos. Ejecuta el script `supabase/admin_tables.sql` para crear las tablas `admin_users`, `admin_clubs`, `admin_players`, `admin_matches`, `admin_tournaments`, `admin_news`, `admin_transfers`, `admin_standings`, `admin_activities` y `admin_comments`. Además, aplica la migración `supabase/migrations/create_users_table.sql` para definir la tabla `users` utilizada en la función `addUser`.

Asegúrate de definir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el archivo `.env` con los valores proporcionados por Supabase. Si el proyecto incluye migraciones para estas tablas, ejecútalas con el CLI de Supabase, por ejemplo:

```bash
supabase db push
```

### Insertar usuario administrador

Agrega la cuenta inicial del panel ejecutando el snippet SQL incluido en el
repositorio o utilizando el helper `addUser` de `src/utils/authService.ts`:

```sql
insert into users (email, username, role, password)
values ('admin@virtualzone.com', 'admin', 'admin', 'password');
```

```ts
await addUser('admin@virtualzone.com', 'admin', 'admin');
```

Para cargar datos de ejemplo puedes importar manualmente `src/data/seed.json` desde la consola o CLI de Supabase.

## Development

Run the development server with hot reload:

```bash
npm run dev
```

If you still require the legacy NestJS API you can start it from the `server/` directory:

To start the API server (which now connects to Supabase) run:
```bash
(cd server && npm install && npm run start:dev)
```


## Build

Create an optimized production build:

```bash
npm run build
```

## Preview

Serve the production build locally to verify the output:

```bash
npm run preview
```

## Tests

Run the Cypress test suite (which now includes an admin user flow test):

```bash
npm run test
```

This command lints the code, builds the project, and then runs Cypress in
headless mode. To open the interactive Cypress UI instead, execute:

```bash
npx cypress open
```

To execute only the admin user flow test, specify its path:

```bash
npx cypress run --spec tests/e2e/admin_user_flow.cy.ts
```

Ensure the development server is running on `http://localhost:5173` before
starting the E2E tests.

## Admin Panel

To access the administrator interface:

1. Start the development server with `npm run dev`.
   To start the API server (connected to Supabase) run:
```bash
(cd server && npm install && npm run start:dev)
```

3. Open the app in your browser and log in using the demo admin account (`admin@virtualzone.com` / `password`).
4. Click on your avatar in the navigation bar and choose **Panel Admin** or navigate directly to `/admin`.

Within the admin panel you will find management sections for:

- **Dashboard** – quick stats and recent activity.
- **Gestión de Usuarios** – manage user accounts and roles.
- **Gestión de Clubes** – edit club data and budgets.
- **Gestión de Jugadores** – view and modify player information.
- **Gestión de Mercado** – open or close the transfer market.
- **Gestión de Torneos** – create and control competitions.
- **Gestión de Noticias** – publish news articles.
- **Estadísticas Generales** – overview of club and player statistics.
- **Calendario de Partidos** – schedule fixtures and events.

## Demo DT Accounts

The application seeds fictional manager users for the demo clubs. All DT accounts use the password `password`.

| Usuario    | Club               |
| ---------- | ------------------ |
| dtdefensor | Defensores del Lag |
| dtneon     | Neón FC            |
| dthax      | Haxball United     |
| dtglitch   | Glitchers 404      |
| dtcyber    | Cyber Warriors     |
| dtbinary   | Binary Strikers    |
| dtconnect  | Connection FC      |
| dtgalaxy   | Pixel Galaxy       |
| dtmadrid   | Real Madrid        |
| dtquantum  | Quantum Rangers    |

## Data Persistence

The backend now connects directly to Supabase, so no local PostgreSQL setup is required. Run `npm run start:dev` inside `server/` to start the API.

## Recuperar contraseña

Puedes solicitar un enlace en `/recuperar-password`; con el token recibido podrás definir una nueva contraseña en `/reset/:token`.

## Páginas legales

Los documentos de [Términos de Servicio](/terminos) y [Política de Privacidad](/privacidad) se procesan como componentes React mediante un plugin MDX ligero incluido en `scripts/mdxPlugin.ts`.

## Comunidad

Visita `/usuarios` para explorar a otros participantes de La Virtual Zone. Cada perfil público muestra avatar, biografía y estadísticas básicas.

## Página no encontrada

Si intentas acceder a una URL inexistente verás una página 404 con un botón que te devuelve al inicio.

El back end expone `GET /healthz` para comprobar que el servicio está en línea.

El archivo `src/data/seed.json` contiene los valores iniciales que puedes importar directamente en Supabase usando la opción **Table Editor** o el CLI `supabase db import`.

## Health Checks

Comprueba que la API está activa haciendo una solicitud a `/healthz`.
El servidor responde con un **HTTP 200** si el servicio se está ejecutando.

```bash
curl -i http://localhost:3000/healthz
```

## CI/CD

El proyecto se despliega automáticamente mediante **GitHub Actions**. El flujo ejecuta `npm run test` y las pruebas de `server/`, mide el rendimiento con Lighthouse CI y publica el front end en **Vercel** y el back end en **Fly.io**.
Se requiere definir los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `FLY_API_TOKEN` y `FLY_APP` en los ajustes del repositorio. También se recomienda configurar `SENTRY_DSN` para el seguimiento de errores.

