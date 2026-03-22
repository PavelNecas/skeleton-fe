import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PimcoreClient } from '../src/client';
import { AuthClient } from '../src/auth';

describe('AuthClient', () => {
  let pimcoreClient: PimcoreClient;
  let authClient: AuthClient;

  const mockTokenResponse = {
    token_type: 'Bearer' as const,
    expires_in: 3600,
    access_token: 'eyJhbGciOiJSUzI1NiJ9.test',
    refresh_token: 'abcdef1234567890abcdef1234567890abcdef12',
  };

  beforeEach(() => {
    pimcoreClient = new PimcoreClient({ baseUrl: 'http://pimcore.localhost' });
    authClient = new AuthClient(pimcoreClient);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('login', () => {
    it('POSTs to /api/auth/login with credentials', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const result = await authClient.login({ email: 'user@example.com', password: 'secret' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://pimcore.localhost/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
        })
      );
      expect(result).toEqual(mockTokenResponse);
    });

    it('stores the access token after login', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await authClient.login({ email: 'user@example.com', password: 'secret' });

      expect(pimcoreClient.getAccessToken()).toBe(mockTokenResponse.access_token);
      expect(pimcoreClient.isTokenExpired()).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('POSTs to /api/auth/refresh with refresh_token', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const result = await authClient.refreshToken('my-refresh-token');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://pimcore.localhost/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh_token: 'my-refresh-token' }),
        })
      );
      expect(result).toEqual(mockTokenResponse);
    });

    it('stores the new access token after refresh', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await authClient.refreshToken('my-refresh-token');

      expect(pimcoreClient.getAccessToken()).toBe(mockTokenResponse.access_token);
    });
  });

  describe('clientCredentials', () => {
    it('POSTs to /token with client_credentials grant type', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await authClient.clientCredentials({
        client_id: 'my-client',
        client_secret: 'my-secret',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://pimcore.localhost/token',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: 'my-client',
            client_secret: 'my-secret',
          }),
        })
      );
    });

    it('stores the access token after obtaining client credentials', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await authClient.clientCredentials({
        client_id: 'my-client',
        client_secret: 'my-secret',
      });

      expect(pimcoreClient.getAccessToken()).toBe(mockTokenResponse.access_token);
    });
  });
});
