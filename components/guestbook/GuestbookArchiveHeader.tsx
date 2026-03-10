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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 flex flex-col items-center text-center"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold/75">Lưu Trữ Theo Tháng</p>
      <h1 className="ant-title mb-5 text-4xl text-foreground md:text-5xl">Sổ Lưu Bút & Hỏi Đáp</h1>

      <div className="inline-flex items-center gap-3 rounded-lg border border-gold/20 bg-gold/5 px-6 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10">
          <CalendarIcon className="h-4 w-4 text-gold" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">
            Tháng {month.toString().padStart(2, '0')} năm {year}
          </p>
          <p className="text-xs text-muted-foreground">{total} lưu bút</p>
        </div>
      </div>
    </motion.div>
  )
}
