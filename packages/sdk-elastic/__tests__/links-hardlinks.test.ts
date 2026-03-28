import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinksIndex } from '../src/indices/links';
import { HardlinksIndex } from '../src/indices/hardlinks';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('LinksIndex', () => {
  let linksIndex: LinksIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    linksIndex = new LinksIndex(mockClient as unknown as ElasticClient);
  });

  describe('findById', () => {
    it('searches the correct localized index by id', async () => {
      const mockLink = {
        id: '7',
        path: '/external-link',
        key: 'external-link',
        locale: 'cs',
        published: true,
        linkData: { href: 'https://example.com', linktype: 'external', internalType: null, internalId: null, direct: null },
        navigationData: { name: 'External', title: null, cssClass: null, target: '_blank', anchor: null, parameters: null, exclude: false, relation: null, accesskey: null, tabindex: null },
      };
      mockClient.searchOne.mockResolvedValueOnce(mockLink);

      const result = await linksIndex.findById('skeleton_localhost', 'cs', '7');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_links_cs', {
        query: { term: { id: '7' } },
      });
      expect(result).toEqual(mockLink);
    });
  });

  describe('findByPath', () => {
    it('searches with path and published filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      await linksIndex.findByPath('skeleton_localhost', 'en', '/link-path');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_links_en', {
        query: {
          bool: {
            must: [
              { term: { path: '/link-path' } },
              { term: { published: true } },
            ],
          },
        },
      });
    });
  });
});

describe('HardlinksIndex', () => {
  let hardlinksIndex: HardlinksIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    hardlinksIndex = new HardlinksIndex(mockClient as unknown as ElasticClient);
  });

  describe('findById', () => {
    it('searches the correct localized index by id', async () => {
      const mockHardlink = {
        id: '3',
        path: '/hardlink',
        key: 'hardlink',
        locale: 'cs',
        published: true,
        modificationDate: 1000000,
        creationDate: 1000000,
        site: 'skeleton_localhost',
        parentId: 1,
        index: 0,
        sourceData: { sourceId: 10, sourceType: 'page', sourcePath: '/source', propertiesFromSource: true, childrenFromSource: false },
        navigationData: { name: null, title: null, cssClass: null, target: null, anchor: null, parameters: null, exclude: false, relation: null, accesskey: null, tabindex: null },
        editables: null,
        properties: null,
      };
      mockClient.searchOne.mockResolvedValueOnce(mockHardlink);

      const result = await hardlinksIndex.findById('skeleton_localhost', 'cs', '3');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_hardlinks_cs', {
        query: { term: { id: '3' } },
      });
      expect(result?.editables).toBeNull();
      expect(result?.properties).toBeNull();
    });
  });

  describe('findByPath', () => {
    it('searches with path and published filter', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      await hardlinksIndex.findByPath('skeleton_localhost', 'en', '/hardlink-path');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_hardlinks_en', {
        query: {
          bool: {
            must: [
              { term: { path: '/hardlink-path' } },
              { term: { published: true } },
            ],
          },
        },
      });
    });
  });
});
