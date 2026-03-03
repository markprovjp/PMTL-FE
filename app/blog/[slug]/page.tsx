// ─────────────────────────────────────────────────────────────
//  /blog/[slug] — Server Component (dynamic blog post)
//  ISR: fallback revalidate 1 hour — instant via /api/revalidate webhook
// ─────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, getPostBySlugForMetadata } from '@/lib/api/blog'
import { getStrapiMediaUrl } from '@/lib/strapi'
import Breadcrumbs from '@/components/Breadcrumbs'
import ViewTracker from '@/components/ViewTracker'
import { ArrowRightIcon } from '@/components/icons/ZenIcons'
import ShareButtons from './ShareButtons'

export const revalidate = 3600 // 1h fallback — webhook clears cache instantly on admin publish

interface Props {
  params: { slug: string }
}

/** Pre-generate known slugs at build time */
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

/** Dynamic SEO metadata per post */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Use lighter fetch for metadata (faster, only fetches needed fields)
    const post = await getPostBySlugForMetadata(params.slug)
    if (!post) return { title: 'Bài không tồn tại' }

    const seoData = post.seo
    const seoTitle = seoData?.metaTitle || post.title
    const seoDesc = seoData?.metaDescription || post.content.replace(/<[^>]*>/g, '').substring(0, 160)

    // SEO Images
    const seoImage = seoData?.metaImage
    const thumbUrl = post.thumbnail ? getStrapiMediaUrl(post.thumbnail.url) : null
    const finalImageUrl = seoImage ? getStrapiMediaUrl(seoImage.url) : thumbUrl

    return {
      title: seoTitle,
      description: seoDesc,
      keywords: seoData?.keywords,
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        type: 'article',
        publishedTime: post.publishedAt || post.createdAt,
        ...(finalImageUrl ? { images: [{ url: finalImageUrl }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDesc,
        ...(finalImageUrl ? { images: [finalImageUrl] } : {}),
      },
      alternates: {
        canonical: post.seo?.canonicalURL || undefined
      }
    }
  } catch {
    return {}
  }
}

/** Extract YouTube video ID from various YouTube URL formats */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// SOURCE_META removed as it's no longer used in simplified schema.

// LanguageBadge removed as it's no longer in schema

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  // Fetch related posts concurrently
  const related = post.related_posts?.length
    ? post.related_posts
    : await getRelatedPosts(post, 4)

  const thumbnailUrl = post.thumbnail
    ? getStrapiMediaUrl(post.thumbnail.formats?.large?.url ?? post.thumbnail.url)
    : null

  const youtubeId = post.video_url ? getYouTubeId(post.video_url) : null
  const source = post.source

  const firstCat = post.categories?.[0]
  const categoryName = firstCat?.name ?? 'Khai Thị'
  const categoryHref = firstCat ? `/category/${firstCat.slug}` : '/blog'

  return (
    <div className="min-h-screen bg-background selection:bg-gold/20 selection:text-gold">
      <Header />
      <ViewTracker documentId={post.documentId} slug={post.slug} />
      <main className="py-5">
        <div className="container mx-auto px-6 ">

          <Breadcrumbs
            items={[
              { label: 'Blog', href: '/blog' },
              { label: categoryName, href: categoryHref },
              { label: post.title }
            ]}
          />

          {/* ── Header meta ── */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Category */}
              <Link
                href={categoryHref}
                className="px-2.5 py-1 rounded-md bg-gold/10 text-xs font-medium text-gold capitalize hover:bg-gold/20 transition-colors"
              >
                {categoryName}
              </Link>

              {/* Source reference badge */}
              {source && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-muted-foreground`}>
                  Nguồn: <code className="font-mono opacity-80">{source}</code>
                </span>
              )}

              {/* Featured */}
              {post.featured && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-xs font-medium text-amber-400">
                  Nổi bật
                </span>
              )}

              {/* Date */}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3 leading-tight">
              {post.title}
            </h1>

            {/* Tựa gốc tiếng Trung */}
            {post.original_title && (
              <p className="text-muted-foreground/70 text-lg mb-3 font-light tracking-wide">
                {post.original_title}
              </p>
            )}

            {/* Author + stats row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Ban biên tập</span>
              <span>{post.views.toLocaleString('vi-VN')} lượt xem</span>
              {post.likes > 0 && (
                <span>{post.likes} thích</span>
              )}
            </div>
          </div>

          {/* ── Thumbnail ── */}
          {thumbnailUrl && !youtubeId && (
            <div className="rounded-xl overflow-hidden mb-10 bg-secondary/30">
              <Image
                src={thumbnailUrl}
                alt={post.thumbnail?.alternativeText ?? post.title}
                width={post.thumbnail?.width ?? 1200}
                height={post.thumbnail?.height ?? 800}
                className="w-full h-auto"
                priority
              />
            </div>
          )}

          {/* ── YouTube embed ── */}
          {youtubeId && (
            <div className="rounded-xl overflow-hidden mb-10 aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {/* ── Non-YouTube video URL ── */}
          {post.video_url && !youtubeId && (
            <div className="rounded-xl overflow-hidden mb-10 bg-black">
              <video
                src={post.video_url}
                controls
                poster={thumbnailUrl ?? undefined}
                className="w-full max-h-[500px]"
              />
            </div>
          )}

          {/* ── Audio player ── */}
          {post.audio_url && (
            <div className="mb-8 p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-2">Nghe bài khai thị</p>
              <audio src={post.audio_url} controls className="w-full" />
            </div>
          )}

          {/* ── Content (HTML from CKEditor) ── */}
          <article
            className="prose dark:prose-invert prose-gold max-w-none mb-10 whitespace-pre-wrap
              prose-headings:font-display prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-gold hover:prose-a:underline
              prose-strong:text-foreground
              prose-blockquote:border-gold/30 prose-blockquote:text-muted-foreground
              prose-img:rounded-lg "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* ── Gallery ── */}
          {post.gallery && post.gallery.length > 0 && (
            <div className="mb-10">
              <h3 className="font-display text-lg text-foreground mb-4">Hình ảnh minh họa</h3>
              <div className={`grid gap-3 ${post.gallery.length === 1 ? 'grid-cols-1' : post.gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                {post.gallery.map((img) => {
                  const imgUrl = getStrapiMediaUrl(img.formats?.medium?.url ?? img.url)
                  if (!imgUrl) return null
                  return (
                    <div key={img.id} className="rounded-lg overflow-hidden aspect-video bg-secondary">
                      <Image
                        src={imgUrl}
                        alt={img.alternativeText ?? ''}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Original Link ── */}
          {post.original_link && (
            <div className="mb-10">
              <a
                href={post.original_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-gold text-sm font-medium border border-gold/20 hover:bg-gold hover:text-black transition-all shadow-sm"
              >
                <ArrowRightIcon className="w-4 h-4 translate-y-px" />
                Xem bài viết gốc (Link gốc)
              </a>
              <p className="mt-2 text-[10px] text-muted-foreground italic">
                Lưu ý: Link dẫn đến trang web chính thống của Pháp Môn Tâm Linh (xlch.org)
              </p>
            </div>
          )}

          {/* ── Tags ── */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-10 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Related posts ── */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-display text-lg text-foreground mb-6">Bài viết liên quan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((rp) => {
                  const rpThumb = rp.thumbnail
                    ? getStrapiMediaUrl(rp.thumbnail.formats?.small?.url ?? rp.thumbnail.url)
                    : null
                  return (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      className="flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/30 transition-all group"
                    >
                      {rpThumb && (
                        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                          <Image
                            src={rpThumb}
                            alt={rp.thumbnail?.alternativeText ?? rp.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(rp.publishedAt ?? rp.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <h4 className="text-sm font-medium text-foreground group-hover:text-gold transition-colors leading-snug line-clamp-3">
                          {rp.title}
                        </h4>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Share Buttons ── */}
          <ShareButtons
            url={`/blog/${post.slug}`}
            content={post.content}
          />

          {/* ── Back link ── */}
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gold hover:underline text-sm"
            >
              ← Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
