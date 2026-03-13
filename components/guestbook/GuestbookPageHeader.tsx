'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function GuestbookPageHeader() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12 flex flex-col items-center text-center"
      >
        <div className="absolute left-1/2 top-0 -z-10 size-64 -translate-x-1/2 rounded-md bg-gold/5 blur-3xl" />

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold/75">Sổ Lưu Bút & Hỏi Đáp</p>
        <h1 className="ant-title text-4xl text-foreground md:text-5xl lg:text-6xl">
          Nơi giao lưu và hỏi đáp nhẹ nhàng
        </h1>

        <Card className="mt-8 w-full max-w-3xl rounded-md border-border/90">
          <CardContent className="p-6 text-left md:p-8">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Đây là nơi để gửi lời cảm niệm, chia sẻ cảm ngộ tu học hoặc đặt một câu hỏi ngắn.
              Nội dung sẽ hiển thị ngay để cộng đồng cùng đọc, còn các phản hồi chính thức sẽ được Ban Quản Trị bổ sung khi cần.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-14 flex flex-col gap-5"
      >
        <Separator className="bg-gold/10" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: '01', label: 'Gửi lưu bút hoặc câu hỏi' },
            { step: '02', label: 'Hiển thị ngay cho cộng đồng' },
            { step: '03', label: 'Nhận phản hồi khi cần thiết' },
          ].map(({ step, label }) => (
            <Card key={label} className="rounded-md border-border bg-card shadow-none">
              <CardContent className="flex items-center gap-3 p-4 md:p-5">
                <span className="ant-number text-base text-gold">{step}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <Separator className="bg-gold/10" />
      </motion.div>
    </>
  )
}
