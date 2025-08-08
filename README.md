# La Virtual Zone – Despliegue en un solo dominio (Fly.io)

Guía rápida para publicar el backend (NestJS + Prisma + Postgres) sirviendo el frontend (Vite/React) desde el mismo dominio en Fly.io.

## Requisitos
- Fly CLI instalado y autenticado.
- Cuenta en Fly.io.
- Una base de datos Postgres (puedes crearla en Fly).

## Variables necesarias
Backend (secrets en Fly):
- `DATABASE_URL` (cadena Postgres)
- `JWT_SECRET` (cadena larga y aleatoria)
- `NODE_ENV=production`

Frontend (PWA / Supabase):
- `VITE_SUPABASE_URL` (opcional si usas Supabase)
- `VITE_SUPABASE_ANON_KEY` (opcional si usas Supabase)

## Pasos de despliegue
1. Crear y adjuntar Postgres en Fly (opcional si ya tienes uno):
```
fly postgres create
fly postgres attach -a la-virtual-zone
```

2. Configurar secrets del backend:
```
fly secrets set \
  DATABASE_URL="postgresql://user:pass@host:5432/db" \
  JWT_SECRET="<tu_llave_segura>" \
  NODE_ENV="production"
```

3. (Opcional) variables de Supabase para el build del frontend:
```
fly deploy --build-arg VITE_SUPABASE_URL="https://xxx.supabase.co" \
           --build-arg VITE_SUPABASE_ANON_KEY="<anon_key>"
```
Si no usas Supabase en producción, omite los build args.

4. Desplegar:
```
fly deploy
```
El contenedor: 
- compila frontend y backend, 
- copia `dist/` del frontend a `server/public`,
- genera Prisma Client,
- en arranque ejecuta `prisma migrate deploy` y luego `node dist/main.js`.

## Rutas y SPA
- `GET /health` responde OK.
- Cualquier ruta del SPA sin extensión devuelve `index.html`.

## Notas de seguridad
- Helmet CSP permite conexiones a Supabase y Sentry; ajusta si no usas esos servicios.
- Cookies de refresh usan mismo dominio (no se requiere `SameSite=None`).

## Desarrollo local
Backend:
```
cd server
npm i
cp env.example .env
npx prisma migrate dev
npm run start:dev
```

Frontend:
```
npm i
npm run dev
```
