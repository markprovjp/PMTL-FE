// components/layout/widgets/LatestCommentsWidget.tsx — Server component
import Link from 'next/link'
import { MessageSquareIcon } from 'lucide-react'
import { getSidebarLatestComments } from '@/lib/api/sidebar'

export default async function LatestCommentsWidget() {
  let comments: Awaited<ReturnType<typeof getSidebarLatestComments>> = []
  try {
    comments = await getSidebarLatestComments(5)
  } catch {
    return null
  }

  if (comments.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <MessageSquareIcon className="w-3.5 h-3.5" />
        Bình luận gần đây
      </h3>
      <ul className="space-y-3">
        {comments.map((c) => {
          const postSlug = (c as any).post?.slug as string | undefined
          const postTitle = (c as any).post?.title as string | undefined
          const snippet = c.content.slice(0, 60) + (c.content.length > 60 ? '…' : '')
          return (
            <li key={c.documentId} className="text-xs leading-relaxed">
              <span className="font-medium text-foreground/80">{c.authorName}</span>
              {postSlug ? (
                <Link
                  href={`/blog/${postSlug}#comments`}
                  className="block text-muted-foreground hover:text-gold transition-colors mt-0.5 line-clamp-2"
                >
                  {snippet}
                </Link>
              ) : (
                <p className="text-muted-foreground mt-0.5 line-clamp-2">{snippet}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
