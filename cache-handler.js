// ─────────────────────────────────────────────────────────────
//  cache-handler.js — ISR Cache Handler dùng Redis
//
//  Thay thế file system cache mặc định của Next.js bằng Redis.
//  Cho phép share cache giữa nhiều instance (khi scale horizontal).
//
//  Cài đặt: npm install @neshca/cache-handler @neshca/json-replacer-reviver ioredis
//
//  Kích hoạt trong next.config.mjs:
//    cacheHandler: require.resolve('./cache-handler.js'),
//    cacheMaxMemorySize: 0,  // Tắt in-memory cache, dùng Redis hoàn toàn
// ─────────────────────────────────────────────────────────────

const { IncrementalCache } = require('@neshca/cache-handler')
const { createClient } = require('ioredis')

// Chỉ kích hoạt Redis nếu có REDIS_URL
const redisUrl = process.env.REDIS_URL

IncrementalCache.onCreation(async () => {
  if (!redisUrl) {
    console.warn('[cache-handler] REDIS_URL chưa cấu hình — dùng file system cache')
    return { handlers: [] }
  }

  const client = new createClient(redisUrl)

  client.on('error', (err) => {
    console.error('[cache-handler] Redis error:', err)
  })

  await client.connect().catch(() => {
    console.error('[cache-handler] Không thể kết nối Redis')
  })

  const redisHandler = {
    name: 'redis',

    async get(key) {
      try {
        const val = await client.get(key)
        if (!val) return null
        return JSON.parse(val)
      } catch {
        return null
      }
    },

    async set(key, value, ttl) {
      try {
        const serialized = JSON.stringify(value)
        if (ttl) {
          await client.set(key, serialized, 'EX', ttl)
        } else {
          await client.set(key, serialized)
        }
      } catch { }
    },

    async delete(key) {
      try {
        await client.del(key)
      } catch { }
    },
  }

  return {
    handlers: [redisHandler],
  }
})

module.exports = IncrementalCache
