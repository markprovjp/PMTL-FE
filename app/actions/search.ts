'use server'

import { getPosts, GetPostsOptions, getAllTags, getCategories } from '@/lib/api/blog'
import { searchBlogPostsViaMeilisearch } from '@/lib/meilisearch'
import { revalidatePath, unstable_cache } from 'next/cache'

/**
 * Search posts via Meilisearch (faster, typo-tolerant)
 * Falls back to Strapi if Meilisearch unavailable
 */
export async function searchPostsAndCategories(options: GetPostsOptions) {
  try {
    // Try Meilisearch first (fast, typo-tolerant)
    const res = await searchBlogPostsViaMeilisearch(options.search || '', {
      page: options.page,
      pageSize: options.pageSize,
      categorySlug: options.categorySlug,
      tagSlugs: options.tagSlugs,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
    })

    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  } catch (error) {
    console.warn('[Search] Meilisearch failed, falling back to Strapi:', error)

    // Fallback to Strapi database search if Meilisearch is down
    const res = await getPosts({ ...options, revalidate: 0 })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  }
}

export const fetchAllCategories = unstable_cache(
  async () => {
    return await getCategories()
  },
  ['all-categories'],
  { revalidate: 3600, tags: ['categories'] }
)

export const fetchAllTags = unstable_cache(
  async () => {
    return await getAllTags()
  },
  ['all-tags'],
  { revalidate: 3600, tags: ['tags'] }
)

export async function incrementViewAction(documentId: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337'
    const token = process.env.STRAPI_API_TOKEN

    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${strapiUrl}/api/blog-posts/${documentId}/view`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    })
    return { success: res.ok, status: res.status }
  } catch (err) {
    console.error('[Action] Failed to increment view:', err)
    return { success: false, error: String(err) }
  }
}

export async function revalidateBlogPath(slug: string) {
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/blog')
}
