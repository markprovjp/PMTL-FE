import { NextRequest, NextResponse } from 'next/server'
import { fetchRecentNotifications } from '@/lib/push-server'

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') || '12')

  try {
    const result = await fetchRecentNotifications(limit)
    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể tải thông báo' },
      { status: 500 }
    )
  }
}
