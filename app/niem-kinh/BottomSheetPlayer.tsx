'use client';
// ─────────────────────────────────────────────────────────────
//  app/niem-kinh/BottomSheetPlayer.tsx  —  Mobile Bottom Sheet
//
//  Slides up from bottom when item selected.
//  Features:
//   - Big tap-anywhere counter zone
//   - +1, -1, Reset buttons
//   - Preset chips
//   - Checklist for kind=step
//   - Cap max warning
//   - Time rule warning
//   - Drag-to-dismiss handle
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { TodayChantItem, ItemProgress } from '@/lib/api/chanting';
import { AlertTriangle, CheckCircle2, Circle, X, BookOpen, Check } from 'lucide-react';

function isTimeRuleViolated(timeRules: TodayChantItem['timeRules']): { violated: boolean; message: string } {
  if (!timeRules) return { violated: false, message: '' };
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (timeRules.notAfter && hhmm >= timeRules.notAfter) {
    return { violated: true, message: `Nên niệm trước ${timeRules.notAfter}` };
  }
  if (timeRules.avoidRange) {
    const [from, to] = timeRules.avoidRange;
    if (hhmm >= from && hhmm <= to) {
      return { violated: true, message: `Nên tránh niệm ${from}–${to}` };
    }
  }
  return { violated: false, message: '' };
}

interface Props {
  item: TodayChantItem | null;
  progress: ItemProgress | undefined;
  onClose: () => void;
  onIncrement: (by: number) => void;
  onDecrement: () => void;
  onReset: () => void;
  onToggleStep: () => void;
  defaultPresets: number[];
}

export default function BottomSheetPlayer({
  item, progress, onClose, onIncrement, onDecrement, onReset, onToggleStep, defaultPresets,
}: Props) {
  const isOpen = item !== null;
  const count = progress?.count ?? 0;
  const sheetRef = useRef<HTMLDivElement>(null);

  // ── Drag to dismiss ───────────────────────────────────────
  const dragStartY = useRef<number>(0);
  const isDragging = useRef(false);
  const [translateY, setTranslateY] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    setTranslateY(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setTranslateY(delta);
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    if (translateY > 120) {
      onClose();
      setTranslateY(0);
    } else {
      setTranslateY(0);
    }
  };

  // ── Close on Escape ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Lock body scroll when open (Mobile Only) ───────────────
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!item) return null;

  const presets = item.presets?.length ? item.presets : defaultPresets;
  const { violated, message: timeMessage } = isTimeRuleViolated(item.timeRules);
  const effectiveCap = item.capMax ?? item.max ?? item.target ?? null;
  const atCap = effectiveCap != null && count >= effectiveCap;
  const done = progress?.done ?? (item.kind !== 'step' && item.target != null && count >= item.target);

  // ── Progress indicator ────────────────────────────────────
  const pct = (() => {
    if (item.kind === 'step') return done ? 100 : 0;
    const total = item.target ?? item.max ?? 0;
    return total ? Math.min(100, Math.round((count / total) * 100)) : 0;
  })();

  const handleTapIncrement = () => {
    if (atCap) {
      toast.error(`Đã đạt giới hạn: ${item.capMax} biến`, { duration: 2000 });
      if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
      return;
    }
    onIncrement(1);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-border bg-card shadow-2xl transition-transform"
        style={{
          transform: isOpen ? `translateY(${translateY}px)` : 'translateY(100%)',
          transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="h-1 w-10 rounded-sm bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold leading-tight truncate">{item.title}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {item.target && item.kind !== 'step' && (
                <span className="text-xs text-muted-foreground">Mục tiêu: {item.target} biến</span>
              )}
              {item.capMax != null && (
                <span className="text-xs text-orange-400">Tối đa: {item.capMax}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-5 h-1.5 overflow-hidden rounded-md bg-muted">
          <div
            className={`h-full rounded-md transition-all duration-300 ${done ? 'bg-green-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Time rule warning */}
        {violated && (
          <div className="mx-5 mt-3 flex items-center gap-2 text-sm text-orange-400 bg-orange-400/10 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {timeMessage}
          </div>
        )}

        {/* Lời cầu nguyện mở đầu */}
        {item.openingPrayer && (
          <div className="mx-5 mt-3 flex gap-2 rounded-lg border border-amber-200/50 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-700/80 italic dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300/80">
            <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{item.openingPrayer}</span>
          </div>
        )}

        <div className="px-5 pb-6 pt-3 space-y-4">
          {/* ── Step kind: checklist ────────────────── */}
          {item.kind === 'step' ? (
            <button
              onClick={onToggleStep}
              className={`w-full rounded-xl py-6 text-xl font-semibold transition-all active:scale-95 ${done
                ? 'bg-green-500/20 text-green-500 border-2 border-green-500/30'
                : 'bg-muted hover:bg-accent text-foreground border-2 border-border'
                }`}
            >
              {done ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  Đã hoàn thành
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Circle className="w-6 h-6" />
                  Nhấn để đánh dấu xong
                </span>
              )}
            </button>
          ) : (
            <>
              {/* Big tap counter zone */}
              <button
                onClick={handleTapIncrement}
                disabled={atCap}
                className={`flex w-full select-none items-center justify-center rounded-xl transition-all active:scale-[0.97]
                  ${done
                    ? 'bg-green-500/10 border-2 border-green-500/30 cursor-not-allowed'
                    : atCap
                      ? 'bg-orange-400/10 border-2 border-orange-400/20 cursor-not-allowed'
                      : 'bg-amber-400/10 border-2 border-amber-400/30 hover:bg-amber-400/15 cursor-pointer'
                  }`}
                style={{ height: 160 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={`font-bold tabular-nums select-none ${count >= 100 ? 'text-7xl' : 'text-8xl'
                      } ${done ? 'text-green-500' : atCap ? 'text-orange-400' : 'text-amber-500'}`}
                  >
                    {count}
                  </span>
                  {done && (
                    <span className="text-xs text-green-500/70 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đủ mục tiêu
                    </span>
                  )}
                </div>
              </button>

              {/* Hint */}
              <p className="text-center text-xs text-muted-foreground -mt-1">
                Chạm vào số để +1
              </p>

              {/* +/- / Reset row */}
              <div className="flex gap-2">
                <button
                  onClick={onDecrement}
                  className="h-14 w-14 rounded-md border bg-muted text-2xl font-bold transition-colors hover:bg-accent flex-shrink-0 active:scale-95"
                >
                  −
                </button>
                <button
                  onClick={onReset}
                  className="h-14 flex-1 rounded-md border bg-muted text-sm text-muted-foreground transition-colors hover:bg-destructive/10 active:scale-95"
                >
                  Reset
                </button>
                <button
                  onClick={() => onIncrement(1)}
                  disabled={atCap}
                  className="h-14 w-14 rounded-md bg-amber-500 text-2xl font-bold text-white transition-colors hover:bg-amber-400 disabled:opacity-40 flex-shrink-0 active:scale-95"
                >
                  +
                </button>
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => onIncrement(p)}
                    disabled={atCap}
                    className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:border-amber-400/40 hover:bg-amber-400/10 disabled:opacity-40 active:scale-95"
                  >
                    +{p}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
