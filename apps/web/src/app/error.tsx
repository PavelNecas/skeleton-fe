'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service in future
    console.error(error)
  }, [error])

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground/50">500</h1>
      <h2 className="mt-4 text-2xl font-semibold">Server error</h2>
      <p className="mt-2 text-muted-foreground">
        Something went wrong on our end. Please try again later.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </section>
  )
}
