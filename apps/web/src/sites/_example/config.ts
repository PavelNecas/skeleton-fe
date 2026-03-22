import type { SiteConfigFile } from '@/lib/site-config'

export const siteConfig: SiteConfigFile = {
  name: 'Example Site',
  theme: 'example',
  features: {
    showPrices: true,
    showStock: false,
  },
}
