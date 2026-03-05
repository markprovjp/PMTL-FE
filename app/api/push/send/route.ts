// ─────────────────────────────────────────────────────────────
//  POST /api/push/send — Gửi push notification
//
//  Gọi bởi cron job (hoặc Strapi webhook) để nhắc nhở hàng ngày
//  Header bảo mật: Authorization: Bearer <PUSH_SEND_SECRET>
//
//  Cài web-push: npm install web-push
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const DB_FILE = path.join(process.cwd(), '.push-subscriptions', 'subscriptions.json')

interface Subscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
  reminderHour: number
}

export async function POST(req: NextRequest) {
  // Xác thực bí mật
  const secret = process.env.PUSH_SEND_SECRET
  const auth = req.headers.get('Authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
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

  let subs: Subscription[] = []
  try {
    subs = JSON.parse(await readFile(DB_FILE, 'utf-8'))
  } catch {
    return NextResponse.json({ sent: 0 })
  }

  // Chỉ gửi cho subscription có giờ nhắc là giờ hiện tại
  const targets = subs.filter((s) => s.reminderHour === currentHour)

  // Lazy import web-push (npm install web-push khi deploy)
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
    targets.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: targets.length })
}
