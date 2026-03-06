// components/hub/HubLinkCard.tsx — Server component
// Renders a single hub link — Visual: Phật giáo, vàng/trầm, tĩnh mà sang
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLinkIcon, ArrowRightIcon } from 'lucide-react'
import type { HubLink } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi'
import { cn } from '@/lib/utils'

interface HubLinkCardProps {
  link: HubLink
}

export default function HubLinkCard({ link }: HubLinkCardProps) {
  const thumbnailUrl = link.thumbnail
    ? getStrapiMediaUrl(link.thumbnail.formats?.small?.url ?? link.thumbnail.url)
    : null

  const isExternal = link.kind === 'external'

  const wrapperClass =
    'group flex flex-col rounded-2xl border border-border bg-card hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 overflow-hidden'

  const inner = (
    <>
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnailUrl}
            alt={link.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* vignette nhẹ khi hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">

        {/* context tag nếu không có thumbnail */}
        {!thumbnailUrl && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold/50 mb-2">
            {isExternal ? 'Liên Kết Ngoài' : 'Bài Viết'}
          </span>
        )}

        {/* title — phân cấp rõ */}
        <h3 className="font-display text-sm md:text-base text-foreground group-hover:text-gold transition-colors leading-snug mb-1.5 line-clamp-2">
          {link.title}
        </h3>

        {/* subtitle / description */}
        {link.description && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3 mb-3 flex-1 italic">
            {link.description}
          </p>
        )}

        {/* CTA — sang, nhẹ */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors mt-auto pt-3 border-t border-border/40',
            'text-muted-foreground/50 group-hover:text-gold'
          )}
        >
          {isExternal ? (
            <>
              Xem thêm <ExternalLinkIcon className="w-3 h-3" />
            </>
          ) : (
            <>
              Đọc tiếp <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </div>
      </div>
    </>
  )

  return isExternal ? (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={wrapperClass}
    >
      {inner}
    </a>
  ) : (
    <Link href={link.url} className={wrapperClass}>
      {inner}
    </Link>
  )
}
