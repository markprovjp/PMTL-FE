// Khong import strapiFetch vi endpoint /with-blogs dung Document Service direct
// strapiFetch chi dung cho REST API thong thuong

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

  relatedBlogs?: BlogPostPreview[]; // Khai thi blog lien quan
}

/**
 * Lay danh sach lunar-events tu endpoint /with-blogs (Document Service)
 * Endpoint nay populate relatedBlogs day du, tranh gioi han permission cua REST API public
 */
export async function fetchLunarEvents(): Promise<LunarEvent[]> {
  try {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337';
    const token = process.env.STRAPI_API_TOKEN;

    // Goi endpoint custom /with-blogs — dung Document Service ben BE, co relatedBlogs
    const res = await fetch(`${STRAPI_URL}/api/lunar-events/with-blogs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error('[LunarAPI] HTTP error:', res.status, await res.text());
      return [];
    }

    const json = await res.json();
    console.log('[LunarAPI] Raw Strapi response:', JSON.stringify(json, null, 2));
    return (json.data as LunarEvent[]) ?? [];
  } catch (err) {
    console.error('[LunarAPI] Error:', err);
    return [];
  }
}
