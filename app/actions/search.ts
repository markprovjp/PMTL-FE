'use server'

import { getPosts, GetPostsOptions, getAllTags, getCategories } from '@/lib/api/blog'
import { revalidatePath } from 'next/cache'

// In-memory cache for tags/categories (they rarely change)
// This reduces database hits when multiple users browse search page
let cachedTags: any = null
let cachedCategories: any = null
let lastTagsRefresh = 0
let lastCategoriesRefresh = 0
const CACHE_TTL = 3600000 // 1 hour in milliseconds

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
    console.log('[Search Action] Using cached categories')
    return cachedCategories
  }
  
  console.log('[Search Action] Fetching fresh categories from Strapi')
  const cats = await getCategories()
  
  // Update cache
  cachedCategories = cats
  lastCategoriesRefresh = now
  
  return cats
}

export async function fetchAllTags() {
  const now = Date.now()
  
  // Return cached if still valid
  if (cachedTags && (now - lastTagsRefresh) < CACHE_TTL) {
    console.log('[Search Action] Using cached tags')
    return cachedTags
  }
  
  console.log('[Search Action] Fetching fresh tags from Strapi')
  const tags = await getAllTags()
  
  // Update cache
  cachedTags = tags
  lastTagsRefresh = now
  
  return tags
}

export async function incrementViewAction(documentId: string, slug?: string) {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337'
    const res = await fetch(`${strapiUrl}/api/blog-posts/${documentId}/view`, {
      method: 'POST',
      cache: 'no-store',
    })
    console.log(`[Action] View increment for ${documentId} returned status ${res.status}`)

    // If successful and slug provided, trigger a background revalidation
    if (res.ok && slug) {
      revalidatePath(`/blog/${slug}`)
      revalidatePath('/blog')
    }

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
