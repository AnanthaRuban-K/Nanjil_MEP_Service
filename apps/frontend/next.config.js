/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Enable standalone output for Docker deployment
  output: 'standalone',
  
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'drizzle-orm']
  },
  
  images: {
    // Disable optimization for Docker deployment
    unoptimized: true,
    domains: [
      'localhost',
      'nanjilmepservice.com',
      'api.nanjilmepservice.com',
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
  
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,
  
  // Enable SWC minifier
  swcMinify: true,
  
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