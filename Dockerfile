# Fase 1: Instalación de dependencias
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalamos pnpm globalmente dentro de Docker
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiamos los archivos de pnpm (Nota que ahora es pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Fase 2: Construcción (Build)
FROM node:22-alpine AS builder
WORKDIR /app
# Instalamos pnpm aquí también para poder hacer el build
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build

# Fase 3: Ejecución (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

#Instalamos yt-dlp y ffmpeg
RUN apk add --no-cache ffmpeg python3 py3-pip
RUN pip3 install yt-dlp --break-system-packages

# Copiamos solo lo necesario del modo standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]