import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AuthClient, PimcoreClient } from '@skeleton-fe/sdk-pimcore'

import { COOKIE_REFRESH_TOKEN } from '@/lib/auth/constants'
import { setAuthCookies } from '@/lib/auth/session'

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  try {
    const pimcoreClient = new PimcoreClient({
      baseUrl: process.env.PIMCORE_API_URL ?? 'http://pimcore',
    })
    const authClient = new AuthClient(pimcoreClient)
    const tokens = await authClient.refreshToken(refreshToken)

    const response = NextResponse.json({ ok: true }, { status: 200 })
    setAuthCookies(response, tokens)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Refresh failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
