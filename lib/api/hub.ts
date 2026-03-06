// ─────────────────────────────────────────────────────────────
//  lib/api/hub.ts — Hub page API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { StrapiList, HubPage } from '@/types/strapi'

const POPULATE_HUB = {
  // Section links + thumbnail
  sections: {
    populate: {
      links: {
        populate: {
          thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
        },
      },
    },
  },
  // Cover image của hub page
  coverImage: { fields: ['url', 'formats', 'alternativeText'] },
  // Bài Editor chọn tay
  curated_posts: {
    fields: ['id', 'documentId', 'title', 'slug', 'publishedAt'],
    populate: {
      thumbnail: { fields: ['url', 'formats', 'alternativeText'] },
    },
  },
  // Tài liệu tải xuống gắn vào hub
  downloads: {
    fields: [
      'id', 'documentId', 'title', 'description', 'url', 'fileType',
      'category', 'groupYear', 'groupLabel', 'notes', 'isUpdating',
      'isNew', 'sortOrder', 'fileSizeMB',
    ],
  },
  // Dynamic blocks
  blocks: {
    on: {
      'blocks.post-list-auto': {
        populate: {
          category: { fields: ['id', 'documentId', 'name', 'slug'] }
        }
      },
      'blocks.post-list-manual': {
        populate: {
          posts: {
            fields: ['id', 'documentId', 'title', 'slug', 'publishedAt'],
            populate: { thumbnail: { fields: ['url', 'formats'] } }
          }
        }
      },
      'blocks.download-grid': {
        populate: {
          downloads: {
            fields: ['id', 'documentId', 'title', 'url', 'fileType', 'isNew', 'isUpdating']
          }
        }
      },
      'blocks.rich-text': true
    }
  }

}

/** Lấy một hub-page theo slug. Populate đầy đủ: sections, curated_posts, downloads */
export async function getHubBySlug(slug: string): Promise<HubPage | null> {
  const res = await strapiFetch<StrapiList<HubPage>>('/hub-pages', {
    filters: { slug: { $eq: slug } },
    populate: POPULATE_HUB,
    pagination: { page: 1, pageSize: 1 },
    next: { revalidate: 3600, tags: ['hub-pages'] },
  })
  return res.data[0] ?? null
}

/** Lấy toàn bộ hub-pages (dùng cho menu/sitemap). Không populate nặng. */
export async function getHubPages(): Promise<HubPage[]> {
  const res = await strapiFetch<StrapiList<HubPage>>('/hub-pages', {
    fields: ['id', 'documentId', 'title', 'slug', 'sortOrder', 'showInMenu', 'menuIcon'],
    filters: { showInMenu: { $eq: true } },
    sort: ['sortOrder:asc', 'title:asc'],
    pagination: { page: 1, pageSize: 50 },
    next: { revalidate: 3600, tags: ['hub-pages'] },
  })
  return res.data
}
