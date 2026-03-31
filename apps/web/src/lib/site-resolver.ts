import { esSearchOne } from './elastic-edge'

export interface SiteConfig {
  id: number
  prefix: string
  mainDomain: string
  defaultLocale: string
  availableLocales: string[]
}

interface EsSite {
  id: number
  mainDomain: string
  defaultLocale: string
  availableLocales: string[]
}

interface CacheEntry {
  config: SiteConfig
  expiresAt: number
}

const SITES_INDEX = 'app_sites'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const siteCache = new Map<string, CacheEntry>()

/**
 * Derives a safe ES index prefix from a hostname.
 * e.g. "skeleton-fe.localhost" → "skeleton_fe_localhost"
 */
function hostnameToPrefix(hostname: string): string {
  return hostname.replace(/[.-]/g, '_')
}

/**
 * Resolves site configuration for a given hostname.
 * Queries the ES sites index and caches results for 5 minutes.
 * Site prefix is derived from hostname; locale config comes from ES.
 */
export async function resolveSite(hostname: string): Promise<SiteConfig> {
  const now = Date.now()
  const cached = siteCache.get(hostname)
  if (cached && cached.expiresAt > now) {
    return cached.config
  }

  const sitePrefix = hostnameToPrefix(hostname)

  const site = await esSearchOne<EsSite>(SITES_INDEX, {
    query: {
      term: { mainDomain: hostname },
    },
  })

  if (!site) {
    throw new Error(`No site found for hostname: ${hostname}`)
  }

  const config: SiteConfig = {
    id: site.id,
    prefix: sitePrefix,
    mainDomain: site.mainDomain,
    defaultLocale: site.defaultLocale,
    availableLocales: site.availableLocales,
  }

  siteCache.set(hostname, { config, expiresAt: now + CACHE_TTL_MS })
  return config
}

/** Clears the in-memory site cache (useful in tests). */
export function clearSiteCache(): void {
  siteCache.clear()
}
