'use client'

import { motion } from 'framer-motion'

export default function GuestbookPageHeader() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-14 flex flex-col items-center text-center"
      >
        <div className="absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-md bg-gold/5 blur-3xl" />

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold/75">Sổ Lưu Bút & Hỏi Đáp</p>
        <h1 className="ant-title text-4xl text-foreground md:text-5xl lg:text-6xl">
          Nơi giao lưu và hỏi đáp nhẹ nhàng
        </h1>

        <div className="surface-panel mt-8 max-w-3xl p-8 text-left">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Đây là nơi để gửi lời cảm niệm, chia sẻ cảm ngộ tu học hoặc đặt một câu hỏi ngắn.
            Nội dung sẽ hiển thị ngay để cộng đồng cùng đọc, còn các phản hồi chính thức sẽ được Ban Quản Trị bổ sung khi cần.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-16 grid gap-4 border-y border-gold/5 py-5 md:grid-cols-3"
      >
        {[
          { step: '01', label: 'Gửi lưu bút hoặc câu hỏi' },
          { step: '02', label: 'Hiển thị ngay cho cộng đồng' },
          { step: '03', label: 'Nhận phản hồi khi cần thiết' },
        ].map(({ step, label }) => (
          <div key={label} className="surface-panel-muted flex items-center gap-4 px-5 py-4">
            <span className="ant-number text-lg text-gold">{step}</span>
            <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground/85">{label}</span>
          </div>
        ))}
      </motion.div>
    </>
  )
}
