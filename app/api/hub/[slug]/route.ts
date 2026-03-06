// ─────────────────────────────────────────────────────────────
//  app/api/hub/[slug]/route.ts
//  GET — lấy hub page theo slug
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'
import qs from 'qs'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const token = process.env.STRAPI_API_TOKEN
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { slug } = await params
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: {
        sections: {
          populate: {
            links: {
              populate: {
                thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
              },
            },
          },
        },
      },
      status: 'published',
      pagination: { page: 1, pageSize: 1 },
    },
    { encodeValuesOnly: true }
  )

  try {
    const res = await fetch(`${STRAPI_URL}/api/hub-pages?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600, tags: ['hub-pages'] },
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
