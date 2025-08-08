# Despliegue 100% gratuito (sin backend propio)

Este proyecto puede operar sin servidor propio usando Supabase (DB/Auth/Storage) y hosteando el frontend en Cloudflare Pages. Todo con planes gratuitos.

## Qué usar gratis
- Frontend: Cloudflare Pages (dominio `*.pages.dev` incluido)
- Backend/DB/Auth/Storage: Supabase (plan Free)
- CI opcional: GitHub Actions (minutos gratuitos)

## Pasos
1) Crear proyecto en Supabase
- Ve a `https://supabase.com` y crea un proyecto Free.
- Copia `Project URL` y `anon public key`.
- Importa el esquema desde `supabase-schema.sql` (en la raíz).
- Activa RLS (Row Level Security) y políticas según tus necesidades.

2) Variables del cliente (Vite)
- Crea `.env` en la raíz (o usa las variables en el panel de Cloudflare Pages).
- Variables mínimas:
```
VITE_SUPABASE_URL=...tu_url...
VITE_SUPABASE_ANON_KEY=...tu_key...
# Si no tendrás API propia, deja VITE_API_URL vacío
VITE_API_URL=
```

3) Ajuste de features que llamaban al backend propio
- La app ya usa Supabase en `src/lib/supabase.ts`, `src/services/supabaseAuth.ts` y `src/services/supabaseData.ts`.
- Revisa cualquier uso de `apiClient`/axios hacia rutas `/auth`, `/players`, `/clubs`, `/market` y migra esas operaciones a llamadas directas a Supabase.
- Sugerencia: centraliza las consultas en `src/services/supabaseData.ts` y el login/registro en `src/services/supabaseAuth.ts`.

4) Build local
```
npm i
npm run build
```

5) Despliegue en Cloudflare Pages (UI)
- Conecta el repositorio.
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables (Build): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (vacía si no hay backend).
- Activa “Single-page app”/SPA fallback para que todas las rutas sirvan `index.html`.

6) Dominio
- Usa `*.pages.dev` (gratis). Si quieres dominio propio, el costo del dominio NO es gratuito.

## Notas
- PWA: añade `public/pwa-192x192.png` y `public/pwa-512x512.png` para evitar 404 del manifest.
- Límites Free:
  - Supabase Free cubre proyectos pequeños (consultas, ancho de banda, almacenamiento con cuota). Escala a Pro si crece el uso.
  - Cloudflare Pages Free es suficiente para sitios con tráfico moderado.

## Alternativa: mantener API con funciones gratis
- Si necesitas endpoints mínimos, usa Supabase Edge Functions (gratis con cuotas) o Cloudflare Pages Functions/Workers (free tier). Evita contenedores/VMs para mantener $0.
