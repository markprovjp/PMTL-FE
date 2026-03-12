import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { enqueuePushJobSafe } from '@/lib/push-jobs'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const fallbackToken = process.env.STRAPI_API_TOKEN

  try {
    const body = await req.json()
    const actorUserId = typeof body?.actorUserId === 'number' ? body.actorUserId : null
    const actorEndpoint = typeof body?.actorEndpoint === 'string' ? body.actorEndpoint : null
    const strapiBody =
      typeof body === 'object' && body !== null
        ? Object.fromEntries(
            Object.entries(body as Record<string, unknown>).filter(
              ([key]) => key !== 'actorUserId' && key !== 'actorEndpoint'
            )
          )
        : body

    const res = await fetch(`${STRAPI_URL}/api/community-posts/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...((token || fallbackToken) ? { Authorization: `Bearer ${token || fallbackToken}` } : {}),
      },
      body: JSON.stringify(strapiBody),
    })

    const data = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          error: normalizeApiErrorMessage(data, res.status, 'Gửi bài thất bại'),
          details: data,
        },
        { status: res.status }
      )
    }

    const entry = typeof data === 'object' && data !== null ? (data as { data?: Record<string, unknown> }).data : null
    const title = typeof entry?.title === 'string' ? entry.title : 'Bài chia sẻ mới trong cộng đồng'
    const slug = typeof entry?.slug === 'string' ? entry.slug : null

    await enqueuePushJobSafe({
      kind: 'community',
      title: 'Có bài chia sẻ mới',
      body: `"${title}" vừa được đăng trong cộng đồng.`,
      url: slug ? `/shares?post=${encodeURIComponent(slug)}` : '/shares',
      tag: 'community-post',
      payload: {
        entity: 'community-post',
        slug,
        ...(actorUserId ? { excludeUserIds: [actorUserId] } : {}),
        ...(actorEndpoint ? { excludeEndpoints: [actorEndpoint] } : {}),
      },
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
