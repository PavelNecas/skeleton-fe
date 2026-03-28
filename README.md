# Skeleton FE

Frontend e-commerce skeleton built with **Next.js App Router + TypeScript**. Consumes data from Elasticsearch (indexed by Pimcore) and the Pimcore REST API. Supports multiple sites with per-site component overrides and theming.

**Backend repo:** [PavelNecas/pim-skeleton](https://github.com/PavelNecas/pim-skeleton)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22 (LTS) |
| pnpm | 9+ |
| Docker + Docker Compose | latest stable |
| Running Elasticsearch | 8.x |
| Running Pimcore backend | see backend repo |

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local values:

```env
# Elasticsearch (direct read access)
ELASTICSEARCH_URL=http://elasticsearch:9200
ELASTICSEARCH_USERNAME=pimcore_frontend
ELASTICSEARCH_PASSWORD=

# Pimcore REST API
PIMCORE_API_URL=http://skeleton.localhost
PIMCORE_CLIENT_ID=
PIMCORE_CLIENT_SECRET=

# Site defaults (overridden by ES sites index when available)
DEFAULT_LOCALE=cs
AVAILABLE_LOCALES=cs,en

# Public URL (exposed to browser)
NEXT_PUBLIC_SITE_URL=http://skeleton-fe.localhost
```

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker

The app runs as a **Next.js standalone** server on port 3000 behind **Traefik** on the `skeleton-net` network (shared with the backend stack).

```bash
# Create the shared network (once)
docker network create skeleton-net

# Build the image
docker compose build

# Start the container (detached)
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

The frontend is available at `http://skeleton-fe.localhost` (routed by Traefik).

---

## Testing

### Unit and component tests (Vitest)

```bash
pnpm test
```

### E2E tests (Playwright)

E2E tests require a running app with a connected Elasticsearch backend.

```bash
# Against the default dev server (auto-started by Playwright)
pnpm test:e2e

# Against a specific running instance
BASE_URL=http://skeleton-fe.localhost pnpm test:e2e
```

### Lint and type-check

```bash
pnpm lint         # ESLint
pnpm type-check   # TypeScript strict check
```

---

## Project Structure

```
skeleton-fe/
├── packages/
│   ├── sdk-elastic/    # ES client + typed value objects for all indices
│   ├── sdk-pimcore/    # Pimcore REST API client
│   ├── ui/             # Shared shadcn/ui components
│   └── config/         # Shared Tailwind, ESLint, TypeScript configs
│
├── apps/
│   └── web/            # Main Next.js application
│       ├── src/
│       │   ├── app/        # App Router entry points (routes, layouts)
│       │   ├── core/       # Shared components, templates, layouts
│       │   ├── sites/      # Per-site overrides (components, config)
│       │   ├── lib/        # Route resolver, auth, locale, data fetching
│       │   └── middleware.ts
│       └── e2e/        # Playwright E2E tests
│
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

Detailed architecture documentation lives in `.claude/docs/`:

| Area | File |
|------|------|
| High-level overview | `.claude/docs/project-structure.md` |
| SDK packages | `.claude/docs/sdk.md` |
| Routing & middleware | `.claude/docs/routing.md` |
| UI components | `.claude/docs/ui.md` |
| Page templates | `.claude/docs/templates.md` |
| Multi-site & theming | `.claude/docs/multi-site.md` |
| Authentication | `.claude/docs/auth.md` |
| Docker & CI/CD | `.claude/docs/infrastructure.md` |

---

## Creating a New Site Override

Site overrides live in `apps/web/src/sites/{sitePrefix}/`. Use `_example` as a starting point:

```bash
cp -r apps/web/src/sites/_example apps/web/src/sites/my-site
```

Then edit `apps/web/src/sites/my-site/config.ts`:

```typescript
import type { SiteConfigFile } from '@/lib/site-config'

export const siteConfig: SiteConfigFile = {
  name: 'My Site',
  theme: 'my-site',        // maps to data-theme="my-site" on <html>
  features: {
    showPrices: true,
    showStock: true,
  },
}
```

Override individual templates or layouts by adding files under `components/` — the component resolver automatically prefers the site-specific version over the core fallback. See `.claude/docs/multi-site.md` for full details.

---

## SDK Usage Examples

### Searching for a page via sdk-elastic

```typescript
import { ElasticClient } from '@skeleton-fe/sdk-elastic'

const client = new ElasticClient({
  url: process.env.ELASTICSEARCH_URL!,
  username: process.env.ELASTICSEARCH_USERNAME!,
  password: process.env.ELASTICSEARCH_PASSWORD!,
})

// Fetch a single page by path
const page = await client.pages.findByPath('skeleton_localhost', '/about-us', 'cs')
```

### Calling the Pimcore API via sdk-pimcore

```typescript
import { PimcoreClient } from '@skeleton-fe/sdk-pimcore'

const pimcore = new PimcoreClient({
  baseUrl: process.env.PIMCORE_API_URL!,
  clientId: process.env.PIMCORE_CLIENT_ID!,
  clientSecret: process.env.PIMCORE_CLIENT_SECRET!,
})

const tokenResponse = await pimcore.auth.token({ username: 'user', password: 'pass' })
```

See `.claude/docs/sdk.md` for the full API reference.
