// ─────────────────────────────────────────────────────────────
//  /blog — Server Component
//  ISR: fallback revalidate 1 hour — instant via /api/revalidate webhook
// ─────────────────────────────────────────────────────────────

export const revalidate = 3600 // 1h fallback — webhook clears cache instantly on admin publish

import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import BlogListClient from '@/components/BlogListClient'
import { getPosts, getCategories } from '@/lib/api/blog'
import type { BlogPost } from '@/types/strapi'


export const metadata: Metadata = {
  title: 'Blog & Chia Sẻ | Tin Tức & Phản Hồi',
  description: 'Tổng hợp khai thị của Sư Phụ',
}

/** Mock data used when Strapi has no posts yet */
const MOCK_POSTS: BlogPost[] = [
  {
    id: 1, documentId: 'mock-1',
    title: "Ba 'Pháp Bảo' linh nghiệm vô cùng — chỉ nửa tháng trị lành bệnh tim bao dịch",
    slug: 'ba-phap-bao-linh-nghiem',
    content: 'Cảm ơn Nam Mô Quan Thế Âm Bồ Tát! Chồng tôi 50 tuổi đã mắc bệnh gan từ lâu. Sau khi kiên trì niệm kinh, phóng sinh và phát nguyện, chỉ sau nửa tháng bệnh tim bao dịch đã được chữa lành...',
    original_link: null, categories: null, tags: null, thumbnail: null,
    views: 245, seo: null, publishedAt: '2026-02-25T00:00:00Z', createdAt: '2026-02-25T00:00:00Z', updatedAt: '2026-02-25T00:00:00Z',
    video_url: null, audio_url: null, source: 'wenda20200215',
    gallery: null, likes: 0, status: 'published', featured: false, original_title: null, related_posts: null,
  },
  {
    id: 2, documentId: 'mock-2',
    title: 'Con gái mang thai bị đột quỵ nguy kịch, Bồ Tát từ bi bảo hộ mẹ con bình an',
    slug: 'con-gai-mang-thai-dot-quy',
    content: 'Con gái tôi 32 tuổi, mang thai, phạm xung Thái Tuế. Mỗi ngày rằm và mùng một đều nhờ tôi thay phóng sinh, tổng cộng gần 5000 con cá...',
    original_link: null, categories: null, tags: null, thumbnail: null,
    views: 189, seo: null, publishedAt: '2026-02-24T00:00:00Z', createdAt: '2026-02-24T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z',
    video_url: null, audio_url: null, source: null,
    gallery: null, likes: 0, status: 'published', featured: false, original_title: null, related_posts: null,
  },
  {
    id: 3, documentId: 'mock-3',
    title: 'Bạch Thoại Phật Pháp — Tập 12: Buông xả và tự tại trong cuộc sống',
    slug: 'bach-thoai-tap-12-buong-xa',
    content: 'Chúng ta phải hiểu rằng trong cuộc sống, mọi thứ đều là vô thường. Khi bạn nắm giữ quá chặt, phiền não sẽ theo đó mà sinh ra...',
    original_link: null, categories: null, tags: null, thumbnail: null,
    views: 312, seo: null, publishedAt: '2026-02-23T00:00:00Z', createdAt: '2026-02-23T00:00:00Z', updatedAt: '2026-02-23T00:00:00Z',
    video_url: null, audio_url: null, source: 'wenda20140829 42:22',
    gallery: null, likes: 12, status: 'published', featured: true, original_title: '白话佛法 第12集', related_posts: null,
  },
  {
    id: 4, documentId: 'mock-4',
    title: 'Hướng dẫn thiết lập bàn thờ Phật tại gia đúng pháp cho người mới',
    slug: 'huong-dan-ban-tho-phat',
    content: 'Bài viết hướng dẫn chi tiết từng bước cách thiết lập bàn thờ Phật tại gia đúng pháp, từ vị trí đặt bàn thờ đến cách thờ phụng đúng chuẩn...',
    original_link: null, categories: null, tags: null, thumbnail: null,
    views: 567, seo: null, publishedAt: '2026-02-21T00:00:00Z', createdAt: '2026-02-21T00:00:00Z', updatedAt: '2026-02-21T00:00:00Z',
    video_url: null, audio_url: null, source: null,
    gallery: null, likes: 24, status: 'published', featured: false, original_title: null, related_posts: null,
  },
  {
    id: 5, documentId: 'mock-5',
    title: 'Sư Phụ khai thị: Tại sao phải niệm Kinh Đại Bi Chú mỗi ngày',
    slug: 'su-phu-khai-thi-niem-dai-bi-chu',
    content: 'Chú Đại Bi là một trong ba trụ cột của Pháp Môn Tâm Linh. Đây là bài khai thị quan trọng từ Sư Phụ về ý nghĩa và lợi ích của việc trì tụng hàng ngày...',
    original_link: null, categories: null, tags: null, thumbnail: null,
    views: 891, seo: null, publishedAt: '2026-02-19T00:00:00Z', createdAt: '2026-02-19T00:00:00Z', updatedAt: '2026-02-19T00:00:00Z',
    video_url: null, audio_url: null, source: 'shuohua20140829 06:33',
    gallery: null, likes: 41, status: 'published', featured: true, original_title: '大悲咒的意义', related_posts: null,
  },
  {
    id: 6, documentId: 'mock-6',
    title: 'Vợ chồng sắp ly hôn — Niệm Kinh Giải Kết Chú hóa giải mâu thuẫn',
    slug: 'vo-chong-sap-ly-hon-giai-ket-chu',
    content: 'Chúng tôi đã đứng bờ ly hôn sau 8 năm chung sống. Sau khi được hướng dẫn niệm Kinh Giải Kết Chú và thực hành phóng sinh hồi hướng, mọi chuyện đã thay đổi...',
    original_link: null, categories: null, tags: null, thumbnail: null,
    views: 423, seo: null, publishedAt: '2026-02-15T00:00:00Z', createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
    video_url: null, audio_url: null, source: null,
    gallery: null, likes: 18, status: 'published', featured: false, original_title: null, related_posts: null,
  },
]

export default async function BlogPage() {

  const [res, categories] = await Promise.all([
    getPosts({ pageSize: 20, revalidate: 0 }),
    getCategories()
  ])
  const posts = res.data.length > 0 ? res.data : MOCK_POSTS
  const totalFromStrapi = res.meta?.pagination?.total ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-12">

            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
              Blog &amp; Chia Sẻ
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Tin Tức &amp; Phản Hồi
            </h1>
            <p className="text-muted-foreground text-lg">
              Tổng hợp khai thị của Sư Phụ
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg mb-2">Chưa có bài viết nào</p>
              <p className="text-sm">Hãy tạo bài viết trong Strapi Admin</p>
            </div>
          ) : (
            <BlogListClient
              posts={posts}
              totalFromStrapi={totalFromStrapi}
              categories={categories}
            />
          )}
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}

