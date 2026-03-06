// components/hub/HubPageComponent.tsx — Server component
// Full layout for a hub page (title, description, sections)
import type { HubPage } from '@/types/strapi'
import HubSection from './HubSection'

interface HubPageComponentProps {
  hubPage: HubPage
}

export default function HubPageComponent({ hubPage }: HubPageComponentProps) {
  return (
    <main className="min-h-screen py-16">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl text-foreground mb-3">{hubPage.title}</h1>
          {hubPage.description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{hubPage.description}</p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-16 bg-gold/40 mb-12" />

        {/* Sections */}
        {hubPage.sections && hubPage.sections.length > 0 ? (
          hubPage.sections.map((section) => (
            <HubSection key={section.id} section={section} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm italic">Trang này chưa có nội dung.</p>
        )}
      </div>
    </main>
  )
}
