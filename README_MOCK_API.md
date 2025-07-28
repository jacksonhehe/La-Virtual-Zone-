# Mock API with MSW

## Qué incluye
- Endpoints `/api/transfers` (GET, approve, reject)
- Endpoints `/api/market-settings` (GET/PUT)
- Datos dummy generados al vuelo.

## Uso rápido
1. `npm i msw --save-dev`
2. Importa el worker en `main.tsx`:

```ts
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  worker.start({ onUnhandledRequest: 'bypass' });
}
```

3. Asegúrate de que `VITE_API_URL` **no** esté definida en `.env` en modo dev
   para que el front use `/api`.

4. Listo. Todo el front consumirá el mock.

Cuando tengas backend real, solo:
- defines `VITE_API_URL=https://tu-backend.com`
- quitas (o mantienes) el bloque MSW en producción.
