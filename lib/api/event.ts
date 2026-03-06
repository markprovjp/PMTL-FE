import { strapiFetch } from '@/lib/strapi';
import type { StrapiEvent, StrapiList } from '@/types/strapi';

/**
 * Fetch events from Strapi
 */
export async function fetchEvents() {
  return strapiFetch<StrapiList<StrapiEvent>>('/events', {
    status: 'published',
    sort: ['date:desc', 'publishedAt:desc'],
    populate: ['coverImage'],
    pagination: { pageSize: 100 },
    next: { tags: ['events'], revalidate: 3600 }
  });
}
