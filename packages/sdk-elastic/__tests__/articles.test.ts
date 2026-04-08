import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ArticlesIndex } from '../src/indices/articles'
import type { ElasticClient } from '../src/client'

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
  searchWithTotal: vi.fn(),
  aggregate: vi.fn(),
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
        path: '/test-article',
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

  describe('findByPath', () => {
    it('searches with path and published filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null)

      await articlesIndex.findByPath('skeleton_localhost', 'en', '/my-article')

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_articles_en', {
        query: {
          bool: {
            must: [{ term: { path: '/my-article' } }, { term: { published: true } }],
          },
        },
      })
    })

    it('returns null when article not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null)

      const result = await articlesIndex.findByPath('skeleton_localhost', 'cs', '/not-found')

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
              { term: { 'categories.id.keyword': '115' } },
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
    it('returns categories from ES aggregation buckets', async () => {
      mockClient.aggregate.mockResolvedValueOnce({
        category_ids: {
          buckets: [
            { key: '10', doc_count: 5, category_name: { buckets: [{ key: 'Tech', doc_count: 5 }] } },
            { key: '20', doc_count: 3, category_name: { buckets: [{ key: 'Sport', doc_count: 3 }] } },
          ],
        },
      })

      const result = await articlesIndex.getCategories('skeleton_localhost', 'cs')

      expect(mockClient.aggregate).toHaveBeenCalledWith('skeleton_localhost_articles_cs', {
        query: { bool: { filter: [{ term: { published: true } }] } },
        aggs: {
          category_ids: {
            terms: { field: 'categories.id.keyword', size: 1000 },
            aggs: {
              category_name: {
                terms: { field: 'categories.name.keyword', size: 1 },
              },
            },
          },
        },
      })
      expect(result).toEqual([
        { id: '10', name: 'Tech' },
        { id: '20', name: 'Sport' },
      ])
    })

    it('returns empty array when no category buckets', async () => {
      mockClient.aggregate.mockResolvedValueOnce({
        category_ids: { buckets: [] },
      })

      const result = await articlesIndex.getCategories('skeleton_localhost', 'cs')

      expect(result).toEqual([])
    })
  })
})
