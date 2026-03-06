// ─────────────────────────────────────────────────────────────
//  /blog — Server Component
//  Phân trang & lọc theo URL searchParams:
//    ?page=2&category=khai-thi&q=buong xa
//  ISR: fallback revalidate 1 hour — instant via /api/revalidate webhook
// ─────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import BlogListClient from '@/components/BlogListClient'
import { getPosts, getCategories, getBlogArchiveIndex } from '@/lib/api/blog'
import { PAGINATION } from '@/lib/config/pagination'

export const revalidate = 3600 // 1h fallback — webhook clears cache instantly

export const metadata: Metadata = {
  title: 'Blog & Chia Sẻ | Khai Thị Của Sư Phụ',
  description: 'Tổng hợp hàng vạn bài khai thị, giải đáp thắc mắc và chia sẻ từ pháp hội Pháp Môn Tâm Linh.',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    q?: string
  }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { page, category, q } = await searchParams
  // Đọc params từ URL
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const currentCategory = category ?? ''
  const currentSearch = q ?? ''

  // Fetch song song: bài viết và danh mục
  const [res, categories, archives] = await Promise.all([
    getPosts({
      page: currentPage,
      pageSize: PAGINATION.BLOG_PAGE_SIZE,
      categorySlug: currentCategory || undefined,
      search: currentSearch || undefined,
      revalidate: currentSearch ? 0 : 3600, // search không cache, browse thì ISR
    }),
    getCategories(),
    getBlogArchiveIndex(),
  ])

  const posts = res.data
  const totalPosts = res.meta?.pagination?.total ?? 0
  const totalPages = res.meta?.pagination?.pageCount ?? 1

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-6">
          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-12">
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
              Blog &amp; Chia Sẻ
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Kho Tàng Khai Thị
            </h1>
            <p className="text-muted-foreground text-lg">
              {totalPosts > 0
                ? `${totalPosts.toLocaleString('vi-VN')} bài giảng của Sư Phụ`
                : 'Tổng hợp khai thị của Sư Phụ'}
            </p>
          </div>

          {posts.length === 0 && !currentSearch && !currentCategory ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg mb-2">Chưa có bài viết nào</p>
              <p className="text-sm">Hãy tạo bài viết trong Strapi Admin</p>
            </div>
          ) : (
            <Suspense fallback={null}>
              <BlogListClient
                posts={posts}
                totalPosts={totalPosts}
                totalPages={totalPages}
                currentPage={currentPage}
                categories={categories}
                currentCategory={currentCategory}
                currentSearch={currentSearch}
                archives={archives}
              />
            </Suspense>
          )}
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
