# Integración Mock API + Mercado

## Pasos
1) Instalar dependencias:
```
npm i axios zustand react-hot-toast lucide-react
npm i -D msw
```
2) Copiar carpetas `src/lib`, `src/mocks`, `src/adminPanel/store`, `src/adminPanel/components` y la página `src/adminPanel/pages/admin/Mercado.tsx` a tu repo.
3) En `src/main.tsx` (o `main.tsx` de la app admin), inicia MSW en dev:
```ts
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  worker.start({ onUnhandledRequest: 'bypass' });
}
```
4) Asegúrate de **no** poner `VITE_API_URL` en `.env` durante desarrollo (para usar `/api` -> MSW).  
   En producción o con backend real, define `VITE_API_URL` y puedes quitar el bloque de MSW.
5) Listo. El módulo Mercado ya consume el mock y soporta importar JSON/CSV, aprobar/rechazar, y configurar la ventana y salary cap con persistencia local + mock.