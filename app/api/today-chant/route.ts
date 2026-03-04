// ─────────────────────────────────────────────────────────────
//  app/api/today-chant/route.ts
//
//  GET /api/today-chant?date=YYYY-MM-DD&planSlug=daily-newbie
//
//  1) Tính lunarMonth/lunarDay từ date dùng @forvn/vn-lunar-calendar
//  2) Gọi Strapi aggregator và trả về kết quả cho client
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { fetchTodayChant } from '@/lib/api/chanting';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const planSlug = searchParams.get('planSlug') ?? 'daily-newbie';

    // ── Xác định ngày hôm nay (Asia/Bangkok = UTC+7) ──
    const dateParam = searchParams.get('date');
    let isoDate: string;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      isoDate = dateParam;
    } else {
      // Tính ngày theo timezone Asia/Bangkok (UTC+7)
      const now = new Date();
      const bkk = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      isoDate = bkk.toISOString().slice(0, 10);
    }

    // ── Tính âm lịch ──────────────────────────────────
    let lunarMonth: number | null = null;
    let lunarDay: number | null = null;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      // @forvn/vn-lunar-calendar API: new LunarCalendar(day, month, year)._lunarDate
      const lunarLib = await import('@forvn/vn-lunar-calendar');
      const LC = (lunarLib as any).LunarCalendar ?? (lunarLib as any).default?.LunarCalendar;
      if (LC) {
        const lc = new LC(day, month, year);
        const ld = (lc as any)._lunarDate;
        if (ld) {
          lunarMonth = ld.month ?? null;
          lunarDay = ld.day ?? null;
        }
      }
    } catch (lunarErr) {
      console.warn('[today-chant] Lunar conversion failed:', lunarErr);
    }

    const data = await fetchTodayChant({ date: isoDate, lunarMonth, lunarDay, planSlug });

    if (!data) {
      return NextResponse.json(
        { error: 'Chưa khởi tạo dữ liệu niệm kinh. Hãy tạo plan "daily-newbie" trong Strapi Admin.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[api/today-chant] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
