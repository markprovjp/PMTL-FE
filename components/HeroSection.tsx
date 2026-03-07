'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "@/components/icons/ZenIcons";
import type { HeroSlide, StatItem } from "@/types/strapi";

/* ══════════════════════════════════════════════════════════════
   HERO SECTION - Senior Friendly Buddhist Design
   - Large readable text
   - Clear call-to-actions with 48px minimum touch targets
   - High contrast overlays
   - Slower animations for comfort
══════════════════════════════════════════════════════════════ */

interface HeroSectionProps {
  slides: HeroSlide[]
  stats: StatItem[]
}

const HeroSection = ({ slides, stats }: HeroSectionProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000); // Slower for seniors
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-zen-dark">
      {/* Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt="Phap Mon Tam Linh"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Refined overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-zen-dark/90 via-zen-dark/60 to-zen-dark/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-zen-dark/85 via-transparent to-zen-dark/40" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 pt-16 pb-40 flex flex-col items-start justify-center min-h-[85vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          {/* Elegant Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-10">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm text-white/90 font-medium tracking-widest uppercase">Phap Mon Tam Linh</span>
          </div>

          {/* Title - Large and clear */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.9 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] text-white mb-8 text-balance"
            >
              {slide.title}
              <br />
              <span className="text-gold drop-shadow-[0_2px_10px_rgba(201,169,97,0.4)]">
                {slide.highlight}
              </span>
            </motion.h1>
          </AnimatePresence>

          {/* Decorative divider */}
          <div className="w-32 h-1 bg-gradient-to-r from-gold via-gold/60 to-transparent mb-8 rounded-full" />

          {/* Subtitle - Readable */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="font-body text-lg md:text-xl text-white/85 max-w-2xl mb-12 leading-relaxed"
            >
              {slide.sub}
            </motion.p>
          </AnimatePresence>

          {/* Actions - Large touch targets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-8"
          >
            {/* Search Bar - Large and accessible */}
            <Link
              href="/search"
              className="block max-w-xl group"
            >
              <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-2 transition-all duration-300 group-hover:border-gold/50 group-hover:bg-white/15">
                <SearchIcon className="w-6 h-6 ml-4 text-white/70 hidden sm:block" />
                <span className="flex-1 px-4 py-4 text-white/60 text-base">
                  Tim kiem kinh van, khai thi...
                </span>
                <span className="px-6 py-4 rounded-xl bg-gold text-zen-dark font-semibold text-base hover:bg-gold-glow transition-colors shrink-0 min-h-[56px] flex items-center">
                  Tra Cuu
                </span>
              </div>
            </Link>

            {/* Quick Links - Clear and touchable */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/beginner-guide"
                className="inline-flex items-center gap-3 px-6 py-4 bg-sage/20 border border-sage/30 text-white hover:bg-sage/30 rounded-xl transition-all duration-200 text-base font-medium min-h-[56px]"
              >
                <span className="w-2 h-2 rounded-full bg-sage" />
                Bat Dau Tu Tap
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 hover:text-white rounded-xl transition-all duration-200 text-base min-h-[56px]"
              >
                Thu Vien Phap Bao
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Bar - Larger text for seniors */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 lg:bottom-10 left-4 right-4 sm:left-6 sm:right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-5xl z-20"
      >
        <div className="grid grid-cols-3 gap-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 overflow-hidden shadow-elevated">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-zen-dark/60 px-4 py-5 sm:px-6 sm:py-6 lg:p-8 flex flex-col justify-center relative group hover:bg-zen-dark/70 transition-colors"
            >
              <h4 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mb-1 lg:mb-2 leading-none">
                {stat.value}
              </h4>
              <p className="text-xs sm:text-sm text-gold uppercase tracking-wider font-semibold mb-1 leading-tight">
                {stat.label}
              </p>
              <p className="hidden sm:block text-xs text-white/50 leading-tight">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Slide Navigation - Larger touch targets */}
      <div className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-20">
        {slides.map((_: HeroSlide, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 rounded-full ${
              i === current 
                ? "h-14 w-3 bg-gold shadow-[0_0_12px_rgba(201,169,97,0.6)]" 
                : "h-3 w-3 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Chuyen den slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
