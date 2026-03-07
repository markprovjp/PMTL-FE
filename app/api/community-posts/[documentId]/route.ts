import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  const token = process.env.STRAPI_API_TOKEN

  try {
    const res = await fetch(`${STRAPI_URL}/api/community-posts/${documentId}?populate[0]=cover_image&populate[1]=comments.author_avatar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 60, tags: [`community-post-${documentId}`] },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
