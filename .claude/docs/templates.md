# Page Templates

## Overview

Templates are React Server Components mapped from the `controllerTemplate` field in the ES routes index. They live in `apps/web/src/core/templates/`.

## Template Registry (`core/templates/index.ts`)

```typescript
const templateMap: Record<string, ComponentType<TemplateProps>> = {
  'CmsModule:Homepage': Homepage,
  'CmsModule:ContentPage': ContentPage,
  'CmsModule:ContentArticles': ContentArticles,
  'CmsModule:ErrorPage404': ErrorPage404,
  'CmsModule:ErrorPage500': ErrorPage500,
}
```

New templates are registered here when added.

## Templates

### Homepage (`Homepage.tsx`)
- **controllerTemplate:** `CmsModule:Homepage`
- **Data source:** `{prefix}_pages_{locale}` (document)
- **Renders:** Page editables via BlockRenderer, homepage-specific layout
- **Special:** May load additional data (featured articles, snippets)

### ContentPage (`ContentPage.tsx`)
- **controllerTemplate:** `CmsModule:ContentPage`
- **Data source:** `{prefix}_pages_{locale}` (document)
- **Renders:** Page editables via BlockRenderer (rich-text, crossroad-block)
- **Most common template** — generic content page

### ContentArticles (`ContentArticles.tsx`)
- **controllerTemplate:** `CmsModule:ContentArticles`
- **Data source:** `{prefix}_articles_{locale}` (object)
- **Renders:** Article fields (name, perex, description) + contentBlocks via BlockRenderer (crossroad-block, highlight, image)

### ErrorPage404 (`ErrorPage404.tsx`)
- **controllerTemplate:** `CmsModule:ErrorPage404`
- **Renders:** 404 message with navigation, search suggestion
- **Triggered:** When route not found in ES routes index

### ErrorPage500 (`ErrorPage500.tsx`)
- **controllerTemplate:** `CmsModule:ErrorPage500`
- **Renders:** 500 error message
- **Triggered:** Unhandled server errors

## Data Flow

```
[[...path]]/page.tsx
  │
  ├── Read x-route header → { sourceType, sourceId, controllerTemplate }
  │
  ├── sourceType === "document"
  │     → sdk-elastic: pages.findById(prefix, locale, sourceId) → Page
  │
  ├── sourceType === "object"
  │     → sdk-elastic: articles.findById(prefix, locale, sourceId) → Article
  │
  ├── templateMap[controllerTemplate] → TemplateComponent
  │
  └── <MainLayout><TemplateComponent data={data} /></MainLayout>
```

## Site Override

Templates can be overridden per-site. The component resolver checks `sites/{site}/templates/` first, falls back to `core/templates/`. See `.claude/docs/multi-site.md`.

## Adding a New Template

1. Create component in `core/templates/NewTemplate.tsx`
2. Register in `core/templates/index.ts`
3. Ensure backend sets corresponding `controllerTemplate` value in routes index
4. Add tests
