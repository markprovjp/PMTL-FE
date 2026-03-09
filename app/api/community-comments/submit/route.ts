import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { enqueuePushJobSafe } from '@/lib/push-jobs'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  // Cho phép guest gửi comment; backend sẽ xử lý việc gán user hay không
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (process.env.STRAPI_API_TOKEN) {
    // Nếu là guest, ta có thể dùng system token để bypass permission nếu cần
    // Tuy nhiên nếu backend cho phép public submit thì không cần.
    // Tạm thời chỉ truyền token của user nếu có.
    headers['Authorization'] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }

  try {
    const body = await req.json();

    const res = await fetch(`${STRAPI_URL}/api/community-comments/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          error: normalizeApiErrorMessage(data, res.status, 'Gửi bình luận thất bại'),
          details: data,
        },
        { status: res.status }
      )
    }

    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    const postDocumentId = typeof body?.postDocumentId === 'string' ? body.postDocumentId : null
    const isReply = typeof body?.parentDocumentId === 'string' && body.parentDocumentId.length > 0

    await enqueuePushJobSafe({
      kind: 'community',
      title: isReply ? 'Có phản hồi mới trong thảo luận' : 'Có bình luận mới trong cộng đồng',
      body: content
        ? `${content.slice(0, 96)}${content.length > 96 ? '...' : ''}`
        : 'Một đạo hữu vừa gửi thêm nội dung mới trong cộng đồng.',
      url: '/shares',
      tag: isReply ? 'community-reply' : 'community-comment',
      payload: {
        entity: 'community-comment',
        postDocumentId,
        isReply,
      },
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
