'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarDaysIcon } from 'lucide-react'
import type { ArchiveStat } from '@/lib/api/guestbook'

interface GuestbookSidebarProps {
  archives: ArchiveStat[]
  currentYear?: number
  currentMonth?: number
}

export default function GuestbookSidebar({ archives, currentYear, currentMonth }: GuestbookSidebarProps) {
  // Gom nhóm theo năm
  const byYear = archives.reduce((acc, stat) => {
    if (!acc[stat.year]) acc[stat.year] = []
    acc[stat.year].push(stat)
    return acc
  }, {} as Record<number, ArchiveStat[]>)

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-[1.75rem] border border-gold/12 bg-card/95 p-6 shadow-[0_12px_30px_-24px_rgba(212,175,55,0.35)] transition-colors duration-300 hover:border-gold/20"
      >
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
            <CalendarDaysIcon className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-display text-lg text-foreground">Lưu trữ theo tháng</h3>
        </div>

        <div className="space-y-5">
          {/* Link Xem tất cả */}
          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <Link
              href="/guestbook"
              className={`block text-sm font-semibold transition-all duration-200 ${!currentYear
                ? 'text-gold underline decoration-gold/40 underline-offset-4'
                : 'text-muted-foreground hover:text-gold hover:underline hover:decoration-gold/40 hover:underline-offset-4'
                }`}
            >
              ← Tất Cả Lưu Bút & Hỏi Đáp
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-gold/18 bg-gold/[0.04] p-4"
          >
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Đặt câu hỏi</h4>
            <p className="text-xs leading-relaxed text-muted-foreground/90">
              Có thắc mắc về tu học? Ban Quản Trị sẽ phản hồi khi cần thiết ngay trong mục lưu bút này.
            </p>
          </motion.div>

          {years.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground italic text-center py-6"
            >
              Chưa có dữ liệu lưu trữ.
            </motion.p>
          ) : (
            <div className="space-y-4">
              {years.map((y, idx) => (
                <motion.div
                  key={y}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className="space-y-3"
                >
                  <motion.p
                    whileHover={{ x: 2 }}
                    className="text-sm font-bold text-foreground/90 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    {y}
                  </motion.p>
                  <div className="grid grid-cols-2 gap-2 pl-4 border-l-2 border-gold/20">
                    {byYear[y]
                      .sort((a, b) => b.month - a.month)
                      .map((m, midx) => {
                        const isActive = currentYear === y && currentMonth === m.month
                        return (
                          <motion.div
                            key={`${y}-${m.month}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 + idx * 0.05 + midx * 0.02 }}
                          >
                            <Link
                              href={`/guestbook/archive/${y}/${m.month}`}
                              className={`text-xs py-2 px-3 rounded-lg flex items-center justify-between transition-all duration-200 font-medium ${isActive
                                ? 'bg-gold/15 text-gold border border-gold/40 shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent hover:border-border'
                                }`}
                            >
                              <span>Tháng {m.month}</span>
                              <span className="text-[10px] opacity-60">({m.count})</span>
                            </Link>
                          </motion.div>
                        )
                      })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </aside>
  )
}
