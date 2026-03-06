import type { Metadata } from 'next'
import { getCategories, getAllTags } from '@/lib/api/blog'
import SearchClient from './SearchClient'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Tìm Kiếm Khai Thị | Pháp Môn Tâm Linh',
  description: 'Tra cứu nhanh hàng ngàn bài giảng của Sư Phụ Lu Junhong trong kho tàng Khai Thị. Tìm kiếm theo từ khóa, chủ đề, thẻ và thời gian.',
  openGraph: {
    title: 'Kho Tàng Khai Thị — Tìm Kiếm Bài Giảng',
    description: 'Tìm thấy câu trả lời bạn cần trong hàng ngàn bài giảng Phật pháp.',
    type: 'website',
  },
}

// ─── Server Component — prefetch categories & tags ────────────────────────────
export default async function SearchPage() {
  // Prefetch on server to avoid client-side waterfall
  const [categories, tags] = await Promise.all([
    getCategories().catch(() => []),
    getAllTags().catch(() => []),
  ])

  return <SearchClient initialCategories={categories} initialTags={tags} />
}
