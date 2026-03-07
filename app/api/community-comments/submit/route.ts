import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
