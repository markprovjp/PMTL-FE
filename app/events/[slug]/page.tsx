import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { fetchEventBySlug, getAllEventSlugs } from '@/lib/api/event'
import { getStrapiMediaUrl } from '@/lib/strapi'
import {
  Calendar, MapPin, User, Globe, ExternalLink,
  ChevronLeft, FileText, Download, Play, Video
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
      description: event.description || '',
      openGraph: {
        title: event.title,
        description: event.description || '',
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    }
  } catch {
    return { title: 'Sự Kiện & Pháp Hội' }
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)

  if (!event) notFound()

  const coverUrl = event.coverImage ? getStrapiMediaUrl(event.coverImage.url) : null
  const typeLabel = typeLabels[event.type] ?? event.type
  const isUpcoming = event.eventStatus === 'upcoming' || event.eventStatus === 'live'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderServer />
      <main className="flex-1">
        {/* Ceremonial Hero Depth */}
        <section className="relative w-full min-h-[50vh] md:min-h-[60vh] flex flex-col justify-end pt-32 pb-16 md:pb-24 overflow-hidden border-b border-gold/10">
          {coverUrl ? (
            <>
              <Image
                src={coverUrl}
                alt={event.coverImage?.alternativeText || event.title}
                fill
                className="object-cover opacity-30 md:opacity-40 select-none grayscale-[20%]"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold/10 via-background to-background" />
          )}

          <div className="container relative mx-auto px-6 max-w-5xl z-10">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold/70 hover:text-gold transition-colors mb-8"
            >
              <ChevronLeft className="w-4 h-4" /> Tuyển Tập Sự Kiện
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                {typeLabel}
              </span>
              {event.eventStatus === 'live' && (
                <span className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest backdrop-blur-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Trực Tiếp
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl text-foreground leading-[1.1] mb-6 drop-shadow-sm">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-lg md:text-2xl text-muted-foreground/90 font-display italic max-w-3xl leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
        </section>

        {/* Program / Invitation Panel */}
        <div className="container mx-auto px-6 max-w-5xl relative z-20 -mt-8 md:-mt-12 mb-16">
          <div className="bg-card rounded-2xl border border-gold/20 shadow-xl shadow-black/5 flex flex-col md:flex-row overflow-hidden backdrop-blur-xl">
            {/* Meta Grid */}
            <div className="flex-1 p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
              {event.date && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Khởi hành
                  </p>
                  <p className="font-medium text-foreground text-lg">
                    {new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {event.timeString && <p className="text-sm text-muted-foreground mt-1">{event.timeString}</p>}
                </div>
              )}
              {event.location && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Tọa lạc
                  </p>
                  <p className="font-medium text-foreground text-lg">{event.location}</p>
                </div>
              )}
              {event.speaker && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Giảng sư
                  </p>
                  <p className="font-medium text-foreground text-lg">{event.speaker}</p>
                </div>
              )}
              {event.language && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold/60 uppercase mb-2 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Ngôn ngữ
                  </p>
                  <p className="font-medium text-foreground text-lg">{event.language}</p>
                </div>
              )}
            </div>

            {/* Sacred Action CTA Area */}
            {event.link && (
              <div className="md:w-72 bg-gold/5 flex flex-col justify-center items-center p-8 border-t md:border-t-0 md:border-l border-gold/10">
                {isUpcoming ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 text-center">Hoan hỷ mời quý đạo hữu cùng tham dự pháp hội.</p>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-gold text-black font-bold text-sm hover:bg-gold/90 transition-all shadow-lg hover:shadow-gold/20 hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4" /> Tham Gia Ngay
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 text-center">Pháp hội đã viên mãn. Quý vị có thể xem lại tư liệu.</p>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-card border border-gold/40 text-gold font-bold text-sm hover:bg-gold/10 transition-all"
                    >
                      <Video className="w-4 h-4" /> Xem Tư Liệu
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 max-w-4xl pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-16 items-start">

            {/* Main Program Description */}
            <div className="min-w-0">
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px bg-gold/30 w-12" />
                <h2 className="font-display text-2xl text-foreground">Nội Dung Chương Trình</h2>
              </div>

              {event.content ? (
                <div
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-gold hover:prose-a:text-gold/80 prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              ) : (
                <p className="text-muted-foreground italic">Đang cập nhật nội dung chi tiết môn quy và lịch trình...</p>
              )}

              {/* Media: YouTube */}
              {event.youtubeId && (
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="h-px bg-gold/30 w-12" />
                    <h2 className="font-display text-2xl text-foreground">Pháp Âm / Hình Ảnh</h2>
                  </div>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${event.youtubeId}`}
                      title="Video sự kiện"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="h-px bg-gold/30 w-12" />
                    <h2 className="font-display text-2xl text-foreground">Khoảnh Khắc Pháp Hội</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {event.gallery.map((img) => {
                      const imgUrl = getStrapiMediaUrl(img.url)
                      if (!imgUrl) return null
                      return (
                        <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border group cursor-zoom-in">
                          <Image
                            src={imgUrl}
                            alt="Khoảnh khắc sự kiện"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Resources Shelf */}
            <div className="md:sticky md:top-24 space-y-12">
              {event.files && event.files.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                    Kệ Tài Liệu
                  </h3>
                  <div className="space-y-3">
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
                          className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-gold/40 hover:bg-gold/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm text-foreground font-medium line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Share/Action */}
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border text-center">
                <p className="text-sm text-foreground font-medium mb-2">Chuyển tiếp thư mời</p>
                <p className="text-xs text-muted-foreground mb-4">Chia sẻ cơ hội tu học đến những người hữu duyên.</p>
                {/* 
                  Do đây là server component, ta không dùng nút có window.navigator được. 
                  Sửa lại thành một simple "Chép link" thủ công hoặc copy logic nhẹ bằng Client component nhỏ 
                  nếu cần. Ở đây để giữ mã nguồn Server, ta thay bằng lời kêu gọi. 
                */}
                <div className="w-full py-2.5 rounded-lg border border-gold/30 bg-card text-gold text-xs font-bold uppercase cursor-default">
                  Hoan Hỷ Chia Sẻ
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
