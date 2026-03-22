import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PimcoreClient } from '../src/client';

describe('PimcoreClient', () => {
  let client: PimcoreClient;

  beforeEach(() => {
    client = new PimcoreClient({ baseUrl: 'http://pimcore.localhost' });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('request', () => {
    it('calls fetch with correct URL and headers', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response);

      await client.request('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://pimcore.localhost/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes Authorization header when token is set', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      client.setAccessToken('my-token', 3600);

      await client.request('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });

    it('throws when response is not ok', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(client.request('/api/protected')).rejects.toThrow(
        'Pimcore API request failed: 401 Unauthorized'
      );
    });

    it('strips trailing slash from baseUrl', async () => {
      const clientWithSlash = new PimcoreClient({ baseUrl: 'http://pimcore.localhost/' });
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await clientWithSlash.request('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://pimcore.localhost/api/test',
        expect.anything()
      );
    });
  });

  describe('token management', () => {
    it('getAccessToken returns null by default', () => {
      expect(client.getAccessToken()).toBeNull();
    });

    it('setAccessToken stores the token', () => {
      client.setAccessToken('abc123', 3600);
      expect(client.getAccessToken()).toBe('abc123');
    });

    it('isTokenExpired returns true when no token set', () => {
      expect(client.isTokenExpired()).toBe(true);
    });

    it('isTokenExpired returns false for fresh token', () => {
      client.setAccessToken('token', 3600);
      expect(client.isTokenExpired()).toBe(false);
    });

    it('isTokenExpired returns true for expired token', () => {
      client.setAccessToken('token', -1);
      expect(client.isTokenExpired()).toBe(true);
    });
  });
});
