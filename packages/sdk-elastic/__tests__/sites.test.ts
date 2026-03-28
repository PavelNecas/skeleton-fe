import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SitesIndex } from '../src/indices/sites';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('SitesIndex', () => {
  let sitesIndex: SitesIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    sitesIndex = new SitesIndex(mockClient as unknown as ElasticClient);
  });

  describe('findByDomain', () => {
    it('searches correct index by mainDomain', async () => {
      const mockSite = {
        id: 1,
        domains: 'skeleton.localhost',
        rootId: 1,
        rootPath: '/',
        mainDomain: 'skeleton.localhost',
        errorDocument: '/error',
        localizedErrorDocuments: [],
        redirectToMainDomain: false,
        modificationDate: 1000000,
        creationDate: 1000000,
      };
      mockClient.searchOne.mockResolvedValueOnce(mockSite);

      const result = await sitesIndex.findByDomain('skeleton_localhost', 'skeleton.localhost');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_sites', {
        query: {
          term: { mainDomain: 'skeleton.localhost' },
        },
      });
      expect(result).toEqual(mockSite);
    });

    it('returns null when site not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await sitesIndex.findByDomain('skeleton_localhost', 'unknown.com');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('retrieves all sites with match_all query', async () => {
      const mockSites = [
        { id: 1, mainDomain: 'skeleton.localhost' },
        { id: 2, mainDomain: 'second-site.com' },
      ];
      mockClient.search.mockResolvedValueOnce(mockSites);

      const result = await sitesIndex.getAll('skeleton_localhost');

      expect(mockClient.search).toHaveBeenCalledWith('skeleton_localhost_sites', {
        query: { match_all: {} },
      });
      expect(result).toHaveLength(2);
    });
  });
});
