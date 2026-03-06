// ─────────────────────────────────────────────────────────────
//  /category/[slug] — Category page
// ─────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { getCategoryBySlug, getCategories, getCategoryBreadcrumb } from '@/lib/api/categories'
import { strapiFetch, getStrapiMediaUrl } from '@/lib/strapi'
import Breadcrumbs from '@/components/Breadcrumbs'
import type { BlogPost, StrapiList, Category } from '@/types/strapi'

interface Props {
  params: Promise<{ slug: string }>
}

// generateMetadata updated for simplified schema
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await strapiFetch<StrapiList<Category>>(`/categories`, { // Using Category type instead of any
    filters: { slug: { $eq: slug } },
    pagination: { page: 1, pageSize: 1 },
  })
  const cat = result?.data?.[0]
  return {
    title: cat ? `${cat.name} — Pháp Môn Tâm Linh` : 'Chủ đề',
    description: cat?.description || (cat ? `Các bài viết thuộc chủ đề ${cat.name}` : undefined),
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
  return `${Math.floor(diffDays / 365)} năm trước`
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, allCats] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ])

  if (!category) notFound()

  const breadcrumb = getCategoryBreadcrumb(allCats, slug)

  // Fetch posts (filter by dynamic categories relation or category enum)
  let posts: BlogPost[] = []
  let total = 0
  try {
    const res = await strapiFetch<StrapiList<BlogPost>>('/blog-posts', {
      filters: {
        // Filter by dynamic category relation
        categories: { slug: { $eq: slug } }
      },
      sort: ['publishedAt:desc'],
      populate: ['thumbnail', 'gallery', 'categories'],
      pagination: { page: 1, pageSize: 24 },
      next: { revalidate: 60, tags: [`category-${slug}`] },
    })
    posts = res.data
    total = res.meta?.pagination?.total ?? 0
  } catch (err) {
    console.error(`[Category ${slug}] Fetch error:`, err instanceof Error ? err.message : err)
    // no matching posts
  }

  const subCategories = allCats.filter((c) => c.parent?.id === category.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-14">
        <div className="container mx-auto px-6">
          {/* ─── Header ─── */}
          <section className="text-center mb-12">
            <Breadcrumbs
              centered
              items={breadcrumb.map((crumb) => ({
                label: crumb.name,
                href: `/category/${crumb.slug}`
              }))}
            />

            {/* Title */}
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
              {breadcrumb.length > 1 ? 'Chủ đề con' : 'Chủ đề'}
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                {category.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-4">{total} bài viết</p>
          </section>

          {/* ─── Sub-categories ─── */}
          {subCategories.length > 0 && (
            <section className="mb-10 pb-8 border-b border-border/50">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Chủ đề con</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className="px-3.5 py-1.5 rounded-full bg-card border border-border/60 hover:border-gold/40 hover:text-gold text-sm text-foreground transition-all"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ─── Posts Grid ─── */}
          {posts.length > 0 ? (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => {
                  const thumb = post.thumbnail || (post.gallery && post.gallery.length > 0 ? post.gallery[0] : null)
                  const thumbUrl = thumb
                    ? getStrapiMediaUrl(thumb.formats?.medium?.url || thumb.formats?.small?.url || thumb.url)
                    : null
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-gold/40 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-secondary/20">
                        {thumbUrl ? (
                          <Image
                            src={thumbUrl}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary/10" />
                        )}
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex gap-1">
                          {post.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">Nổi bật</span>
                          )}
                          {post.sourceName && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground">
                              {post.sourceName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-4">
                        <h3 className="font-display text-sm md:text-base text-foreground group-hover:text-gold transition-colors mb-2 line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
                          {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span>Ban biên tập</span>
                          <span>{post.publishedAt ? timeAgo(post.publishedAt) : ''}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ) : (
            <section className="text-center py-16">
              <p className="text-muted-foreground mb-2">Chưa có bài viết nào trong chủ đề này</p>
              <Link href="/blog" className="inline-block mt-3 text-sm text-gold hover:underline">
                Xem tất cả bài viết →
              </Link>
            </section>
          )}
        </div>
      </main>

      <Footer />
      <StickyBanner />
    </div>
  )
}
