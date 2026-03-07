'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { BookIcon, CompassIcon, UsersIcon, ArrowRightIcon } from "@/components/icons/ZenIcons";
import type { ActionCardItem } from "@/types/strapi";

/* ══════════════════════════════════════════════════════════════
   ACTION CARDS - Quick Navigation
   Senior-friendly with large touch targets and clear text
══════════════════════════════════════════════════════════════ */

// Map iconType string to actual icon component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookIcon,
  compass: CompassIcon,
  users: UsersIcon,
}

interface ActionCardsProps {
  cards: ActionCardItem[]
}

const ActionCards = ({ cards }: ActionCardsProps) => {
  return (
    <section className="section-padding-sm bg-zen-surface">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={card.link} className="block h-full">
                <div className="card-zen h-full p-8 group">
                  {/* Icon container */}
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    {(() => { 
                      const Icon = iconMap[card.iconType] ?? BookIcon; 
                      return <Icon className="w-7 h-7 text-gold" />; 
                    })()}
                  </div>
                  
                  <h3 className="font-display text-xl lg:text-2xl text-foreground mb-4 group-hover:text-gold transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-base text-gold font-medium group-hover:text-gold-glow transition-colors">
                    Kham pha 
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

export default ActionCards;
