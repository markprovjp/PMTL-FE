// components/hub/HubLinkCard.tsx — Server component
// Renders a single hub link (internal or external)
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

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isExternal ? (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col rounded-2xl border border-border bg-card hover:border-gold/40 hover:shadow-sm transition-all overflow-hidden"
      >
        {children}
      </a>
    ) : (
      <Link
        href={link.url}
        className="group flex flex-col rounded-2xl border border-border bg-card hover:border-gold/40 hover:shadow-sm transition-all overflow-hidden"
      >
        {children}
      </Link>
    )

  return (
    <Wrapper>
      {thumbnailUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnailUrl}
            alt={link.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-base text-foreground group-hover:text-gold transition-colors leading-snug mb-1.5 line-clamp-2">
          {link.title}
        </h3>
        {link.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3 flex-1">
            {link.description}
          </p>
        )}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium transition-colors mt-auto',
            'text-muted-foreground group-hover:text-gold'
          )}
        >
          {isExternal ? (
            <>
              Xem thêm <ExternalLinkIcon className="w-3 h-3" />
            </>
          ) : (
            <>
              Đọc tiếp <ArrowRightIcon className="w-3 h-3" />
            </>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
