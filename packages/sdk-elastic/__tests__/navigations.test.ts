import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationsIndex } from '../src/indices/navigations';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('NavigationsIndex', () => {
  let navigationsIndex: NavigationsIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    navigationsIndex = new NavigationsIndex(mockClient as unknown as ElasticClient);
  });

  describe('getByName', () => {
    it('searches non-localized index by menuDocumentName', async () => {
      const mockNav = {
        id: '1',
        menuDocumentName: 'main-menu',
        modificationDate: 1000000,
        root: {
          id: '1',
          path: '/',
          label: 'Home',
          href: '/',
          documentType: 'page',
          children: [],
        },
      };
      mockClient.searchOne.mockResolvedValueOnce(mockNav);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'main-menu');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_navigations', {
        query: {
          term: { menuDocumentName: 'main-menu' },
        },
      });
      expect(result).toEqual(mockNav);
    });

    it('returns null when navigation not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'footer-menu');

      expect(result).toBeNull();
    });

    it('handles nested NavigationNode children recursively', async () => {
      const mockNav = {
        id: '1',
        menuDocumentName: 'main-menu',
        modificationDate: 1000000,
        root: {
          id: '1',
          path: '/',
          label: 'Home',
          href: '/',
          documentType: 'page',
          children: [
            {
              id: '2',
              path: '/about',
              label: 'About',
              href: '/about',
              documentType: 'page',
              children: [],
            },
          ],
        },
      };
      mockClient.searchOne.mockResolvedValueOnce(mockNav);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'main-menu');

      expect(result?.root.children).toHaveLength(1);
      expect(result?.root.children[0].path).toBe('/about');
    });
  });
});
