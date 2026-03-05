// ─────────────────────────────────────────────────────────────
//  POST /api/auth/logout — Xóa httpOnly cookie đăng xuất
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  return NextResponse.json({ success: true })
}
