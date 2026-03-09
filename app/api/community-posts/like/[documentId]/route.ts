import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || process.env.STRAPI_API_TOKEN

  if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const res = await fetch(`${STRAPI_URL}/api/community-posts/like/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Không thể thích bài viết') },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
