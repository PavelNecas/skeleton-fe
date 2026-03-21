# Project Structure

**Read only the section relevant to your task.** Each section links to a detailed doc — read that doc only when working in that area.

## Monorepo Layout

```
skeleton-fe/
├── packages/                 # Shared libraries
│   ├── sdk-elastic/          → .claude/docs/sdk.md
│   ├── sdk-pimcore/          → .claude/docs/sdk.md
│   ├── ui/                   → .claude/docs/ui.md
│   └── config/               # Shared configs (tailwind, eslint, tsconfig)
│
├── apps/
│   ├── web/                  # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router entry points
│   │   │   ├── core/         → .claude/docs/templates.md, .claude/docs/ui.md
│   │   │   ├── sites/        → .claude/docs/multi-site.md
│   │   │   ├── lib/          → .claude/docs/routing.md, .claude/docs/auth.md
│   │   │   ├── middleware.ts → .claude/docs/routing.md
│   │   │   └── styles/       → .claude/docs/multi-site.md
│   │   ├── __tests__/
│   │   ├── Dockerfile        → .claude/docs/infrastructure.md
│   │   └── next.config.ts
│   │
│   └── sync/                 # Sync module (future, skeleton only for now)
│
├── docker-compose.yml        → .claude/docs/infrastructure.md
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # Workspace definition
└── .env.example              → .claude/docs/infrastructure.md
```

## Workspace Packages

| Package | Name | Purpose |
|---------|------|---------|
| `packages/sdk-elastic` | `@skeleton-fe/sdk-elastic` | ES client, value objects, query builders for all indices |
| `packages/sdk-pimcore` | `@skeleton-fe/sdk-pimcore` | HTTP client, auth, Pimcore API endpoints |
| `packages/ui` | `@skeleton-fe/ui` | Shared UI components (shadcn/ui based) |
| `packages/config` | `@skeleton-fe/config` | Shared Tailwind, ESLint, TypeScript configs |
| `apps/web` | `@skeleton-fe/web` | Main Next.js application |
| `apps/sync` | `@skeleton-fe/sync` | Sync module (placeholder) |

## Data Sources

- **Elasticsearch** — read-only, via `sdk-elastic`. Indices: routes, pages, articles, navigations, sites, snippets, links, hardlinks. Index naming: `{sitePrefix}_{baseName}_{locale}`.
- **Pimcore REST API** — via `sdk-pimcore`. Auth endpoints, future e-commerce endpoints. Base URL: `http://skeleton.localhost`.
- **ES schema endpoint** — `/api/search/schemas` and `/api/search/schemas/{indexName}` on backend.
- **Full schema snapshot** — `.claude/temp/structure.json` (all ES index schemas).

## Detailed Documentation

Read only what you need:

| Area | Doc | When to read |
|------|-----|-------------|
| SDK packages | [sdk.md](sdk.md) | Working on sdk-elastic or sdk-pimcore |
| Routing & middleware | [routing.md](routing.md) | Working on middleware, route resolution, locale |
| UI components | [ui.md](ui.md) | Working on components, content blocks, layouts |
| Page templates | [templates.md](templates.md) | Working on Homepage, ContentPage, etc. |
| Multi-site | [multi-site.md](multi-site.md) | Working on site overrides, theming, i18n |
| Authentication | [auth.md](auth.md) | Working on login, session, protected pages |
| Infrastructure | [infrastructure.md](infrastructure.md) | Working on Docker, CI/CD, env vars |
