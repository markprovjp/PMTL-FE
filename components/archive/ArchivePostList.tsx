// components/archive/ArchivePostList.tsx — Server component
// Renders a list of blog posts from archive query result
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
    ? getStrapiMediaUrl(post.thumbnail.formats?.medium?.url ?? post.thumbnail.url)
    : null

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <article className="group flex gap-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow p-4">
      {cover && (
        <div className="shrink-0 w-24 h-20 rounded-lg overflow-hidden bg-muted">
          <Image
            src={cover}
            alt={post.title}
            width={96}
            height={80}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <Link
          href={`/blog/${post.slug}`}
          className="block font-display text-base text-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug mb-1.5"
        >
          {post.title}
        </Link>
        {post.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
            {post.excerpt}
          </p>
        )}
        <time
          dateTime={post.publishedAt ?? undefined}
          className="text-[11px] text-muted-foreground/60"
        >
          {publishedDate}
        </time>
      </div>
    </article>
  )
}

export default function ArchivePostList({ data, year, month }: ArchivePostListProps) {
  const { data: posts, meta } = data

  const periodLabel = month
    ? `${MONTH_VI[month]} ${year}`
    : `Năm ${year}`

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Không có bài viết nào trong {periodLabel}.
      </p>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        {meta.pagination.total.toLocaleString('vi-VN')} bài viết · {periodLabel}
      </p>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.documentId} post={post} />
        ))}
      </div>
    </div>
  )
}
