import { strapiFetch } from "@/lib/strapi";
import type { StrapiList } from "@/types/strapi";

export interface BlogPostPreview {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  thumbnail?: { url: string };
}

export interface LunarEvent {
  id: number;
  documentId: string;
  title: string;
  isRecurringLunar: boolean;
  lunarMonth: number | null;
  lunarDay: number | null;
  solarDate: string | null;
  eventType: 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal';
  reciteCount: number;
  relatedBlogs?: BlogPostPreview[]; // Khai thị blog liên quan
}

export async function fetchLunarEvents(): Promise<LunarEvent[]> {
  try {
    // Deep populate: chỉ định rõ fields bên trong relatedBlogs
    // Dùng object syntax thay vì array để Strapi trả về title + slug (không chỉ ID)
    const res = await strapiFetch<StrapiList<LunarEvent>>('/lunar-events', {
      pagination: { page: 1, pageSize: 100 },
      populate: {
        relatedBlogs: {
          fields: ['id', 'title', 'slug'],
        }
      },
      next: { revalidate: 0 }
    });

    return res.data ?? [];
  } catch (err) {
    console.error("[LunarAPI] Error:", err);
    return [];
  }
}
