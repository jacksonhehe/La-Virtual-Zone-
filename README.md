# La Virtual Zone

La Virtual Zone is a web platform for managing PES 2021 leagues and tournaments. It is built with React, TypeScript, and Vite.

## Prerequisites

Before running the project, make sure you have **Node.js** installed. Install the dependencies once and reuse them for any script:

```bash
npm install
```

After the packages are installed you can start the development server.

## Development

Run the development server with hot reload:

```bash
npm run dev

To start the API server run:
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
nTo start the API server run:
```bash
(cd server && npm install && npm run start:dev)
```

2. Open the app in your browser and log in using the demo admin account (`admin` / `password`).
3. Click on your avatar in the navigation bar and choose **Panel Admin** or navigate directly to `/admin`.

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

The platform now stores all data in a PostgreSQL database managed by Prisma. Run `npm run start:dev` inside `server/` to start the API.

## Recuperar contraseña

Puedes solicitar un enlace en `/recuperar-password`; con el token recibido podrás definir una nueva contraseña en `/reset/:token`.

## Páginas legales

Los documentos de [Términos de Servicio](/terminos) y [Política de Privacidad](/privacidad) están disponibles como páginas MDX.

## Comunidad

Visita `/usuarios` para explorar a otros participantes de La Virtual Zone. Cada perfil público muestra avatar, biografía y estadísticas básicas.

## Página no encontrada

Si intentas acceder a una URL inexistente verás una página 404 con un botón que te devuelve al inicio.

## Personalización de datos

El archivo `src/data/seed.json` contiene los valores iniciales que se importan en la base de datos al ejecutar `npx prisma db seed` desde el directorio `server`.

