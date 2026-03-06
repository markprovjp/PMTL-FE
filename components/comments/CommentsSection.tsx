// CommentsSection.tsx — Server Component wrapper
// Fetches first page of comments server-side (SEO) then passes to client.

import { getBlogCommentsBySlug } from '@/lib/api/blogComments'
import CommentsClient from './CommentsClient'

interface CommentsSectionProps {
  slug: string
}

export default async function CommentsSection({ slug }: CommentsSectionProps) {
  let initialData = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
  }

  try {
    initialData = await getBlogCommentsBySlug(slug, 1, 20)
  } catch {
    // Nếu không tải được — hiển thị phần tử trống, client sẽ retry
  }

  return <CommentsClient slug={slug} initialData={initialData} />
}
