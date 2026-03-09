import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
}

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
      cache: 'no-store',
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status, headers: NO_STORE_HEADERS })
    }

    return NextResponse.json(data, { headers: NO_STORE_HEADERS })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500, headers: NO_STORE_HEADERS })
  }
}
