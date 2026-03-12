// ─────────────────────────────────────────────────────────────
//  middleware.ts — Bảo vệ route yêu cầu đăng nhập
//  Kiểm tra cookie auth_token, redirect sang /auth nếu chưa có
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const idToken = req.nextUrl.searchParams.get('id_token')
  const accessToken = req.nextUrl.searchParams.get('access_token')

  // OAuth callback fallback: if provider redirects to "/" with token query, route it to callback page.
  if ((idToken || accessToken) && req.nextUrl.pathname !== '/auth/google/callback') {
    const callbackUrl = req.nextUrl.clone()
    callbackUrl.pathname = '/auth/google/callback'
    return NextResponse.redirect(callbackUrl)
  }

  const token = req.cookies.get('auth_token')?.value

  if (req.nextUrl.pathname.startsWith('/profile') && !token) {
    const redirectUrl = req.nextUrl.clone()
    const originalPath = req.nextUrl.pathname
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirect', originalPath)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/profile/:path*'],
}
