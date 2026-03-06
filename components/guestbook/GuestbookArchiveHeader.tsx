// components/guestbook/GuestbookArchiveHeader.tsx — Client component (motion wrapper)
'use client'

import { motion } from 'framer-motion'
import { CalendarIcon } from 'lucide-react'

interface Props {
  year: number
  month: number
  total: number
}

export default function GuestbookArchiveHeader({ year, month, total }: Props) {
  return (
    <>
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Lưu Trữ Theo Tháng</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Sổ Lưu Bút & Hỏi Đáp</h1>
      </motion.div>

      {/* Archive Timeline Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center mb-12"
      >
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gold/10 to-yellow-500/5 border border-gold/30 rounded-2xl px-6 py-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-gold" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-semibold">
              Tháng {month.toString().padStart(2, '0')} năm {year}
            </p>
            <p className="text-muted-foreground text-sm">
              {total} lưu bút
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
