// ─────────────────────────────────────────────────────────────
//  lib/api/chanting.ts  —  Types + server-side helpers for Niệm Kinh
//  Chỉ dùng trong Server Components / Route Handlers (có strapiFetch)
// ─────────────────────────────────────────────────────────────
import { STRAPI_URL } from '@/lib/strapi';

// ── Types ─────────────────────────────────────────────────────

export type EventType = 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal';
export type ChantKind = 'step' | 'sutra' | 'mantra';

export interface TimeRules {
  notAfter?: string;       // 'HH:mm' — không niệm sau giờ này
  avoidRange?: [string, string]; // ['HH:mm','HH:mm']
}

export interface TodayEvent {
  id: number;
  documentId: string;
  title: string;
  eventType: EventType;
  relatedBlogs: { id: number; title: string; slug: string }[];
}

export interface TodayChantItem {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  kind: ChantKind;
  order: number;
  target: number | null;       // target cuối sau merge
  min: number | null;
  max: number | null;
  presets: number[];
  timeRules: TimeRules | null;
  openingPrayer: string | null;  // Lời cầu nguyện mở đầu trước khi niệm
  isOptional: boolean;
  source: 'base' | 'enableOverride';
  capsApplied: boolean;
  capMax: number | null;
}

export interface TodayChantResponse {
  date: string;
  lunarInfo: { month: number; day: number } | null;
  todayEvents: TodayEvent[];
  planSlug: string;
  items: TodayChantItem[];
}

export interface ItemProgress {
  count: number;
  done: boolean;
}

export type ProgressMap = Record<string, ItemProgress>;

export interface PracticeLog {
  id: number;
  documentId: string;
  date: string;
  planSlug: string;
  itemsProgress: ProgressMap | null;
  completedAt: string | null;
}

// ── Server-side fetchers ──────────────────────────────────────

/**
 * Gọi Strapi aggregator endpoint /chant-plans/today-chant
 * Chỉ dùng trong Server Components hoặc Route Handlers
 */
export async function fetchTodayChant(params: {
  date: string;
  lunarMonth?: number | null;
  lunarDay?: number | null;
  planSlug?: string | null;
}): Promise<TodayChantResponse | null> {
  const { date, lunarMonth, lunarDay, planSlug } = params;
  try {
    const qs = new URLSearchParams({ date });
    if (planSlug) qs.set('planSlug', planSlug);
    if (lunarMonth) qs.set('lunarMonth', String(lunarMonth));
    if (lunarDay) qs.set('lunarDay', String(lunarDay));

    const url = `${STRAPI_URL}/api/chant-plans/today-chant?${qs}`;
    const token = process.env.STRAPI_API_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 60 }, // cache 1 phút
    });
    if (!res.ok) {
      console.error('[fetchTodayChant] Strapi error', res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[fetchTodayChant] Error:', err);
    return null;
  }
}

/**
 * Lấy practice log từ Strapi với JWT user token (dùng trong Server Action hoặc route handler)
 */
export async function fetchPracticeLog(params: {
  date: string;
  planSlug?: string | null;
  jwt: string;
}): Promise<PracticeLog | null> {
  const { date, planSlug, jwt } = params;
  try {
    const qs = new URLSearchParams({ date });
    if (planSlug) qs.set('planSlug', planSlug);
    const res = await fetch(`${STRAPI_URL}/api/practice-logs/my?${qs}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Upsert practice log (dùng trong client thông qua Next route handler)
 */
export async function upsertPracticeLog(params: {
  date: string;
  planSlug?: string | null;
  itemsProgress: ProgressMap;
  jwt: string;
}): Promise<PracticeLog | null> {
  const { date, planSlug, itemsProgress, jwt } = params;
  try {
    const res = await fetch(`${STRAPI_URL}/api/practice-logs/my`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ date, planSlug, itemsProgress }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
