'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "@/components/icons/ZenIcons";
import type { HeroSlide, StatItem } from "@/types/strapi";

interface HeroSectionProps {
  slides: HeroSlide[]
  stats: StatItem[]
}

const HeroSection = ({ slides, stats }: HeroSectionProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt="Pháp Môn Tâm Linh"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Multi-layer overlay for guaranteed readability on any image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Text & Search */}
        <div className="flex-1 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {/* Elegant Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
              <span className="text-xs text-white/90 font-medium tracking-[0.2em] uppercase">心灵法门 · Pháp Môn Tâm Linh</span>
            </div>

            {/* Title with Masked Gradient */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={current}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.8 }}
                className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] text-white mb-6 drop-shadow-2xl"
              >
                {slide.title} <br />
                <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  {slide.highlight}
                </span>
              </motion.h1>
            </AnimatePresence>

            <div className="w-24 h-px bg-gradient-to-r from-gold to-transparent mb-8" />

            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-body text-lg md:text-xl text-white/80 max-w-2xl mb-12 leading-relaxed font-light drop-shadow-lg"
              >
                {slide.sub}
              </motion.p>
            </AnimatePresence>

            {/* Actions: Search & Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-6"
            >
              {/* Search Bar */}
              <div
                className="max-w-xl relative group cursor-pointer"
                onClick={() => window.location.href = '/search'}
              >
                <div className="absolute inset-0 bg-gold/20 rounded-2xl blur group-hover:bg-gold/30 transition-colors opacity-50" />
                <div className="relative flex items-center  backdrop-blur-xl border border-white/10 rounded-2xl p-2 transition-all group-hover:border-gold/50 shadow-2xl">
                  <SearchIcon className="w-6 h-6 ml-4 text-white hidden sm:block" />
                  <input
                    type="text"
                    disabled
                    placeholder="Tìm kiếm kinh văn, khai thị, hoặc từ khóa..."
                    className="w-full bg-transparent px-4 py-3 focus:outline-none text-white/80 cursor-pointer placeholder:text-white/60"
                  />
                  <button className="px-6 py-3 rounded-xl bg-gold text-black font-medium hover:bg-gold-glow transition-colors shrink-0">
                    Tra Cứu
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/beginner-guide"
                  className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-glow transition-colors font-medium tracking-wide uppercase"
                >
                  <span className="w-8 h-px bg-current" />
                  Bắt Đầu Tu Tập
                </Link>
                <span className="text-white/30 hidden sm:block">•</span>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors tracking-wide"
                >
                  Thư Viện Pháp Bảo
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Glass Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-4 lg:bottom-8 left-4 right-4 sm:left-6 sm:right-6 lg:left-1/3 lg:-translate-x-1/2 lg:w-full lg:max-w-4xl z-20"
      >
        <div className="grid grid-cols-3 gap-px bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/15 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-black/50 px-3 py-4 sm:px-5 sm:py-5 md:p-6 lg:p-8 flex flex-col justify-center relative group hover:bg-black/70 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors pointer-events-none" />
              <h4 className="font-display text-xl sm:text-2xl lg:text-4xl text-white mb-0.5 lg:mb-2 relative z-10 leading-none">{stat.value}</h4>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-gold uppercase tracking-wider font-semibold mb-0.5 relative z-10 leading-tight">{stat.label}</p>
              <p className="hidden sm:block text-[9px] lg:text-xs text-white/40 relative z-10 leading-tight">{stat.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Slide Navigation Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-20">
        {slides.map((_: HeroSlide, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 rounded-full border border-white/20 ${i === current ? "h-12 w-2 bg-gold border-gold relative shadow-[0_0_10px_rgba(234,179,8,0.8)]" : "h-2 w-2 bg-white/20 hover:bg-white/50"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
