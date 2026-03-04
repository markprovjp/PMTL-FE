'use server'

import { getPosts, GetPostsOptions, getAllTags, getCategories } from '@/lib/api/blog'
import { revalidatePath, unstable_cache } from 'next/cache'

export async function searchPostsAndCategories(options: GetPostsOptions) {
  // Enforce zero cache for search queries (user-facing dynamic search)
  const res = await getPosts({ ...options, revalidate: 0 })
  return {
    data: res.data ?? [],
    meta: res.meta,
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
