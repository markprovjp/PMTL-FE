// components/hub/HubSection.tsx — Server component
// Renders a single HubSection: heading + description + links grid
import type { HubSection as HubSectionType } from '@/types/strapi'
import HubLinkCard from './HubLinkCard'

interface HubSectionProps {
  section: HubSectionType
}

export default function HubSection({ section }: HubSectionProps) {
  return (
    <section className="mb-14">
      <div className="mb-6">
        <h2 className="font-display text-xl text-foreground mb-1.5">{section.heading}</h2>
        {section.description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            {section.description}
          </p>
        )}
      </div>

      {section.links && section.links.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.links.map((link) => (
            <HubLinkCard key={link.id} link={link} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/60 italic">Chưa có liên kết nào.</p>
      )}
    </section>
  )
}
