'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PhapBaoItem } from "@/types/strapi";

/* ══════════════════════════════════════════════════════════════
   PHAP BAO SECTION - 5 Great Dharma Treasures
   - Larger icons and text for seniors
   - More generous spacing
   - Clear visual hierarchy
══════════════════════════════════════════════════════════════ */

// SVG icons — larger for better visibility
const svgIcons: Record<string, React.ReactNode> = {
  book: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 6h18a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" strokeLinecap="round" />
      <path d="M12 12h12M12 17h12M12 22h8" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 6l2.4 7.2H30l-6.2 4.5 2.4 7.2L20 18.5l-6.2 5.4 2.4-7.2L10 13.2h7.6L20 6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 30c-6-4-10-9-10-14a10 10 0 0 1 20 0c0 5-4 10-10 14z" strokeLinecap="round" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 6c0 0-8 6-8 14s3.6 12 8 12 8-4 8-12c0-8-8-14-8-14z" strokeLinecap="round" />
    </svg>
  ),
  house: (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 10c0 0-8 5-8 11s8 9 8 9 8-3 8-9-8-11-8-11z" strokeLinecap="round" />
      <path d="M20 17v6M17 22l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

interface PhaoBaoSectionProps {
  items: PhapBaoItem[]
}

const PhaoBaoSection = ({ items }: PhaoBaoSectionProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header - Larger text for seniors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">
            Nam Dai Phap Bao
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 text-balance">
            5 Dai Phap Bao
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
            Nam Dai Phap Bao do Quan The Am Bo Tat truyen thu — con duong hoa giai nghiep chuong, tich duc hoi huong va khai mo tri tue.
          </p>
        </motion.div>

        {/* Cards Grid - Better spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={item.link} className="block h-full">
                <div className="card-zen h-full p-8 group">
                  {/* Icon - Larger */}
                  <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center text-gold mb-6 group-hover:bg-gold/10 group-hover:scale-105 transition-all duration-300">
                    {svgIcons[item.iconType] ?? svgIcons.book}
                  </div>

                  {/* Title + Chinese */}
                  <h3 className="font-display text-xl lg:text-2xl text-foreground mb-2 group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mb-4">{item.chinese}</p>

                  {/* Description - More readable */}
                  <p className="text-base text-muted-foreground leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* CTA Link - Larger touch target */}
                  <span className="inline-flex items-center gap-2 text-base text-gold group-hover:text-gold-glow transition-colors font-medium">
                    Tim hieu them
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaoBaoSection;
