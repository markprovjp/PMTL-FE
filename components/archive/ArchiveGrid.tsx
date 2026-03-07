// components/archive/ArchiveGrid.tsx — Server component
// Renders the archive index: years with expandable months and post counts
import Link from 'next/link'
import type { ArchiveYear } from '@/types/strapi'

const MONTH_VI_SHORT = [
  '', 'Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6',
  'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12',
]

interface ArchiveGridProps {
  data: ArchiveYear[]
}

export default function ArchiveGrid({ data }: ArchiveGridProps) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Chưa có bài viết nào trong lưu trữ.
      </p>
    )
  }

  // Find most recent month with posts (for featured section)
  const featuredMonth = data[0]?.months?.[0] // Latest year's latest month

  return (
    <div className="relative">
      {/* ── Vertical Timeline Decoration ── */}
      <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/10 to-transparent hidden md:block" />

      <div className="space-y-24">
        {/* ── Featured Month (Latest) — Editorial Reveal ── */}
        {featuredMonth && data[0] && (
          <section className="relative group pl-0 md:pl-16">
            {/* Timeline node */}
            <div className="absolute left-3 top-10 w-5 h-5 rounded-full bg-background border-2 border-gold hidden md:flex items-center justify-center z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            </div>

            <div className="p-8 md:p-12 rounded-2xl border border-gold/20 bg-gold/[0.03] relative overflow-hidden">
              {/* Decorative background icon */}
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 pointer-events-none">
                <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>

              <p className="text-[10px] font-bold tracking-[0.4em] text-gold/80 uppercase mb-4 pl-1 border-l-2 border-gold/40">Gần Đây Nhất</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                <Link
                  href={`/archive/${data[0].year}/${featuredMonth.month}`}
                  className="hover:text-gold transition-colors duration-500"
                >
                  {MONTH_VI_SHORT[featuredMonth.month]} <span className="text-gold/40 font-serif italic">{data[0].year}</span>
                </Link>
              </h2>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gold/10 flex items-center justify-center text-[8px] text-gold/60 font-bold uppercase">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground/70">{featuredMonth.count} Bài viết đã lưu trữ</span>
                <Link
                  href={`/archive/${data[0].year}/${featuredMonth.month}`}
                  className="ml-auto px-6 py-2 rounded-full border border-gold/30 text-xs font-bold text-gold hover:bg-gold hover:text-black transition-all"
                >
                  Mở Lưu Trữ →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Year Chapters ── */}
        <div className="space-y-32">
          {data.map((yearData) => (
            <div key={yearData.year} className="relative pl-0 md:pl-16">
              {/* Timeline Year Marker */}
              <div className="absolute left-0 top-0 hidden md:block">
                <div className="w-10 h-10 rounded-xl bg-background border border-gold/20 flex items-center justify-center font-display text-gold shadow-sm rotate-3">
                  {String(yearData.year).slice(-2)}
                </div>
              </div>

              {/* Year header */}
              <div className="flex items-end gap-6 mb-12">
                <Link
                  href={`/archive/${yearData.year}`}
                  className="font-display text-6xl md:text-8xl text-foreground/5 hover:text-gold/20 transition-all duration-700 leading-none select-none"
                >
                  {yearData.year}
                </Link>
                <div className="pb-2">
                  <p className="text-xs font-bold tracking-widest text-gold/60 uppercase mb-1">Toàn bộ tuyển tập</p>
                  <span className="text-xl font-display text-foreground/80">
                    {yearData.total} <span className="text-sm font-sans text-muted-foreground">Ấn bản</span>
                  </span>
                </div>
              </div>

              {/* Month grid — Catalog Card Style */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {yearData.months.map((m) => (
                  <Link
                    key={m.month}
                    href={`/archive/${yearData.year}/${m.month}`}
                    className="group relative flex flex-col items-start p-6 rounded-xl border border-gold/10 bg-card hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 transition-all"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                        <span className="text-[10px] text-black">→</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-gold/60 tracking-widest uppercase mb-4 group-hover:text-gold">
                      {MONTH_VI_SHORT[m.month]}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display text-foreground transition-transform group-hover:scale-105">
                        {m.count}
                      </span>
                      <span className="text-xs text-muted-foreground/50 italic">bài viết</span>
                    </div>

                    {/* Decorative stripe */}
                    <div className="mt-6 w-full h-0.5 bg-gold/5 overflow-hidden">
                      <div className="w-0 group-hover:w-full h-full bg-gold transition-all duration-700" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
