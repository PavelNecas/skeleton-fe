import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticlesIndex } from '../src/indices/articles';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('ArticlesIndex', () => {
  let articlesIndex: ArticlesIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    articlesIndex = new ArticlesIndex(mockClient as unknown as ElasticClient);
  });

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
      };
      mockClient.searchOne.mockResolvedValueOnce(mockArticle);

      const result = await articlesIndex.findById('skeleton_localhost', 'cs', '10');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_articles_cs', {
        query: {
          term: { id: '10' },
        },
      });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findBySlug', () => {
    it('searches with slug and published filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      await articlesIndex.findBySlug('skeleton_localhost', 'en', 'my-article');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_articles_en', {
        query: {
          bool: {
            must: [
              { term: { slug: 'my-article' } },
              { term: { published: true } },
            ],
          },
        },
      });
    });

    it('returns null when article not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await articlesIndex.findBySlug('skeleton_localhost', 'cs', 'not-found');

      expect(result).toBeNull();
    });
  });
});
