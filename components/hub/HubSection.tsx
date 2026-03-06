// components/hub/HubSection.tsx — Server component
// Renders a single HubSection: heading + description + links grid
// Visual language: Phật giáo, trang nghiêm, nhịp điệu thị giác rõ ràng
import type { HubSection as HubSectionType } from '@/types/strapi'
import HubLinkCard from './HubLinkCard'

interface HubSectionProps {
  section: HubSectionType
}

export default function HubSection({ section }: HubSectionProps) {
  return (
    <section>
      {/* ── Section Header — có nhịp điệu, badge, divider ── */}
      <div className="mb-8">
        {/* eyebrow badge */}
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block w-1 h-5 rounded-full bg-gold/60 shrink-0" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-semibold">
            Chuyên Mục
          </p>
        </div>

        {/* heading chính */}
        <h2 className="font-display text-xl md:text-2xl text-foreground leading-snug mb-2 pl-4">
          {section.heading}
        </h2>

        {/* description dưới heading */}
        {section.description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose pl-4 mb-4 italic border-l border-gold/20">
            {section.description}
          </p>
        )}

        {/* divider gradient */}
        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent mt-4" />
      </div>

      {/* ── Links Grid ── */}
      {section.links && section.links.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.links.map((link) => (
            <HubLinkCard key={link.id} link={link} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/60 italic pl-4">Chưa có liên kết nào.</p>
      )}
    </section>
  )
}
