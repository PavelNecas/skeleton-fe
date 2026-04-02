# Routing & Middleware

## Overview

All routing happens through Next.js middleware + a single catch-all route (`[[...path]]/page.tsx`). The middleware resolves site, locale, and route from Elasticsearch before the page component runs.

## Middleware Flow (`src/middleware.ts`)

```
Request: GET skeleton-fe.localhost/en/about-us
    │
    ▼
1. SITE DETECTION
   hostname → ES sites index → site config
   Cache: in-memory, 5min TTL
   Result: { prefix: "skeleton_localhost", defaultLocale: "cs", availableLocales: ["cs", "en"] }
    │
    ▼
2. LOCALE DETECTION
   firstSegment = "en" → ∈ availableLocales → locale = "en", resolvedPath = "/about-us"
   (If no prefix → locale = defaultLocale, path unchanged)
    │
    ▼
3. ROUTE RESOLUTION
   ES query: skeleton_localhost_routes WHERE path = "about-us" AND locale AND published = true
   Result: { sourceId, sourceType, objectType, controllerTemplate, locale, translationLinks, aliases }
    │
    ▼
4. ALIAS CHECK
   If path matches an alias → 301 redirect to current path
    │
    ▼
5. REWRITE
   Set headers: x-site-prefix, x-locale, x-route (JSON), x-template
   NextResponse.rewrite(same URL with headers)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Orchestrates the full flow above |
| `src/lib/site-resolver.ts` | Hostname → ES sites index → site config (cached) |
| `src/lib/route-resolver.ts` | Path → ES routes index → Route (alias check + redirect) |
| `src/lib/locale.ts` | Locale detection from path prefix, stripping, defaultLocale fallback |
| `src/lib/template-registry.ts` | `controllerTemplate` string → React component mapping |
| `src/lib/component-resolver.ts` | Site-specific component → core fallback resolution |

## Catch-All Page (`src/app/[[...path]]/page.tsx`)

Server Component that:
1. Reads headers set by middleware (x-site-prefix, x-locale, x-route, x-template)
2. Fetches data from appropriate ES index based on `objectType`:
   - `"Page"` → `{prefix}_pages_{locale}` WHERE id = sourceId
   - `"Article"` → `{prefix}_articles_{locale}` WHERE id = sourceId
   - `"Hardlink"` → `{prefix}_hardlinks_{locale}` + `{prefix}_pages_{locale}` (fetches both, merges into composite Page)
3. Resolves template component from template registry
4. Checks for site-specific template override
5. Renders inside MainLayout with navigation data

## Template Registry

```typescript
const templateMap: Record<string, ComponentType> = {
  'CmsModule:Homepage': Homepage,
  'CmsModule:ContentPage': ContentPage,
  'CmsModule:ContentArticles': ContentArticles,
  'CmsModule:ErrorPage404': ErrorPage404,
  'CmsModule:ErrorPage500': ErrorPage500,
}
```

## i18n URL Rules

| Scenario | URL | Locale |
|----------|-----|--------|
| Default locale page | `/clanky` | cs (no prefix) |
| Secondary locale page | `/en/articles` | en (with prefix) |
| Root homepage (default) | `/` | cs |
| Root homepage (secondary) | `/en` | en |

**Default locale and available locales are defined per-site** in the ES sites index (`defaultLocale`, `availableLocales` fields).

## Route Data (from ES routes index)

```typescript
interface Route {
  sourceId: number
  sourceType: string          // "document" | "object"
  objectType: string
  controllerTemplate: string  // e.g. "CmsModule:ContentPage"
  path: string
  site: string
  published: boolean
  locale: string              // pending BE implementation
  translationLinks: TranslationLink[]  // pending BE implementation
  aliases: { path: string }[]
  redirect: string
  redirectCode: string
}
```

## Caching

| Data | Cache | TTL |
|------|-------|-----|
| Site config | In-memory in middleware | 5 min |
| Routes | In-memory in middleware | 1 min |
| Page/article data | Next.js fetch cache | revalidate: 60s |
| Navigation | Next.js fetch cache | revalidate: 300s |
