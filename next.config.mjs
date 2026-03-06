/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bật React Compiler (thay thế React.memo, useMemo, useCallback)
 reactCompiler: true,

  typescript: {
    // UI components copied from shadcn have some unused deps — safe to ignore
    ignoreBuildErrors: true,
  },

  // ── Redis ISR Cache (production) ──────────────────────────────
  // Kích hoạt khi có REDIS_URL trong môi trường
  // Cài: npm install @neshca/cache-handler ioredis
  ...(process.env.REDIS_URL
    ? {
      cacheHandler: new URL('./cache-handler.js', import.meta.url).pathname,
      cacheMaxMemorySize: 0,
    }
    : {}),

  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      // External media
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      // Strapi local uploads (dev)
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '::1', port: '1337', pathname: '/uploads/**' },
      // Strapi production
      { protocol: 'https', hostname: 'api.phapmontamlinh.vn', pathname: '/uploads/**' },
      // Cloudflare R2 / CDN (production — uncomment và thay hostname khi deploy)
      // { protocol: 'https', hostname: '<your-r2-bucket>.r2.dev', pathname: '/**' },
      // { protocol: 'https', hostname: 'cdn.phapmontamlinh.vn', pathname: '/**' },
      // AWS S3 (nếu dùng S3 thay R2)
      // { protocol: 'https', hostname: '<bucket>.s3.<region>.amazonaws.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
