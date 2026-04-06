# Article Listing & Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add article listing with pagination/category filtering and article detail templates, updating the SDK to match current ES data.

**Architecture:** Extend `ElasticClient` with a `searchWithTotal` method. Update `Article` type and add `findAll`/`getCategories` to `ArticlesIndex`. Pass `searchParams` through `page.tsx` into templates. Build listing and detail templates as server components.

**Tech Stack:** Next.js App Router (server components), Elasticsearch queries, Tailwind CSS, Vitest

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `packages/sdk-elastic/src/types.ts` | Add `copyright` to `PimcoreImage` |
| Modify | `packages/sdk-elastic/src/indices/articles.ts` | Add new fields, `ArticleCategory`, `ArticleImages`, `ArticleListingParams`, `ArticleListingResult`, `findAll()`, `getCategories()` |
| Modify | `packages/sdk-elastic/src/client.ts` | Add `searchWithTotal()` method |
| Modify | `packages/sdk-elastic/src/index.ts` | Export new types |
| Modify | `packages/sdk-elastic/__tests__/client.test.ts` | Test `searchWithTotal()` |
| Modify | `packages/sdk-elastic/__tests__/articles.test.ts` | Test `findAll()`, `getCategories()` |
| Modify | `apps/web/src/lib/types.ts` | Add `searchParams` to `TemplateProps` |
| Modify | `apps/web/src/lib/data-fetching.ts` | Add `fetchArticleListing()`, `fetchArticleCategories()` |
| Modify | `apps/web/src/app/[[...path]]/page.tsx` | Pass `searchParams` to template |
| Create | `apps/web/src/core/components/article/ArticleCard.tsx` | Article card for listing |
| Create | `apps/web/src/core/components/article/__tests__/ArticleCard.test.tsx` | ArticleCard tests |
| Create | `apps/web/src/core/components/shared/Pagination.tsx` | Generic pagination links |
| Create | `apps/web/src/core/components/shared/__tests__/Pagination.test.tsx` | Pagination tests |
| Create | `apps/web/src/core/components/article/CategoryFilter.tsx` | Category filter links |
| Create | `apps/web/src/core/components/article/__tests__/CategoryFilter.test.tsx` | CategoryFilter tests |
| Modify | `apps/web/src/core/templates/Cms/Articles/Default.tsx` | Add listing with pagination + category filter |
| Create | `apps/web/src/core/templates/Cms/Article/Default.tsx` | Article detail template |

---

### Task 1: Add `searchWithTotal` to ElasticClient

**Files:**
- Modify: `packages/sdk-elastic/src/client.ts`
- Modify: `packages/sdk-elastic/__tests__/client.test.ts`

The current `search()` discards `hits.total`. We need a method that returns both items and total count for pagination.

- [ ] **Step 1: Write the failing test for `searchWithTotal`**

Add this test block after the existing `searchOne` describe block in `packages/sdk-elastic/__tests__/client.test.ts`:

```typescript
describe('searchWithTotal', () => {
  it('returns items and total count', async () => {
    const { Client } = await import('@elastic/elasticsearch');
    const mockEsClient = vi.mocked(Client).mock.results[0].value;
    mockEsClient.search.mockResolvedValueOnce({
      hits: {
        total: { value: 42, relation: 'eq' },
        hits: [
          { _source: { id: '1' } },
          { _source: { id: '2' } },
        ],
      },
    });

    const result = await client.searchWithTotal<{ id: string }>('test_index', {
      query: { match_all: {} },
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({ id: '1' });
    expect(result.total).toBe(42);
  });

  it('returns zero total and empty items when no hits', async () => {
    const { Client } = await import('@elastic/elasticsearch');
    const mockEsClient = vi.mocked(Client).mock.results[0].value;
    mockEsClient.search.mockResolvedValueOnce({
      hits: {
        total: { value: 0, relation: 'eq' },
        hits: [],
      },
    });

    const result = await client.searchWithTotal('test_index', {
      query: { match_all: {} },
    });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/sdk-elastic && pnpm vitest run __tests__/client.test.ts`
Expected: FAIL — `client.searchWithTotal is not a function`

- [ ] **Step 3: Implement `searchWithTotal`**

Add this interface and method to `packages/sdk-elastic/src/client.ts`.

Add the interface before the `ElasticClient` class:

```typescript
export interface SearchWithTotalResult<T> {
  items: T[]
  total: number
}
```

Add this method to the `ElasticClient` class, after the existing `searchOne` method:

```typescript
async searchWithTotal<T>(index: string, query: object): Promise<SearchWithTotalResult<T>> {
  const response = await this.esClient.search<T>({
    index,
    ...query,
  })

  const total =
    typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value ?? 0

  return {
    items: response.hits.hits.map((hit) => hit._source as T),
    total,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/sdk-elastic && pnpm vitest run __tests__/client.test.ts`
Expected: All PASS

- [ ] **Step 5: Export `SearchWithTotalResult` from index**

Add to `packages/sdk-elastic/src/index.ts`, in the Client section:

```typescript
export type { SearchWithTotalResult } from './client'
```

- [ ] **Step 6: Commit**

```bash
git add packages/sdk-elastic/src/client.ts packages/sdk-elastic/src/index.ts packages/sdk-elastic/__tests__/client.test.ts
git commit -m "feat(sdk): add searchWithTotal method to ElasticClient"
```

---

### Task 2: Update `PimcoreImage` type — add `copyright`

**Files:**
- Modify: `packages/sdk-elastic/src/types.ts`

- [ ] **Step 1: Add `copyright` field to `PimcoreImage`**

In `packages/sdk-elastic/src/types.ts`, add `copyright` after the `height` field in the `PimcoreImage` interface:

```typescript
export interface PimcoreImage {
  src: string
  alt: string
  title: string
  sources: ImageSource[]
  width: number
  height: number
  copyright: string
}
```

- [ ] **Step 2: Run type-check to verify no breakage**

Run: `pnpm type-check`
Expected: PASS (copyright is a new field, existing code doesn't reference it so no errors)

- [ ] **Step 3: Commit**

```bash
git add packages/sdk-elastic/src/types.ts
git commit -m "feat(sdk): add copyright field to PimcoreImage"
```

---

### Task 3: Update `Article` type and add listing methods

**Files:**
- Modify: `packages/sdk-elastic/src/indices/articles.ts`
- Modify: `packages/sdk-elastic/src/index.ts`
- Modify: `packages/sdk-elastic/__tests__/articles.test.ts`

- [ ] **Step 1: Write failing tests for `findAll` and `getCategories`**

Replace the entire content of `packages/sdk-elastic/__tests__/articles.test.ts` with:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ArticlesIndex } from '../src/indices/articles'
import type { ElasticClient } from '../src/client'

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
  searchWithTotal: vi.fn(),
}

describe('ArticlesIndex', () => {
  let articlesIndex: ArticlesIndex

  beforeEach(() => {
    vi.clearAllMocks()
    articlesIndex = new ArticlesIndex(mockClient as unknown as ElasticClient)
  })

  describe('findById', () => {
    it('searches the correct localized index by id', async () => {
      const mockArticle = {
        id: '10',
        name: 'Test Article',
        slug: 'test-article',
        locale: 'cs',
        published: true,
        contentBlocks: [],
        properties: [],
        categories: [],
        authors: [],
        images: {},
      }
      mockClient.searchOne.mockResolvedValueOnce(mockArticle)

      const result = await articlesIndex.findById('skeleton_localhost', 'cs', '10')

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_articles_cs', {
        query: {
          term: { id: '10' },
        },
      })
      expect(result).toEqual(mockArticle)
    })
  })

  describe('findBySlug', () => {
    it('searches with slug and published filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null)

      await articlesIndex.findBySlug('skeleton_localhost', 'en', 'my-article')

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_articles_en', {
        query: {
          bool: {
            must: [{ term: { slug: 'my-article' } }, { term: { published: true } }],
          },
        },
      })
    })

    it('returns null when article not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null)

      const result = await articlesIndex.findBySlug('skeleton_localhost', 'cs', 'not-found')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('returns paginated articles sorted by publishedDate desc by default', async () => {
      mockClient.searchWithTotal.mockResolvedValueOnce({
        items: [{ id: '1', name: 'Article 1' }],
        total: 15,
      })

      const result = await articlesIndex.findAll('skeleton_localhost', 'cs')

      expect(mockClient.searchWithTotal).toHaveBeenCalledWith('skeleton_localhost_articles_cs', {
        query: {
          bool: {
            filter: [{ term: { published: true } }],
          },
        },
        sort: [{ publishedDate: 'desc' }],
        from: 0,
        size: 10,
      })
      expect(result).toEqual({
        items: [{ id: '1', name: 'Article 1' }],
        total: 15,
        page: 1,
        perPage: 10,
        totalPages: 2,
      })
    })

    it('filters by categoryId when provided', async () => {
      mockClient.searchWithTotal.mockResolvedValueOnce({ items: [], total: 0 })

      await articlesIndex.findAll('skeleton_localhost', 'cs', { categoryId: '115' })

      expect(mockClient.searchWithTotal).toHaveBeenCalledWith('skeleton_localhost_articles_cs', {
        query: {
          bool: {
            filter: [
              { term: { published: true } },
              { term: { 'categories.id': '115' } },
            ],
          },
        },
        sort: [{ publishedDate: 'desc' }],
        from: 0,
        size: 10,
      })
    })

    it('paginates correctly with page and perPage', async () => {
      mockClient.searchWithTotal.mockResolvedValueOnce({ items: [], total: 50 })

      const result = await articlesIndex.findAll('skeleton_localhost', 'cs', {
        page: 3,
        perPage: 5,
      })

      expect(mockClient.searchWithTotal).toHaveBeenCalledWith(
        'skeleton_localhost_articles_cs',
        expect.objectContaining({ from: 10, size: 5 }),
      )
      expect(result.page).toBe(3)
      expect(result.perPage).toBe(5)
      expect(result.totalPages).toBe(10)
    })

    it('sorts ascending when sort is oldest', async () => {
      mockClient.searchWithTotal.mockResolvedValueOnce({ items: [], total: 0 })

      await articlesIndex.findAll('skeleton_localhost', 'cs', { sort: 'oldest' })

      expect(mockClient.searchWithTotal).toHaveBeenCalledWith(
        'skeleton_localhost_articles_cs',
        expect.objectContaining({ sort: [{ publishedDate: 'asc' }] }),
      )
    })
  })

  describe('getCategories', () => {
    it('returns unique categories from aggregation', async () => {
      mockClient.search.mockResolvedValueOnce([])
      // We need to access the raw ES client for aggregations, so we mock at a different level.
      // Actually, getCategories needs to call searchWithTotal or a raw search.
      // Let's use a dedicated approach: mock the underlying search to return aggregation results.
    })
  })
})
```

Note: The `getCategories` test is incomplete — we need to decide the approach first. The aggregation query returns data in `response.aggregations`, not in `hits`. The simplest approach is to add a `searchRaw` method to `ElasticClient`, but that adds scope. Instead, `getCategories` can use the existing `search` method with a `size: 0` query and handle aggregations by adding a new `aggregate` method. However, the simplest approach that works: **fetch all published articles and extract unique categories client-side**. With a small number of articles this is fine, and avoids adding a new ElasticClient method.

Let's simplify: `getCategories` calls `findAll` with a large `perPage` and extracts unique categories. This is simple and correct for a skeleton project.

Replace the `getCategories` describe block:

```typescript
describe('getCategories', () => {
  it('returns unique categories extracted from all articles', async () => {
    mockClient.searchWithTotal.mockResolvedValueOnce({
      items: [
        { id: '1', categories: [{ id: '10', name: 'Tech' }] },
        { id: '2', categories: [{ id: '10', name: 'Tech' }, { id: '20', name: 'Sport' }] },
        { id: '3', categories: [] },
      ],
      total: 3,
    })

    const result = await articlesIndex.getCategories('skeleton_localhost', 'cs')

    expect(result).toEqual([
      { id: '10', name: 'Tech' },
      { id: '20', name: 'Sport' },
    ])
  })

  it('returns empty array when no articles have categories', async () => {
    mockClient.searchWithTotal.mockResolvedValueOnce({
      items: [{ id: '1', categories: [] }],
      total: 1,
    })

    const result = await articlesIndex.getCategories('skeleton_localhost', 'cs')

    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/sdk-elastic && pnpm vitest run __tests__/articles.test.ts`
Expected: FAIL — `findAll` and `getCategories` methods don't exist

- [ ] **Step 3: Update Article type and implement `findAll` and `getCategories`**

Replace the entire content of `packages/sdk-elastic/src/indices/articles.ts` with:

```typescript
import type { ElasticClient } from '../client'
import type { ContentBlock, PimcoreImage, Property } from '../types'

export interface ArticleCategory {
  id: string
  name: string
}

export interface ArticleImages {
  articleCard: PimcoreImage | null
  openGraph: PimcoreImage | null
  socialSquare: PimcoreImage | null
}

export interface Article {
  id: string
  name: string | null
  metaDescription: string | null
  description: string | null
  perex: string | null
  summary: string | null
  locale: string
  published: boolean
  path: string
  slug: string
  frontendTemplate: string | null
  modificationDate: number
  creationDate: number
  publishedDate: number
  properties: Property[]
  contentBlocks: ContentBlock[]
  categories: ArticleCategory[]
  authors: string[]
  images: ArticleImages
}

export interface ArticleListingParams {
  page?: number
  perPage?: number
  categoryId?: string
  sort?: 'newest' | 'oldest'
}

export interface ArticleListingResult {
  items: Article[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export class ArticlesIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_articles_${locale}`
  }

  async findById(sitePrefix: string, locale: string, id: string): Promise<Article | null> {
    return this.client.searchOne<Article>(this.indexName(sitePrefix, locale), {
      query: {
        term: { id },
      },
    })
  }

  async findBySlug(sitePrefix: string, locale: string, slug: string): Promise<Article | null> {
    return this.client.searchOne<Article>(this.indexName(sitePrefix, locale), {
      query: {
        bool: {
          must: [{ term: { slug } }, { term: { published: true } }],
        },
      },
    })
  }

  async findAll(
    sitePrefix: string,
    locale: string,
    params?: ArticleListingParams,
  ): Promise<ArticleListingResult> {
    const page = params?.page ?? 1
    const perPage = params?.perPage ?? 10
    const sortDirection = params?.sort === 'oldest' ? 'asc' : 'desc'

    const filter: object[] = [{ term: { published: true } }]
    if (params?.categoryId) {
      filter.push({ term: { 'categories.id': params.categoryId } })
    }

    const { items, total } = await this.client.searchWithTotal<Article>(
      this.indexName(sitePrefix, locale),
      {
        query: {
          bool: { filter },
        },
        sort: [{ publishedDate: sortDirection }],
        from: (page - 1) * perPage,
        size: perPage,
      },
    )

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async getCategories(
    sitePrefix: string,
    locale: string,
  ): Promise<ArticleCategory[]> {
    const { items } = await this.client.searchWithTotal<Article>(
      this.indexName(sitePrefix, locale),
      {
        query: { bool: { filter: [{ term: { published: true } }] } },
        sort: [{ publishedDate: 'desc' }],
        from: 0,
        size: 1000,
        _source: ['categories'],
      },
    )

    const seen = new Set<string>()
    const categories: ArticleCategory[] = []

    for (const article of items) {
      for (const cat of article.categories) {
        if (!seen.has(cat.id)) {
          seen.add(cat.id)
          categories.push(cat)
        }
      }
    }

    return categories
  }
}
```

- [ ] **Step 4: Export new types from index**

Add these exports to `packages/sdk-elastic/src/index.ts`, in the Articles section:

```typescript
export type {
  Article,
  ArticleCategory,
  ArticleImages,
  ArticleListingParams,
  ArticleListingResult,
} from './indices/articles'
```

(Replace the existing `export type { Article } from './indices/articles'` line.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/sdk-elastic && pnpm vitest run __tests__/articles.test.ts`
Expected: All PASS

- [ ] **Step 6: Run full type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/sdk-elastic/src/indices/articles.ts packages/sdk-elastic/src/index.ts packages/sdk-elastic/__tests__/articles.test.ts
git commit -m "feat(sdk): update Article type and add findAll/getCategories methods"
```

---

### Task 4: Update `TemplateProps` and pass `searchParams` to templates

**Files:**
- Modify: `apps/web/src/lib/types.ts`
- Modify: `apps/web/src/app/[[...path]]/page.tsx`

- [ ] **Step 1: Add `searchParams` to `TemplateProps`**

In `apps/web/src/lib/types.ts`, update the `TemplateProps` interface:

```typescript
export interface TemplateProps {
  data: Page | Article
  route: RouteInfo
  locale: string
  sitePrefix: string
  searchParams?: Record<string, string | string[] | undefined>
}
```

- [ ] **Step 2: Update `page.tsx` to accept and pass `searchParams`**

In `apps/web/src/app/[[...path]]/page.tsx`:

1. Add `searchParams` to the function signature. In Next.js App Router, the catch-all page receives `searchParams` as a prop:

Change the function signature from:

```typescript
export default async function CatchAllPage() {
```

to:

```typescript
export default async function CatchAllPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
```

2. Await searchParams and pass it to the template. After the existing `const [data, navigations, siteConfig] = await Promise.all([...])` block, add:

```typescript
const resolvedSearchParams = await searchParams
```

3. Update the `<Template>` render to pass `searchParams`:

Change:

```tsx
<Template data={data} route={routeInfo} locale={locale} sitePrefix={sitePrefix} />
```

to:

```tsx
<Template data={data} route={routeInfo} locale={locale} sitePrefix={sitePrefix} searchParams={resolvedSearchParams} />
```

- [ ] **Step 3: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/types.ts apps/web/src/app/[[...path]]/page.tsx
git commit -m "feat: pass searchParams from page.tsx to templates"
```

---

### Task 5: Add `fetchArticleListing` and `fetchArticleCategories`

**Files:**
- Modify: `apps/web/src/lib/data-fetching.ts`

- [ ] **Step 1: Add the two fetch functions**

Add these imports at the top of `apps/web/src/lib/data-fetching.ts`:

```typescript
import type { ArticleCategory, ArticleListingParams, ArticleListingResult } from '@skeleton-fe/sdk-elastic'
```

Add these functions at the bottom of the file:

```typescript
export const fetchArticleListing = cache(
  async (
    sitePrefix: string,
    locale: string,
    params?: ArticleListingParams,
  ): Promise<ArticleListingResult> => {
    const es = getElasticClient()
    return es.articles.findAll(sitePrefix, locale, params)
  },
)

export const fetchArticleCategories = cache(
  async (sitePrefix: string, locale: string): Promise<ArticleCategory[]> => {
    const es = getElasticClient()
    return es.articles.getCategories(sitePrefix, locale)
  },
)
```

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/data-fetching.ts
git commit -m "feat: add fetchArticleListing and fetchArticleCategories"
```

---

### Task 6: Create `Pagination` component

**Files:**
- Create: `apps/web/src/core/components/shared/Pagination.tsx`
- Create: `apps/web/src/core/components/shared/__tests__/Pagination.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/core/components/shared/__tests__/Pagination.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} buildUrl={(p) => `?page=${p}`} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page links for multiple pages', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThanOrEqual(3)
  })

  it('marks the current page as active (not a link)', () => {
    const { getByText } = render(
      <Pagination page={2} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const currentPage = getByText('2')
    expect(currentPage.tagName).not.toBe('A')
  })

  it('renders previous link when not on first page', () => {
    const { container } = render(
      <Pagination page={2} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const prevLink = container.querySelector('a[aria-label="Previous page"]')
    expect(prevLink).not.toBeNull()
    expect(prevLink?.getAttribute('href')).toBe('?page=1')
  })

  it('does not render previous link on first page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const prevLink = container.querySelector('a[aria-label="Previous page"]')
    expect(prevLink).toBeNull()
  })

  it('renders next link when not on last page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const nextLink = container.querySelector('a[aria-label="Next page"]')
    expect(nextLink).not.toBeNull()
    expect(nextLink?.getAttribute('href')).toBe('?page=2')
  })

  it('does not render next link on last page', () => {
    const { container } = render(
      <Pagination page={3} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const nextLink = container.querySelector('a[aria-label="Next page"]')
    expect(nextLink).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/core/components/shared/__tests__/Pagination.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `Pagination` component**

Create `apps/web/src/core/components/shared/Pagination.tsx`:

```tsx
interface PaginationProps {
  page: number
  totalPages: number
  buildUrl: (page: number) => string
}

export function Pagination({ page, totalPages, buildUrl }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = generatePageNumbers(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {page > 1 && (
        <a
          href={buildUrl(page - 1)}
          aria-label="Previous page"
          className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          &laquo;
        </a>
      )}

      {pages.map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">
            &hellip;
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
          >
            {p}
          </span>
        ) : (
          <a
            key={p}
            href={buildUrl(p)}
            className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            {p}
          </a>
        ),
      )}

      {page < totalPages && (
        <a
          href={buildUrl(page + 1)}
          aria-label="Next page"
          className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          &raquo;
        </a>
      )}
    </nav>
  )
}

function generatePageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = [1]

  if (current > 3) {
    pages.push(null)
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(null)
  }

  pages.push(total)

  return pages
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/core/components/shared/__tests__/Pagination.test.tsx`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/core/components/shared/Pagination.tsx apps/web/src/core/components/shared/__tests__/Pagination.test.tsx
git commit -m "feat: add Pagination component"
```

---

### Task 7: Create `CategoryFilter` component

**Files:**
- Create: `apps/web/src/core/components/article/CategoryFilter.tsx`
- Create: `apps/web/src/core/components/article/__tests__/CategoryFilter.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/core/components/article/__tests__/CategoryFilter.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CategoryFilter } from '../CategoryFilter'

const categories = [
  { id: '10', name: 'Tech' },
  { id: '20', name: 'Sport' },
]

describe('CategoryFilter', () => {
  it('renders all categories plus a reset link', () => {
    const { container } = render(
      <CategoryFilter categories={categories} activeCategoryId={undefined} basePath="/articles" />,
    )
    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(3) // "Vše" + 2 categories
  })

  it('highlights the active category', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId="10" basePath="/articles" />,
    )
    const techLink = getByText('Tech')
    expect(techLink.className).toContain('bg-gray-900')
  })

  it('highlights "Vše" when no category is active', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId={undefined} basePath="/articles" />,
    )
    const allLink = getByText('Vše')
    expect(allLink.className).toContain('bg-gray-900')
  })

  it('links categories with ?category={id}', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId={undefined} basePath="/articles" />,
    )
    const techLink = getByText('Tech')
    expect(techLink.getAttribute('href')).toBe('/articles?category=10')
  })

  it('"Vše" links to the base path without query', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId="10" basePath="/articles" />,
    )
    const allLink = getByText('Vše')
    expect(allLink.getAttribute('href')).toBe('/articles')
  })

  it('renders nothing when categories is empty', () => {
    const { container } = render(
      <CategoryFilter categories={[]} activeCategoryId={undefined} basePath="/articles" />,
    )
    expect(container.innerHTML).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/core/components/article/__tests__/CategoryFilter.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `CategoryFilter` component**

Create `apps/web/src/core/components/article/CategoryFilter.tsx`:

```tsx
import type { ArticleCategory } from '@skeleton-fe/sdk-elastic'

interface CategoryFilterProps {
  categories: ArticleCategory[]
  activeCategoryId: string | undefined
  basePath: string
}

export function CategoryFilter({ categories, activeCategoryId, basePath }: CategoryFilterProps) {
  if (categories.length === 0) {
    return null
  }

  const activeClass = 'rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white'
  const inactiveClass =
    'rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100'

  return (
    <nav aria-label="Category filter" className="flex flex-wrap gap-2">
      <a href={basePath} className={activeCategoryId === undefined ? activeClass : inactiveClass}>
        Vše
      </a>
      {categories.map((cat) => (
        <a
          key={cat.id}
          href={`${basePath}?category=${cat.id}`}
          className={activeCategoryId === cat.id ? activeClass : inactiveClass}
        >
          {cat.name}
        </a>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/core/components/article/__tests__/CategoryFilter.test.tsx`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/core/components/article/CategoryFilter.tsx apps/web/src/core/components/article/__tests__/CategoryFilter.test.tsx
git commit -m "feat: add CategoryFilter component"
```

---

### Task 8: Create `ArticleCard` component

**Files:**
- Create: `apps/web/src/core/components/article/ArticleCard.tsx`
- Create: `apps/web/src/core/components/article/__tests__/ArticleCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/core/components/article/__tests__/ArticleCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ArticleCard } from '../ArticleCard'
import type { Article } from '@skeleton-fe/sdk-elastic'

vi.mock('@/core/components/PimcoreImage', () => ({
  PimcoreImage: ({ image }: { image: { alt: string } }) => (
    <img alt={image.alt} data-testid="pimcore-image" />
  ),
}))

const baseArticle: Article = {
  id: '1',
  name: 'Test Article',
  metaDescription: null,
  description: null,
  perex: 'This is a test perex',
  summary: null,
  locale: 'cs',
  published: true,
  path: '/Cms/Articles/test-article',
  slug: '/test-article',
  frontendTemplate: null,
  modificationDate: 1700000000,
  creationDate: 1700000000,
  publishedDate: 1700000000,
  properties: [],
  contentBlocks: [],
  categories: [{ id: '10', name: 'Tech' }],
  authors: [],
  images: {
    articleCard: {
      src: '/img/test.jpg',
      alt: 'Test',
      title: '',
      sources: [],
      width: 600,
      height: 400,
      copyright: '',
    },
    openGraph: null,
    socialSquare: null,
  },
}

describe('ArticleCard', () => {
  it('renders article title', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} locale="cs" />)
    expect(getByText('Test Article')).not.toBeNull()
  })

  it('renders perex', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} locale="cs" />)
    expect(getByText('This is a test perex')).not.toBeNull()
  })

  it('renders article card image when available', () => {
    const { container } = render(<ArticleCard article={baseArticle} locale="cs" />)
    expect(container.querySelector('[data-testid="pimcore-image"]')).not.toBeNull()
  })

  it('does not render image when articleCard is null', () => {
    const article = {
      ...baseArticle,
      images: { articleCard: null, openGraph: null, socialSquare: null },
    }
    const { container } = render(<ArticleCard article={article} locale="cs" />)
    expect(container.querySelector('[data-testid="pimcore-image"]')).toBeNull()
  })

  it('links to the article slug', () => {
    const { container } = render(<ArticleCard article={baseArticle} locale="cs" />)
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/test-article')
  })

  it('renders formatted date', () => {
    const { container } = render(<ArticleCard article={baseArticle} locale="cs" />)
    // publishedDate 1700000000 = 2023-11-14 in UTC
    expect(container.textContent).toContain('2023')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/core/components/article/__tests__/ArticleCard.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `ArticleCard` component**

Create `apps/web/src/core/components/article/ArticleCard.tsx`:

```tsx
import type { Article } from '@skeleton-fe/sdk-elastic'

import { PimcoreImage } from '@/core/components/PimcoreImage'

interface ArticleCardProps {
  article: Article
  locale: string
}

export function ArticleCard({ article, locale }: ArticleCardProps) {
  const date = new Date((article.publishedDate || article.creationDate) * 1000)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <a href={article.slug} className="block">
        {article.images.articleCard && (
          <PimcoreImage
            image={article.images.articleCard}
            className="aspect-[3/2] w-full object-cover"
          />
        )}
        <div className="p-4">
          <time dateTime={date.toISOString()} className="text-sm text-gray-500">
            {formattedDate}
          </time>
          {article.name && (
            <h2 className="mt-1 text-lg font-semibold leading-tight text-gray-900">
              {article.name}
            </h2>
          )}
          {article.perex && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{article.perex}</p>}
        </div>
      </a>
    </article>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/core/components/article/__tests__/ArticleCard.test.tsx`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/core/components/article/ArticleCard.tsx apps/web/src/core/components/article/__tests__/ArticleCard.test.tsx
git commit -m "feat: add ArticleCard component"
```

---

### Task 9: Update listing template `Cms/Articles/Default.tsx`

**Files:**
- Modify: `apps/web/src/core/templates/Cms/Articles/Default.tsx`

- [ ] **Step 1: Replace listing template with full implementation**

Replace the entire content of `apps/web/src/core/templates/Cms/Articles/Default.tsx`:

```tsx
import type { Page } from '@skeleton-fe/sdk-elastic'

import { ArticleCard } from '@/core/components/article/ArticleCard'
import { CategoryFilter } from '@/core/components/article/CategoryFilter'
import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/core/components/shared/Breadcrumbs'
import { Pagination } from '@/core/components/shared/Pagination'
import { fetchArticleCategories, fetchArticleListing } from '@/lib/data-fetching'
import type { TemplateProps } from '@/lib/types'

export default async function ContentArticles({
  data,
  locale,
  sitePrefix,
  searchParams,
}: TemplateProps) {
  const page = data as Page
  const breadcrumbs = buildBreadcrumbsFromPath(page.path)

  const currentPage = Number(searchParams?.page) || 1
  const categoryId = typeof searchParams?.category === 'string' ? searchParams.category : undefined

  const [listing, categories] = await Promise.all([
    fetchArticleListing(sitePrefix, locale, { page: currentPage, categoryId }),
    fetchArticleCategories(sitePrefix, locale),
  ])

  const basePath = page.path.startsWith('/') ? page.path : `/${page.path}`

  function buildPaginationUrl(p: number): string {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (categoryId) params.set('category', categoryId)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </nav>

        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>

        {page.editables.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={page.editables} />
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-8">
            <CategoryFilter
              categories={categories}
              activeCategoryId={categoryId}
              basePath={basePath}
            />
          </div>
        )}

        {listing.items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listing.items.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-gray-500">Žádné články k zobrazení.</p>
        )}

        <div className="mt-8">
          <Pagination
            page={listing.page}
            totalPages={listing.totalPages}
            buildUrl={buildPaginationUrl}
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/core/templates/Cms/Articles/Default.tsx
git commit -m "feat: update Articles listing template with pagination and category filter"
```

---

### Task 10: Create article detail template `Cms/Article/Default.tsx`

**Files:**
- Create: `apps/web/src/core/templates/Cms/Article/Default.tsx`

- [ ] **Step 1: Create the detail template**

Create `apps/web/src/core/templates/Cms/Article/Default.tsx`:

```tsx
import type { Article } from '@skeleton-fe/sdk-elastic'

import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/core/components/shared/Breadcrumbs'
import type { TemplateProps } from '@/lib/types'

export default function ContentArticle({ data, locale }: TemplateProps) {
  const article = data as Article

  const breadcrumbs = buildBreadcrumbsFromPath(article.path)

  const date = new Date((article.publishedDate || article.creationDate) * 1000)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </nav>

        {article.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight">{article.name}</h1>

        <time dateTime={date.toISOString()} className="mt-2 block text-sm text-gray-500">
          {formattedDate}
        </time>

        {article.perex && (
          <p className="mt-4 text-lg text-gray-600">{article.perex}</p>
        )}

        {article.contentBlocks.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={article.contentBlocks} />
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/core/templates/Cms/Article/Default.tsx
git commit -m "feat: add Article detail template"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 2: Run full type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: All PASS

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: PASS
