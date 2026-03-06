// components/hub/HubPageComponent.tsx — Server component
// Full layout for a hub page — Visual language: Phật giáo, vàng/trầm, trang nghiêm
import Link from 'next/link'
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import type { HubPage, DownloadItem } from '@/types/strapi'
import HubSection from './HubSection'
import {
  FileText,
  Music,
  Video,
  Archive,
  File,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Download,
  BookMarked
} from 'lucide-react'
import HubBlockRenderer from './HubBlockRenderer'

/* ── Icon theo loại file ────────────────────────────────────── */
function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4" />
    case 'mp3': return <Music className="w-4 h-4" />
    case 'mp4': return <Video className="w-4 h-4" />
    case 'zip': return <Archive className="w-4 h-4" />
    case 'epub':
    case 'doc': return <BookOpen className="w-4 h-4" />
    default: return <File className="w-4 h-4" />
  }
}

/* ── Badge màu theo loại file — dùng palette vàng/trầm ──────── */
function typeBadgeClass(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-amber-500/10 text-amber-500'
    case 'mp3': return 'bg-gold/10 text-gold'
    case 'mp4': return 'bg-amber-700/10 text-amber-600'
    case 'zip': return 'bg-stone-500/10 text-stone-400'
    default: return 'bg-secondary text-muted-foreground'
  }
}

/* ── DownloadRow ───────────────────────────────────────────── */
function DownloadRow({ item }: { item: DownloadItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gold/5 transition-colors border-b border-border/30 last:border-b-0"
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeBadgeClass(item.fileType)} group-hover:scale-105 transition-transform`}>
        <FileIcon type={item.fileType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground group-hover:text-gold transition-colors truncate">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase ${typeBadgeClass(item.fileType)}`}>
            {item.fileType.toUpperCase()}
          </span>
          {item.fileSizeMB && (
            <span className="text-[10px] text-muted-foreground/50">{item.fileSizeMB}MB</span>
          )}
          {item.isUpdating && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
              <RefreshCw className="w-2.5 h-2.5" /> Đang cập nhật
            </span>
          )}
          {item.isNew && (
            <span className="flex items-center gap-0.5 text-[10px] text-gold font-semibold">
              <Sparkles className="w-2.5 h-2.5" /> Mới
            </span>
          )}
          {item.notes && (
            <span className="text-[10px] text-muted-foreground/50 italic">{item.notes}</span>
          )}
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-gold transition-colors shrink-0" />
    </a>
  )
}

interface HubPageComponentProps {
  hubPage: HubPage
}

export default function HubPageComponent({ hubPage }: HubPageComponentProps) {
  const hasCuratedPosts = hubPage.curated_posts && hubPage.curated_posts.length > 0
  const hasDownloads = hubPage.downloads && hubPage.downloads.length > 0

  return (
    <main className="min-h-screen">

      {/* ── Hero / Header — Phật giáo, khai thị ── */}
      <div className="relative overflow-hidden border-b border-gold/10">
        {/* nền trang nghiêm */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />

        <div className="container max-w-4xl mx-auto px-6 py-14 md:py-20 text-center relative z-10">

          {/* eyebrow Hán-Việt */}
          <p className="font-display text-[10px] md:text-xs uppercase tracking-[0.35em] text-gold/70 mb-5 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold/30" />
            Pháp Môn Tâm Linh
            <span className="w-8 h-px bg-gold/30" />
          </p>

          {/* title lớn */}
          <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-5 tracking-tight">
            {hubPage.title}
          </h1>

          {/* divider sen vàng */}
          <div className="flex items-center justify-center gap-3 my-5">
            <span className="w-12 h-px bg-gold/30" />
            <span className="text-gold/60 text-base">✦</span>
            <span className="w-12 h-px bg-gold/30" />
          </div>

          {/* description — intro block giàu không khí */}
          {hubPage.description && (
            <p className="text-muted-foreground leading-loose max-w-2xl mx-auto text-sm md:text-base italic">
              {hubPage.description}
            </p>
          )}

        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-14">

        {/* ── Dynamic Blocks (Master's Pattern) ── */}
        <HubBlockRenderer blocks={hubPage.blocks} />

        {/* ── Legacy Layout (For older entries) ── */}
        {hasCuratedPosts && (
          <section className="mb-14">
            {/* section header có nhịp điệu */}
            <div className="flex items-center gap-4 mb-7">
              <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold/60 font-semibold mb-0.5">Tuyển Chọn</p>
                <h2 className="font-display text-xl text-foreground leading-none">Bài Đọc Nổi Bật</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent ml-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hubPage.curated_posts!.map((post) => {
                const thumbUrl = post.thumbnail
                  ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
                  : null
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-3 p-4 rounded-2xl bg-card border border-border hover:border-gold/40 hover:shadow-sm hover:shadow-gold/5 transition-all group"
                  >
                    {thumbUrl && (
                      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                        <Image
                          src={thumbUrl}
                          alt={post.thumbnail?.alternativeText ?? post.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gold/60 uppercase tracking-wider font-medium mb-1">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
                          : ''}
                      </p>
                      <h3 className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-3 leading-snug">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Sections (curated links từ CMS) ── */}
        {hubPage.sections && hubPage.sections.length > 0 ? (
          <div className="space-y-16">
            {hubPage.sections.map((section) => (
              <HubSection key={section.id} section={section} />
            ))}
          </div>
        ) : !hasCuratedPosts && !hasDownloads ? (
          <p className="text-muted-foreground text-sm italic text-center py-10">Trang này chưa có nội dung.</p>
        ) : null}

        {/* ── Khối Tài Liệu Tải Xuống ── */}
        {hasDownloads && (
          <section className="mt-16 pt-10 border-t border-gold/10">
            {/* section header */}
            <div className="flex items-center gap-4 mb-7">
              <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold/60 font-semibold mb-0.5">Thư Viện</p>
                <h2 className="font-display text-xl text-foreground leading-none">Tài Liệu Tải Xuống</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent ml-2" />
            </div>

            <div className="rounded-2xl border border-gold/10 bg-card overflow-hidden">
              {hubPage.downloads!.map((item) => (
                <DownloadRow key={item.id} item={item} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/40 mt-4 text-center italic">
              Nhấp vào tài liệu để tải hoặc xem trực tuyến — Hoàn toàn miễn phí
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
