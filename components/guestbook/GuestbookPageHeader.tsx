// components/guestbook/GuestbookPageHeader.tsx — Client component (motion wrapper)
'use client'

import { motion } from 'framer-motion'

export default function GuestbookPageHeader() {
  return (
    <>
      {/* Animated Header */}
      {/* Animated Header — editorial prayer desk mood */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-16 relative"
      >
        {/* Desk/Paper Ornament Background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/5 blur-3xl rounded-full -z-10" />

        {/* Floating Motifs */}
        <div className="hidden md:block absolute -left-10 top-20 opacity-[0.03] rotate-[-15deg] pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>

        <p className="text-gold text-xs font-semibold tracking-[0.4em] uppercase mb-4 opacity-70">Lưu Bút & Nguyện Ước</p>

        <div className="relative inline-block mb-8">
          <h1 className="font-display text-4xl md:text-5xl lg:text-7xl text-foreground relative z-10 px-4">
            Sổ Lưu Bút Kỳ Diệu
          </h1>
          <div className="absolute -bottom-2 left-0 w-full h-3 bg-gold/10 -rotate-1 skew-x-12 -z-10" />
        </div>

        {/* Paper texture card for description */}
        <div className="relative max-w-2xl mx-auto p-8 rounded-2xl bg-[#fdfcf6] dark:bg-stone-900/40 border border-gold/15 shadow-sm overflow-hidden group">
          {/* Local SVG paper texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.2] pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}
          />

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed italic relative z-10">
            "Nơi các thiện hữu giao lưu, thắc mắc và gửi gắm tâm tình trên con đường Phật Pháp.
            Mỗi lưu bút đều được Ban Quản Trị nâng niu và giải đáp tận tường."
          </p>

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gold/5 rounded-bl-3xl border-l border-b border-gold/20" />
          <div className="absolute bottom-4 right-6 text-gold/20 text-4xl font-serif select-none">“</div>
        </div>
      </motion.div>

      {/* 3-step invitation row — horizontal process flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-16 py-4 border-y border-gold/5"
      >
        {[
          { step: 'I', label: 'Tâm tình / Hỏi đáp' },
          { step: 'II', label: 'Ban QTrị giải đáp' },
          { step: 'III', label: 'Lưu giữ & Chia sẻ' },
        ].map(({ step, label }, i) => (
          <div key={label} className="flex items-center gap-4 group">
            <span className="font-display text-lg text-gold/40 group-hover:text-gold transition-colors">{step}</span>
            <span className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase">{label}</span>
            {i < 2 && <div className="hidden lg:block w-8 h-px bg-gold/20" />}
          </div>
        ))}
      </motion.div>
    </>
  )
}
