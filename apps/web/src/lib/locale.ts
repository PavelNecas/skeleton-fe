export interface LocaleResult {
  locale: string
  resolvedPath: string
}

/**
 * Detects the locale from the URL pathname prefix and strips it from the path.
 *
 * Rules:
 * - If the first path segment matches a non-default locale → use that locale,
 *   strip the prefix from the path.
 * - Otherwise → use defaultLocale, keep the path as-is.
 *
 * Examples (defaultLocale = "cs", availableLocales = ["cs", "en"]):
 *   /en/about-us  → { locale: "en", resolvedPath: "/about-us" }
 *   /about-us     → { locale: "cs", resolvedPath: "/about-us" }
 *   /             → { locale: "cs", resolvedPath: "/" }
 *   /en           → { locale: "en", resolvedPath: "/" }
 */
export function detectLocale(
  pathname: string,
  availableLocales: string[],
  defaultLocale: string,
): LocaleResult {
  // Normalise: ensure it starts with /
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`

  // Split into segments and grab the first non-empty one
  const segments = normalized.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && availableLocales.includes(firstSegment) && firstSegment !== defaultLocale) {
    // Strip the locale prefix
    const remaining = segments.slice(1)
    const resolvedPath = remaining.length > 0 ? `/${remaining.join('/')}` : '/'
    return { locale: firstSegment, resolvedPath }
  }

  return { locale: defaultLocale, resolvedPath: normalized }
}
