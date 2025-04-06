/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  images: {
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
