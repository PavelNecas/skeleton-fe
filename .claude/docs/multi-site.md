# Multi-site & i18n

## Multi-site Architecture

Single Next.js app serving multiple sites. Sites are identified by domain in middleware, with per-site component/template/layout overrides.

### Site Detection

1. Middleware extracts hostname from request
2. Queries ES sites index for matching `mainDomain`
3. Returns site config: `{ prefix, defaultLocale, availableLocales }`
4. Cached in-memory (5min TTL)

### Site Override System

Sites live in `apps/web/src/sites/{site-name}/`:

```
sites/
├── _example/               # Example/reference site
│   ├── config.ts            # Site config (name, theme, feature flags)
│   ├── components/          # Overridden components
│   │   └── layout/
│   │       └── Header.tsx   # Custom header for this site
│   ├── templates/           # Overridden templates
│   └── layouts/             # Overridden layouts
```

### Component Resolver

Resolution order:
1. `sites/{current-site}/components/{path}` — site-specific override
2. `core/components/{path}` — default component

```typescript
function resolveComponent(site: string, componentPath: string): ComponentType {
  const siteComponent = sites[site]?.components?.[componentPath]
  return siteComponent ?? coreComponents[componentPath]
}
```

Same pattern applies to templates and layouts.

### Site Config

```typescript
// sites/{site-name}/config.ts
export const siteConfig = {
  name: 'B2B Portal',
  theme: 'b2b',           // → loads styles/themes/b2b.css
  features: {
    showPrices: true,
    showStock: true,
  },
}
```

### Per-site Theming

CSS variables in `apps/web/src/styles/themes/{site}.css` override shadcn/ui defaults:

```css
/* styles/themes/b2b.css */
:root {
  --primary: 142 76% 36%;
  --radius: 0.25rem;
}
```

Loaded based on site config's `theme` field.

## i18n

### URL Strategy

- **Default locale:** no path prefix (`/clanky`)
- **Secondary locales:** with prefix (`/en/articles`)
- Default locale is per-site (from `site.defaultLocale` in ES)

### Translation Links

Routes in ES contain `translationLinks` array:

```json
{
  "path": "/clanky",
  "locale": "cs",
  "translationLinks": [
    { "locale": "en", "sourceId": 78, "path": "/articles" }
  ]
}
```

**Documents** have different `sourceId` per locale (translations are separate Pimcore documents).
**Objects** (articles) have the same `sourceId` across locales.
Both use `translationLinks` for frontend convenience.

### Language Switcher

Generates URLs from `translationLinks`:

```typescript
function buildLocalizedUrl(link: TranslationLink, defaultLocale: string): string {
  if (link.locale === defaultLocale) return link.path    // no prefix
  return `/${link.locale}${link.path}`                   // with prefix
}
```

### hreflang Tags

Generated in `SEOHead` component from route data:

```html
<link rel="alternate" hreflang="cs" href="/clanky" />
<link rel="alternate" hreflang="en" href="/en/articles" />
<link rel="alternate" hreflang="x-default" href="/clanky" />
```

`x-default` always points to the default locale version.

### Adding a New Site

1. Create `sites/{site-name}/config.ts` with site config
2. Optionally add component/template/layout overrides
3. Create theme CSS in `styles/themes/{theme-name}.css`
4. Ensure Pimcore Site exists with correct `mainDomain`
5. Configure Traefik to route the domain to the frontend container
