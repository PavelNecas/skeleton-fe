# Article Listing & Detail — Design Spec

## Overview

Add article listing with pagination and category filtering to the `Cms:Articles:default` template, create a new `Cms:Article:default` detail template, and update the SDK to reflect the current Elasticsearch article data structure.

## Requirements

- Listing page (`Cms:Articles:default`) displays page content + paginated list of all articles
- Detail page (`Cms:Article:default`) displays a single article with content blocks
- Pagination via URL query parameter (`?page=2`), fully SSR
- Category filter via URL query parameter (`?category=115`)
- Chronological sorting (newest first), with option for oldest first
- Article cards show: thumbnail image (`articleCard`), title, perex, date

## 1. SDK — Type Updates

### Article interface changes

File: `packages/sdk-elastic/src/indices/articles.ts`

New fields to add to `Article`:

```typescript
publishedDate: number
categories: ArticleCategory[]
authors: string[]
images: ArticleImages
```

New supporting types:

```typescript
interface ArticleCategory {
  id: string
  name: string
}

interface ArticleImages {
  articleCard: PimcoreImage | null
  openGraph: PimcoreImage | null
  socialSquare: PimcoreImage | null
}
```

### PimcoreImage update

File: `packages/sdk-elastic/src/types.ts`

Add field:

```typescript
copyright: string
```

## 2. SDK — New Query Methods

### `articles.findAll()`

```typescript
interface ArticleListingParams {
  page?: number        // default 1
  perPage?: number     // default 10
  categoryId?: string  // filter by category ID
  sort?: 'newest' | 'oldest'  // default 'newest'
}

interface ArticleListingResult {
  items: Article[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

async findAll(
  sitePrefix: string,
  locale: string,
  params?: ArticleListingParams
): Promise<ArticleListingResult>
```

ES query: `bool` filter on `published: true`, optional `term: { "categories.id": categoryId }`, sort on `publishedDate` desc/asc, `from`/`size` for pagination. Uses `hits.total.value` for total count.

### `articles.getCategories()`

```typescript
async getCategories(
  sitePrefix: string,
  locale: string
): Promise<ArticleCategory[]>
```

Uses ES `terms` aggregation on `categories.id` field with sub-aggregation on `categories.name` to return unique categories from all published articles.

## 3. Data Fetching

File: `apps/web/src/lib/data-fetching.ts`

New functions, both wrapped in `React.cache()`:

```typescript
export const fetchArticleListing = cache(
  async (sitePrefix: string, locale: string, params?: ArticleListingParams) => {
    const es = getElasticClient()
    return es.articles.findAll(sitePrefix, locale, params)
  }
)

export const fetchArticleCategories = cache(
  async (sitePrefix: string, locale: string) => {
    const es = getElasticClient()
    return es.articles.getCategories(sitePrefix, locale)
  }
)
```

Existing `fetchPageData` remains unchanged.

## 4. Template Props Update

File: `apps/web/src/lib/types.ts`

Add optional `searchParams` to `TemplateProps`:

```typescript
interface TemplateProps {
  data: Page | Article
  route: RouteInfo
  locale: string
  sitePrefix: string
  searchParams?: Record<string, string | string[] | undefined>
}
```

File: `apps/web/src/app/[[...path]]/page.tsx`

Pass `searchParams` from the page component into the resolved template component.

## 5. Listing Template — `Cms/Articles/Default.tsx`

File: `apps/web/src/core/templates/Cms/Articles/Default.tsx`

Extends existing template. Layout:

```
Breadcrumbs
H1 (page.title)
Editables (page.editables)
────────────────────────
Category filter (links)
────────────────────────
Article cards (3-col grid, responsive: 1 mobile, 2 tablet)
────────────────────────
Pagination (« 1 2 3 ... »)
```

- Server component, reads `searchParams` to determine page/category
- Calls `fetchArticleListing()` and `fetchArticleCategories()`
- Category filter renders as `<a>` links with `?category={id}`, active category highlighted, "Vše" link to reset
- Pagination renders as `<a>` links — fully SSR, no client JS

## 6. Detail Template — `Cms/Article/Default.tsx` (new)

File: `apps/web/src/core/templates/Cms/Article/Default.tsx`

Layout:

```
Breadcrumbs
Categories (badge links → listing with filter)
H1 (article.name)
Date (publishedDate, formatted by locale)
Perex (if present)
────────────────────────
Content blocks (BlockRenderer)
```

- Server component, data type = `Article`
- Category badges link back to listing page with `?category={id}`
- Date formatted using `Intl.DateTimeFormat` with the current locale

## 7. UI Components (new)

All in `apps/web/src/core/components/`:

### `ArticleCard`

Card component for listing: `articleCard` image (via `PimcoreImage` component), article title, perex (truncated), formatted date. Wrapped in `<a>` linking to article detail.

### `Pagination`

Generic pagination component. Receives `page`, `totalPages`, and a base URL builder function. Renders prev/next + page number links. Handles edge cases (single page = hidden, ellipsis for many pages).

### `CategoryFilter`

Renders list of category links. Receives categories array, active category ID, and base path. Includes "Vše" reset link.

## 8. What Does NOT Change

- `middleware.ts` — route resolution unchanged
- `component-resolver.ts` — `Cms:Article:default` auto-resolves to `Cms/Article/Default.tsx` via existing convention
- Cache strategy — stays with `React.cache()`, no `unstable_cache`
- `fetchPageData` — unchanged, continues to fetch single Page/Article by ID
