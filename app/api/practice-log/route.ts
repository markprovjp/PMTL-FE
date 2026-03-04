// ─────────────────────────────────────────────────────────────
//  app/api/practice-log/route.ts
//
//  GET  /api/practice-log?date=YYYY-MM-DD&planSlug=...
//  PUT  /api/practice-log  body: { date, planSlug, itemsProgress }
//
//  Proxy đến Strapi với user JWT (lấy từ Authorization header)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { STRAPI_URL } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

function getUserJwt(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function GET(req: NextRequest) {
  const jwt = getUserJwt(req);
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const date = searchParams.get('date');
  const planSlug = searchParams.get('planSlug') ?? 'daily-newbie';

  if (!date) return NextResponse.json({ error: 'Thiếu date' }, { status: 400 });

  try {
    const qs = new URLSearchParams({ date, planSlug });
    const res = await fetch(`${STRAPI_URL}/api/practice-logs/my?${qs}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[api/practice-log GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const jwt = getUserJwt(req);
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const res = await fetch(`${STRAPI_URL}/api/practice-logs/my`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[api/practice-log PUT]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
