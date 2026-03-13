import 'server-only'

import { cache } from 'react'
import { MeiliSearch } from 'meilisearch'
import { z } from 'zod'

const meilisearchEnvSchema = z.object({
  host: z.string().url(),
  apiKey: z.string().min(1),
  indexName: z.string().min(1).default('blog-post'),
})

const parseMeilisearchConfig = () =>
  meilisearchEnvSchema.safeParse({
    host: process.env.MEILISEARCH_HOST ?? process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
    apiKey:
      process.env.MEILISEARCH_SEARCH_KEY ??
      process.env.MEILISEARCH_API_KEY ??
      process.env.MEILISEARCH_MASTER_KEY ??
      process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ??
      process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY,
    indexName: process.env.MEILISEARCH_BLOG_POST_INDEX ?? 'blog-post',
  })

export const isMeilisearchConfigured = cache(() => parseMeilisearchConfig().success)

const getMeilisearchConfig = cache(() => {
  const parsed = parseMeilisearchConfig()

  if (!parsed.success) {
    return null
  }

  return parsed.data
})

/**
 * Initialize Meilisearch client
 * Only available on server-side
 */
export const getMeilisearchClient = cache(() => {
  const config = getMeilisearchConfig()

  if (!config) {
    return null
  }

  const { host, apiKey } = config
  return new MeiliSearch({
    host,
    apiKey,
  })
})

/**
 * Search blog posts via Meilisearch
 * Returns hits with _formatted field for keyword highlighting
 */
export async function searchBlogPostsViaMeilisearch(
  query: string,
  options: {
    page?: number
    pageSize?: number
    sort?: 'relevance' | 'newest' | 'oldest' | 'most-viewed'
    categorySlug?: string
    tagSlugs?: string[]
    dateFrom?: string
    dateTo?: string
  } = {}
) {
  const { page = 1, pageSize = 10, sort = 'relevance', categorySlug, tagSlugs, dateFrom, dateTo } = options

  try {
    const config = getMeilisearchConfig()
    const client = getMeilisearchClient()

    if (!config || !client) {
      throw new Error('Meilisearch is not configured')
    }

    const { indexName } = config
    const index = client.index(indexName)

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

    const filterString = filters.length > 0 ? filters.join(' AND ') : undefined

    const sortOptions =
      sort === 'newest'
        ? ['publishedAt:desc']
        : sort === 'oldest'
          ? ['publishedAt:asc']
          : sort === 'most-viewed'
            ? ['views:desc', 'publishedAt:desc']
            : query
              ? undefined
              : ['publishedAt:desc']

    const result = await index.search(query, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      filter: filterString ?? undefined,
      sort: sortOptions,
      // Highlight matching keywords in title, excerpt, content, and source metadata
      attributesToHighlight: ['title', 'excerpt', 'content', 'sourceName', 'sourceTitle'],
      highlightPreTag: '<mark class="bg-gold/20 text-gold rounded px-0.5">',
      highlightPostTag: '</mark>',
      // Only return the fields we need (performance)
      attributesToRetrieve: [
        'id', 'documentId', 'title', 'slug', 'excerpt', 'content',
        'thumbnail', 'categories', 'tags', 'views', 'likes',
        'publishedAt', 'createdAt', 'featured',
        'sourceName', 'sourceTitle', 'sourceUrl',
      ],
      // Return a snippet of the content around the match
      attributesToCrop: ['content', 'excerpt', 'sourceTitle'],
      cropLength: 200,
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
 */
export async function getAllBlogPostsViaMeilisearch(options: {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlugs?: string[]
  dateFrom?: string
  dateTo?: string
} = {}) {
  return searchBlogPostsViaMeilisearch('', options)
}

