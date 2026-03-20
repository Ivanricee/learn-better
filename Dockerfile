# Fase 1: Instalación de dependencias
FROM node:22-alpine AS deps
# Alpine no trae algunas librerías de sistema necesarias para ciertas dependencias de Node
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Fase 2: Construcción (Build)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivamos telemetría para que el build sea más rápido y privado
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Fase 3: Ejecución (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Creamos un usuario de sistema para que la app no corra como "root" (por seguridad)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo lo necesario del modo standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# El servidor standalone de Next.js genera un archivo llamado server.js
CMD ["node", "server.js"]