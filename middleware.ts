// ─────────────────────────────────────────────────────────────
//  middleware.ts — Bảo vệ route yêu cầu đăng nhập
//  Kiểm tra cookie auth_token, redirect sang /auth nếu chưa có
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value

  if (!token) {
    const redirectUrl = req.nextUrl.clone()
    const originalPath = req.nextUrl.pathname
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirect', originalPath)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*'],
}
