// ─────────────────────────────────────────────────────────────
//  GET /api/auth/google-callback?access_token=...
//  Trao đổi Google access_token lấy JWT Strapi → set httpOnly cookie
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const access_token = searchParams.get('access_token')

  if (!access_token) {
    return NextResponse.json({ error: 'Thiếu access_token' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/auth/google/callback?access_token=${encodeURIComponent(access_token)}`
    )
    const data = await res.json()

    if (!res.ok || !data.jwt) {
      return NextResponse.json(
        { error: data.error?.message || 'Xác thực thất bại' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('auth_token', data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    // Chuẩn hóa avatar_url
    if (data.user?.avatar_url && typeof data.user.avatar_url === 'object') {
      data.user.avatar_url = data.user.avatar_url.url?.startsWith('http')
        ? data.user.avatar_url.url
        : `${STRAPI_URL}${data.user.avatar_url.url}`
    }

    return NextResponse.json({ user: data.user })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
