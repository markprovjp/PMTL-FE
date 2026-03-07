// components/archive/ArchivePostList.tsx — Server component  
// Editorial archive: featured post + chronological reading list
import Link from 'next/link'
import Image from 'next/image'
import type { StrapiList, BlogPost } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi'

interface ArchivePostListProps {
  data: StrapiList<BlogPost>
  year: number
  month?: number
}

const MONTH_VI = [
  '', 'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
  'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
]

function PostCard({ post }: { post: BlogPost }) {
  const cover = post.thumbnail
    ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
    : null

  const day = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit' })
    : ''
  const month = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { month: 'short' })
    : ''

  return (
    <article className="group relative flex gap-8 py-8 border-b border-gold/5 last:border-0 hover:bg-gold/[0.01] transition-colors rounded-xl px-4 -mx-4">
      {/* Date floating label */}
      <div className="shrink-0 w-12 pt-1 text-center">
        <span className="block text-2xl font-display text-foreground/80 group-hover:text-gold transition-colors">{day}</span>
        <span className="block text-[10px] font-bold text-gold/40 uppercase tracking-widest">{month}</span>
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/blog/${post.slug}`}
          className="block font-display text-lg md:text-xl text-foreground group-hover:text-gold transition-colors leading-tight mb-3"
        >
          {post.title}
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed max-w-2xl">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4">
          <span className="text-[10px] font-bold text-gold/60 uppercase tracking-tighter">Bộ sưu tập</span>
          <div className="w-4 h-px bg-gold/20" />
          <span className="text-[10px] text-muted-foreground/40 italic">Nhấp để đọc toàn văn</span>
        </div>
      </div>

      {cover && (
        <div className="hidden sm:block shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-muted rotate-2 group-hover:rotate-0 transition-transform duration-500 shadow-sm border border-gold/10">
          <Image
            src={cover}
            alt={post.title}
            width={120}
            height={120}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      )}
    </article>
  )
}

// Featured post card — Premium Banner Style
function FeaturedPostCard({ post }: { post: BlogPost }) {
  const cover = post.thumbnail
    ? getStrapiMediaUrl(post.thumbnail.formats?.large?.url ?? post.thumbnail.url)
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block rounded-2xl overflow-hidden border border-gold/20 bg-card hover:border-gold/40 transition-all duration-500 shadow-xl shadow-gold/5"
    >
      <div className="flex flex-col lg:flex-row gap-0">
        {cover && (
          <div className="shrink-0 w-full lg:w-1/2 h-64 lg:h-auto overflow-hidden relative">
            <Image
              src={cover}
              alt={post.title}
              width={600}
              height={480}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 lg:to-background/20" />

            {/* Year highlight tag */}
            <div className="absolute top-6 left-6 px-4 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Tác phẩm tiêu biểu</span>
            </div>
          </div>
        )}
        <div className={`${cover ? 'lg:w-1/2' : 'w-full'} p-8 md:p-12 flex flex-col justify-center`}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <p className="text-[10px] font-bold tracking-[0.4em] text-gold/70 uppercase">Điểm tin lưu trữ</p>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground group-hover:text-gold transition-colors leading-[1.1]">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-base text-muted-foreground leading-relaxed italic border-l-2 border-gold/20 pl-6">
                {post.excerpt}
              </p>
            )}

            <div className="pt-4 flex items-center gap-4">
              <span className="text-sm font-bold text-foreground">Đọc bài viết</span>
              <div className="w-12 h-0.5 bg-gold/30 group-hover:w-20 transition-all duration-500" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ArchivePostList({ data, year, month }: ArchivePostListProps) {
  const { data: posts, meta } = data

  const periodLabel = month
    ? `${MONTH_VI[month]} ${year}`
    : `Năm ${year}`

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-gold/20">
        <p className="text-muted-foreground italic">Không tìm thấy bản ghi nào trong {periodLabel}.</p>
      </div>
    )
  }

  // Featured post (first) + remaining posts
  const [featured, ...remaining] = posts

  return (
    <div className="space-y-20">
      {/* Featured post */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <p className="text-[10px] font-black tracking-[0.5em] text-gold/40 uppercase">Tuyển tập tiêu biểu</p>
          <span className="h-px flex-1 mx-8 bg-gold/10 hidden md:block" />
        </div>
        <FeaturedPostCard post={featured} />
      </section>

      {/* Remaining posts (if any) */}
      {remaining.length > 0 && (
        <div>
          <div className="border-t border-gold/10 pt-12">
            <p className="text-sm text-muted-foreground mb-6">
              {remaining.length} bài viết khác · {periodLabel}
            </p>
            <div className="space-y-3">
              {remaining.map((post) => (
                <PostCard key={post.documentId} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
