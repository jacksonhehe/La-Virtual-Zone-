# --------------------
# Etapa de build
# --------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias del backend
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copiar código fuente del backend
COPY server .

# Construir la aplicación
RUN npm run build

# --------------------
# Etapa de producción
# --------------------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos compilados y dependencias
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./prisma

# Puerto expuesto (coincide con fly.toml)
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]