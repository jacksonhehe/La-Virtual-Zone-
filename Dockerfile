# Multi-stage build for La Virtual Zone

# ----- Builder -----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN corepack enable && pnpm install --frozen-lockfile && cd server && pnpm install --frozen-lockfile && cd ..
COPY . .
RUN pnpm run build && pnpm --filter ./server... run build

# ----- API Runtime -----
FROM node:20-alpine AS api-runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server/dist/main.js"]

# ----- Web Runtime -----
FROM nginx:alpine AS web-runtime
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
