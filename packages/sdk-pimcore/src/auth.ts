import type { PimcoreClient } from './client'
import type { TokenResponse, LoginCredentials, ClientCredentials } from './types'

export class AuthClient {
  constructor(private readonly client: PimcoreClient) {}

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await this.client.request<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    this.client.setAccessToken(response.access_token, response.expires_in)

    return response
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.client.request<TokenResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    this.client.setAccessToken(response.access_token, response.expires_in)

    return response
  }

  async clientCredentials(
    credentials: Omit<ClientCredentials, 'grant_type'>,
  ): Promise<TokenResponse> {
    const payload: ClientCredentials = {
      grant_type: 'client_credentials',
      ...credentials,
    }

    const response = await this.client.request<TokenResponse>('/token', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    this.client.setAccessToken(response.access_token, response.expires_in)

    return response
  }
}
