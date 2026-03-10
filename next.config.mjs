/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 Tối ưu cho VPS 2GB - Cực nhẹ & Bỏ qua check lỗi lúc Build
  output: 'standalone',
  reactCompiler: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Redis ISR Cache (production) ──────────────────────────────
  ...(process.env.REDIS_URL
    ? {
      cacheHandler: new URL('./cache-handler.js', import.meta.url).pathname,
      cacheMaxMemorySize: 0,
    }
    : {}),

  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '::1', port: '1337', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'api.phapmontamlinh.vn', pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
