// ─────────────────────────────────────────────────────────────
//  POST /api/push/subscribe — Lưu push subscription vào Strapi DB
//  DELETE /api/push/subscribe — Xóa push subscription
//
//  Dữ liệu lưu trong Strapi collection push-subscription.
//  Không dùng file system — an toàn khi server restart.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ''

async function strapiReq(path: string, options: RequestInit = {}) {
  return fetch(`${STRAPI_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(options.headers || {}),
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, reminderHour } = await req.json()

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Dữ liệu subscription không hợp lệ' }, { status: 400 })
    }

    const res = await strapiReq('/push-subscriptions/upsert', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        reminderHour: Number(reminderHour) || 6,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Thiếu endpoint' }, { status: 400 })

    await strapiReq('/push-subscriptions/by-endpoint', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
