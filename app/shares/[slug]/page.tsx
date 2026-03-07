// ─────────────────────────────────────────────────────────────
//  /shares/[slug] — Chi tiết bài viết cộng đồng (Server Component)
// ─────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { getCommunityPostBySlug } from '@/lib/api/community-server'
import { getStrapiMediaUrl } from '@/lib/strapi'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Clock, Eye, Heart, MessageSquare, ChevronLeft, Globe } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getCommunityPostBySlug(slug)
    if (!post) return { title: 'Bài viết không tồn tại' }

    return {
      title: `${post.title} | Chia sẻ cộng đồng - Pháp Môn Tâm Linh`,
      description: post.content.substring(0, 160),
      openGraph: {
        title: post.title,
        description: post.content.substring(0, 160),
        type: 'article',
      }
    }
  } catch {
    return { title: 'Dữ liệu đang được cập nhật' }
  }
}

export default async function CommunityPostDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getCommunityPostBySlug(slug)

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />

      <main className="py-12">
        <div className="container mx-auto px-6 ">
          <Breadcrumbs
            items={[
              { label: 'Chia sẻ', href: '/shares' },
              { label: post.category, href: `/shares?category=${encodeURIComponent(post.category)}` },
              { label: post.title }
            ]}
          />

          <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Header info */}
            <div className="p-8 pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-gold/10 text-[10px] font-bold text-gold uppercase tracking-wider">
                  {post.type || 'Câu chuyện'}
                </span>
                <span className="text-xs text-muted-foreground">• {post.category}</span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between py-6 border-y border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 overflow-hidden shrink-0">
                    {post.author_avatar ? (
                      <img src={getStrapiMediaUrl(post.author_avatar) || ''} alt={post.author_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gold">{post.author_name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{post.author_name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <Globe className="w-3 h-3" />
                      {(post as any).author_country || 'Đồng tu'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {post.views}</span>
                  <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> {post.likes}</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-4">
              {post.coverUrl && (
                <div className="rounded-xl overflow-hidden mb-8 bg-black/5 flex items-center justify-center">
                  <img src={post.coverUrl} alt={post.title} className="w-full h-auto max-h-[600px] object-contain" />
                </div>
              )}

              <article className="prose prose-gold max-w-none dark:prose-invert">
                <div className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif">
                  {post.content}
                </div>
              </article>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10">
                  {post.tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="p-8 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-t border-border mt-8">
                <Link href="/shares" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Quay lại diễn đàn
                </Link>

                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground italic">Mọi chia sẻ đều là hạt giống thiện lành.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments preview hint */}
          <div className="mt-12 text-center">
            <Link href="/shares" className="bg-gold/10 text-gold border border-gold/20 px-8 py-3 rounded-full hover:bg-gold hover:text-black transition-all font-semibold inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Tham gia thảo luận tại Diễn Đàn
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <StickyBanner />
    </div>
  )
}
