// ─────────────────────────────────────────────────────────────
//  app/events/[slug] — Server Component (event detail page)
//  ISR: 1 hour revalidate
// ─────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { fetchEventBySlug, getAllEventSlugs } from '@/lib/api/event'
import { getStrapiMediaUrl } from '@/lib/strapi'
import {
  Calendar, MapPin, User, Globe, ExternalLink,
  ChevronLeft, FileText, Download, Play
} from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

const typeLabels: Record<string, string> = {
  'dharma-talk': 'Pháp Hội',
  'webinar': 'Trực Tuyến',
  'retreat': 'Khóa Tu',
  'liberation': 'Phóng Sinh',
  'festival': 'Lễ Hội',
}

const statusLabels: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Sắp Diễn Ra', className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
  live: { label: 'ĐANG PHÁT', className: 'bg-red-500/10 text-red-500 border border-red-500/20' },
  past: { label: 'Đã Kết Thúc', className: 'bg-secondary text-muted-foreground border border-border' },
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllEventSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const event = await fetchEventBySlug(slug)
    if (!event) return { title: 'Sự kiện không tìm thấy' }

    const imageUrl = event.coverImage ? getStrapiMediaUrl(event.coverImage.url) : undefined

    return {
      title: `${event.title} — Pháp Môn Tâm Linh`,
      description: event.description,
      openGraph: {
        title: event.title,
        description: event.description,
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    }
  } catch {
    return { title: 'Sự Kiện & Pháp Hội' }
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)

  if (!event) notFound()

  const coverUrl = event.coverImage ? getStrapiMediaUrl(event.coverImage.url) : null
  const typeLabel = typeLabels[event.type] ?? event.type
  const statusInfo = statusLabels[event.eventStatus] ?? statusLabels.past

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">

          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Tất cả sự kiện
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold font-medium">
                {typeLabel}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4 leading-tight">
              {event.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{event.description}</p>
          </div>

          {/* Cover image */}
          {coverUrl && (
            <div className="relative aspect-[16/7] w-full rounded-2xl overflow-hidden mb-8 border border-border">
              <Image
                src={coverUrl}
                alt={event.coverImage?.alternativeText || event.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-xl bg-card border border-border mb-8">
            {event.date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Ngày diễn ra</p>
                  <p className="text-sm text-foreground font-medium">
                    {formatDate(event.date)}
                    {event.timeString && <span className="text-muted-foreground font-normal"> · {event.timeString}</span>}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Địa điểm</p>
                <p className="text-sm text-foreground font-medium">{event.location}</p>
              </div>
            </div>
            {event.speaker && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Giảng sư</p>
                  <p className="text-sm text-foreground font-medium">{event.speaker}</p>
                </div>
              </div>
            )}
            {event.language && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Ngôn ngữ</p>
                  <p className="text-sm text-foreground font-medium">{event.language}</p>
                </div>
              </div>
            )}
          </div>

          {/* Join link */}
          {event.link && event.eventStatus !== 'past' && (
            <div className="mb-8">
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-background font-medium text-sm hover:bg-gold/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Tham gia sự kiện
              </a>
            </div>
          )}

          {/* YouTube embed */}
          {event.youtubeId && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-4 h-4 text-gold" />
                <h2 className="font-display text-xl text-foreground">Video sự kiện</h2>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
                <iframe
                  src={`https://www.youtube.com/embed/${event.youtubeId}`}
                  title={event.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Rich text content */}
          {event.content && (
            <div className="mb-10">
              <div
                className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-gold prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: event.content }}
              />
            </div>
          )}

          {/* Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl text-foreground mb-4">Hình ảnh sự kiện</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {event.gallery.map((img) => {
                  const imgUrl = getStrapiMediaUrl(img.url)
                  if (!imgUrl) return null
                  return (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border"
                    >
                      <Image
                        src={imgUrl}
                        alt={img.alternativeText || event.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Files */}
          {event.files && event.files.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl text-foreground mb-4">Tài liệu đính kèm</h2>
              <div className="space-y-2">
                {event.files.map((file) => {
                  const fileUrl = getStrapiMediaUrl(file.url)
                  if (!fileUrl) return null
                  const isImage = file.mime?.startsWith('image/')
                  const Icon = isImage ? FileText : Download
                  return (
                    <a
                      key={file.id}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/30 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium truncate group-hover:text-gold transition-colors">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors shrink-0" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past event replay link */}
          {event.link && event.eventStatus === 'past' && (
            <div className="p-5 rounded-xl bg-card border border-border mb-8">
              <p className="text-sm text-muted-foreground mb-3">Xem lại sự kiện:</p>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                {event.link}
              </a>
            </div>
          )}

          {/* Back */}
          <div className="pt-6 border-t border-border">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại danh sách sự kiện
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
