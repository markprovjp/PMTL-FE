// ─────────────────────────────────────────────────────────────
//  POST /api/push/send — Gửi push notification
//
//  Gọi bởi cron job (định kỳ) để nhắc nhở hàng ngày
//  Header bảo mật: Authorization: Bearer <PUSH_SEND_SECRET>
//  Subscriptions lấy từ Strapi DB (không dùng file system).
//
//  Cài web-push: npm install web-push
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ''

interface Subscription {
  endpoint: string
  p256dh: string
  auth: string
  reminderHour: number
}

async function fetchSubscriptionsForHour(hour: number): Promise<Subscription[]> {
  const url = `${STRAPI_URL}/api/push-subscriptions?filters[reminderHour][$eq]=${hour}&pagination[limit]=500`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data?.data || []).map((item: any) => ({
    endpoint: item.endpoint,
    p256dh: item.p256dh,
    auth: item.auth,
    reminderHour: item.reminderHour,
  }))
}

export async function POST(req: NextRequest) {
  // Xác thực bí mật
  const secret = process.env.PUSH_SEND_SECRET
  const authHeader = req.headers.get('Authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL || 'admin@phapmontamlinh.vn'

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'VAPID keys chưa cấu hình' }, { status: 500 })
  }

  const currentHour = new Date().getHours()
  const { message } = await req.json().catch(() => ({}))

  const subs = await fetchSubscriptionsForHour(currentHour)
  if (subs.length === 0) return NextResponse.json({ sent: 0 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let webpush: any
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    webpush = require('web-push')
  } catch {
    return NextResponse.json({ error: 'web-push chưa được cài (npm install web-push)' }, { status: 500 })
  }

  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate)

  const payload = JSON.stringify({
    title: 'Nhắc Niệm Kinh',
    body: message || 'Đến giờ niệm kinh hôm nay rồi, hãy dành vài phút tu tập nhé!',
    url: '/niem-kinh',
    tag: 'daily-reminder',
  })

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: subs.length })
}
