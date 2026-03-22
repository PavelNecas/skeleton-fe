import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnippetsIndex } from '../src/indices/snippets';
import type { ElasticClient } from '../src/client';

const mockClient = {
  search: vi.fn(),
  searchOne: vi.fn(),
};

describe('SnippetsIndex', () => {
  let snippetsIndex: SnippetsIndex;

  beforeEach(() => {
    vi.clearAllMocks();
    snippetsIndex = new SnippetsIndex(mockClient as unknown as ElasticClient);
  });

  describe('findByKey', () => {
    it('searches the correct localized index by key', async () => {
      const mockSnippet = {
        id: '5',
        path: '/snippets/footer',
        key: 'footer',
        locale: 'cs',
        published: true,
        modificationDate: 1000000,
        creationDate: 1000000,
        site: 'skeleton_localhost',
        parentId: 1,
        index: 0,
        technicalData: { controller: null, template: null, contentMainDocumentId: null },
        editables: [],
        properties: [],
      };
      mockClient.searchOne.mockResolvedValueOnce(mockSnippet);

      const result = await snippetsIndex.findByKey('skeleton_localhost', 'cs', 'footer');

      expect(mockClient.searchOne).toHaveBeenCalledWith('skeleton_localhost_snippets_cs', {
        query: {
          bool: {
            must: [
              { term: { key: 'footer' } },
              { term: { published: true } },
            ],
          },
        },
      });
      expect(result).toEqual(mockSnippet);
    });

    it('returns null when snippet not found', async () => {
      mockClient.searchOne.mockResolvedValueOnce(null);

      const result = await snippetsIndex.findByKey('skeleton_localhost', 'en', 'nonexistent');

      expect(result).toBeNull();
    });
  });
});
