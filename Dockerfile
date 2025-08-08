#############################
# Etapa 1: Build
#############################
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar deps del frontend
COPY package*.json ./
RUN npm ci

# Instalar deps del backend (incluye dev deps para compilar Nest)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copiar código
COPY . .

# Variables de build para Vite (Supabase)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build frontend
RUN npm run build

# Copiar artefactos del frontend al backend/public
RUN mkdir -p server/public && cp -r dist/* server/public/

# Build backend
RUN cd server && npm run build && npx prisma generate

#############################
# Etapa 2: Producción
#############################
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copiar servidor compilado y assets
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/public ./public
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/node_modules ./node_modules

# Prune dev deps por si quedaron
RUN npm prune --omit=dev && npx prisma generate

# Exponer puerto
ENV PORT=3000
EXPOSE 3000

# Ejecutar migraciones y arrancar
CMD sh -c "npx prisma migrate deploy && node dist/main.js"
