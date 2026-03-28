export interface TokenResponse {
  token_type: 'Bearer'
  expires_in: number
  access_token: string
  refresh_token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ClientCredentials {
  grant_type: 'client_credentials'
  client_id: string
  client_secret: string
}

export interface PimcoreClientConfig {
  baseUrl: string
  accessToken?: string
  tokenExpiresAt?: number
}
