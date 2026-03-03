'use server'

import { getPosts, GetPostsOptions, getAllTags, getCategories } from '@/lib/api/blog'
import { revalidatePath } from 'next/cache'
import type { Category, BlogTag } from '@/types/strapi'

// In-memory cache for tags/categories (they rarely change)
let cachedTags: BlogTag[] | null = null
let cachedCategories: Category[] | null = null
let lastTagsRefresh = 0
let lastCategoriesRefresh = 0
const CACHE_TTL = 3600000 // 1 hour

export async function searchPostsAndCategories(options: GetPostsOptions) {
  // Enforce zero cache for search queries (user-facing dynamic search)
  const res = await getPosts({ ...options, revalidate: 0 })
  return {
    data: res.data ?? [],
    meta: res.meta,
  }
}

export async function fetchAllCategories() {
  const now = Date.now()

  // Return cached if still valid
  if (cachedCategories && (now - lastCategoriesRefresh) < CACHE_TTL) {
    return cachedCategories
  }
  const cats = await getCategories()
  cachedCategories = cats
  lastCategoriesRefresh = now
  return cats
}

export async function fetchAllTags() {
  const now = Date.now()

  // Return cached if still valid
  if (cachedTags && (now - lastTagsRefresh) < CACHE_TTL) {
    return cachedTags
  }
  const tags = await getAllTags()
  cachedTags = tags
  lastTagsRefresh = now
  return tags
}

export async function incrementViewAction(documentId: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337'
    const res = await fetch(`${strapiUrl}/api/blog-posts/${documentId}/view`, {
      method: 'POST',
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
