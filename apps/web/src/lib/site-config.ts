/**
 * Structure of a site's config.ts file located at
 * `apps/web/src/sites/{sitePrefix}/config.ts`.
 */
export interface SiteConfigFile {
  name: string
  theme?: string
  features?: Record<string, boolean>
}

/**
 * Dynamically imports a site config from `@/sites/{sitePrefix}/config`.
 *
 * Falls back to a minimal default config if the site does not have a config file.
 */
export async function loadSiteConfig(sitePrefix: string): Promise<SiteConfigFile> {
  try {
    const mod = (await import(`@/sites/${sitePrefix}/config`)) as { siteConfig: SiteConfigFile }
    return mod.siteConfig
  } catch {
    // No site config found — return a default
    return {
      name: deriveSiteName(sitePrefix),
    }
  }
}

function deriveSiteName(sitePrefix: string): string {
  return sitePrefix
    .split('_')
    .map((part, index) => (index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}
