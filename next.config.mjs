/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 Tối ưu Standalone cho VPS 2GB
  output: 'standalone',
  reactCompiler: true,

  // Bỏ qua check lúc build để dành RAM cho việc Build chính
  typescript: {
    ignoreBuildErrors: true,
  },

  // Tắt tele cho nhẹ
  telemetry: false,

  images: {
    unoptimized: true, // Tiết kiệm công sức xử lý ảnh cho CPU yếu
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
