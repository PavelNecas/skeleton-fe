import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationsIndex } from '../src/indices/navigations';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

const mockEsNavigation = {
  id: 'main',
  menuDocumentName: 'MAIN',
  modificationDate: 1000000,
  root: {
    documentId: 15,
    path: '/',
    documentType: 'page',
    navigationData: {
      name: 'Homepage',
      title: null,
      cssClass: null,
      target: null,
      anchor: null,
      parameters: null,
      exclude: false,
      relation: null,
      accesskey: null,
      tabindex: null,
    },
    children: [
      {
        documentId: 33,
        path: 'clanky',
        documentType: 'page',
        navigationData: {
          name: 'Články',
          title: null,
          cssClass: null,
          target: null,
          anchor: null,
          parameters: null,
          exclude: false,
          relation: null,
          accesskey: null,
          tabindex: null,
        },
        children: [],
      },
    ],
  },
};

describe('NavigationsIndex', () => {
  let navigationsIndex: NavigationsIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    navigationsIndex = new NavigationsIndex(mockClient as unknown as ElasticClient);
  });

  describe('getByName', () => {
    it('searches localized index by menuDocumentName', async () => {
      mockClient.searchOne.mockResolvedValueOnce(mockEsNavigation);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'cs', 'MAIN');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_navigations_cs', {
        query: {
          term: { menuDocumentName: 'MAIN' },
        },
      });
      expect(result).not.toBeNull();
      expect(result!.menuDocumentName).toBe('MAIN');
    });

    it('maps ES structure to NavigationNode', async () => {
      mockClient.searchOne.mockResolvedValueOnce(mockEsNavigation);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'cs', 'MAIN');

      expect(result!.root.id).toBe('15');
      expect(result!.root.label).toBe('Homepage');
      expect(result!.root.children[0].id).toBe('33');
      expect(result!.root.children[0].label).toBe('Články');
      expect(result!.root.children[0].href).toBe('/clanky');
    });

    it('returns null when navigation not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'cs', 'NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('fetches all navigations and returns record keyed by menuDocumentName', async () => {
      const footerEsNav = {
        id: 'footer',
        menuDocumentName: 'FOOTER',
        modificationDate: 1000000,
        root: {
          documentId: 37,
          path: 'footer',
          documentType: 'page',
          navigationData: {
            name: 'Footer',
            title: null,
            cssClass: null,
            target: null,
            anchor: null,
            parameters: null,
            exclude: false,
            relation: null,
            accesskey: null,
            tabindex: null,
          },
          children: [],
        },
      };
      mockClient.search.mockResolvedValueOnce([mockEsNavigation, footerEsNav]);

      const result = await navigationsIndex.getAll('skeleton_localhost', 'cs');

      expect(mockClient.search).toHaveBeenCalledWith('skeleton_localhost_navigations_cs', {
        query: { match_all: {} },
        size: 100,
      });
      expect(Object.keys(result)).toEqual(['MAIN', 'FOOTER']);
      expect(result['MAIN'].root.label).toBe('Homepage');
      expect(result['FOOTER'].root.label).toBe('Footer');
    });

    it('returns empty record when no navigations exist', async () => {
      mockClient.search.mockResolvedValueOnce([]);

      const result = await navigationsIndex.getAll('skeleton_localhost', 'cs');

      expect(result).toEqual({});
    });
  });

  describe('path normalization', () => {
    it('adds leading slash to flat paths in mapped nodes', async () => {
      mockClient.searchOne.mockResolvedValueOnce(mockEsNavigation);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'cs', 'MAIN');

      // "clanky" → "/clanky"
      expect(result!.root.children[0].href).toBe('/clanky');
    });

    it('preserves root path "/"', async () => {
      mockClient.searchOne.mockResolvedValueOnce(mockEsNavigation);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'cs', 'MAIN');

      expect(result!.root.href).toBe('/');
    });

    it('preserves http URLs and prepends https:// to www. URLs', async () => {
      const externalNavigation = {
        ...mockEsNavigation,
        root: {
          ...mockEsNavigation.root,
          children: [
            {
              documentId: 99,
              path: 'https://example.com',
              documentType: 'page',
              navigationData: {
                name: 'External',
                title: null,
                cssClass: null,
                target: '_blank',
                anchor: null,
                parameters: null,
                exclude: false,
                relation: null,
                accesskey: null,
                tabindex: null,
              },
              children: [],
            },
            {
              documentId: 100,
              path: 'www.example.com',
              documentType: 'page',
              navigationData: {
                name: 'WWW External',
                title: null,
                cssClass: null,
                target: null,
                anchor: null,
                parameters: null,
                exclude: false,
                relation: null,
                accesskey: null,
                tabindex: null,
              },
              children: [],
            },
          ],
        },
      };
      mockClient.searchOne.mockResolvedValueOnce(externalNavigation);

      const result = await navigationsIndex.getByName('skeleton_localhost', 'cs', 'MAIN');

      expect(result!.root.children[0].href).toBe('https://example.com');
      expect(result!.root.children[1].href).toBe('https://www.example.com');
    });
  });
});
