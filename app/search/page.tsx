'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";

import Footer from "@/components/Footer";
import StickyBanner from "@/components/StickyBanner";
import { SearchIcon, ArrowRightIcon } from "@/components/icons/ZenIcons";
import { searchPostsAndCategories, fetchAllCategories, fetchAllTags } from "@/app/actions/search";
import type { BlogPost, Category, BlogTag } from "@/types/strapi";
import { format, subDays, subMonths } from "date-fns";

const TIME_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Trong tuần", value: "week" },
  { label: "Trong tháng", value: "month" }
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
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
  const [loading, setLoading] = useState(true);

  // Fetch categories and tags on mount
  useEffect(() => {
    Promise.all([
      fetchAllCategories().then(cats => setCategories(cats)),
      fetchAllTags().then(tagsData => setTags(tagsData))
    ]).catch(console.error);
  }, []);

  // Fetch results when filters or debounced query changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let dateFrom: string | undefined = undefined;
        const dateTo: string | undefined = undefined;

        if (activeTime === "week") {
          dateFrom = format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ssXX");
        } else if (activeTime === "month") {
          dateFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ssXX");
        }

        const res = await searchPostsAndCategories({
          search: debouncedQuery,
          categorySlug: activeCategory || undefined,
          tagSlugs: activeTags.length > 0 ? activeTags : undefined,
          dateFrom,
          dateTo,
          pageSize: 20
        });

        setResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [debouncedQuery, activeCategory, activeTags, activeTime]);

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

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {loading ? "Đang tìm kiếm..." : `Tìm thấy ${results.length} kết quả phù hợp`}
                </h2>
              </div>

              {loading ? (
                // Skeleton loading
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="p-5 rounded-2xl bg-card border border-border/30 animate-pulse">
                    <div className="h-4 bg-secondary rounded w-1/4 mb-3"></div>
                    <div className="h-5 bg-secondary rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-secondary rounded w-full"></div>
                      <div className="h-3 bg-secondary rounded w-5/6"></div>
                    </div>
                  </div>
                ))
              ) : results.length > 0 ? (
                results.map((r, i) => (
                  <motion.div
                    key={r.documentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
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
                        <span className="ml-auto text-[11px] text-muted-foreground">{r.views} lượt xem</span>
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
                ))
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Không tìm thấy bài viết nào</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">Vui lòng thử lại với từ khóa khác hoặc xóa bớt các bộ lọc để xem nhiều kết quả hơn.</p>

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
          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.5); }
      `}} />
    </div>
  );
}
