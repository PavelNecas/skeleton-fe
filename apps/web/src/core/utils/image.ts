/**
 * Builds a Pimcore asset URL from an imageId.
 * Falls back to an empty string when imageId is null.
 */
export function getImageUrl(imageId: number | null, baseUrl?: string): string {
  if (imageId === null) {
    return ''
  }

  const base = baseUrl ?? process.env.NEXT_PUBLIC_PIMCORE_URL ?? ''
  return `${base}/var/assets/${imageId}`
}
