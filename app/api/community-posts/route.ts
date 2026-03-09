// ─────────────────────────────────────────────────────────────
//  app/api/community-posts/route.ts — Community-posts proxy
// ─────────────────────────────────────────────────────────────

import { buildStrapiUrl } from '@/lib/strapi'
import type { StrapiList } from '@/types/strapi'

const NO_STORE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
}

export async function GET(request: Request) {
  try {
    const token = process.env.STRAPI_API_TOKEN

    // Extract query parameters
    const { searchParams } = new URL(request.url)

    // Chuyển đổi searchParams sang object
    const queryObj: any = Object.fromEntries(searchParams.entries())

    // Xử lý mapping page/pageSize phẳng sang cấu trúc pagination của Strapi/buildStrapiUrl
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    if (page || pageSize) {
      queryObj.pagination = {
        ...(queryObj.pagination || {}),
        ...(page ? { page: parseInt(page) } : {}),
        ...(pageSize ? { pageSize: parseInt(pageSize) } : {})
      }
    }

    // Đảm bảo các tham số mặc định nếu thiếu
    if (!queryObj.populate) queryObj.populate = ['cover_image']
    if (!queryObj.sort) queryObj.sort = ['publishedAt:desc']
    if (!queryObj.status) queryObj.status = 'published'

    const url = buildStrapiUrl('/community-posts', queryObj)

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[CommunityPosts Proxy] Error from Strapi:', res.status, errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch community posts', status: res.status, details: errorData }),
        { status: res.status, headers: NO_STORE_HEADERS }
      )
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: NO_STORE_HEADERS,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errMsg }),
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}
