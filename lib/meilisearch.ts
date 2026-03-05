// ─────────────────────────────────────────────────────────────
// lib/meilisearch.ts — Meilisearch Client Setup
// Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────

import { MeiliSearch } from 'meilisearch'

/**
 * Initialize Meilisearch client
 * Only available on server-side
 */
export function getMeilisearchClient() {
  const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700'
  const apiKey = process.env.MEILISEARCH_MASTER_KEY || 'super-secret-key-12345'

  return new MeiliSearch({
    host,
    apiKey,
  })
}

/**
 * Search blog posts via Meilisearch
 * @param query Search keyword
 * @param options Pagination + filters
 */
export async function searchBlogPostsViaMeilisearch(
  query: string,
  options: {
    page?: number
    pageSize?: number
    categorySlug?: string
    tagSlugs?: string[]
    dateFrom?: string
    dateTo?: string
  } = {}
) {
  const { page = 1, pageSize = 10, categorySlug, tagSlugs, dateFrom, dateTo } = options

  try {
    const client = getMeilisearchClient()
    const index = client.index('blog-post')

    // Build filter array
    const filters: string[] = []

    if (categorySlug) {
      filters.push(`categories.slug = "${categorySlug}"`)
    }

    if (tagSlugs && tagSlugs.length > 0) {
      const tagFilters = tagSlugs.map(slug => `tags.slug = "${slug}"`).join(' OR ')
      filters.push(`(${tagFilters})`)
    }

    if (dateFrom) {
      filters.push(`publishedAt >= "${dateFrom}"`)
    }

    if (dateTo) {
      filters.push(`publishedAt <= "${dateTo}"`)
    }

    // Combine filters with AND
    const filterString = filters.length > 0 ? filters.join(' AND ') : undefined

    // Execute search
    const result = await index.search(query, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      filter: filterString ? [filterString] : undefined,
      sort: ['publishedAt:desc'],
    })

    return {
      data: result.hits,
      meta: {
        pagination: {
          page,
          pageSize,
          total: result.estimatedTotalHits || 0,
          pageCount: Math.ceil((result.estimatedTotalHits || 0) / pageSize),
        },
      },
    }
  } catch (error) {
    console.error('[Meilisearch] Search failed:', error)
    throw error
  }
}

/**
 * Fetch all blog posts (for initial load or fallback)
 * Use Meilisearch instead of Strapi for better performance
 */
export async function getAllBlogPostsViaMeilisearch(options: {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlugs?: string[]
  dateFrom?: string
  dateTo?: string
} = {}) {
  // When query is empty, return all posts
  return searchBlogPostsViaMeilisearch('', options)
}
