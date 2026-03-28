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
});
