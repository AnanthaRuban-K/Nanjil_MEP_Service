/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove appDir - it's default in Next.js 14 and causes warnings
    serverComponentsExternalPackages: ['@prisma/client', 'drizzle-orm']
  },
  
  images: {
    domains: [
      'localhost',
      'nanjilmep.com',
      'your-storage-domain.com' // Keep if you'll use external image storage
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  env: {
    NEXT_PUBLIC_APP_NAME: 'Nanjil MEP Services',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // Webpack config for PWA and module resolution
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Remove the transpilePackages since you're not using a monorepo structure
  // transpilePackages: ['@nanjil-mep/shared-types', '@nanjil-mep/shared-utils', '@nanjil-mep/ui-components'],
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;