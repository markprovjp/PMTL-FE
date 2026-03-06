'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Globe, Heart, Star, Megaphone,
  Languages, Flower2, Clock, MapPin, Video,
  ChevronRight, Calendar, Info, type LucideIcon
} from "lucide-react";
import type { StrapiEvent } from "@/types/strapi";
import { getStrapiMediaUrl } from "@/lib/strapi-helpers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeLabels: Record<string, { label: string; bg: string; text: string; icon: LucideIcon }> = {
  "dharma-talk": { label: "Pháp Hội", bg: "bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/20", text: "text-red-500 dark:text-red-400", icon: Sparkles },
  "webinar": { label: "Trực Tuyến", bg: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 border-blue-500/20", text: "text-blue-500 dark:text-blue-400", icon: Globe },
  "retreat": { label: "Khóa Tu", bg: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 dark:text-purple-400 border-purple-500/20", text: "text-purple-500 dark:text-purple-400", icon: Flower2 },
  "liberation": { label: "Phóng Sinh", bg: "bg-green-500/10 hover:bg-green-500/20 text-green-500 dark:text-green-400 border-green-500/20", text: "text-green-500 dark:text-green-400", icon: Heart },
  "festival": { label: "Lễ Hội", bg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: Star },
};

const statusLabels: Record<string, { label: string; bg: string; text: string; pulse?: boolean }> = {
  upcoming: { label: "Sắp Diễn Ra", bg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20", text: "text-emerald-500 dark:text-emerald-400" },
  live: { label: "ĐANG PHÁT", bg: "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20", text: "text-red-500 dark:text-red-400", pulse: true },
  past: { label: "Đã Kết Thúc", bg: "bg-secondary text-muted-foreground border-transparent", text: "text-muted-foreground" },
};

export default function EventsClient({ initialEvents }: { initialEvents: StrapiEvent[] }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filtered = initialEvents.filter((e) => {
    if (filter === "upcoming" && e.eventStatus !== "upcoming" && e.eventStatus !== "live") return false;
    if (filter === "past" && e.eventStatus !== "past") return false;
    if (typeFilter && e.type !== typeFilter) return false;
    return true;
  });

  const upcoming = initialEvents.filter((e) => e.eventStatus === "upcoming" || e.eventStatus === "live");
  const past = initialEvents.filter((e) => e.eventStatus === "past");

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-10">
        <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Lịch Sự Kiện</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Sự Kiện & Pháp Hội</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tham gia các pháp hội, khóa tu, phóng sinh và bài giảng tại Việt Nam cùng cộng đồng toàn cầu.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[{ label: "Pháp Hội/Năm", value: "30+" }, { label: "Khóa Lễ", value: "100+" }, { label: "Tham Dự", value: "10K+" }, { label: "Phóng Sinh/Năm", value: "50+" }].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center shadow-sm">
            <p className="text-xl font-display text-gold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-card p-2 rounded-xl border border-border/60 shadow-sm">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
              className={`rounded-md text-xs font-medium h-9 px-4 ${filter === f ? "bg-background text-foreground shadow hover:bg-background/90" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? `Tất Cả (${initialEvents.length})` : f === "upcoming" ? `Sắp Tới (${upcoming.length})` : `Đã Qua (${past.length})`}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap justify-center p-1">
          {Object.entries(typeLabels).map(([key, { label, icon: Icon, bg }]) => (
            <Badge
              key={key}
              variant={typeFilter === key ? "default" : "outline"}
              onClick={() => setTypeFilter(typeFilter === key ? null : key)}
              className={`cursor-pointer px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-1.5 ${typeFilter === key ? bg + " ring-1 ring-current" : "hover:bg-secondary/80 bg-background text-muted-foreground border-border"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((event, index) => {
            const typeInfo = typeLabels[event.type] || typeLabels['dharma-talk'];
            const statusInfo = statusLabels[event.eventStatus] || statusLabels.upcoming;
            const TypeIcon = typeInfo.icon;

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`group flex flex-col rounded-2xl border transition-all hover:shadow-lg overflow-hidden ${event.eventStatus === "past" ? "bg-card/50 border-border/50 hover:border-border" : "bg-card border-border hover:border-gold/30"}`}
              >
                {/* Card Header -> Image */}
                <div className="relative aspect-[16/10] w-full bg-secondary overflow-hidden shrink-0 border-b border-border/50">
                  {event.coverImage ? (
                    <Image src={getStrapiMediaUrl(event.coverImage.url) ?? ''} alt={event.coverImage.alternativeText || event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gold/30 bg-gold/5 transition-transform duration-500 group-hover:scale-110">
                      <TypeIcon className="w-16 h-16" />
                    </div>
                  )}
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="outline" className={`${statusInfo.bg} shadow-sm backdrop-blur-md`}>
                      {statusInfo.pulse && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className={`${typeInfo.bg} shadow-sm backdrop-blur-md flex items-center gap-1.5`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      {typeInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-1 p-5 lg:p-6">
                  <h3 className={`text-lg font-semibold line-clamp-2 mb-2 group-hover:text-gold transition-colors ${event.eventStatus === "past" ? "text-muted-foreground" : "text-foreground"}`}>{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">{event.description}</p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-foreground/70 mb-6 bg-secondary/30 p-3 rounded-xl border border-border/40">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold/70 shrink-0" /><span className="truncate">{event.date ? new Date(event.date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</span></div>
                    {event.timeString && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold/70 shrink-0" /><span className="truncate">{event.timeString}</span></div>}
                    <div className="flex items-center gap-2 col-span-2"><MapPin className="w-4 h-4 text-gold/70 shrink-0" /><span className="truncate">{event.location}</span></div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 rounded-xl h-11 border-border/80 text-foreground hover:bg-gold/5 hover:text-gold hover:border-gold/30 transition-all gap-2 group/btn">
                          <Info className="w-4 h-4 text-muted-foreground group-hover/btn:text-gold" /> Chi Tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden rounded-2xl border-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-background">
                        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-secondary shrink-0 border-b border-border/50">
                          {event.coverImage ? (
                            <Image src={getStrapiMediaUrl(event.coverImage.url) ?? ''} alt={event.coverImage.alternativeText || event.title} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gold/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-background to-background">
                              <TypeIcon className="w-20 h-20 opacity-50 drop-shadow-lg" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className={`${statusInfo.bg} shadow-sm`}>
                                {statusInfo.pulse && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />}
                                {statusInfo.label}
                              </Badge>
                              <Badge variant="outline" className={`${typeInfo.bg} shadow-sm flex items-center gap-1.5`}>
                                <TypeIcon className="w-3.5 h-3.5" />
                                {typeInfo.label}
                              </Badge>
                            </div>
                            <DialogHeader>
                              <DialogTitle className="text-2xl md:text-3xl lg:text-4xl font-display text-foreground leading-tight drop-shadow-md text-left">{event.title}</DialogTitle>
                            </DialogHeader>
                          </div>
                        </div>

                        <ScrollArea className="max-h-[60vh] md:max-h-[55vh]">
                          <div className="p-6 md:p-8 pt-4 md:pt-6">
                            <DialogDescription className="text-base text-foreground/80 mb-8 whitespace-pre-wrap leading-relaxed">
                              {event.description}
                            </DialogDescription>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-secondary/40 mb-8 border border-border/50">
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-background border border-border/50 text-gold shadow-sm flex items-center justify-center shrink-0">
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest font-semibold">Thời gian</p>
                                  <p className="text-sm font-medium text-foreground">{event.date ? new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Đang cập nhật'}</p>
                                  {event.timeString && <p className="text-sm text-muted-foreground">{event.timeString}</p>}
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-background border border-border/50 text-gold shadow-sm flex items-center justify-center shrink-0">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest font-semibold">Địa điểm</p>
                                  <p className="text-sm font-medium text-foreground">{event.location}</p>
                                </div>
                              </div>
                              {event.speaker && (
                                <div className="flex gap-4">
                                  <div className="w-10 h-10 rounded-full bg-background border border-border/50 text-gold shadow-sm flex items-center justify-center shrink-0">
                                    <Megaphone className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest font-semibold">Diễn giả</p>
                                    <p className="text-sm font-medium text-foreground">{event.speaker}</p>
                                  </div>
                                </div>
                              )}
                              {event.language && (
                                <div className="flex gap-4">
                                  <div className="w-10 h-10 rounded-full bg-background border border-border/50 text-gold shadow-sm flex items-center justify-center shrink-0">
                                    <Languages className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest font-semibold">Ngôn ngữ</p>
                                    <p className="text-sm font-medium text-foreground">{event.language}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {event.content && (
                              <div className="prose prose-sm dark:prose-invert prose-gold max-w-none pt-4 border-t border-border/50">
                                <div dangerouslySetInnerHTML={{ __html: event.content }} />
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                        <div className="p-4 md:p-6 border-t bg-muted/30 flex flex-col sm:flex-row justify-end gap-3 rounded-b-2xl">
                          {event.eventStatus === "upcoming" && event.link && (
                            <Button asChild size="lg" className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 w-full sm:w-auto font-medium shadow-md shadow-gold/20">
                              <a href={event.link} target="_blank" rel="noopener noreferrer">
                                Tham Gia / Đăng Ký <ChevronRight className="w-4 h-4 ml-1.5" />
                              </a>
                            </Button>
                          )}
                          {event.eventStatus === "past" && event.youtubeId && (
                            <Button asChild size="lg" className="rounded-xl bg-[#FF0000] hover:bg-[#CC0000] text-white w-full sm:w-auto font-medium shadow-md shadow-red-500/20">
                              <a href={`https://www.youtube.com/watch?v=${event.youtubeId}`} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-2" /> Xem Lại Video
                              </a>
                            </Button>
                          )}
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="lg" className="rounded-xl hidden sm:flex">
                              Đóng
                            </Button>
                          </DialogTrigger>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {event.eventStatus === "upcoming" && event.link && (
                      <Button asChild className="flex-1 rounded-xl h-11 bg-gold text-gold-foreground hover:bg-gold/90 px-0 shadow-sm transition-all gap-1.5 font-medium group/btn">
                        <a href={event.link} target="_blank" rel="noopener noreferrer">
                          Tham Gia <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </Button>
                    )}
                    {event.eventStatus === "past" && event.youtubeId && (
                      <Button asChild variant="outline" className="flex-1 rounded-xl h-11 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white px-0 shadow-sm transition-all gap-1.5 font-medium">
                        <a href={`https://www.youtube.com/watch?v=${event.youtubeId}`} target="_blank" rel="noopener noreferrer">
                          <Video className="w-4 h-4" /> Xem Lại
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 px-6 rounded-3xl border-2 border-dashed border-border/60 bg-secondary/20">
          <div className="w-20 h-20 rounded-full bg-background border border-border/50 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Calendar className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Không có sự kiện</h3>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">Hiện tại không có sự kiện nào phù hợp với bộ lọc bạn chọn. Vui lòng thử lại sau.</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setFilter('all'); setTypeFilter(null); }}>
            Xóa bộ lọc
          </Button>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-20 p-8 md:p-14 rounded-[2rem] bg-gradient-to-br from-gold/5 via-amber-500/5 to-transparent border border-gold/10 text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 relative z-10">Tổ Chức Sự Kiện Việc Thiện?</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">Bạn là hội viên và muốn tổ chức pháp hội, phóng sinh, phát sách miễn phí tại địa phương? Hãy liên hệ với chúng tôi để được tư vấn và kết nối cộng đồng.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Button asChild size="lg" className="rounded-xl h-12 px-8 bg-gold text-gold-foreground hover:bg-gold/90 font-medium text-base shadow-lg shadow-gold/20 transition-all hover:scale-105">
            <Link href="/directory">
              <MapPin className="w-5 h-5 mr-2" /> Tìm Quán Âm Đường
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl h-12 px-8 border-border bg-background/50 hover:bg-secondary font-medium text-base transition-all">
            <a href="mailto:oriental2or@hotmail.com">Liên Hệ Ban Tổ Chức</a>
          </Button>
        </div>
      </motion.div>
    </>
  );
}
