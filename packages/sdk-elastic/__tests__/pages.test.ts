import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PagesIndex } from '../src/indices/pages';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('PagesIndex', () => {
  let pagesIndex: PagesIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    pagesIndex = new PagesIndex(mockClient as unknown as ElasticClient);
  });

  describe('findById', () => {
    it('searches the correct localized index by id', async () => {
      const mockPage = {
        id: '42',
        title: 'Test Page',
        path: '/test',
        locale: 'cs',
        published: true,
      };
      mockClient.searchOne.mockResolvedValueOnce(mockPage);

      const result = await pagesIndex.findById('skeleton_localhost', 'cs', '42');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_pages_cs', {
        query: {
          term: { id: '42' },
        },
      });
      expect(result).toEqual(mockPage);
    });

    it('returns null when page not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await pagesIndex.findById('skeleton_localhost', 'en', '999');

      expect(result).toBeNull();
    });
  });

  describe('findByPath', () => {
    it('searches with path and published filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      await pagesIndex.findByPath('skeleton_localhost', 'en', '/home');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_pages_en', {
        query: {
          bool: {
            must: [
              { term: { path: '/home' } },
              { term: { published: true } },
            ],
          },
        },
      });
    });
  });
});
