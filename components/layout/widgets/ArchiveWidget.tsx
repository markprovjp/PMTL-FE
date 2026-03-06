// components/layout/widgets/ArchiveWidget.tsx — Server component
// Compact archive list: years with expandable months
import Link from 'next/link'
import { ArchiveIcon } from 'lucide-react'
import { getArchiveIndex } from '@/lib/api/archive'

const MONTH_VI_SHORT = [
  '', 'Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6',
  'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12',
]

export default async function ArchiveWidget() {
  let data: Awaited<ReturnType<typeof getArchiveIndex>> = []
  try {
    data = await getArchiveIndex()
  } catch {
    return null
  }

  if (data.length === 0) return null

  // Max 3 years in sidebar
  const years = data.slice(0, 3)

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <ArchiveIcon className="w-3.5 h-3.5" />
        Lưu trữ
      </h3>

      <div className="space-y-4">
        {years.map((y) => (
          <div key={y.year}>
            <Link
              href={`/archive/${y.year}`}
              className="flex items-center justify-between text-sm font-medium text-foreground hover:text-gold transition-colors mb-2"
            >
              <span>{y.year}</span>
              <span className="text-xs text-muted-foreground/60">{y.total} bài</span>
            </Link>
            <div className="flex flex-wrap gap-1">
              {y.months.map((m) => (
                <Link
                  key={m.month}
                  href={`/archive/${y.year}/${m.month}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all"
                  title={`${MONTH_VI_SHORT[m.month]} — ${m.count} bài`}
                >
                  {MONTH_VI_SHORT[m.month]}
                  <span className="text-[9px] text-muted-foreground/50">{m.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/archive"
        className="mt-4 block text-xs text-muted-foreground hover:text-gold transition-colors"
      >
        Xem toàn bộ lưu trữ →
      </Link>
    </div>
  )
}
