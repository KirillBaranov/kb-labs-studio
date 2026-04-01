FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/studio/package.json ./apps/studio/
COPY packages/studio-ui-core/package.json ./packages/studio-ui-core/
COPY packages/studio-ui-kit/package.json ./packages/studio-ui-kit/
COPY packages/studio-data-client/package.json ./packages/studio-data-client/

RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/studio/node_modules ./apps/studio/node_modules
COPY . .

ARG VITE_DATA_SOURCE_MODE=mock
ARG VITE_API_BASE_URL=https://api.kblabs.ru/api/v1
ENV VITE_DATA_SOURCE_MODE=$VITE_DATA_SOURCE_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN corepack enable pnpm && pnpm --filter kb-labs-studio-app run build

# ── runner ───────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/studio/dist /usr/share/nginx/html

# SPA routing — redirect all 404s to index.html
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
