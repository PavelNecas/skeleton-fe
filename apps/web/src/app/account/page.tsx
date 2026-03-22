import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { COOKIE_ACCESS_TOKEN } from '@/lib/auth/constants'
import { parseJwtPayload } from '@/lib/auth/utils'
import { LogoutButton } from '@/core/components/auth/LogoutButton'

export default async function AccountPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value

  if (!accessToken) {
    redirect('/login?returnUrl=/account')
  }

  let email: string | undefined
  let subject: string | undefined

  try {
    const payload = parseJwtPayload(accessToken)
    email = typeof payload.email === 'string' ? payload.email : undefined
    subject = typeof payload.sub === 'string' ? payload.sub : undefined
  } catch {
    // Malformed token — treat as unauthenticated
    redirect('/login?returnUrl=/account')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">My account</h1>

          <dl className="space-y-1 text-sm">
            {subject && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground">ID:</dt>
                <dd>{subject}</dd>
              </div>
            )}
            {email && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground">Email:</dt>
                <dd>{email}</dd>
              </div>
            )}
          </dl>
        </div>

        <LogoutButton />
      </div>
    </main>
  )
}
