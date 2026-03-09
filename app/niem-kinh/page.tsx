// ─────────────────────────────────────────────────────────────
//  app/niem-kinh/page.tsx  —  Niệm Kinh (Server Component)
//
//  1) Tính ngày hôm nay (Asia/Bangkok)
//  2) Tính âm lịch bằng @forvn/vn-lunar-calendar
//  3) Fetch Today Chant List từ Strapi aggregator (server-side, có auth token)
//  4) Render ChantingRunner (client component)
// ─────────────────────────────────────────────────────────────
import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeaderServer from '@/components/HeaderServer';
import Footer from '@/components/Footer';
import StickyBanner from '@/components/StickyBanner';
import { fetchTodayChant } from '@/lib/api/chanting';
import type { TodayChantResponse } from '@/lib/api/chanting';
import { CHANTING_ADMIN_COPY } from '@/lib/config/chanting';
import ChantingRunner from './ChantingRunner';
import { ChantingNotesSection } from '@/components/ChantingNotesSection';
import { Moon } from 'lucide-react';


export const revalidate = 3600; // Cache 1 hour, auto-revalidate

export const metadata: Metadata = {
  title: 'Niệm Kinh — Lịch Trình Niệm Hôm Nay',
  description: 'Theo dõi đúng chant plan đang cấu hình trong admin: bài niệm, tiến độ thực hành và sự kiện âm lịch trong ngày.',
};

// ── Tính ngày trong timezone Asia/Bangkok ────────────────────
function getTodayBKK(): { isoDate: string; year: number; month: number; day: number; serverNow: string } {
  const now = new Date();
  const bkk = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const isoDate = bkk.toISOString().slice(0, 10);
  const [year, month, day] = isoDate.split('-').map(Number);
  return { isoDate, year, month, day, serverNow: now.toISOString() };
}

// ── Tính âm lịch (server-side) ────────────────────────────────
async function getLunarDate(
  year: number,
  month: number,
  day: number
): Promise<{ month: number; day: number } | null> {
  try {
    const lunarLib = await import('@forvn/vn-lunar-calendar');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LC = (lunarLib as any).LunarCalendar ?? (lunarLib as any).default?.LunarCalendar;
    if (!LC) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lc = new LC(day, month, year);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ld = (lc as any)._lunarDate;
    if (!ld) return null;
    return { month: ld.month, day: ld.day };
  } catch {
    return null;
  }
}

// ── Format âm lịch ────────────────────────────────────────────
function formatLunar(lunarInfo: { month: number; day: number } | null): string {
  if (!lunarInfo) return '';
  const { day, month } = lunarInfo;
  return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month} ÂL`;
}

export default async function NiemKinhPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planSlug } = await searchParams;
  const { isoDate, year, month, day, serverNow } = getTodayBKK();
  const lunar = await getLunarDate(year, month, day);

  const data: TodayChantResponse | null = await fetchTodayChant({
    date: isoDate,
    lunarMonth: lunar?.month ?? null,
    lunarDay: lunar?.day ?? null,
    planSlug,
  });

  // Format ngày hiển thị
  const [y, m, d2] = isoDate.split('-').map(Number);
  const solarLabel = `${d2 < 10 ? '0' + d2 : d2}/${m < 10 ? '0' + m : m}/${y}`;

  return (
    <div className="min-h-screen bg-background">
      <StickyBanner />
      <HeaderServer />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          {/* ── Header Section ────────────────────────────────── */}
          <div className="mb-12">
            <div className="flex flex-col items-center text-center mb-8">
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">{CHANTING_ADMIN_COPY.pageEyebrow}</p>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4 leading-tight">
                {CHANTING_ADMIN_COPY.pageTitle}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {CHANTING_ADMIN_COPY.pageDescription}
              </p>
              <p className="text-muted-foreground text-base">
                {solarLabel}
                {lunar && (
                  <span className="ml-2 text-amber-500 font-medium inline-flex items-center gap-1">
                    <Moon className="w-4 h-4" />
                    {formatLunar(lunar)}
                  </span>
                )}
              </p>
            </div>

            {/* Event badges */}
            {data && data.todayEvents.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {data.todayEvents.map((ev) => (
                  <span
                    key={ev.id}
                    className="text-xs md:text-sm px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium"
                  >
                    {ev.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Chanting Runner ───────────────────────────────── */}
          <div className="mb-16">
            {!data ? (
              <EmptyState planSlug={planSlug} />
            ) : (
              <Suspense fallback={<RunnerSkeleton />}>
                <ChantingRunner
                  todayChant={data}
                  isoDate={isoDate}
                  serverNow={serverNow}
                />
              </Suspense>
            )}
          </div>

          {/* ── Chanting Notes Section ────────────────────────── */}
          {data && <ChantingNotesSection />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ planSlug }: { planSlug?: string }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-muted-foreground/30 bg-card/30 p-12 text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">Chưa có lịch trình niệm để hiển thị</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Trong Strapi Admin, hãy kiểm tra{' '}
        <span className="font-semibold">{CHANTING_ADMIN_COPY.collectionName}</span>
        {planSlug ? (
          <>
            {' '}ở slug <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{planSlug}</code>
          </>
        ) : null}
        {' '}và bảo đảm entry đó đã có <span className="font-semibold">{CHANTING_ADMIN_COPY.itemComponent}</span>.
      </p>
      <a href="/lunar-calendar" className="inline-block text-sm text-amber-500 hover:text-amber-600 font-medium transition-colors">
        Xem lịch tu học →
      </a>
    </div>
  );
}

function RunnerSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-24 rounded-xl bg-muted" />
    </div>
  );
}
