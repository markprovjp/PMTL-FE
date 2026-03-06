// ─────────────────────────────────────────────────────────────
//  POST /api/auth/google-callback
//  Trao đổi authorization code lấy JWT Strapi → set httpOnly cookie
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json()

    if (!access_token) {
      return NextResponse.json({ error: 'Thiếu mã truy cập (access_token)' }, { status: 400 })
    }

    // 1) Đổi access_token từ Google lấy JWT và User của Strapi
    const res = await fetch(`${STRAPI_URL}/api/auth/google/callback?access_token=${access_token}`)
    const data = await res.json()

    if (!res.ok || !data.jwt) {
      return NextResponse.json(
        { error: data.error?.message || 'Xác thực Google thất bại hoặc token không hợp lệ' },
        { status: 401 }
      )
    }

    const { jwt, user } = data

    // 2) Set httpOnly cookie với JWT từ Strapi
    const cookieStore = await cookies()
    cookieStore.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    // 3) Chuẩn hóa avatar_url nếu cần
    if (user?.avatar_url && typeof user.avatar_url === 'object') {
      user.avatar_url = user.avatar_url.url?.startsWith('http')
        ? user.avatar_url.url
        : `${STRAPI_URL}${user.avatar_url.url}`
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[Google Callback] Error:', err)
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi xác thực Google' },
      { status: 500 }
    )
  }
}


