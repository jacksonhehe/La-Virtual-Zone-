# La Virtual Zone

La Virtual Zone is a web platform for managing PES 2021 leagues and tournaments. It is built with React, TypeScript, and Vite.

## Prerequisites

Before running the project, make sure you have **Node.js** installed. Install the dependencies once and reuse them for any script. This step installs packages such as `@types/node` that the TypeScript compiler depends on:

```bash
npm install
```

Run `npm install` before executing TypeScript builds or tests, otherwise `tsc` will report missing type definitions. After the packages are installed you can start the development server.

## Development

Run the development server with hot reload:

```bash
npm run dev
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

## Admin Panel

To access the administrator interface:

1. Start the development server with `npm run dev`.
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

## Data Persistence

User accounts and login state are stored in the browser using `localStorage`. Clearing your browser data resets this information. Other league data (clubs, players, tournaments, etc.) comes from mock files and is kept in memory only, so changes are lost on page refresh.

## License

This project is licensed under the [MIT License](LICENSE).

