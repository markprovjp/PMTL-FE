'use client'

// ─────────────────────────────────────────────────────────────
//  SearchClient.tsx — Trang tìm kiếm kho tàng Khai Thị
//  Tính năng: Highlight từ khóa, Thumbnail, URL sync,
//  Voice Search, PostHog analytics, Filter badge count,
//  Popular tags khi chưa search, Mobile-friendly filters
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { SearchIcon, ArrowRightIcon } from '@/components/icons/ZenIcons'
import { searchPostsAndCategories } from '@/app/actions/search'
import type { BlogPost, Category, BlogTag } from '@/types/strapi'
import { format, subDays, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2, Mic, MicOff, X } from 'lucide-react'
import { PAGINATION, getPaginationRange } from '@/lib/config/pagination'
import { cn } from '@/lib/utils'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'

// ─── Augment Window for browser Speech API (no @types/webspeechapi needed) ──
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchClientProps {
  initialCategories: Category[]
  initialTags: BlogTag[]
}

// Meilisearch returns _formatted with <mark> tags for highlight
type SearchHit = BlogPost & {
  _formatted?: {
    title?: string
    excerpt?: string
    content?: string
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Trong tuần', value: 'week' },
  { label: 'Trong tháng', value: 'month' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

function trackSearch(query: string, resultCount: number) {
  // PostHog search analytics — fire-and-forget
  if (typeof window === 'undefined') return
  import('posthog-js').then(({ default: posthog }) => {
    if (posthog.__loaded) {
      posthog.capture('search_performed', {
        query,
        result_count: resultCount,
        timestamp: new Date().toISOString(),
      })
    }
  }).catch(() => { })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SearchPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function SearchPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  if (totalPages <= 1) return null
  const range = getPaginationRange(currentPage, totalPages)
  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Phân trang kết quả tìm kiếm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border text-sm font-medium transition-all',
          currentPage <= 1
            ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
            : 'border-border text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>
      {range.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e-${idx}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground/60">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={item}
            onClick={() => item !== currentPage && onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all',
              item === currentPage
                ? 'border-gold bg-gold/10 text-gold font-semibold cursor-default'
                : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5'
            )}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border text-sm font-medium transition-all',
          currentPage >= totalPages
            ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
            : 'border-border text-muted-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5'
        )}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="ml-3 text-xs text-muted-foreground/60 hidden md:block">
        Trang {currentPage}/{totalPages}
      </span>
    </nav>
  )
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ post, index }: { post: SearchHit; index: number }) {
  const thumbUrl = getStrapiMediaUrl(post.thumbnail?.url)
  // Use Meilisearch highlighted excerpt if available, else plain excerpt
  const highlightedExcerpt = post._formatted?.excerpt || post._formatted?.content || post.excerpt || ''
  const highlightedTitle = post._formatted?.title || post.title

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.3 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-gold/40 hover:shadow-md hover:shadow-gold/5 transition-all group"
      >
        {/* Thumbnail */}
        {thumbUrl && (
          <div className="flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-secondary/50">
            <Image
              src={thumbUrl}
              alt={post.thumbnail?.alternativeText || post.title}
              width={96}
              height={80}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {post.featured && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500">Nổi bật</span>
            )}
            {post.sourceName ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-gold font-mono">{post.sourceName}</span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
              </span>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">
              {post.views.toLocaleString('vi-VN')} lượt xem
            </span>
          </div>

          {/* Title with highlight */}
          <h3
            className="text-sm sm:text-base font-display text-foreground mb-1.5 group-hover:text-gold transition-colors line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />

          {/* Excerpt / Content snippet with highlight */}
          {highlightedExcerpt && (
            <p
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2"
              dangerouslySetInnerHTML={{ __html: highlightedExcerpt }}
            />
          )}

          <div className="flex items-center gap-1.5 text-xs font-medium text-gold/70 group-hover:text-gold transition-colors mt-2">
            Xem chi tiết <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SearchClient({ initialCategories, initialTags }: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── State from URL params ──────────────────────────────────
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [activeCategory, setActiveCategory] = useState<string | null>(() => searchParams.get('cat') || null)
  const [activeTags, setActiveTags] = useState<string[]>(() => {
    const t = searchParams.get('tags')
    return t ? t.split(',').filter(Boolean) : []
  })
  const [activeTime, setActiveTime] = useState<string>(() => searchParams.get('time') || 'all')
  const [showFilters, setShowFilters] = useState(false)

  // ── Results state ───────────────────────────────────────────
  const [results, setResults] = useState<SearchHit[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const isFirstRender = useRef(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Voice search ────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const debouncedQuery = useDebounce(query, 400)

  // ── Active filter count badge ───────────────────────────────
  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    activeTags.length +
    (activeTime !== 'all' ? 1 : 0)

  // ── Sync state → URL ────────────────────────────────────────
  const syncUrl = useCallback((q: string, cat: string | null, tags: string[], time: string, page: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat) params.set('cat', cat)
    if (tags.length > 0) params.set('tags', tags.join(','))
    if (time !== 'all') params.set('time', time)
    if (page > 1) params.set('page', String(page))
    const newUrl = `/search${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newUrl, { scroll: false })
  }, [router])

  // ── Fetch results ───────────────────────────────────────────
  const fetchResults = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      let dateFrom: string | undefined
      if (activeTime === 'week') {
        dateFrom = format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ssXX")
      } else if (activeTime === 'month') {
        dateFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ssXX")
      }

      const res = await searchPostsAndCategories({
        search: debouncedQuery || undefined,
        categorySlug: activeCategory || undefined,
        tagSlugs: activeTags.length > 0 ? activeTags : undefined,
        dateFrom,
        page,
        pageSize: PAGINATION.SEARCH_PAGE_SIZE,
      })

      const hits = res.data as SearchHit[]
      setResults(hits)
      const meta = res.meta?.pagination
      const total = meta?.total ?? res.data.length
      setTotalResults(total)
      setTotalPages(meta?.pageCount ?? 1)
      setCurrentPage(page)

      // PostHog: track search only when user typed something
      if (debouncedQuery) {
        trackSearch(debouncedQuery, total)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, activeCategory, activeTags, activeTime])

  // ── Trigger re-fetch when filters change ────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchResults(1)
      return
    }
    fetchResults(1)
    syncUrl(debouncedQuery, activeCategory, activeTags, activeTime, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchResults])

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchResults(page)
    syncUrl(debouncedQuery, activeCategory, activeTags, activeTime, page)
  }

  // ── Voice search ────────────────────────────────────────────
  const startVoiceSearch = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.')
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognitionAPI() as any
    recognitionRef.current = recognition
    recognition.lang = 'vi-VN'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => result[0])
        .map(result => result.transcript)
        .join('')

      setQuery(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert('Vui lòng cho phép quyền truy cập micro để sử dụng tính năng này.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // ── Reset all filters ───────────────────────────────────────
  const clearAll = () => {
    setQuery('')
    setActiveCategory(null)
    setActiveTags([])
    setActiveTime('all')
    setShowFilters(false)
    router.replace('/search', { scroll: false })
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background selection:bg-gold/20 selection:text-gold flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6">

          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-10"
          >
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Tra cứu nhanh</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Kho Tàng Khai Thị</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tìm thấy câu trả lời bạn cần trong hàng ngàn bài giảng của Sư Phụ.
            </p>
          </motion.div>

          {/* ── Search Box ── */}
          <div className="max-w-3xl mx-auto mb-6 relative z-20">
            <div className="flex gap-2">
              {/* Input */}
              <div className="relative flex-1 group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập từ khóa (vd: buông xả, gia đình, wenda...)"
                  className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-card border border-border/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/10 transition-all shadow-sm"
                  autoComplete="off"
                />

                {/* Mounted-only buttons to prevent hydration shift */}
                {mounted && (
                  <>
                    {/* Clear button */}
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className="absolute right-14 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground transition-all z-10"
                        aria-label="Xóa từ khóa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Voice search button */}
                    <button
                      onClick={startVoiceSearch}
                      className={cn(
                        'absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full transition-all z-10',
                        isListening
                          ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/20'
                          : 'bg-secondary/80 text-muted-foreground hover:text-gold hover:bg-gold/10'
                      )}
                      aria-label={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
                      title={isListening ? 'Dừng ghi âm' : 'Nhấn và nói'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </>
                )}
              </div>

              {/* Filter toggle button with badge */}
              <button
                id="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'relative px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all whitespace-nowrap',
                  showFilters || activeFilterCount > 0
                    ? 'bg-primary/10 border-gold/30 text-gold'
                    : 'bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── Listening indicator ── */}
            {isListening && (
              <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
                Đang lắng nghe... Hãy nói từ khóa bạn muốn tìm
              </p>
            )}
          </div>

          <div className="max-w-3xl mx-auto">

            {/* ── Filter Panel ── */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5">
                    {/* Categories */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-foreground">Danh mục chủ đề</p>
                        {activeCategory && (
                          <button onClick={() => setActiveCategory(null)} className="text-xs text-muted-foreground hover:text-gold">
                            Xóa chọn
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                        {initialCategories.map((cat) => (
                          <button
                            key={cat.slug}
                            onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                            className={cn(
                              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                              activeCategory === cat.slug
                                ? 'bg-gold text-black border-gold'
                                : 'bg-background text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground'
                            )}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="pt-4 border-t border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-foreground">Thẻ chủ đề</p>
                        {activeTags.length > 0 && (
                          <button onClick={() => setActiveTags([])} className="text-xs text-muted-foreground hover:text-gold">
                            Xóa chọn
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {initialTags.map((tag) => (
                          <button
                            key={tag.slug}
                            onClick={() =>
                              setActiveTags(activeTags.includes(tag.slug)
                                ? activeTags.filter(t => t !== tag.slug)
                                : [...activeTags, tag.slug]
                              )
                            }
                            className={cn(
                              'px-3 py-1 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap',
                              activeTags.includes(tag.slug)
                                ? 'bg-gold/20 text-gold border-gold/50'
                                : 'bg-background text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground'
                            )}
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="pt-4 border-t border-border/30">
                      <p className="text-sm font-medium text-foreground mb-3">Thời gian đăng tải</p>
                      <div className="flex flex-wrap gap-2">
                        {TIME_FILTERS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setActiveTime(t.value)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-xs font-medium transition-colors border',
                              activeTime === t.value
                                ? 'bg-primary/10 text-gold border-gold/30'
                                : 'bg-background text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground'
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Popular Tags (khi chưa search) ── */}
            {!query && !activeCategory && activeTags.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <p className="text-xs text-muted-foreground mb-2.5 font-medium uppercase tracking-wider">Chủ đề phổ biến</p>
                <div className="flex flex-wrap gap-2">
                  {initialTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag.slug}
                      onClick={() => setActiveTags([tag.slug])}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary/60 text-muted-foreground border border-border/40 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Results ── */}
            <div className="space-y-3">
              {/* Status bar */}
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                  {loading
                    ? 'Đang tìm kiếm...'
                    : `Tìm thấy ${totalResults.toLocaleString('vi-VN')} kết quả`}
                </p>
                {!loading && totalPages > 1 && (
                  <span className="text-xs text-muted-foreground/60">Trang {currentPage}/{totalPages}</span>
                )}
              </div>

              {/* Skeleton */}
              {loading && results.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/30 animate-pulse">
                      <div className="w-20 h-16 rounded-xl bg-secondary flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-secondary rounded w-1/4" />
                        <div className="h-5 bg-secondary rounded w-3/4" />
                        <div className="h-3 bg-secondary rounded w-full" />
                        <div className="h-3 bg-secondary rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results list */}
              {!loading || results.length > 0 ? (
                results.length > 0 ? (
                  <div className={cn('space-y-3 transition-opacity', loading && 'opacity-40 pointer-events-none')}>
                    {results.map((r, i) => (
                      <ResultCard key={r.documentId} post={r} index={i} />
                    ))}
                  </div>
                ) : !loading ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SearchIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground mb-2">Không tìm thấy bài viết nào</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                      Vui lòng thử lại với từ khóa khác hoặc xóa bớt các bộ lọc.
                    </p>

                    <div className="max-w-md mx-auto">
                      <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">Gợi ý từ khóa cho bạn</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {initialTags.slice(0, 8).map((tag) => (
                          <button
                            key={tag.slug}
                            onClick={() => {
                              setQuery(tag.name)
                              setActiveTags([tag.slug])
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-card border border-border/60 hover:border-gold/30 hover:text-gold transition-all"
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(query || activeCategory || activeTags.length > 0 || activeTime !== 'all') && (
                      <button
                        onClick={clearAll}
                        className="mt-10 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-gold/10"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    )}
                  </div>
                ) : null
              ) : null}
            </div>

            {/* ── Pagination ── */}
            {!loading && (
              <SearchPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
