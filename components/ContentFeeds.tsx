'use client'
// ─────────────────────────────────────────────────────────────
//  components/ContentFeeds.tsx
//  Hiển thị Khai Thị mới nhất và Chuyện Phật Pháp từ server thật
//  Đã gỡ bỏ mock data (dharmaTalks)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, BookIcon } from "@/components/icons/ZenIcons";
import { getCategoriesClient } from "@/lib/api/categories-client";
import type { Category, BlogPost } from "@/types/strapi";
import { BookOpen, Clock } from "lucide-react";
import { getStrapiMediaUrl } from "@/lib/strapi";

const ContentFeeds = () => {
  const [danhMuc, setDanhMuc] = useState<Category[]>([]);
  const [baiKhaiThi, setBaiKhaiThi] = useState<BlogPost[]>([]);
  const [chuyenPhapBao, setChuyenPhapBao] = useState<{ id: string; documentId: string; slug: string; title: string; createdAt: string }[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangTaiBaiViet, setDangTaiBaiViet] = useState(true);

  useEffect(() => {
    // Tải danh mục khai thị
    getCategoriesClient()
      .then(ds => setDanhMuc(ds.slice(0, 8)))
      .catch(() => null);

    // Tải bài khai thị mới nhất (4 bài) từ API blog
    fetch('/api/blog-posts?pageSize=4')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          setBaiKhaiThi(data.data as BlogPost[])
        }
      })
      .catch(() => null)
      .finally(() => {
        setDangTaiBaiViet(false)
      })

    // Tải chuyện Phật pháp mới nhất (1 bài) từ API cộng đồng
    fetch('/api/community-posts?pageSize=1')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          setChuyenPhapBao(data.data)
        }
      })
      .catch(() => null)
      .finally(() => {
        setDangTai(false)
      })
  }, []);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Cột trái (8/12) ── */}
          <div className="lg:col-span-8 space-y-20">

            {/* Khai Thị Mới Nhất */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl text-foreground">Khai Thị Mới Nhất</h2>
                  <p className="text-sm text-muted-foreground">Lời vàng ý ngọc từ Sư Phụ</p>
                </div>
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gold-dim hover:text-gold transition-colors font-medium">
                  Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {dangTaiBaiViet ? (
                // Skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-5 rounded-xl bg-card border border-border/50 animate-pulse">
                      <div className="h-4 bg-secondary rounded w-1/3 mb-3" />
                      <div className="h-5 bg-secondary rounded w-full mb-2" />
                      <div className="h-3 bg-secondary rounded w-4/5" />
                    </div>
                  ))}
                </div>
              ) : baiKhaiThi.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {baiKhaiThi.map((bai, i) => (
                    <motion.div
                      key={bai.documentId}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/blog/${bai.slug}`}
                        className="block p-5 rounded-xl bg-card border border-border/50 hover:border-gold/30 transition-all group/item shadow-sm hover:shadow-gold/5 h-full"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover/item:bg-gold/10 transition-colors mt-0.5">
                            <BookOpen className="w-4 h-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-base text-foreground line-clamp-2 group-hover/item:text-gold transition-colors leading-snug">
                              {bai.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {bai.categories?.[0] && (
                                <span className="text-[10px] text-gold-dim uppercase tracking-wider font-bold">
                                  {bai.categories[0].name}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(bai.publishedAt || bai.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Fallback: link đến trang blog
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-xl">
                  <p className="text-sm italic mb-4">Chưa có bài khai thị nào được đăng tải</p>
                  <Link href="/blog" className="text-gold text-sm font-medium hover:underline">
                    Đến trang Khai Thị →
                  </Link>
                </div>
              )}
            </div>

            {/* Chuyện Phật Pháp */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl text-foreground">Chuyện Phật Pháp</h2>
                  <p className="text-sm text-muted-foreground">Chứng nghiệm mầu nhiệm từ đồng tu</p>
                </div>
                <Link href="/shares" className="inline-flex items-center gap-2 text-sm text-gold-dim hover:text-gold transition-colors font-medium">
                  Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {dangTai ? (
                <div className="p-8 rounded-xl bg-card border border-border/50 animate-pulse">
                  <div className="h-4 bg-secondary rounded w-1/4 mb-4 mx-auto" />
                  <div className="h-20 bg-secondary rounded w-full" />
                </div>
              ) : chuyenPhapBao.length > 0 ? (
                chuyenPhapBao.map((bai: any) => (
                  <motion.div
                    key={bai.documentId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={`/shares?post=${encodeURIComponent(bai.slug)}`}
                      className="block p-8 rounded-xl bg-card border border-border/50 hover:border-gold/30 transition-all group/share shadow-sm hover:shadow-gold/5"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {bai.cover_image && (
                          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={getStrapiMediaUrl(bai.cover_image.url) || ''}
                              alt={bai.title}
                              width={200}
                              height={150}
                              className="w-full h-full object-cover group-hover/share:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/10 text-gold uppercase tracking-wide">
                              {bai.type || 'Câu chuyện'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(bai.publishedAt || bai.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h3 className="font-display text-xl text-foreground group-hover/share:text-gold transition-colors">
                            {bai.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {bai.content ? bai.content.replace(/<[^>]*>/g, '').substring(0, 250) + '...' : 'Nhấn để xem chi tiết câu chuyện...'}
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                              {bai.author_avatar ? (
                                <Image src={getStrapiMediaUrl(bai.author_avatar) || ''} alt={bai.author_name} width={24} height={24} />
                              ) : (
                                <span className="text-[10px] font-bold text-gold">{bai.author_name?.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">{bai.author_name}</span>
                            <span className="text-[10px] text-muted-foreground/50">•</span>
                            <span className="text-[10px] text-muted-foreground">{bai.author_country || 'Đồng tu'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 rounded-xl bg-card border border-border/50 text-center">
                  <BookIcon className="w-8 h-8 text-gold/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground italic">
                    Những câu chuyện chứng nghiệm từ cộng đồng đồng tu đang được tổng hợp.
                  </p>
                  <Link href="/shares" className="mt-4 inline-flex items-center gap-1.5 text-gold text-sm font-medium hover:underline">
                    Đến Diễn Đàn <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>


          {/* ── Sidebar (4/12) ── */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Danh Mục Tra Cứu  */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border/50 bg-secondary/30">
                <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  Danh Mục Tra Cứu
                </h3>
              </div>
              <div className="p-3">
                {danhMuc.length === 0 ? (
                  <div className="space-y-2 p-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-9 bg-secondary rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <nav className="space-y-1 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                    {danhMuc.map((dm, i) => (
                      <Link
                        key={dm.id}
                        href={`/category/${dm.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gold/10 group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-mono opacity-50">
                            {(i + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="text-sm text-muted-foreground group-hover:text-gold group-hover:font-medium transition-colors">
                            {dm.name}
                          </span>
                        </div>
                        <ArrowRightIcon className="w-3 h-3 text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    ))}
                  </nav>
                )}
                <div className="mt-4 p-4 border-t border-border/30">
                  <Link href="/blog" className="text-xs text-gold hover:underline flex items-center justify-center gap-2 font-medium">
                    Xem tất cả bài viết <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ContentFeeds;
