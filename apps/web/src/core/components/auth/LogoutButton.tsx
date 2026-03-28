'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@skeleton-fe/ui'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="outline" className={className} onClick={() => void handleLogout()}>
      Sign out
    </Button>
  )
}
