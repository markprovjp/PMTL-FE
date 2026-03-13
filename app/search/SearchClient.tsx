'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mic, MicOff, MoreHorizontal, Search as SearchIconLucide, X } from 'lucide-react'
import { toast } from 'sonner'
import { searchPostsAndCategories } from '@/app/actions/search'
import { SearchIcon, ArrowRightIcon } from '@/components/icons/ZenIcons'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BlogTag, Category, StrapiList } from '@/types/strapi'
import { PAGINATION, getPaginationRange } from '@/lib/config/pagination'
import type { SearchHit } from '@/lib/search/types'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import { cn } from '@/lib/utils'
import {
  getSearchDateFrom,
  getSearchStateKey,
  parseSearchPageParams,
  serializeSearchPageParams,
  type SearchPageState,
  type SearchSortOption,
} from '@/lib/search/search-params'
import { loadRecentSearches, saveRecentSearch } from '@/lib/search/recent-searches'

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionLike
    webkitSpeechRecognition: new () => SpeechRecognitionLike
  }
}

interface SpeechRecognitionLike {
  start: () => void
  stop: () => void
  onstart?: () => void
  onresult?: (event: SpeechRecognitionEventLike) => void
  onerror?: (event: { error: string }) => void
  onend?: () => void
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface SearchClientProps {
  initialCategories: Category[]
  initialTags: BlogTag[]
  initialState: SearchPageState
  initialResults: StrapiList<SearchHit>
}

const TIME_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Trong tuần', value: 'week' },
  { label: 'Trong tháng', value: 'month' },
] as const

const SORT_OPTIONS: Array<{ label: string; value: SearchSortOption }> = [
  { label: 'Liên quan nhất', value: 'relevance' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Xem nhiều', value: 'most-viewed' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function trackSearchEvent(event: 'search_performed' | 'search_no_results', payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  import('posthog-js')
    .then(({ default: posthog }) => {
      if (posthog.__loaded) {
        posthog.capture(event, payload)
      }
    })
    .catch(() => {})
}

function SearchPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const range = getPaginationRange(currentPage, totalPages)

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Phân trang kết quả tìm kiếm">
      <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        Trước
      </Button>
      {range.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="flex size-9 items-center justify-center text-muted-foreground/60">
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-lg border text-sm transition-colors',
              item === currentPage
                ? 'border-gold bg-gold/10 font-semibold text-gold'
                : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold'
            )}
          >
            {item}
          </button>
        )
      )}
      <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Sau
      </Button>
    </nav>
  )
}

function ResultCard({ post, index }: { post: SearchHit; index: number }) {
  const thumbUrl = getStrapiMediaUrl(post.thumbnail?.url)
  const highlightedTitle = post._formatted?.title || post.title
  const highlightedExcerpt = post._formatted?.excerpt || post._formatted?.content || post.excerpt || ''

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.28 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group flex gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-gold/40 hover:shadow-md hover:shadow-gold/5"
      >
        {thumbUrl && (
          <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40 sm:h-24 sm:w-28">
            <Image
              src={thumbUrl}
              alt={post.thumbnail?.alternativeText || post.title}
              width={112}
              height={96}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            {post.featured && (
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">Nổi bật</span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground">{post.views.toLocaleString('vi-VN')} lượt xem</span>
          </div>
          <h2
            className="mb-2 line-clamp-2 font-display text-base text-foreground transition-colors group-hover:text-gold"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />
          {highlightedExcerpt && (
            <p
              className="line-clamp-2 text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: highlightedExcerpt }}
            />
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gold/75 transition-colors group-hover:text-gold">
            Xem chi tiết <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default function SearchClient({
  initialCategories,
  initialTags,
  initialState,
  initialResults,
}: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const firstRender = useRef(true)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const [query, setQuery] = useState(initialState.q)
  const [activeCategory, setActiveCategory] = useState<string | null>(initialState.cat)
  const [activeTags, setActiveTags] = useState<string[]>(initialState.tags)
  const [activeTime, setActiveTime] = useState(initialState.time)
  const [sort, setSort] = useState<SearchSortOption>(initialState.sort)
  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [showFilters, setShowFilters] = useState(false)
  const [resultsState, setResultsState] = useState(initialResults)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  const debouncedQuery = useDebounce(query, 350)
  const currentUrlState = parseSearchPageParams(searchParams)
  const requestState: SearchPageState = {
    q: debouncedQuery.trim(),
    cat: activeCategory,
    tags: activeTags,
    time: activeTime,
    sort,
    page: currentPage,
  }
  const requestStateKey = getSearchStateKey(requestState)
  const currentUrlKey = getSearchStateKey(currentUrlState)
  const initialStateKey = getSearchStateKey(initialState)

  useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  useEffect(() => {
    const nextState = parseSearchPageParams(searchParams)
    setQuery(nextState.q)
    setActiveCategory(nextState.cat)
    setActiveTags(nextState.tags)
    setActiveTime(nextState.time)
    setSort(nextState.sort)
    setCurrentPage(nextState.page)
  }, [searchParams])

  useEffect(() => {
    const nextUrl = serializeSearchPageParams(requestState)
    const currentUrl = serializeSearchPageParams(currentUrlState)
    if (nextUrl !== currentUrl) {
      router.replace(`/search${nextUrl ? `?${nextUrl}` : ''}`, { scroll: false })
    }
  }, [currentUrlKey, requestStateKey, router])

  useEffect(() => {
    if (firstRender.current && requestStateKey === initialStateKey) {
      firstRender.current = false
      return
    }

    firstRender.current = false
    let ignore = false

    async function run() {
      setIsLoading(true)

      try {
        const response = await searchPostsAndCategories({
          search: requestState.q || undefined,
          categorySlug: requestState.cat || undefined,
          tagSlugs: requestState.tags.length > 0 ? requestState.tags : undefined,
          dateFrom: getSearchDateFrom(requestState.time),
          page: requestState.page,
          pageSize: PAGINATION.SEARCH_PAGE_SIZE,
          sort: requestState.sort,
        })

        if (ignore) return

        const nextResults = response as StrapiList<SearchHit>
        setResultsState(nextResults)

        const resultCount = nextResults.meta.pagination.total
        const payload = {
          query: requestState.q,
          result_count: resultCount,
          category: requestState.cat,
          tags: requestState.tags,
          time: requestState.time,
          sort: requestState.sort,
          page: requestState.page,
        }

        trackSearchEvent('search_performed', payload)

        if (requestState.q) {
          setRecentSearches(saveRecentSearch(requestState.q))
        }

        if (requestState.q && resultCount === 0) {
          trackSearchEvent('search_no_results', payload)
        }
      } catch (error) {
        if (!ignore) {
          console.error('Search failed:', error)
          toast.error('Không thể tải kết quả tìm kiếm. Vui lòng thử lại.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    run()

    return () => {
      ignore = true
    }
  }, [initialStateKey, requestStateKey])

  const results = resultsState.data
  const totalResults = resultsState.meta.pagination.total
  const totalPages = resultsState.meta.pagination.pageCount
  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    activeTags.length +
    (activeTime !== 'all' ? 1 : 0) +
    (sort !== 'relevance' ? 1 : 0)

  function resetPage() {
    setCurrentPage(1)
  }

  function clearAll() {
    setQuery('')
    setActiveCategory(null)
    setActiveTags([])
    setActiveTime('all')
    setSort('relevance')
    setCurrentPage(1)
    setShowFilters(false)
  }

  function toggleTag(slug: string) {
    setActiveTags((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])
    resetPage()
  }

  function handleVoiceSearch() {
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionApi) {
      toast.error('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognitionApi()
    recognitionRef.current = recognition
    recognition.lang = 'vi-VN'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('')
      setQuery(transcript)
      resetPage()
    }
    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Không thể nhận giọng nói. Vui lòng thử lại.')
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">Tra cứu nhanh</p>
          <h1 className="mb-4 font-display text-4xl text-foreground md:text-5xl">Kho Tàng Khai Thị</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Tìm nhanh theo từ khóa, chủ đề, thẻ và độ mới. Kết quả được đồng bộ trực tiếp với URL để chia sẻ và quay lại dễ hơn.
          </p>
        </motion.div>

        <div className="relative z-20 mx-auto mb-6 max-w-4xl">
          <div className="flex gap-2">
            <div className="group relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-gold" />
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  resetPage()
                }}
                placeholder="Nhập từ khóa như: buông xả, gia đình, niệm Phật..."
                className="w-full rounded-2xl border border-border/50 bg-card py-3.5 pl-12 pr-24 text-base text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-4 focus:ring-gold/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    resetPage()
                  }}
                  className="absolute right-14 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Xóa từ khóa"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={cn(
                  'absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors',
                  isListening ? 'bg-red-500/15 text-red-500' : 'bg-secondary/80 text-muted-foreground hover:bg-gold/10 hover:text-gold'
                )}
                aria-label={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={cn(
                'relative rounded-2xl border px-5 py-3.5 text-sm font-medium transition-colors',
                showFilters || activeFilterCount > 0
                  ? 'border-gold/30 bg-gold/10 text-gold'
                  : 'border-border/50 bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          {isListening && <p className="mt-2 text-center text-sm text-red-500">Đang lắng nghe...</p>}
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[180px] flex-1 sm:flex-none">
              <Select
                value={sort}
                onValueChange={(value: SearchSortOption) => {
                  setSort(value)
                  resetPage()
                }}
              >
                <SelectTrigger className="rounded-xl bg-card">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoading ? 'Đang tìm kiếm...' : `Tìm thấy ${totalResults.toLocaleString('vi-VN')} kết quả`}
            </div>
            {!isLoading && totalPages > 1 && (
              <div className="text-xs text-muted-foreground/70">Trang {currentPage}/{totalPages}</div>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex flex-col gap-5 rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Danh mục chủ đề</p>
                      {activeCategory && (
                        <button type="button" onClick={() => setActiveCategory(null)} className="text-xs text-muted-foreground hover:text-gold">
                          Xóa chọn
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {initialCategories.map((category) => (
                        <button
                          key={category.slug}
                          type="button"
                          onClick={() => {
                            setActiveCategory(activeCategory === category.slug ? null : category.slug)
                            resetPage()
                          }}
                          className={cn(
                            'rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors',
                            activeCategory === category.slug
                              ? 'border-gold bg-gold text-black'
                              : 'border-border/50 bg-background text-muted-foreground hover:border-gold/30 hover:text-foreground'
                          )}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Thẻ chủ đề</p>
                      {activeTags.length > 0 && (
                        <button type="button" onClick={() => setActiveTags([])} className="text-xs text-muted-foreground hover:text-gold">
                          Xóa chọn
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {initialTags.slice(0, 24).map((tag) => (
                        <button
                          key={tag.slug}
                          type="button"
                          onClick={() => toggleTag(tag.slug)}
                          className={cn(
                            'rounded-lg border px-3 py-1 text-xs font-medium transition-colors',
                            activeTags.includes(tag.slug)
                              ? 'border-gold/50 bg-gold/10 text-gold'
                              : 'border-border/50 bg-background text-muted-foreground hover:border-gold/30 hover:text-foreground'
                          )}
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-4">
                    <p className="mb-3 text-sm font-medium text-foreground">Thời gian đăng tải</p>
                    <div className="flex flex-wrap gap-2">
                      {TIME_FILTERS.map((timeFilter) => (
                        <button
                          key={timeFilter.value}
                          type="button"
                          onClick={() => {
                            setActiveTime(timeFilter.value)
                            resetPage()
                          }}
                          className={cn(
                            'rounded-lg border px-4 py-2 text-xs font-medium transition-colors',
                            activeTime === timeFilter.value
                              ? 'border-gold/30 bg-primary/10 text-gold'
                              : 'border-border/50 bg-background text-muted-foreground hover:border-gold/30 hover:text-foreground'
                          )}
                        >
                          {timeFilter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!query && activeTags.length === 0 && !activeCategory && (
            <div className="mb-6 flex flex-col gap-4">
              {recentSearches.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tìm gần đây</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setQuery(item)
                          resetPage()
                        }}
                        className="rounded-xl border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Gợi ý nhanh</p>
                <div className="flex flex-wrap gap-2">
                  {initialTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => {
                        setQuery(tag.name)
                        setActiveTags([tag.slug])
                        resetPage()
                      }}
                      className="rounded-xl border border-border/40 bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="relative space-y-3">
            {isLoading && results.length > 0 && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
                <div className="rounded-full border border-gold/20 bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                  Đang cập nhật...
                </div>
              </div>
            )}

            {isLoading && results.length === 0 && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 rounded-2xl border border-border/30 bg-card p-4">
                    <div className="size-20 animate-pulse rounded-xl bg-secondary sm:h-24 sm:w-28" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
                      <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
                      <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && results.length === 0 && (
              <div className="px-4 py-16 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/50">
                  <SearchIconLucide className="size-6 text-muted-foreground/60" />
                </div>
                <h2 className="mb-2 text-lg font-medium text-foreground">Không tìm thấy bài viết nào</h2>
                <p className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground">
                  Hãy thử đổi từ khóa, bỏ bớt bộ lọc hoặc chọn một chủ đề gợi ý bên dưới.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {initialTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => {
                        setQuery(tag.name)
                        setActiveTags([tag.slug])
                        resetPage()
                      }}
                      className="rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs transition-colors hover:border-gold/30 hover:text-gold"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={clearAll} className="mt-8 rounded-xl">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}

            {results.length > 0 && (
              <div className={cn('space-y-3 transition-opacity', isLoading && 'opacity-50')}>
                {results.map((result, index) => (
                  <ResultCard key={result.documentId} post={result} index={index} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}
