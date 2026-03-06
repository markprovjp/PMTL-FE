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

  return (
    <div className="space-y-10">
      {data.map((yearData) => (
        <div key={yearData.year}>
          {/* Year header */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/archive/${yearData.year}`}
              className="font-display text-2xl text-foreground hover:text-gold transition-colors"
            >
              {yearData.year}
            </Link>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {yearData.total} bài
            </span>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {yearData.months.map((m) => (
              <Link
                key={m.month}
                href={`/archive/${yearData.year}/${m.month}`}
                className="group flex flex-col items-center justify-center gap-0.5 rounded-xl border border-border p-3 hover:border-gold/40 hover:bg-gold/5 transition-all text-center"
              >
                <span className="text-xs font-medium text-muted-foreground group-hover:text-gold transition-colors">
                  {MONTH_VI_SHORT[m.month]}
                </span>
                <span className="text-lg font-display text-foreground group-hover:text-gold transition-colors leading-none">
                  {m.count}
                </span>
                <span className="text-[10px] text-muted-foreground/60">bài</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
