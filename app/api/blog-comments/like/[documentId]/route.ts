// ─────────────────────────────────────────────────────────────
//  app/api/blog-comments/like/[documentId]/route.ts
//  POST — tăng lượt thích bình luận
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const token = process.env.STRAPI_API_TOKEN
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { documentId } = await params
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/blog-comments/like/${encodeURIComponent(documentId)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
