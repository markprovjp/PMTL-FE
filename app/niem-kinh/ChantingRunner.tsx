'use client';
// ─────────────────────────────────────────────────────────────
//  app/niem-kinh/ChantingRunner.tsx  —  Client Component
//
//  Mobile:  List cards + Bottom Sheet player
//  Desktop: 2-column (list left, counter panel right)
//
//  Storage strategy:
//   - Guest (no token)  : localStorage only
//   - Logged in + online: backend API only (practice-log)
//   - Logged in + offline: in-memory, sync when back online
//
//  Features:
//   - Tap counter zone → +1, haptic vibrate
//   - Preset chips, +/-, Reset + Undo snackbar
//   - Time rule warnings (non-blocking icon)
//   - Cap max block + error toast
//   - Keyboard: Space=+1, Backspace=-1, R=reset, 1-6=preset, Esc=close
//   - step kind → checklist
// ─────────────────────────────────────────────────────────────
import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { TodayChantResponse, TodayChantItem, ProgressMap, ItemProgress } from '@/lib/api/chanting';
import { ChantingGuidelinesDialog } from '@/components/ChantingGuidelinesDialog';
import BottomSheetPlayer from './BottomSheetPlayer';
import {
  CheckCircle2, Circle, Clock, AlertTriangle, BookOpen,
  Flame, Music2, ChevronRight, Wifi, WifiOff, LogIn, ArrowRight,
  ChevronLeft, Check, Info, Star, X
} from 'lucide-react';
import { PAGINATION } from '@/lib/config/pagination';
import { CHANTING_ADMIN_COPY } from '@/lib/config/chanting';
import { motion, AnimatePresence } from 'framer-motion';

// ── Guest localStorage helpers ────────────────────────────────
// Chỉ dùng khi chưa đăng nhập (no token)
const LS_KEY = (date: string, slug: string) => `chant_progress_${date}_${slug}`;

function loadLocalProgress(date: string, planSlug: string): ProgressMap {
  try {
    const raw = localStorage.getItem(LS_KEY(date, planSlug));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocalProgress(date: string, planSlug: string, p: ProgressMap) {
  try {
    localStorage.setItem(LS_KEY(date, planSlug), JSON.stringify(p));
  } catch { }
}

function clearLocalProgress(date: string, planSlug: string) {
  try { localStorage.removeItem(LS_KEY(date, planSlug)); } catch { }
}

function isTimeRuleViolated(timeRules: TodayChantItem['timeRules'], offset = 0): { violated: boolean; message: string } {
  if (!timeRules) return { violated: false, message: '' };
  const now = new Date(Date.now() + offset);
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

function kindIcon(kind: TodayChantItem['kind']) {
  if (kind === 'step') return <Flame className="w-4 h-4" />;
  if (kind === 'sutra') return <BookOpen className="w-4 h-4" />;
  return <Music2 className="w-4 h-4" />;
}

function progressLabel(item: TodayChantItem, prog: ItemProgress | undefined): string {
  if (item.kind === 'step') return prog?.done ? 'Xong' : 'Chưa';
  const count = prog?.count ?? 0;
  if (item.target) return `${count}/${item.target}`;
  if (item.max) return `${count}/${item.max}`;
  return String(count);
}

function progressPercent(item: TodayChantItem, prog: ItemProgress | undefined): number {
  if (item.kind === 'step') return prog?.done ? 100 : 0;
  const count = prog?.count ?? 0;
  const total = item.target ?? item.max ?? 0;
  if (!total) return 0;
  return Math.min(100, Math.round((count / total) * 100));
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  todayChant: TodayChantResponse;
  isoDate: string;
  serverNow: string; // ISO string from server
}

const DEFAULT_PRESETS: number[] = []; // Presets lấy từ BE (recommendedPresets), không dùng hardcode

export default function ChantingRunner({ todayChant, isoDate, serverNow }: Props) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'offline'>('saved');
  const [isOnline, setIsOnline] = useState(true);
  const [showInstruction, setShowInstruction] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, planSlug, todayEvents } = todayChant;

  const allBlogs = todayEvents.flatMap((ev) =>
    (ev.relatedBlogs ?? []).map((blog) => ({ ...blog, eventTitle: ev.title }))
  );
  const uniqueBlogs = Array.from(
    new Map(allBlogs.map((b) => [b.slug, b])).values()
  );

  const [blogPage, setBlogPage] = useState(1);
  const limit = PAGINATION.RELATED_BLOGS_LIMIT;
  const totalBlogPages = Math.ceil(uniqueBlogs.length / limit);
  const paginatedBlogs = uniqueBlogs.slice((blogPage - 1) * limit, blogPage * limit);

  // ── Instruction Persistence ──────────────────────────────
  useEffect(() => {
    const hidden = localStorage.getItem('hide_chanting_instruction');
    if (!hidden) setShowInstruction(true);

    // Calculate server time offset
    const serverDate = new Date(serverNow);
    const localDate = new Date();
    setServerTimeOffset(serverDate.getTime() - localDate.getTime());
  }, [serverNow]);

  const hideInstruction = () => {
    setShowInstruction(false);
    localStorage.setItem('hide_chanting_instruction', 'true');
  };

  // ── Init: backend-first if logged in, otherwise localStorage ──
  useEffect(() => {
    if (user) {
      // Đã đăng nhập: fetch từ backend (cookie được gửi tự động same-origin)
      setSaveStatus('saving');
      fetch(`/api/practice-log?date=${isoDate}&planSlug=${planSlug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.itemsProgress) {
            setProgress(data.itemsProgress);
          }
          setSaveStatus('saved');
        })
        .catch(() => {
          setSaveStatus('offline');
        });
    } else {
      // Khách: load từ localStorage
      const local = loadLocalProgress(isoDate, planSlug);
      setProgress(local);
      setSaveStatus('saved');
    }
  }, [isoDate, planSlug, user]);

  // ── Online/offline detection ───────────────────────────────
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      if (user) syncToBackend(progress);
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []); // eslint-disable-line

  // ── Autosave ──────────────────────────────────────────────
  const syncToBackend = useCallback(
    async (prog: ProgressMap) => {
      if (!user) return;
      setSaveStatus('saving');
      try {
        const res = await fetch('/api/practice-log', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: isoDate, planSlug, itemsProgress: prog }),
        });
        setSaveStatus(res.ok ? 'saved' : 'unsaved');
      } catch {
        setSaveStatus('offline');
      }
    },
    [user, isoDate, planSlug]
  );

  const scheduleAutosave = useCallback(
    (prog: ProgressMap) => {
      if (user) {
        // Đã đăng nhập: debounce sync lên backend
        setSaveStatus('unsaved');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          if (navigator.onLine) {
            syncToBackend(prog);
          } else {
            setSaveStatus('offline');
          }
        }, 1500);
      } else {
        // Khách: lưu localStorage ngay lập tức
        saveLocalProgress(isoDate, planSlug, prog);
        setSaveStatus('saved');
      }
    },
    [isoDate, planSlug, user, syncToBackend]
  );

  // ── Progress mutators ────────────────────────────────────
  const getItem = useCallback(
    (slug: string) => items.find((it) => it.slug === slug),
    [items]
  );

  const increment = useCallback(
    (slug: string, by = 1) => {
      const item = getItem(slug);
      if (!item) return;
      const current = progress[slug]?.count ?? 0;

      // Giới hạn cano: target > capMax > max (theo ưu tiên)
      const hardCap = item.capMax ?? item.max ?? null;
      // Nếu đã đủ target và không có hardcap cao hơn, chặn lại
      const effectiveCap = hardCap ?? item.target ?? Infinity;

      if (current >= effectiveCap) {
        toast.error(
          hardCap != null
            ? `Đã đạt giới hạn hôm nay: ${hardCap} biến`
            : `Đã niệm đủ mục tiêu: ${item.target} biến`,
          { duration: 2000 }
        );
        if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
        return;
      }

      const next = Math.min(current + by, effectiveCap === Infinity ? current + by : effectiveCap);
      const justDone = item.target != null && current < item.target && next >= item.target;
      const done = item.target ? next >= item.target : false;
      const newProg = { ...progress, [slug]: { count: next, done } };
      setProgress(newProg);
      scheduleAutosave(newProg);
      if (navigator.vibrate) navigator.vibrate(justDone ? [30, 20, 50] : 10);

      // Auto-advance: khi vừa hoàn thành mục tiêu, tự động chuyển sang bài kế tiếp
      if (justDone) {
        const currentIndex = items.findIndex((it) => it.slug === slug);
        const nextItem = items.slice(currentIndex + 1).find(
          (it) => !newProg[it.slug]?.done && it.kind !== 'step'
        ) ?? items.slice(currentIndex + 1).find((it) => !newProg[it.slug]?.done);

        toast.success(`Hoàn thành ${item.title}!`, {
          description: nextItem
            ? `Tiếp theo: ${nextItem.title}`
            : `Đã xong tất cả bài hôm nay!`,
          duration: 3000,
          action: nextItem ? {
            label: 'Niệm tiếp',
            onClick: () => setSelectedSlug(nextItem.slug),
          } : undefined,
        });

        // Tự động chuyển sau 1s
        if (nextItem) {
          setTimeout(() => setSelectedSlug(nextItem.slug), 1200);
        }
      }
    },
    [progress, getItem, scheduleAutosave, items]
  );

  const decrement = useCallback(
    (slug: string) => {
      const current = progress[slug]?.count ?? 0;
      if (current <= 0) return;
      const next = current - 1;
      const item = getItem(slug);
      const done = item?.target ? next >= item.target : false;
      const newProg = { ...progress, [slug]: { count: next, done } };
      setProgress(newProg);
      scheduleAutosave(newProg);
    },
    [progress, getItem, scheduleAutosave]
  );

  const resetItem = useCallback(
    (slug: string) => {
      const prev = progress[slug];
      const newProg = { ...progress, [slug]: { count: 0, done: false } };
      setProgress(newProg);
      scheduleAutosave(newProg);
      toast(`Đã reset "${getItem(slug)?.title}"`, {
        action: {
          label: 'Hoàn tác',
          onClick: () => {
            const restored = { ...progress, [slug]: prev ?? { count: 0, done: false } };
            setProgress(restored);
            scheduleAutosave(restored);
          },
        },
        duration: 4000,
      });
    },
    [progress, getItem, scheduleAutosave]
  );

  const toggleStep = useCallback(
    (slug: string) => {
      const current = progress[slug]?.done ?? false;
      const newProg = { ...progress, [slug]: { count: current ? 0 : 1, done: !current } };
      setProgress(newProg);
      scheduleAutosave(newProg);
      if (navigator.vibrate) navigator.vibrate(current ? [5] : [15, 5, 15]);
    },
    [progress, scheduleAutosave]
  );

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    if (!selectedSlug) return;
    const item = getItem(selectedSlug);
    const presets = item?.presets?.length ? item.presets : DEFAULT_PRESETS;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') { e.preventDefault(); increment(selectedSlug); }
      else if (e.code === 'Backspace') { e.preventDefault(); decrement(selectedSlug); }
      else if (e.code === 'KeyR') { e.preventDefault(); resetItem(selectedSlug); }
      else if (/^Digit([1-6])$/.test(e.code)) {
        const idx = parseInt(e.code.replace('Digit', '')) - 1;
        if (presets[idx] != null) increment(selectedSlug, presets[idx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedSlug, increment, decrement, resetItem, getItem]);

  const selectedItem = selectedSlug ? getItem(selectedSlug) ?? null : null;

  // ── No items ──────────────────────────────────────────────
  if (!items.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-4xl mb-4">*</p>
        <p className="font-semibold mb-1">Chưa có bài niệm kinh</p>
        <p className="text-sm">
          Entry này chưa có <span className="font-semibold">{CHANTING_ADMIN_COPY.itemComponent}</span>.
          Hãy tạo bài trong <span className="font-semibold">Niệm Kinh · Danh Mục Bài Niệm</span>, rồi quay lại{' '}
          <span className="font-semibold">{CHANTING_ADMIN_COPY.collectionName}</span> để gắn vào `planItems`.
        </p>
      </div>
    );
  }



  // ── Instruction Banner ──────────────────────────────────
  const InstructionBanner = () => (
    <AnimatePresence>
      {showInstruction && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-br from-amber-50/80 to-transparent p-4 dark:from-amber-500/5 dark:to-transparent">
            <button
              onClick={hideInstruction}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-amber-500/10 text-amber-500/50 hover:text-amber-500 transition-colors z-10"
              title="Đóng hướng dẫn"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3 pr-6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                <Info className="h-4 w-4 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest flex items-center gap-2">
                  Bài Tập Cơ Bản <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                </h3>
                <p className="text-sm leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                  Dành cho người mới: Ba bài kinh (<strong>Chú Đại Bi, Tâm Kinh, Lễ Phật</strong>) là bài tập cơ bản <span className="underline decoration-amber-500/30 underline-offset-2">phải niệm</span>.
                </p>
                <p className="text-[11px] font-medium text-amber-700/60 dark:text-amber-400/60 italic">
                  * Thông thường bắt đầu với <strong>Chú Đại Bi</strong>, các bài sau không cần thứ tự cụ thể.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Item card ─────────────────────────────────────────────
  const ItemCard = ({ item }: { item: TodayChantItem }) => {
    const prog = progress[item.slug];
    const pct = progressPercent(item, prog);
    const label = progressLabel(item, prog);
    const done = prog?.done || (item.kind !== 'step' && item.target != null && (prog?.count ?? 0) >= item.target);
    const { violated } = isTimeRuleViolated(item.timeRules, serverTimeOffset);
    const isSelected = selectedSlug === item.slug;

    return (
      <button
        onClick={() => setSelectedSlug(item.slug)}
        className={[
          'w-full text-left rounded-xl border transition-all duration-200 overflow-hidden',
          'hover:shadow-md active:scale-[0.99]',
          isSelected
            ? 'border-amber-400/70 bg-amber-500/5 shadow-sm shadow-amber-400/10'
            : done
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-border bg-card hover:border-amber-400/30',
        ].join(' ')}
      >
        {/* Progress bar — top edge accent */}
        {item.kind !== 'step' && pct > 0 && (
          <div className="h-0.5 w-full bg-muted">
            <div
              className={`h-full transition-all duration-300 ${done ? 'bg-green-500' : 'bg-amber-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`flex-shrink-0 ${done ? 'text-green-500' : 'text-muted-foreground'}`}>
                {done
                  ? <CheckCircle2 className="w-4 h-4" />
                  : kindIcon(item.kind)}
              </span>
              <div className="min-w-0">
                <span className={`block font-medium text-sm leading-tight truncate ${done ? 'text-muted-foreground line-through decoration-green-500/50' : 'text-foreground'
                  }`}>
                  {item.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {item.target && item.kind !== 'step' && (
                    <span className="text-xs text-muted-foreground/70">
                      Mục tiêu: {item.target} biến
                    </span>
                  )}
                  {item.timeRules?.notAfter && (
                    <span className="text-xs text-blue-400/80 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />truoc {item.timeRules.notAfter}
                    </span>
                  )}
                  {violated && (
                    <span className="text-xs text-orange-400 flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />Nên niệm sớm
                    </span>
                  )}
                  {item.isOptional && (
                    <span className="text-xs text-muted-foreground/50 italic">tuỳ chọn</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-sm font-semibold tabular-nums ${done ? 'text-green-500' : 'text-amber-500'
                }`}>
                {label}
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-amber-400' : 'text-muted-foreground/50'
                }`} />
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* ── Desktop: 2-column ────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left: list */}
        <div className="space-y-4">
          <InstructionBanner />

          {/* Related Blogs Block */}
          {uniqueBlogs.length > 0 && (
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Khai Thị Liên Kết</h3>
                </div>
                {totalBlogPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBlogPage(p => Math.max(1, p - 1))}
                      disabled={blogPage === 1}
                      className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Trang {blogPage}/{totalBlogPages}
                    </span>
                    <button
                      onClick={() => setBlogPage(p => Math.min(totalBlogPages, p + 1))}
                      disabled={blogPage === totalBlogPages}
                      className="p-1 rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={blogPage}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-2"
                  >
                    {paginatedBlogs.map((blog) => (
                      <a
                        key={blog.slug}
                        href={`/blog/${blog.slug}`}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-border/70 bg-card hover:border-amber-400/50 hover:bg-amber-500/5 transition-all group shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1 transition-colors">
                            {blog.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{blog.eventTitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                      </a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* List items label */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground font-semibold uppercase tracking-widest">
              Lịch Niệm Kinh Hôm Nay <span className="text-muted-foreground font-normal normal-case">({items.length} bài)</span>
            </span>
            <div className="flex items-center gap-3">
              <ChantingGuidelinesDialog />
            </div>
          </div>
          {items.map((item) => (
            <ItemCard key={item.slug} item={item} />
          ))}
        </div>

        {/* Right: counter panel */}
        <div className="sticky top-20 self-start">
          {selectedItem ? (
            <DesktopCounterPanel
              item={selectedItem}
              progress={progress[selectedItem.slug]}
              onIncrement={(by) => increment(selectedItem.slug, by)}
              onDecrement={() => decrement(selectedItem.slug)}
              onReset={() => resetItem(selectedItem.slug)}
              onToggleStep={() => toggleStep(selectedItem.slug)}
              defaultPresets={DEFAULT_PRESETS}
              serverTimeOffset={serverTimeOffset}
            />
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 flex items-center justify-center h-64 text-muted-foreground text-sm">
              ← Chọn một bài để bắt đầu
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <InstructionBanner />
        {uniqueBlogs.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Khai Thị Liên Kết</h3>
              </div>
              {totalBlogPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBlogPage(p => Math.max(1, p - 1))}
                    disabled={blogPage === 1}
                    className="p-1 rounded-md bg-muted/50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-muted-foreground">
                    {blogPage}/{totalBlogPages}
                  </span>
                  <button
                    onClick={() => setBlogPage(p => Math.min(totalBlogPages, p + 1))}
                    disabled={blogPage === totalBlogPages}
                    className="p-1 rounded-md bg-muted/50"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={blogPage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-2"
                >
                  {paginatedBlogs.map((blog) => (
                    <a
                      key={blog.slug}
                      href={`/blog/${blog.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/70 bg-card active:scale-[0.98] transition-all shadow-sm"
                    >
                      <BookOpen className="w-4 h-4 text-amber-500/70 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground line-clamp-1">{blog.title}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{blog.eventTitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/20 flex-shrink-0" />
                    </a>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-foreground font-semibold uppercase tracking-widest">
            Niệm Kinh <span className="text-muted-foreground font-normal normal-case">({items.length} bài)</span>
          </span>
          <div className="flex items-center gap-2">
            <ChantingGuidelinesDialog />
          </div>
        </div>
        <div className="space-y-2.5 pb-4">
          {items.map((item) => (
            <ItemCard key={item.slug} item={item} />
          ))}
        </div>
      </div>

      {/* ── Bottom Sheet (mobile only) ───────────────────── */}
      <BottomSheetPlayer
        item={selectedItem}
        progress={selectedItem ? progress[selectedItem.slug] : undefined}
        onClose={() => setSelectedSlug(null)}
        onIncrement={(by) => selectedSlug && increment(selectedSlug, by)}
        onDecrement={() => selectedSlug && decrement(selectedSlug)}
        onReset={() => selectedSlug && resetItem(selectedSlug)}
        onToggleStep={() => selectedSlug && toggleStep(selectedSlug)}
        defaultPresets={DEFAULT_PRESETS}
      />
    </>
  );
}

// ── Desktop counter panel ─────────────────────────────────────
interface CounterPanelProps {
  item: TodayChantItem;
  progress: ItemProgress | undefined;
  onIncrement: (by: number) => void;
  onDecrement: () => void;
  onReset: () => void;
  onToggleStep: () => void;
  defaultPresets: number[];
  serverTimeOffset: number;
}

function DesktopCounterPanel({
  item, progress, onIncrement, onDecrement, onReset, onToggleStep, defaultPresets, serverTimeOffset,
}: CounterPanelProps) {
  const count = progress?.count ?? 0;
  const done = progress?.done ?? false;
  const presets = item.presets?.length ? item.presets : defaultPresets;
  const { violated, message } = isTimeRuleViolated(item.timeRules, serverTimeOffset);
  const effectiveCap = item.capMax ?? item.max ?? item.target ?? null;
  const atCap = effectiveCap != null && count >= effectiveCap;
  const pct = item.target ? Math.min(100, Math.round((count / item.target) * 100)) : 0;

  if (item.kind === 'step') {
    return (
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        {item.openingPrayer && (
          <div className="text-xs text-amber-600/80 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl px-3 py-2.5 leading-relaxed italic flex gap-2">
            <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{item.openingPrayer}</span>
          </div>
        )}
        <button
          onClick={onToggleStep}
          className={`w-full py-4 rounded-xl text-lg font-semibold transition-all ${done
            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
            : 'bg-muted hover:bg-accent text-foreground border border-border'
            }`}
        >
          {done ? <><CheckCircle2 className="inline w-5 h-5 mr-2" />Đã hoàn thành</> : <><Circle className="inline w-5 h-5 mr-2" />Đánh dấu xong</>}
        </button>
        <KeyboardHints />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold leading-tight">{item.title}</h2>
        {item.target && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-amber-400'
                  }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-semibold tabular-nums ${done ? 'text-green-500' : 'text-amber-500'
              }`}>
              {count}/{item.target}
            </span>
          </div>
        )}
        {item.capMax && (
          <p className="text-xs text-orange-400 mt-0.5">Giới hạn hôm nay: {item.capMax}</p>
        )}
      </div>

      {/* Lời cầu nguyện mở đầu */}
      {item.openingPrayer && (
        <div className="text-xs text-amber-700/80 dark:text-amber-300/80 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-xl px-3 py-2.5 leading-relaxed italic flex gap-2">
          <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{item.openingPrayer}</span>
        </div>
      )}

      {violated && (
        <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-400/10 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          {message}
        </div>
      )}

      {/* Big counter */}
      <button
        onClick={() => onIncrement(1)}
        disabled={atCap}
        className={`w-full rounded-2xl border-2 flex flex-col items-center justify-center transition-all select-none gap-1
          ${done
            ? 'border-green-500/40 bg-green-500/5 cursor-not-allowed'
            : atCap
              ? 'border-orange-400/30 bg-orange-400/5 cursor-not-allowed'
              : 'border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 active:scale-95 cursor-pointer'
          }`}
        style={{ height: 150 }}
        title={done ? 'Đã hoàn thành mục tiêu' : atCap ? 'Đã đạt giới hạn' : 'Nhấn để +1 (phím Space)'}
      >
        <span className={`text-8xl font-bold tabular-nums leading-none ${done ? 'text-green-500' : atCap ? 'text-orange-400' : 'text-amber-500'
          }`}>
          {count}
        </span>
        {done && <span className="text-xs text-green-500/70 flex items-center gap-1">
          <Check className="w-3 h-3" /> Đã đủ mục tiêu
        </span>}
      </button>

      {/* +/- buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onDecrement()}
          className="flex-1 h-12 rounded-xl border bg-muted hover:bg-accent text-xl font-bold transition-colors"
        >
          −
        </button>
        <button
          onClick={onReset}
          className="px-4 h-12 rounded-xl border bg-muted hover:bg-destructive/10 text-sm text-muted-foreground transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => onIncrement(1)}
          disabled={atCap}
          className="flex-1 h-12 rounded-xl border bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white text-xl font-bold transition-colors"
        >
          +
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onIncrement(p)}
            disabled={atCap}
            className="px-3 py-1 rounded-full border text-sm hover:bg-accent disabled:opacity-40 transition-colors"
          >
            +{p}
          </button>
        ))}
      </div>

      <KeyboardHints />
    </div>
  );
}

function KeyboardHints() {
  return (
    <div className="text-xs text-muted-foreground/60 space-y-0.5">
      <p>Space +1 · Backspace −1 · R reset · 1-6 preset nhanh</p>
    </div>
  );
}
