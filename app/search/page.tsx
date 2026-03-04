'use client'

// ─────────────────────────────────────────────────────────────
//  /search — Trang tìm kiếm nhanh kho tàng khai thị
//  Phân trang: state-based (client component) — mỗi trang 20 bài
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyBanner from "@/components/StickyBanner";
import { SearchIcon, ArrowRightIcon } from "@/components/icons/ZenIcons";
import { searchPostsAndCategories, fetchAllCategories, fetchAllTags } from "@/app/actions/search";
import type { BlogPost, Category, BlogTag } from "@/types/strapi";
import { format, subDays, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from "lucide-react";
import { PAGINATION, getPaginationRange } from "@/lib/config/pagination";
import { cn } from "@/lib/utils";

const TIME_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Trong tuần", value: "week" },
  { label: "Trong tháng", value: "month" }
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Inline Pagination (đơn giản cho search page) ────────────────────────
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeTime, setActiveTime] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  // Restore search state from session storage on mount
  useEffect(() => {
    try {
      const savedQuery = sessionStorage.getItem("pmtl_search_query");
      const savedCat = sessionStorage.getItem("pmtl_search_category");
      const savedTags = sessionStorage.getItem("pmtl_search_tags");
      const savedTime = sessionStorage.getItem("pmtl_search_time");

      if (savedQuery) setQuery(savedQuery);
      if (savedCat) setActiveCategory(savedCat);
      if (savedTags) setActiveTags(JSON.parse(savedTags));
      if (savedTime) setActiveTime(savedTime);
    } catch {
      console.error("Error restoring search state");
    } finally {
      // Đánh dấu đã khôi phục xong để bắt đầu cho phép fetch
      isInitialized.current = true;
    }
  }, []);

  // Save search state whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem("pmtl_search_query", query);
      if (activeCategory) sessionStorage.setItem("pmtl_search_category", activeCategory);
      else sessionStorage.removeItem("pmtl_search_category");

      sessionStorage.setItem("pmtl_search_tags", JSON.stringify(activeTags));
      sessionStorage.setItem("pmtl_search_time", activeTime);
    } catch {
      // Ignore sessionStorage errors (e.g., incognito mode)
    }
  }, [query, activeCategory, activeTags, activeTime]);

  // Tải danh mục và tags một lần khi mount
  useEffect(() => {
    Promise.all([
      fetchAllCategories().then(cats => setCategories(cats)),
      fetchAllTags().then(tagsData => setTags(tagsData))
    ]).catch(console.error);
  }, []);

  // Tải kết quả khi filter hoặc trang thay đổi
  const fetchResults = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let dateFrom: string | undefined = undefined;

      if (activeTime === "week") {
        dateFrom = format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ssXX");
      } else if (activeTime === "month") {
        dateFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ssXX");
      }

      const res = await searchPostsAndCategories({
        search: debouncedQuery || undefined,
        categorySlug: activeCategory || undefined,
        tagSlugs: activeTags.length > 0 ? activeTags : undefined,
        dateFrom,
        page,
        pageSize: PAGINATION.SEARCH_PAGE_SIZE,
      });

      setResults(res.data);
      const meta = res.meta?.pagination
      setTotalResults(meta?.total ?? res.data.length);
      setTotalPages(meta?.pageCount ?? 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeCategory, activeTags, activeTime]);

  // Re-fetch khi filter đổi, reset về trang 1
  useEffect(() => {
    // Chỉ fetch khi đã khôi phục trạng thái từ session storage xong
    if (isInitialized.current) {
      fetchResults(1);
    }
  }, [fetchResults]);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchResults(page);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-gold/20 selection:text-gold flex flex-col">
      <Header />
      <main className="flex-1 py-5">
        <div className="container mx-auto px-6">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-10">
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Tra cứu nhanh</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Kho Tàng Khai Thị</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tìm thấy câu trả lời bạn cần trong hàng ngàn bài giảng của Sư Phụ.</p>
          </motion.div>

          {/* ── Search box ── */}
          <div className="max-w-3xl mx-auto mb-8 relative z-20">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập từ khóa (vd: buông xả, gia đình, wenda...)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-card border border-border/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/10 transition-all shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all ${showFilters || activeCategory || activeTime !== "all" ? 'bg-primary/10 border-gold/30 text-gold' : 'bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              >
                Bộ lọc
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* ── Bộ lọc mở rộng ── */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-6">
                    {/* Danh mục */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-foreground">Danh mục chủ đề</p>
                        {activeCategory && <button onClick={() => setActiveCategory(null)} className="text-xs text-muted-foreground hover:text-gold">Xóa chọn</button>}
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((cat) => (
                          <button
                            key={cat.slug}
                            onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${activeCategory === cat.slug ? "bg-gold text-black border-gold" : "bg-background text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground"}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="pt-4 border-t border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-foreground">Tags</p>
                        {activeTags.length > 0 && <button onClick={() => setActiveTags([])} className="text-xs text-muted-foreground hover:text-gold">Xóa chọn</button>}
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {tags.map((tag) => (
                          <button
                            key={tag.slug}
                            onClick={() => setActiveTags(activeTags.includes(tag.slug) ? activeTags.filter(t => t !== tag.slug) : [...activeTags, tag.slug])}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap ${activeTags.includes(tag.slug) ? "bg-gold/20 text-gold border-gold/50" : "bg-background text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground"}`}
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div className="pt-4 border-t border-border/30">
                      <p className="text-sm font-medium text-foreground mb-3">Thời gian đăng tải</p>
                      <div className="flex flex-wrap gap-2">
                        {TIME_FILTERS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setActiveTime(t.value)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors border ${activeTime === t.value ? "bg-primary/10 text-gold border-gold/30" : "bg-background text-muted-foreground border-border/50 hover:border-gold/30 hover:text-foreground"}`}
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

            {/* ── Kết quả ── */}
            <div className="space-y-4">
              {/* Status bar */}
              <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                  {loading
                    ? "Đang tìm kiếm..."
                    : `Tìm thấy ${totalResults.toLocaleString('vi-VN')} kết quả`}
                </h2>
                {!loading && totalPages > 1 && (
                  <span className="text-xs text-muted-foreground/60">Trang {currentPage}/{totalPages}</span>
                )}
              </div>

              {(loading && results.length === 0) ? (
                // Skeleton loading
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="p-5 rounded-2xl bg-card border border-border/30 animate-pulse">
                    <div className="h-4 bg-secondary rounded w-1/4 mb-3" />
                    <div className="h-5 bg-secondary rounded w-3/4 mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-secondary rounded w-full" />
                      <div className="h-3 bg-secondary rounded w-5/6" />
                    </div>
                  </div>
                ))
              ) : results.length > 0 ? (
                <div className={cn("space-y-4 transition-opacity", loading && "opacity-40 pointer-events-none")}>
                  {results.map((r, i) => (
                    <motion.div
                      key={r.documentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.25), duration: 0.3 }}
                    >
                      <Link
                        href={`/blog/${r.slug}`}
                        className="block p-5 rounded-2xl bg-card border border-border/50 hover:border-gold/40 hover:shadow-md hover:shadow-gold/5 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {r.featured && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500">Nổi bật</span>}
                          {r.source ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-gold font-mono">{r.source}</span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">{new Date(r.publishedAt || r.createdAt).toLocaleDateString("vi-VN")}</span>
                          )}
                          <span className="ml-auto text-[11px] text-muted-foreground">{r.views.toLocaleString('vi-VN')} lượt xem</span>
                        </div>

                        <h3 className="text-base md:text-lg font-display text-foreground mb-2 group-hover:text-gold transition-colors">{r.title}</h3>

                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {r.content.replace(/<[^>]*>/g, '').substring(0, 180)}...
                        </p>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-gold/70 group-hover:text-gold transition-colors">
                          Xem chi tiết <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Không tìm thấy bài viết nào</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">Vui lòng thử lại với từ khóa khác hoặc xóa bớt các bộ lọc.</p>

                  {(query || activeCategory || activeTags.length > 0 || activeTime !== "all") && (
                    <button
                      onClick={() => { setQuery(''); setActiveCategory(null); setActiveTags([]); setActiveTime('all'); setShowFilters(false); }}
                      className="mt-6 px-4 py-2 rounded-lg bg-primary/10 text-gold text-sm font-medium hover:bg-gold hover:text-black transition-colors"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Phân trang ── */}
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
  );
}
