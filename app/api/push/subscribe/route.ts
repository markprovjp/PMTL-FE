// ─────────────────────────────────────────────────────────────
//  POST /api/push/subscribe — Lưu push subscription
//  DELETE /api/push/subscribe — Xoá push subscription
//
//  Thay thế bộ nhớ file JSON bằng DB thực tế khi lên production
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'

const DB_DIR = path.join(process.cwd(), '.push-subscriptions')
const DB_FILE = path.join(DB_DIR, 'subscriptions.json')

interface SubscriptionEntry {
  endpoint: string
  keys: { p256dh: string; auth: string }
  reminderHour: number
  createdAt: string
}

async function loadSubscriptions(): Promise<SubscriptionEntry[]> {
  try {
    const raw = await readFile(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveSubscriptions(subs: SubscriptionEntry[]): Promise<void> {
  await mkdir(DB_DIR, { recursive: true })
  await writeFile(DB_FILE, JSON.stringify(subs, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, reminderHour } = await req.json()

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Dữ liệu subscription không hợp lệ' }, { status: 400 })
    }

    const subs = await loadSubscriptions()
    // Cập nhật nếu đã tồn tại
    const idx = subs.findIndex((s) => s.endpoint === subscription.endpoint)
    const entry: SubscriptionEntry = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      reminderHour: Number(reminderHour) || 6,
      createdAt: new Date().toISOString(),
    }

    if (idx >= 0) {
      subs[idx] = entry
    } else {
      subs.push(entry)
    }

    await saveSubscriptions(subs)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    const subs = await loadSubscriptions()
    const filtered = subs.filter((s) => s.endpoint !== endpoint)
    await saveSubscriptions(filtered)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
