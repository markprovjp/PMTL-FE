// ─────────────────────────────────────────────────────────────
//  lib/api/hub.ts — Hub page API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { StrapiList, HubPage } from '@/types/strapi'

const POPULATE_HUB = {
  sections: {
    populate: {
      links: {
        populate: {
          thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
        },
      },
    },
  },
}

export async function getHubBySlug(slug: string): Promise<HubPage | null> {
  const res = await strapiFetch<StrapiList<HubPage>>('/hub-pages', {
    filters: { slug: { $eq: slug } },
    populate: POPULATE_HUB,
    pagination: { page: 1, pageSize: 1 },
    next: { revalidate: 3600, tags: ['hub-pages'] },
  })
  return res.data[0] ?? null
}
