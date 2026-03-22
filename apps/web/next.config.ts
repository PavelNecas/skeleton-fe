import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@skeleton-fe/ui', '@skeleton-fe/sdk-elastic', '@skeleton-fe/sdk-pimcore'],
}

export default nextConfig
