# Import Transfers Backend & Store Integration

This package gives you:
- A minimal **Express backend** with endpoints:
  - `GET /api/transfers` → list
  - `POST /api/transfers/import` → upsert (insert/update) array of transfers
  - `POST /api/transfers/:id/approve`
  - `POST /api/transfers/:id/reject`
- A client API module at `src/adminPanel/api/transfers.ts`
- A **Zustand store snippet** at `src/adminPanel/store/globalStore.imports-snippet.ts` to wire the backend.

## 1) Start the backend

```bash
cd server
npm i express cors
node index.js
# It starts at http://localhost:4000
```

> Data is persisted to `server/data/transfers.json`.

## 2) Frontend config

Create `.env` at your project root (next to `vite.config.ts`) and add:

```
VITE_API_URL=http://localhost:4000
```

Restart Vite dev server.

## 3) Wire the store

Open your Zustand store (the file that exports `useGlobalStore`). Add the code from:

```
src/adminPanel/store/globalStore.imports-snippet.ts
```

- If you already have `refreshTransfers / approveTransfer / rejectTransfer`, you can **replace** them with the versions from the snippet to use the backend.
- Add the **new** method `importTransfers(rows)`.
- Make sure your store state includes `transfers: any[]` initially.

## 4) Mercado.tsx

The Mercado page I sent earlier **detects** `importTransfers` automatically.
- If present, it will call the backend import.
- If not, it falls back to a local-only import persisted in `localStorage`.

You're done! Now `Importar` will persist to the backend, merges will be applied without duplicates, and `Aprobar/Rechazar` will update the DB.