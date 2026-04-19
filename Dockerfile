# =============================================================================
# Stage 1: Build - Vite baut das React-Frontend zu statischen Assets
# =============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Dependencies zuerst kopieren (bessere Docker-Layer-Cache-Nutzung)
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Quellcode kopieren
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

# Frontend bauen (erzeugt /app/dist)
RUN npm run build

# =============================================================================
# Stage 2: Runtime - Kleines Image mit nur Server + gebauten Assets
# =============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Nur Production-Dependencies fürs Backend installieren
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Server-Code und gebautes Frontend aus der Build-Stage übernehmen
COPY server ./server
COPY --from=build /app/dist ./dist

# Als non-root-user laufen (Security-Best-Practice)
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Healthcheck für Coolify/Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server/index.js"]
