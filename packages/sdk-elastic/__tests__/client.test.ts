import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElasticClient } from '../src/client';
import { RoutesIndex } from '../src/indices/routes';
import { PagesIndex } from '../src/indices/pages';
import { ArticlesIndex } from '../src/indices/articles';
import { NavigationsIndex } from '../src/indices/navigations';
import { SitesIndex } from '../src/indices/sites';
import { SnippetsIndex } from '../src/indices/snippets';
import { LinksIndex } from '../src/indices/links';
import { HardlinksIndex } from '../src/indices/hardlinks';

vi.mock('@elastic/elasticsearch', () => {
  const mockSearch = vi.fn();
  return {
    Client: vi.fn().mockImplementation(() => ({
      search: mockSearch,
    })),
  };
});

describe('ElasticClient', () => {
  let client: ElasticClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ElasticClient({
      url: 'http://localhost:9200',
      username: 'elastic',
      password: 'password',
    });
  });

  describe('lazy accessor properties', () => {
    it('returns a RoutesIndex instance', () => {
      expect(client.routes).toBeInstanceOf(RoutesIndex);
    });

    it('returns the same RoutesIndex instance on subsequent calls', () => {
      const first = client.routes;
      const second = client.routes;
      expect(first).toBe(second);
    });

    it('returns a PagesIndex instance', () => {
      expect(client.pages).toBeInstanceOf(PagesIndex);
    });

    it('returns the same PagesIndex instance on subsequent calls', () => {
      const first = client.pages;
      const second = client.pages;
      expect(first).toBe(second);
    });

    it('returns an ArticlesIndex instance', () => {
      expect(client.articles).toBeInstanceOf(ArticlesIndex);
    });

    it('returns a NavigationsIndex instance', () => {
      expect(client.navigations).toBeInstanceOf(NavigationsIndex);
    });

    it('returns a SitesIndex instance', () => {
      expect(client.sites).toBeInstanceOf(SitesIndex);
    });

    it('returns a SnippetsIndex instance', () => {
      expect(client.snippets).toBeInstanceOf(SnippetsIndex);
    });

    it('returns a LinksIndex instance', () => {
      expect(client.links).toBeInstanceOf(LinksIndex);
    });

    it('returns a HardlinksIndex instance', () => {
      expect(client.hardlinks).toBeInstanceOf(HardlinksIndex);
    });
  });

  describe('search', () => {
    it('maps hits to _source values', async () => {
      const { Client } = await import('@elastic/elasticsearch');
      const mockEsClient = vi.mocked(Client).mock.results[0].value;
      mockEsClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            { _source: { id: '1', path: '/test' } },
            { _source: { id: '2', path: '/other' } },
          ],
        },
      });

      const results = await client.search<{ id: string; path: string }>('test_index', { query: { match_all: {} } });

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ id: '1', path: '/test' });
    });

    it('returns empty array when no hits', async () => {
      const { Client } = await import('@elastic/elasticsearch');
      const mockEsClient = vi.mocked(Client).mock.results[0].value;
      mockEsClient.search.mockResolvedValueOnce({
        hits: { hits: [] },
      });

      const results = await client.search('test_index', { query: { match_all: {} } });

      expect(results).toHaveLength(0);
    });
  });

  describe('searchOne', () => {
    it('returns the first result', async () => {
      const { Client } = await import('@elastic/elasticsearch');
      const mockEsClient = vi.mocked(Client).mock.results[0].value;
      mockEsClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            { _source: { id: '1' } },
            { _source: { id: '2' } },
          ],
        },
      });

      const result = await client.searchOne<{ id: string }>('test_index', { query: { match_all: {} } });

      expect(result).toEqual({ id: '1' });
    });

    it('returns null when no results', async () => {
      const { Client } = await import('@elastic/elasticsearch');
      const mockEsClient = vi.mocked(Client).mock.results[0].value;
      mockEsClient.search.mockResolvedValueOnce({
        hits: { hits: [] },
      });

      const result = await client.searchOne('test_index', { query: { match_all: {} } });

      expect(result).toBeNull();
    });
  });

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

  describe('aggregate', () => {
    it('returns aggregation results with size 0', async () => {
      const { Client } = await import('@elastic/elasticsearch');
      const mockEsClient = vi.mocked(Client).mock.results[0].value;
      mockEsClient.search.mockResolvedValueOnce({
        hits: { total: { value: 0, relation: 'eq' }, hits: [] },
        aggregations: {
          category_ids: {
            buckets: [
              { key: '10', doc_count: 5, category_name: { buckets: [{ key: 'Tech', doc_count: 5 }] } },
            ],
          },
        },
      });

      const result = await client.aggregate('test_index', {
        query: { match_all: {} },
        aggs: { category_ids: { terms: { field: 'categories.id' } } },
      });

      expect(mockEsClient.search).toHaveBeenCalledWith({
        index: 'test_index',
        size: 0,
        query: { match_all: {} },
        aggs: { category_ids: { terms: { field: 'categories.id' } } },
      });
      expect(result).toHaveProperty('category_ids');
    });

    it('returns empty object when no aggregations', async () => {
      const { Client } = await import('@elastic/elasticsearch');
      const mockEsClient = vi.mocked(Client).mock.results[0].value;
      mockEsClient.search.mockResolvedValueOnce({
        hits: { total: { value: 0, relation: 'eq' }, hits: [] },
      });

      const result = await client.aggregate('test_index', { query: { match_all: {} } });

      expect(result).toEqual({});
    });
  });
});
