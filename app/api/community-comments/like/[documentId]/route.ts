import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

// URL format: /api/community-comments/like/[documentId]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || process.env.STRAPI_API_TOKEN

  if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const res = await fetch(`${STRAPI_URL}/api/community-comments/like/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
