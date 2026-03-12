'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid2X2,
  LayoutGrid,
  MapPin,
  Search,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'

import type { GalleryCardItem } from '@/lib/api/gallery'
import { cn } from '@/lib/utils'

type SortMode = 'newest' | 'oldest' | 'featured' | 'az'
type ViewMode = 'grid' | 'editorial'
const ALL_OPTION = 'Tất cả'
const UNKNOWN_YEAR = 'Khác'

function formatDate(date: string | null) {
  if (!date) return 'Chưa cập nhật'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getYear(date: string | null) {
  if (!date) return UNKNOWN_YEAR
  return String(new Date(date).getFullYear())
}

function buildShareUrl(item: GalleryCardItem) {
  if (typeof window === 'undefined') return ''
  const url = new URL('/gallery', window.location.origin)
  url.hash = item.slug || item.documentId
  return url.toString()
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="surface-panel-muted p-4">
      <p className="ant-label text-gold/80">{label}</p>
      <p className="ant-title mt-3 text-2xl text-foreground md:text-3xl">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

function GalleryCard({
  item,
  priority = false,
  editorial = false,
  onOpen,
}: {
  item: GalleryCardItem
  priority?: boolean
  editorial?: boolean
  onOpen: (item: GalleryCardItem) => void
}) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onOpen(item)}
      className={cn(
        'group relative block w-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-ant transition-all hover:border-gold/30 hover:shadow-gold',
        editorial ? 'sm:col-span-2 xl:col-span-2' : ''
      )}
    >
      <div className={cn('relative overflow-hidden', editorial ? 'aspect-[16/10]' : 'aspect-[4/5]')}>
        <Image
          src={item.imageUrl}
          alt={item.imageAlt}
          fill
          priority={priority}
          sizes={editorial ? '(max-width: 1280px) 100vw, 66vw' : '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-gold/25 bg-black/25 px-3 py-1 text-[11px] font-medium text-gold backdrop-blur-md">
          {item.category}
        </div>
        {item.featured ? (
          <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/15 px-3 py-1 text-[11px] font-semibold text-gold backdrop-blur-md">
            <Sparkles className="size-3.5" />
            Nổi bật
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <div className="flex items-center gap-2 text-[11px] text-white/70">
            <span>{formatDate(item.shotDate)}</span>
            {item.album ? (
              <>
                <span className="text-white/35">•</span>
                <span className="truncate">{item.album}</span>
              </>
            ) : null}
          </div>
          <h3 className="ant-title mt-2 text-xl leading-tight text-white md:text-2xl">{item.title}</h3>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/72">
            {item.quote || item.description || 'Nhấn để xem chi tiết ảnh và thông tin tư liệu.'}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

export default function GalleryClient({ initialItems }: { initialItems: GalleryCardItem[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_OPTION)
  const [year, setYear] = useState(ALL_OPTION)
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = useMemo(() => {
    return [ALL_OPTION, ...Array.from(new Set(initialItems.map((item) => item.category))).sort()]
  }, [initialItems])

  const years = useMemo(() => {
    return [ALL_OPTION, ...Array.from(new Set(initialItems.map((item) => getYear(item.shotDate)))).sort().reverse()]
  }, [initialItems])

  const collections = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of initialItems) {
      if (!item.album) continue
      map.set(item.album, (map.get(item.album) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [initialItems])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const items = initialItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery) ||
        item.quote?.toLowerCase().includes(normalizedQuery) ||
        item.location?.toLowerCase().includes(normalizedQuery) ||
        item.album?.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

      const matchesCategory = category === ALL_OPTION || item.category === category
      const matchesYear = year === ALL_OPTION || getYear(item.shotDate) === year

      return matchesQuery && matchesCategory && matchesYear
    })

    return items.toSorted((a, b) => {
      if (sortMode === 'az') return a.title.localeCompare(b.title, 'vi')
      if (sortMode === 'featured') {
        return Number(b.featured) - Number(a.featured) || (b.shotDate || '').localeCompare(a.shotDate || '')
      }

      const aDate = a.shotDate || ''
      const bDate = b.shotDate || ''
      return sortMode === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    })
  }, [category, initialItems, query, sortMode, year])

  const heroItem = filteredItems.find((item) => item.featured) || filteredItems[0] || null
  const spotlightItems = filteredItems.filter((item) => item.documentId !== heroItem?.documentId).slice(0, 3)
  const selectedIndex = selectedId ? filteredItems.findIndex((item) => item.documentId === selectedId) : -1
  const selectedItem = selectedIndex >= 0 ? filteredItems[selectedIndex] : null

  useEffect(() => {
    if (!selectedItem) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedItem])

  useEffect(() => {
    if (typeof window === 'undefined' || !initialItems.length) return

    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const matched = initialItems.find((item) => item.slug === hash || item.documentId === hash)
    if (matched) {
      setSelectedId(matched.documentId)
    }
  }, [initialItems])

  useEffect(() => {
    if (!selectedItem) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
      if (event.key === 'ArrowRight' && selectedIndex < filteredItems.length - 1) {
        setSelectedId(filteredItems[selectedIndex + 1].documentId)
      }
      if (event.key === 'ArrowLeft' && selectedIndex > 0) {
        setSelectedId(filteredItems[selectedIndex - 1].documentId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filteredItems, selectedIndex, selectedItem])

  const featuredCount = initialItems.filter((item) => item.featured).length
  const locationCount = new Set(initialItems.map((item) => item.location).filter(Boolean)).size
  const latestYear = years.find((item) => item !== ALL_OPTION) || '2024'

  async function handleShare(item: GalleryCardItem) {
    const shareUrl = buildShareUrl(item)
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedId(item.documentId)
      window.history.replaceState(null, '', `/gallery#${item.slug || item.documentId}`)
      window.setTimeout(() => setCopiedId((current) => (current === item.documentId ? null : current)), 1600)
    } catch {
      setCopiedId(null)
    }
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] border border-gold/10 bg-card/70 px-6 py-12 shadow-elevated md:px-10 md:py-16">
        <div className="mesh-glow pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-end">
          <div>
            <p className="ant-label text-gold">Tư liệu hình ảnh</p>
            <h1 className="ant-title mt-5 max-w-4xl text-4xl text-foreground md:text-6xl">
              Gallery Pháp Môn Tâm Linh
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Kho lưu trữ hình ảnh về pháp hội, nghi lễ, kiến trúc cổ tự, hoa sen và những khoảnh khắc tu học tĩnh lặng.
              Giao diện này lấy tinh thần từ mẫu Stitch, nhưng đã chuyển sang hệ dữ liệu động để admin có thể quản lý trực tiếp trong Strapi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <StatCard label="Tổng ảnh" value={String(initialItems.length)} note="Đồng bộ trực tiếp từ CMS." />
            <StatCard label="Chủ đề" value={String(categories.length - 1)} note="Tự sinh từ trường category." />
            <StatCard label="Lưu trữ" value={latestYear} note={`${locationCount} địa điểm đã ghi nhận.`} />
          </div>
        </div>
      </section>

      {heroItem ? (
        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)]">
          <button
            type="button"
            onClick={() => setSelectedId(heroItem.documentId)}
            className="group relative overflow-hidden rounded-[2rem] border border-gold/15 bg-black text-left shadow-elevated"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={heroItem.imageUrl}
                alt={heroItem.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-end p-6 md:p-10">
                <div className="max-w-2xl">
                  <p className="ant-label text-gold/90">Chi tiết ảnh</p>
                  <h2 className="ant-title mt-4 text-3xl leading-tight text-white md:text-5xl">{heroItem.title}</h2>
                  <p className="mt-4 max-w-xl text-base italic leading-8 text-white/72">
                    {heroItem.quote || heroItem.description}
                  </p>
                </div>
                <div className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-gold" />
                    {formatDate(heroItem.shotDate)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-gold" />
                    {heroItem.location || 'Đang cập nhật địa điểm'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Camera className="size-4 text-gold" />
                    {heroItem.device || 'Thiết bị chưa ghi chú'}
                  </span>
                </div>
              </div>
            </div>
          </button>

          <div className="grid gap-4">
            {spotlightItems.map((item) => (
              <button
                key={item.documentId}
                type="button"
                onClick={() => setSelectedId(item.documentId)}
                className="surface-panel interactive-border group flex items-center gap-4 p-4 text-left"
              >
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold/80">{item.category}</p>
                  <h3 className="ant-title mt-2 text-xl text-foreground">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.description || item.quote || 'Ảnh tư liệu trong kho lưu trữ PMTL.'}
                  </p>
                </div>
              </button>
            ))}

            <div className="surface-panel-muted p-5">
              <p className="ant-label text-gold/80">Điểm nhấn</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <p className="text-muted-foreground">Ảnh nổi bật</p>
                  <p className="ant-title mt-1 text-2xl text-foreground">{featuredCount}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <p className="text-muted-foreground">Bộ sưu tập</p>
                  <p className="ant-title mt-1 text-2xl text-foreground">{collections.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div>
          <div className="surface-panel sticky top-20 z-20 flex flex-col gap-4 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tiêu đề, album, địa điểm..."
                className="h-11 w-full rounded-full border border-border bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-gold/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none"
              >
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item === ALL_OPTION ? 'Năm: Tất cả' : item}
                  </option>
                ))}
              </select>

              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="featured">Ưu tiên nổi bật</option>
                <option value="az">Tên A-Z</option>
              </select>

              <div className="inline-flex h-11 items-center rounded-full border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full transition',
                    viewMode === 'grid' ? 'bg-gold text-black' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('editorial')}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full transition',
                    viewMode === 'editorial' ? 'bg-gold text-black' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredItems.length ? (
            <div className={cn('mt-6 grid gap-5', viewMode === 'editorial' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
              {filteredItems.map((item, index) => (
                <GalleryCard
                  key={item.documentId}
                  item={item}
                  priority={index < 2}
                  editorial={viewMode === 'editorial' && index % 5 === 0}
                  onOpen={(next) => setSelectedId(next.documentId)}
                />
              ))}
            </div>
          ) : (
            <div className="surface-panel mt-6 px-6 py-20 text-center">
              <p className="ant-label text-gold/80">Không có dữ liệu phù hợp</p>
              <h3 className="ant-title mt-4 text-3xl text-foreground">Thử đổi bộ lọc hoặc thêm ảnh mới trong admin</h3>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Route này đọc dữ liệu trực tiếp từ collection type `gallery-item`. Khi admin thêm ảnh và publish, giao diện sẽ tự cập nhật theo chu kỳ cache.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-panel p-5">
            <p className="ant-label text-gold/80">Lưu trữ nhanh</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {years.filter((item) => item !== ALL_OPTION).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setYear(item)}
                  className={cn(
                    'rounded-full border px-3 py-2 text-sm transition',
                    year === item
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border text-muted-foreground hover:border-gold/25 hover:text-foreground'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="ant-label text-gold/80">Bộ sưu tập nổi bật</p>
            <div className="mt-4 space-y-3">
              {collections.length ? (
                collections.map(([name, total]) => (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                    <div>
                      <p className="text-sm text-foreground">{name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Bộ ảnh được tổng hợp từ CMS</p>
                    </div>
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{total} ảnh</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có album nào được đặt tên riêng.</p>
              )}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="ant-label text-gold/80">Gợi ý vận hành</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Đặt `featured = true` cho ảnh cần xuất hiện ở hero.</li>
              <li>Dùng `album` để gom cụm ảnh cùng sự kiện hoặc chủ đề.</li>
              <li>Điền `keywords` bằng chuỗi phân tách dấu phẩy để tăng chất lượng tìm kiếm.</li>
            </ul>
          </div>
        </aside>
      </section>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md"
          >
            <div className="absolute inset-0 overflow-y-auto overscroll-contain p-4 md:p-8" data-lenis-prevent style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="mx-auto flex min-h-full max-w-7xl items-center">
                <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#17120d] shadow-elevated">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="absolute right-4 top-4 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition hover:text-white"
                  >
                    <X className="size-5" />
                  </button>

                  {selectedIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedId(filteredItems[selectedIndex - 1].documentId)}
                      className="absolute left-4 top-1/2 z-20 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition hover:text-white"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                  ) : null}

                  {selectedIndex < filteredItems.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedId(filteredItems[selectedIndex + 1].documentId)}
                      className="absolute right-4 top-1/2 z-20 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition hover:text-white"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  ) : null}

                  <div className="grid min-h-[720px] lg:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="relative min-h-[420px] bg-black">
                      <div className="absolute inset-0 opacity-25">
                        <Image src={selectedItem.imageUrl} alt="" fill sizes="100vw" className="object-cover blur-3xl scale-110" />
                      </div>
                      <div className="relative flex h-full items-center justify-center p-8 md:p-12">
                        <div className="relative aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/10">
                          <Image
                            src={selectedItem.imageUrl}
                            alt={selectedItem.imageAlt}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 70vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-col border-t border-white/10 lg:border-l lg:border-t-0">
                      <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8" data-lenis-prevent style={{ WebkitOverflowScrolling: 'touch' }}>
                        <p className="ant-label text-gold/90">Chi tiết ảnh</p>
                        <h3 className="ant-title mt-4 text-3xl leading-tight text-white">{selectedItem.title}</h3>
                        <p className="mt-5 text-base italic leading-8 text-white/70">
                          {selectedItem.quote || selectedItem.description || 'Ảnh tư liệu trong thư viện Pháp Môn Tâm Linh.'}
                        </p>

                        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/70">
                          <div className="grid gap-4">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/45">Ngày chụp</span>
                              <span>{formatDate(selectedItem.shotDate)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/45">Chủ đề</span>
                              <span>{selectedItem.category}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/45">Địa điểm</span>
                              <span>{selectedItem.location || 'Đang cập nhật'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/45">Thiết bị</span>
                              <span>{selectedItem.device || 'Đang cập nhật'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/45">Người ghi hình</span>
                              <span>{selectedItem.photographer || 'Ban Truyền Thông PMTL'}</span>
                            </div>
                          </div>
                        </div>

                        {selectedItem.tags.length ? (
                          <div className="mt-8">
                            <p className="text-xs uppercase tracking-[0.24em] text-gold/80">Từ khóa</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {selectedItem.tags.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    setQuery(tag)
                                    setSelectedId(null)
                                  }}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 transition hover:border-gold/30 hover:text-gold"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-8 flex flex-wrap gap-3">
                          <a
                            href={selectedItem.imageUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-black transition hover:bg-gold/90"
                          >
                            <Download className="size-4" />
                            Tải ảnh
                          </a>
                          <button
                            type="button"
                            onClick={() => handleShare(selectedItem)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white/80 transition hover:border-gold/30 hover:text-gold"
                          >
                            <Share2 className="size-4" />
                            {copiedId === selectedItem.documentId ? 'Đã sao chép' : 'Chia sẻ'}
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-white/10 p-4">
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {filteredItems.slice(Math.max(0, selectedIndex - 4), selectedIndex + 5).map((item) => (
                            <button
                              key={item.documentId}
                              type="button"
                              onClick={() => setSelectedId(item.documentId)}
                              className={cn(
                                'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition',
                                item.documentId === selectedItem.documentId
                                  ? 'border-gold'
                                  : 'border-white/10 hover:border-gold/25'
                              )}
                            >
                              <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="80px" className="object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
