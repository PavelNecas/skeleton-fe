import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutesIndex } from '../src/indices/routes';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('RoutesIndex', () => {
  let routesIndex: RoutesIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    routesIndex = new RoutesIndex(mockClient as unknown as ElasticClient);
  });

  describe('findByPath', () => {
    it('searches correct index with path, locale, and published filter', async () => {
      const mockRoute = {
        sourceId: 1,
        path: 'test',
        published: true,
        site: 'skeleton_localhost',
        locale: 'cs',
        aliases: [],
        sourceType: 'document',
        objectType: 'Page',
        controllerTemplate: 'default',
        uid: 'abc123',
        redirect: '',
        redirectCode: '',
        modificationDate: 1000000,
        creationDate: 1000000,
      };
      mockClient.searchOne.mockResolvedValueOnce(mockRoute);

      const result = await routesIndex.findByPath('skeleton_localhost', 'test', 'cs');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_routes', {
        query: {
          bool: {
            must: [
              { term: { path: 'test' } },
              { term: { locale: 'cs' } },
              { term: { published: true } },
            ],
          },
        },
      });
      expect(result).toEqual(mockRoute);
    });

    it('returns null when route not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await routesIndex.findByPath('skeleton_localhost', 'nonexistent', 'cs');

      expect(result).toBeNull();
    });
  });

  describe('findByAlias', () => {
    it('searches with nested alias query and locale filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      await routesIndex.findByAlias('skeleton_localhost', 'old-path', 'cs');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_routes', {
        query: {
          bool: {
            must: [
              { term: { locale: 'cs' } },
              {
                nested: {
                  path: 'aliases',
                  query: {
                    term: { 'aliases.path': 'old-path' },
                  },
                },
              },
            ],
          },
        },
      });
    });
  });

  describe('findTranslations', () => {
    it('searches by sourceId', async () => {
      const mockRoutes = [
        { sourceId: 42, path: 'test-cs', published: true },
        { sourceId: 42, path: 'test-en', published: true },
      ];
      mockClient.search.mockResolvedValueOnce(mockRoutes);

      const result = await routesIndex.findTranslations('skeleton_localhost', 42);

      expect(mockClient.search).toHaveBeenCalledWith('skeleton_localhost_routes', {
        query: {
          term: { sourceId: 42 },
        },
      });
      expect(result).toHaveLength(2);
    });
  });
});
