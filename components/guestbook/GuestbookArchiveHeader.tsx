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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Lưu Trữ Theo Tháng</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-5">Sổ Lưu Bút & Hỏi Đáp</h1>

        {/* Archive timeline badge */}
        <div className="inline-flex items-center gap-3 bg-gold/5 border border-gold/20 rounded-2xl px-6 py-3 mt-2">
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-gold" />
          </div>
          <div className="text-left">
            <p className="text-foreground font-semibold text-sm">
              Tháng {month.toString().padStart(2, '0')} năm {year}
            </p>
            <p className="text-muted-foreground text-xs">{total} lưu bút</p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
