# Infrastructure

## Docker

### Container Setup

- **Base image:** `node:22-alpine`
- **Build:** Multi-stage (deps → build → production standalone)
- **Output:** Next.js standalone server (`server.js`)
- **Port:** 3000
- **Network:** `skeleton-net` (external, shared with backend)

### Dockerfile (`apps/web/Dockerfile`)

Three stages:
1. **deps** — install pnpm, copy package.json files, `pnpm install --frozen-lockfile`
2. **builder** — copy source, `pnpm --filter @skeleton-fe/web build`
3. **runner** — copy standalone output, run as non-root `nextjs` user

### Docker Compose (`docker-compose.yml`)

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: skeleton-fe
    restart: unless-stopped
    env_file:
      - .env
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.skeleton-fe.rule=Host(`skeleton-fe.localhost`)"
      - "traefik.http.services.skeleton-fe.loadbalancer.server.port=3000"
    networks:
      - skeleton-net

networks:
  skeleton-net:
    external: true
```

### Commands

```bash
docker compose build      # Build image
docker compose up -d      # Start container
docker compose logs -f    # View logs
docker compose down       # Stop container
```

## Traefik

Traefik runs in the backend infrastructure and routes by hostname:
- `skeleton.localhost` → backend (nginx → PHP)
- `skeleton-fe.localhost` → frontend (Next.js standalone)

No nginx needed for frontend — Next.js standalone server handles HTTP directly.

## Environment Variables

```env
# Elasticsearch
ELASTICSEARCH_URL=http://elasticsearch:9200
ELASTICSEARCH_USERNAME=pimcore_frontend
ELASTICSEARCH_PASSWORD=

# Pimcore API
PIMCORE_API_URL=http://skeleton.localhost
PIMCORE_CLIENT_ID=
PIMCORE_CLIENT_SECRET=

# Site (fallback until defaultLocale is in ES sites index)
DEFAULT_LOCALE=cs
AVAILABLE_LOCALES=cs,en

# Next.js
NEXT_PUBLIC_SITE_URL=http://skeleton-fe.localhost
```

**Note:** `NEXT_PUBLIC_` prefix exposes variable to client-side code. Only use for non-sensitive values.

## CI/CD (GitHub Actions)

### Pipeline (`ci.yml`)

Runs on push/PR:
1. `pnpm install`
2. `pnpm lint` — ESLint
3. `pnpm type-check` — TypeScript compilation
4. `pnpm test` — Vitest (unit + component tests)
5. `docker compose build` — verify Docker build succeeds

E2E tests (Playwright) run separately — require running backend + ES.

## Turborepo

### Pipeline Config (`turbo.json`)

- **build** — depends on `^build` (packages before apps)
- **lint** — no dependencies, runs in parallel
- **type-check** — no dependencies, runs in parallel
- **test** — depends on `^build`
- **dev** — persistent task, not cached

### Workspace Resolution

pnpm workspaces defined in `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

Packages reference each other by workspace name (e.g., `@skeleton-fe/sdk-elastic`).
