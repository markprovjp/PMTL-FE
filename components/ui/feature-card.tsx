import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = Omit<React.ComponentProps<typeof Card>, "title"> & {
  icon?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "hero" | "muted";
};

const toneStyles: Record<NonNullable<FeatureCardProps["tone"]>, string> = {
  default:
    "border-gold/15 bg-card/90 shadow-[0_18px_40px_-28px_rgba(212,175,55,0.45)] hover:-translate-y-1 hover:border-gold/35",
  hero:
    "border-white/12 bg-black/40 text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl hover:border-gold/30",
  muted:
    "border-border/70 bg-gradient-to-br from-card via-card to-secondary/40 hover:border-gold/25",
};

function FeatureCard({
  className,
  icon,
  eyebrow,
  title,
  description,
  footer,
  tone = "default",
  children,
  ...props
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border transition-all duration-300",
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_35%)] before:opacity-80",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      <CardHeader className="relative space-y-4 p-6">
        {(icon || eyebrow) && (
          <div className="flex items-center justify-between gap-4">
            {icon ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                {icon}
              </div>
            ) : (
              <span />
            )}
            {eyebrow}
          </div>
        )}
        <div className="space-y-2">
          <CardTitle className="font-display text-2xl leading-tight">{title}</CardTitle>
          {description ? (
            <CardDescription className={cn(tone === "hero" ? "text-white/72" : "text-muted-foreground")}>
              {description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      {(children || footer) && (
        <CardContent className="relative space-y-5 p-6 pt-0">
          {children}
          {footer}
        </CardContent>
      )}
    </Card>
  );
}

export { FeatureCard };
