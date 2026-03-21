# Frontend Application Init — Design Spec

**Date:** 2026-03-21
**Issue:** [#1 FE app init plan](https://github.com/PavelNecas/skeleton-fe/issues/1)
**Status:** Approved

## Overview

Frontend e-commerce skeleton application built on Next.js + TypeScript. Consumes data from Elasticsearch (indexed by Pimcore backend) and Pimcore REST API. Designed as a multi-site template with per-site component overrides.

## Decisions

| Area | Decision |
|------|----------|
| Framework | Next.js (App Router) + TypeScript |
| UI Library | shadcn/ui (Radix UI + Tailwind CSS) |
| Monorepo | Turborepo + pnpm workspaces |
| Multi-site | Single app + middleware routing + component override system |
| SDK | Two packages: `sdk-elastic` + `sdk-pimcore` |
| Auth | Client credentials (server-side M2M) + password grant (customer login via `POST /api/auth/login`) |
| ES access | Frontend reads ES directly (read-only user `pimcore_frontend`) + Pimcore API for write operations |
| i18n | Path-based; default locale without prefix, secondary locales with prefix (`/en/...`) |
| Docker | Node 22 Alpine, standalone Next.js, Traefik routing on `skeleton-net` |
| Hostname | `skeleton-fe.localhost` |
| Testing | Vitest (unit), Testing Library (component), Playwright (E2E) |
| Scope v1 | CMS pages, routing, navigation, auth, error pages |

## Architecture

```
Browser → Traefik → Next.js (standalone, Node 22)
                       │
                       ├── Middleware (site detection, locale, route resolution)
                       ├── Templates (Server Components)
                       ├── sdk-elastic → Elasticsearch (read-only)
                       └── sdk-pimcore → Pimcore Backend API
```

### Backend Context

- **Backend:** Pimcore CMS v2025.4, PHP 8.4, Symfony 7.x
- **Backend repo:** [PavelNecas/pim-skeleton](https://github.com/PavelNecas/pim-skeleton)
- **ES indices per site:** articles, pages, snippets, emails, hardlinks, links, navigations, sites, routes
- **Index naming:** `{sitePrefix}_{baseName}_{locale}` (e.g., `skeleton_localhost_pages_cs`)
- **API docs:** `http://skeleton.localhost/api/docs/`
- **Schema endpoint:** `/api/search/schemas` and `/api/search/schemas/{indexName}`

## Project Structure

```
skeleton-fe/
├── packages/
│   ├── sdk-elastic/              # SDK for Elasticsearch
│   │   ├── src/
│   │   │   ├── client.ts         # ES client (connection, auth, base queries)
│   │   │   ├── types.ts          # Shared types (Property, Editable, ContentBlock)
│   │   │   ├── indices/          # Per-index query builders + value objects
│   │   │   │   ├── routes.ts
│   │   │   │   ├── pages.ts
│   │   │   │   ├── articles.ts
│   │   │   │   ├── navigations.ts
│   │   │   │   ├── sites.ts
│   │   │   │   ├── snippets.ts
│   │   │   │   ├── links.ts
│   │   │   │   └── hardlinks.ts
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── sdk-pimcore/              # SDK for Pimcore REST API
│   │   ├── src/
│   │   │   ├── client.ts         # HTTP client (base URL, auth, interceptors)
│   │   │   ├── auth.ts           # Login, refresh token, client credentials
│   │   │   ├── endpoints/
│   │   │   ├── types.ts          # Request/Response DTOs
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                       # Shared UI components (shadcn/ui)
│   │   ├── src/
│   │   │   ├── components/       # shadcn components (Button, Dialog, Form...)
│   │   │   ├── lib/utils.ts      # cn() helper
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                   # Shared configuration
│       ├── tailwind/preset.ts
│       ├── eslint/base.js
│       └── tsconfig/
│           ├── base.json
│           ├── nextjs.json
│           └── library.json
│
├── apps/
│   ├── web/                      # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── not-found.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   ├── [[...path]]/page.tsx  # Catch-all route
│   │   │   │   └── api/auth/[...nextauth]/route.ts
│   │   │   │
│   │   │   ├── core/             # Shared logic & default components
│   │   │   │   ├── templates/    # Template components
│   │   │   │   │   ├── index.ts  # Template registry
│   │   │   │   │   ├── Homepage.tsx
│   │   │   │   │   ├── ContentPage.tsx
│   │   │   │   │   ├── ContentArticles.tsx
│   │   │   │   │   ├── ErrorPage404.tsx
│   │   │   │   │   └── ErrorPage500.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── layout/   # Header, Footer, Navigation, LanguageSwitcher
│   │   │   │   │   ├── content/  # BlockRenderer, RichTextBlock, CrossroadBlock, HighlightBlock, ImageBlock
│   │   │   │   │   └── shared/   # SEOHead, Breadcrumbs
│   │   │   │   └── layouts/MainLayout.tsx
│   │   │   │
│   │   │   ├── sites/            # Per-site overrides
│   │   │   │   └── _example/     # Example site override
│   │   │   │       ├── config.ts
│   │   │   │       ├── components/
│   │   │   │       ├── templates/
│   │   │   │       └── layouts/
│   │   │   │
│   │   │   ├── lib/              # Utilities & infrastructure
│   │   │   │   ├── site-resolver.ts
│   │   │   │   ├── route-resolver.ts
│   │   │   │   ├── template-registry.ts
│   │   │   │   ├── component-resolver.ts
│   │   │   │   ├── locale.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── session.ts
│   │   │   │   │   └── middleware.ts
│   │   │   │   └── utils.ts
│   │   │   │
│   │   │   ├── middleware.ts     # Next.js middleware
│   │   │   └── styles/
│   │   │       ├── globals.css
│   │   │       └── themes/_example.css
│   │   │
│   │   ├── __tests__/
│   │   │   ├── unit/
│   │   │   ├── components/
│   │   │   └── e2e/
│   │   ├── Dockerfile
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── vitest.config.ts
│   │   ├── playwright.config.ts
│   │   └── package.json
│   │
│   └── sync/                    # Sync module (skeleton only)
│       ├── src/index.ts
│       └── package.json
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
└── .gitignore
```

## Request Lifecycle

1. **Traefik** routes `skeleton-fe.localhost` → frontend container port 3000
2. **Middleware — Site Detection:** hostname → ES sites index → site config (prefix, defaultLocale, availableLocales); cached in-memory 5min
3. **Middleware — Locale Detection:** check first path segment against availableLocales; if match → strip prefix, set locale; if no match → use defaultLocale
4. **Middleware — Route Resolution:** ES `{sitePrefix}_routes` WHERE `path = resolvedPath`; if alias match → 301 redirect; if no match → 404
5. **Middleware — Rewrite:** set headers (x-site-prefix, x-locale, x-route, x-template), rewrite to same URL
6. **`[[...path]]/page.tsx`:** read headers, fetch data from appropriate ES index based on sourceType + sourceId + locale
7. **Template resolution:** `controllerTemplate` → React component via template registry; check site overrides first via component resolver
8. **Render:** MainLayout (Header + Navigation + LanguageSwitcher + Footer) wrapping the template component

## SDK Value Objects

### Shared Types

```typescript
// Property (polymorphic)
type Property = TextProperty | BoolProperty | RelationProperty

// Editable (polymorphic) — for documents (pages, snippets, emails)
type Editable = RichTextEditable | CrossroadBlockEditable

// ContentBlock (polymorphic) — for objects (articles)
type ContentBlock = CrossroadContentBlock | HighlightContentBlock | ImageContentBlock
```

### Index Value Objects

| Index | Key Fields |
|-------|-----------|
| **Route** | sourceId, sourceType, objectType, controllerTemplate, path, site, published, locale*, translationLinks*, aliases |
| **Page** | id, title, description, path, key, locale, published, site, technicalData, navigationData, editables, properties |
| **Article** | id, name, metaDescription, description, perex, summary, locale, slug, frontendTemplate, contentBlocks, properties |
| **Navigation** | id, menuDocumentName, root (NavigationNode tree) |
| **Site** | id, domains, rootId, mainDomain, errorDocument, localizedErrorDocuments, defaultLocale*, availableLocales* |
| **Snippet** | id, path, key, locale, published, site, technicalData, editables, properties |
| **Link** | id, path, key, locale, published, site, linkData, navigationData |
| **Hardlink** | id, path, key, locale, published, site, sourceData, navigationData, editables, properties |

\* Fields pending backend implementation (issues created)

### Query Builder Pattern

Each index has a class with typed query methods:
- `RoutesIndex.findByPath(sitePrefix, path)` → `Route | null`
- `RoutesIndex.findByAlias(sitePrefix, path)` → `Route | null`
- `PagesIndex.findById(sitePrefix, locale, id)` → `Page | null`
- `ArticlesIndex.findById(sitePrefix, locale, id)` → `Article | null`
- `NavigationsIndex.getByName(sitePrefix, menuDocumentName)` → `Navigation | null`
- `SitesIndex.findByDomain(sitePrefix, domain)` → `Site | null`

## i18n Strategy

- **Default locale:** no path prefix (e.g., `/clanky`)
- **Secondary locales:** with prefix (e.g., `/en/articles`)
- **hreflang tags:** generated from `route.translationLinks` + `site.defaultLocale`
- **x-default:** points to default locale version
- **Language switcher:** uses `translationLinks` from route to build localized URLs
- **Translation linking for documents:** via `translationLinks` field in routes index (documents have different sourceId per locale)
- **Translation linking for objects:** via `sourceId` (same across locales) + `translationLinks` for convenience

## Auth Flow

### Customer Login (Password Grant)
1. User submits email + password on login page
2. Frontend calls `POST /api/auth/login` via sdk-pimcore
3. Backend returns `{ token_type, expires_in, access_token, refresh_token }`
4. Frontend stores access_token in httpOnly cookie (1h TTL)
5. Frontend stores refresh_token in httpOnly cookie (30d TTL)
6. Middleware checks auth cookie for protected pages

### Server-side M2M (Client Credentials)
1. Next.js server-side code calls `POST /token` with client_id + client_secret
2. Used for server-side data fetching that requires authentication
3. Token cached server-side

## Multi-site Override System

### Component Resolver
```
Request for "Header" component on site "b2b-site":
  1. Check sites/b2b-site/components/layout/Header.tsx → exists? Use it
  2. Fallback to core/components/layout/Header.tsx
```

### Per-site Theming
CSS variables in per-site theme files override the base shadcn/ui theme:
```css
/* sites/b2b-site theme */
:root { --primary: 142 76% 36%; --radius: 0.25rem; }
```

### Site Config
```typescript
// sites/b2b-site/config.ts
export const siteConfig = {
  name: 'B2B Portal',
  theme: 'b2b',
  features: { showPrices: true, showStock: true },
}
```

## Docker Setup

- **Base image:** `node:22-alpine`
- **Build:** Multi-stage (deps → build → production standalone)
- **Network:** `skeleton-net` (external, shared with backend)
- **Traefik labels:** `Host(\`skeleton-fe.localhost\`)`
- **Port:** 3000

## Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|-------------|
| Site config | In-memory (middleware) | 5 min | Restart |
| Routes | In-memory (middleware) | 1 min | Restart |
| Pages/Articles (SSR) | Next.js cache | revalidate: 60s | On-demand revalidation API |
| Navigation | Next.js cache | revalidate: 300s | On-demand revalidation API |
| Static assets | CDN/browser | immutable | Build hash |

## Testing Strategy

| Level | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | SDK query builders, resolvers, auth client, locale logic |
| Component | Testing Library + Vitest | BlockRenderer, Navigation, LanguageSwitcher, SEOHead, layout components |
| E2E | Playwright | Full page loads, routing, locale switching, 404, alias redirects, auth flow |

## Implementation Phases

```
Phase 1: Project scaffold (monorepo, tooling, Docker, CI)
    │
    ▼
Phase 2: SDK (sdk-elastic + sdk-pimcore + unit tests)
    │
    ├────────────┐
    ▼            ▼
Phase 3:     Phase 4:
Routing &    UI components
Middleware   (shadcn/ui + content blocks)
    │            │
    ├────────────┘
    ▼
Phase 5: Templates & Pages (Homepage, ContentPage, ContentArticles, Error pages)
    │
    ▼
Phase 6: Auth & Session (login, JWT, protected pages)
    │
    ▼
Phase 7: Multi-site & i18n (site overrides, locale routing, hreflang, LanguageSwitcher)
    │
    ▼
Phase 8: E2E tests & Polish (Playwright, documentation, code review)
```

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

# Site (fallback until defaultLocale is in ES)
DEFAULT_LOCALE=cs
AVAILABLE_LOCALES=cs,en

# Next.js
NEXT_PUBLIC_SITE_URL=http://skeleton-fe.localhost
```

## Pending Backend Changes

- Add `locale` field to routes index (issue created)
- Add `translationLinks` field to routes index (issue created)
- Add `defaultLocale` + `availableLocales` fields to sites index (issue created)
