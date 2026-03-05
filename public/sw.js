// ─────────────────────────────────────────────────────────────
//  public/sw.js — Service Worker cho PWA
//  Cache-first cho static assets, network-first cho API
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'pmtl-v1'
const STATIC_ASSETS = [
  '/',
  '/niem-kinh',
  '/lunar-calendar',
  '/blog',
  '/manifest.json',
]

// ── Install: pre-cache shell ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// ── Activate: xóa cache cũ ───────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first cho API, cache-first cho static ─────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Bỏ qua các request không phải GET và các request cross-origin
  if (event.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // API routes: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request)
      })
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((res) => {
        if (res.ok && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return res
      })
    })
  )
})

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pháp Môn Tâm Linh', {
      body: data.body || 'Nhắc nhở niệm kinh hôm nay',
      icon: '/images/PMTL-LOGO.png',
      badge: '/images/PMTL-LOGO.png',
      tag: data.tag || 'pmtl-reminder',
      data: { url: data.url || '/niem-kinh' },
      actions: [
        { action: 'open', title: 'Mở ngay' },
        { action: 'dismiss', title: 'Để sau' },
      ],
    })
  )
})

// ── Notification click ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/niem-kinh'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(targetUrl))
      if (existing) return existing.focus()
      return self.clients.openWindow(targetUrl)
    })
  )
})
