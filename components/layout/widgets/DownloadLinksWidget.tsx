// components/layout/widgets/DownloadLinksWidget.tsx — Server component
import { DownloadIcon } from 'lucide-react'
import type { QuickLink } from '@/types/strapi'

interface DownloadLinksWidgetProps {
  links: QuickLink[]
}

export default function DownloadLinksWidget({ links }: DownloadLinksWidgetProps) {
  if (!links || links.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <DownloadIcon className="w-3.5 h-3.5" />
        Tài liệu tải về
      </h3>
      <ul className="space-y-1.5">
        {links.map((link, i) => (
          <li key={i}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-gold transition-colors group"
            >
              <DownloadIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50 group-hover:text-gold/60 transition-colors" />
              <span className="line-clamp-1">{link.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
