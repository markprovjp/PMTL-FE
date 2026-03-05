'use client'
// ─────────────────────────────────────────────────────────────
//  components/PushNotificationButton.tsx
//  Nút đăng ký / huỷ nhận thông báo nhắc niệm kinh
//
//  Yêu cầu:
//   - NEXT_PUBLIC_VAPID_PUBLIC_KEY trong .env.local
//   - Service worker (/sw.js) đã đăng ký
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array(Array.from(rawData).map((c) => c.charCodeAt(0)))
}

interface Props {
  className?: string
  /** Giờ nhắc (0-23, mặc định 6 sáng) */
  defaultHour?: number
}

export default function PushNotificationButton({ className, defaultHour = 6 }: Props) {
  const [status, setStatus] = useState<'unsupported' | 'loading' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')
  const [reminderHour, setReminderHour] = useState(defaultHour)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    // Kiểm tra trạng thái subscription hiện tại
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  const subscribe = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY chưa được cấu hình')
      return
    }

    setSaving(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      // Lưu subscription lên server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), reminderHour }),
      })

      if (res.ok) setStatus('subscribed')
    } catch (err) {
      console.error('Subscribe push failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const unsubscribe = async () => {
    setSaving(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setStatus('unsubscribed')
    } catch (err) {
      console.error('Unsubscribe push failed:', err)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'unsupported') return null

  if (status === 'denied') {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        Thông báo đã bị tắt trong trình duyệt. Bật lại trong cài đặt trình duyệt.
      </p>
    )
  }

  if (status === 'loading') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground">Đang kiểm tra...</span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {status === 'unsubscribed' && (
        <div className="flex items-center gap-2">
          <label htmlFor="remind-hour" className="text-xs text-muted-foreground whitespace-nowrap">
            Nhắc lúc:
          </label>
          <select
            id="remind-hour"
            value={reminderHour}
            onChange={(e) => setReminderHour(Number(e.target.value))}
            className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={status === 'subscribed' ? unsubscribe : subscribe}
        disabled={saving}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all',
          status === 'subscribed'
            ? 'bg-secondary border border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400'
            : 'bg-gold text-black hover:opacity-90',
          'disabled:opacity-50 disabled:cursor-wait'
        )}
      >
        {saving ? (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )}
        {status === 'subscribed'
          ? 'Tắt nhắc nhở'
          : `Nhắc niệm kinh lúc ${String(reminderHour).padStart(2, '0')}:00`}
      </button>

      {status === 'subscribed' && (
        <p className="text-xs text-green-400 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Đang nhắc nhở mỗi ngày lúc {String(reminderHour).padStart(2, '0')}:00
        </p>
      )}
    </div>
  )
}
