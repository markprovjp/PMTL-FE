// ─────────────────────────────────────────────────────────────
//  app/api/community-posts/route.ts — Community-posts proxy
// ─────────────────────────────────────────────────────────────

import { buildStrapiUrl } from '@/lib/strapi'
import type { StrapiList } from '@/types/strapi'

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
      next: { revalidate: 60, tags: ['community-posts'] },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[CommunityPosts Proxy] Error from Strapi:', res.status, errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch community posts', status: res.status, details: errorData }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
