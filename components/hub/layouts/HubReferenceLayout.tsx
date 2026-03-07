// components/hub/layouts/HubReferenceLayout.tsx
// Reference theme: academic, index-like, minimal decoration
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import type { HubPage } from '@/types/strapi'
import { Library, Download } from 'lucide-react'
import HubBlockRenderer from '../HubBlockRenderer'
import HubSection from '../HubSection'
import DownloadRow from '../DownloadRow'

interface HubReferenceLayoutProps {
  hubPage: HubPage
}

export default function HubReferenceLayout({ hubPage }: HubReferenceLayoutProps) {
  const hasDownloads = hubPage.downloads && hubPage.downloads.length > 0

  return (
    <main className="min-h-screen bg-background">
      {/* ── HERO: Minimal, purely functional text header ── */}
      <div className="relative border-b border-border/60 bg-gradient-to-br from-secondary/40 to-background overflow-hidden">
        {hubPage.coverImage && (() => {
          const imgSrc = getStrapiMediaUrl(
            hubPage.coverImage!.formats?.large?.url ?? hubPage.coverImage!.url
          )
          return imgSrc ? (
            <div className="absolute inset-0 right-0 w-1/2 opacity-[0.05] pointer-events-none md:block hidden">
              <Image
                src={imgSrc}
                alt={hubPage.title || 'Tra cứu'}
                fill
                className="object-cover object-right mix-blend-overlay grayscale"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
            </div>
          ) : null
        })()}

        <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 shadow-sm">
              <Library className="w-3.5 h-3.5" /> Tra Cứu
            </div>

            <h1 className="font-sans font-bold text-3xl md:text-5xl lg:text-5xl text-foreground leading-[1.1] mb-5 tracking-tight break-words">
              {hubPage.title || 'Tu Thư Cổ'}
            </h1>

            {hubPage.description && (
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base border-l-[3px] border-border pl-4 py-1">
                {hubPage.description}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-mono bg-card px-4 py-2 border border-border rounded shadow-sm opacity-60">
            REF-{typeof window !== 'undefined' ? Date.now().toString().slice(-4) : 'IDX'}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-20 space-y-24">
        {/* ── Hub Sections (Index list/folders) ── */}
        {hubPage.sections && hubPage.sections.length > 0 && (
          <div className="space-y-16">
            {hubPage.sections.map((section) => (
              <HubSection key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* ── Dynamic Blocks ── */}
        {hubPage.blocks && hubPage.blocks.length > 0 && (
          <section className="pt-8 border-t border-dashed border-border/70">
            <HubBlockRenderer blocks={hubPage.blocks} />
          </section>
        )}

        {/* ── Downloads Archives ── */}
        {hasDownloads && (
          <section className="pt-16 border-t-[3px] border-border">
            <div className="flex items-center gap-3 mb-8">
              <Download className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-sans font-bold text-xl md:text-2xl text-foreground">Kho Tàng Lưu Trữ</h2>
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {hubPage.downloads!.map((item) => (
                <DownloadRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
