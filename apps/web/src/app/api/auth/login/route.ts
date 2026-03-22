import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthClient, PimcoreClient } from '@skeleton-fe/sdk-pimcore'

import { setAuthCookies } from '@/lib/auth/session'

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = loginBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    )
  }

  try {
    const pimcoreClient = new PimcoreClient({
      baseUrl: process.env.PIMCORE_API_URL ?? 'http://pimcore',
    })
    const authClient = new AuthClient(pimcoreClient)
    const tokens = await authClient.login(parsed.data)

    const response = NextResponse.json({ ok: true }, { status: 200 })
    setAuthCookies(response, tokens)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
