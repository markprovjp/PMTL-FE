// components/guestbook/GuestbookPageHeader.tsx — Client component (motion wrapper)
'use client'

import { motion } from 'framer-motion'
import { MessageCircleIcon } from 'lucide-react'

export default function GuestbookPageHeader() {
  return (
    <>
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Giao Lưu & Hỏi Đáp</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Sổ Lưu Bút Kỳ Diệu</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Nơi các thiện hữu giao lưu, hỏi đáp thắc mắc và chia sẻ kinh nghiệm tu học trên con đường Phật Pháp.
          Những lưu bút từ bốn phương được Ban Quản Trị giải đáp một cách trang trọng.
        </p>
      </motion.div>

      {/* Info Banner — palette vàng/trầm */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-gold/5 to-amber-500/5 border border-gold/10"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <MessageCircleIcon className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">Chia Sẻ & Ghi Lại Hành Trình Tu Học</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bạn có thể gửi lưu bút, hỏi những thắc mắc về tu học, chia sẻ kinh nghiệm riêng hoặc cảm nhận.
              Ban Quản Trị sẽ duyệt và trả lời một cách trang trọng — mỗi câu hỏi đều được coi trọng.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
