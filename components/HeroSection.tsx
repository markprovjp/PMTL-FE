'use client'

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "@/components/icons/ZenIcons";
import type { HeroSlide, StatItem } from "@/types/strapi";

interface HeroSectionProps {
  slides: HeroSlide[];
  stats: StatItem[];
}

export default function HeroSection({ slides, stats }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-background text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt="Pháp Môn Tâm Linh"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,12,7,0.34)_0%,rgba(19,12,7,0.68)_48%,rgba(19,12,7,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,208,56,0.22),transparent_30%)]" />
          <div className="absolute inset-y-0 left-0 w-[58%] bg-[linear-gradient(90deg,rgba(16,11,7,0.88)_0%,rgba(16,11,7,0.55)_55%,rgba(16,11,7,0)_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative container mx-auto px-6 pb-10 pt-28 md:pb-16 md:pt-36 lg:pt-40">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/88">
              心灵法门 · Pháp Môn Tâm Linh
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="mt-8 space-y-6"
            >
              <h1 className="max-w-5xl font-display text-[clamp(3rem,10vw,6.6rem)] leading-[0.92] tracking-[-0.04em] text-white">
                <span className="block">{slide.title}</span>
                <span className="mt-2 block text-gold">{slide.highlight}</span>
              </h1>
              <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />
              <p className="max-w-5xl font-body text-base leading-relaxed text-white/74 md:text-xl">
                {slide.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col gap-4 md:mt-10 md:flex-row md:items-center">
            <Link
              href="/search"
              className="group flex w-full max-w-xl items-center gap-3 rounded-full border border-white/12 bg-black/30 px-4 py-3 backdrop-blur-md transition-colors hover:border-gold/35 hover:bg-black/36"
            >
              <SearchIcon className="h-5 w-5 text-gold" />
              <span className="flex-1 text-left text-sm text-white/68 md:text-base">
                Tìm kinh văn, khai thị, pháp bảo hoặc chủ đề tu học
              </span>
              <span className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black transition-transform group-hover:scale-[1.02]">
                Tra cứu
              </span>
            </Link>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/beginner-guide" className="rounded-full border border-white/15 px-5 py-3 text-white/90 transition-colors hover:border-gold/35 hover:text-gold">
                Hướng dẫn sơ học
              </Link>
              <Link href="/library" className="rounded-full border border-transparent px-1 py-3 text-white/68 transition-colors hover:text-white">
                Thư viện pháp bảo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3 lg:mt-16 lg:max-w-5xl">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 + index * 0.08 }}
              className="rounded-[1.75rem] border border-white/10 bg-black/38 p-5 backdrop-blur-md"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold/78">{stat.label}</p>
              <p className="mt-3 font-display text-4xl leading-none text-white md:text-5xl">{stat.value}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/52">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:flex lg:flex-col lg:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={[
              "pointer-events-auto rounded-full border transition-all duration-300",
              index === current
                ? "h-11 w-2 border-gold bg-gold shadow-[0_0_14px_rgba(234,179,8,0.45)]"
                : "h-2.5 w-2.5 border-white/20 bg-white/25 hover:bg-white/45",
            ].join(" ")}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
