import { NextResponse } from 'next/server'

import { clearAuthCookies } from '@/lib/auth/session'

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true }, { status: 200 })
  clearAuthCookies(response)
  return response
}
