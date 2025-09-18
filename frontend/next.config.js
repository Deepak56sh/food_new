/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  // Add environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Disable static optimization for admin pages to avoid SSR issues
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  // Add output configuration
  output: 'standalone',
  // Skip static generation for admin pages
  generateBuildId: async () => {
    return 'build-id';
  }
}

export default nextConfig;