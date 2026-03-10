'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, BookIcon, CompassIcon, UsersIcon } from "@/components/icons/ZenIcons";
import type { ActionCardItem } from "@/types/strapi";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookIcon,
  compass: CompassIcon,
  users: UsersIcon,
};

interface ActionCardsProps {
  cards: ActionCardItem[];
}

export default function ActionCards({ cards }: ActionCardsProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="mb-10 max-w-3xl space-y-4 md:mb-12">
          <p className="text-gold text-xs font-medium uppercase tracking-[0.28em]">Lộ Trình Tu Học</p>
          <h2 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            Ba hướng đi rõ ràng, để người mới nhìn vào là biết nên bắt đầu từ đâu.
          </h2>
          <p className="font-body text-base leading-relaxed text-muted-foreground">
            Mỗi khối dẫn tới một nhịp sử dụng khác nhau: học nền tảng, theo dõi lịch trình niệm, hoặc đi vào cộng đồng.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {cards.map((card, index) => {
            const Icon = iconMap[card.iconType] ?? BookIcon;
            const isPrimary = index === 0;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={isPrimary ? "lg:col-span-7" : "lg:col-span-5"}
              >
                <Link
                  href={card.link}
                  className={[
                    "group block h-full overflow-hidden rounded-xl border border-border bg-card p-7 shadow-ant transition-all duration-200",
                    "hover:border-gold/30 hover:shadow-elevated",
                    isPrimary ? "lg:min-h-[23rem]" : "lg:min-h-[18rem]",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-12 items-center justify-center rounded-md border border-border bg-muted text-gold">
                          <Icon className="h-7 w-7" />
                        </div>
                        <span className="ant-label text-gold/70">
                          Lối vào 0{index + 1}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <h3 className={isPrimary ? "ant-title text-4xl leading-tight text-foreground" : "ant-title text-3xl leading-tight text-foreground"}>
                          {card.title}
                        </h3>
                        <p className="max-w-xl font-body text-base leading-relaxed text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
                      <span className="text-sm text-muted-foreground">
                        {isPrimary ? "Dành cho người cần một điểm bắt đầu rõ ràng." : "Mở sang một nhóm nội dung chuyên biệt hơn."}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-gold">
                        Khám phá
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
