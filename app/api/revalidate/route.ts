// ─────────────────────────────────────────────────────────────
//  app/api/revalidate/route.ts
//
//  On-Demand Revalidation endpoint for Strapi v5 Webhooks.
//
//  HOW IT WORKS:
//  1. Admin publishes/updates/deletes content in Strapi
//  2. Strapi fires a webhook POST to this endpoint
//  3. This handler calls revalidateTag() → Next.js clears the
//     specific cache entries instantly (no 5-minute wait)
//
//  SETUP IN STRAPI ADMIN:
//  Settings → Webhooks → Add new webhook
//    URL:     http://your-fe-domain.com/api/revalidate
//    Headers: Authorization: Bearer <REVALIDATE_SECRET>
//    Events:  entry.publish, entry.update, entry.unpublish, entry.delete
//
//  .env.local:
//    REVALIDATE_SECRET=any-long-random-string-you-choose
// ─────────────────────────────────────────────────────────────

import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/** Strapi v5 webhook payload shape */
interface StrapiWebhookPayload {
  event: 'entry.create' | 'entry.update' | 'entry.publish' | 'entry.unpublish' | 'entry.delete' | string
  createdAt: string
  model: string
  uid: string
  entry?: {
    id?: number
    documentId?: string
    slug?: string
    [key: string]: unknown
  }
}

/**
 * Map a Strapi model name to the cache tags that should be invalidated.
 * These tags must match exactly what is set on strapiFetch() next.tags calls.
 */
function getTagsForModel(model: string, entry?: StrapiWebhookPayload['entry']): string[] {
  const tags: string[] = []

  switch (model) {
    case 'blog-post': {
      tags.push('blog-posts', 'blog-posts-slugs', 'blog-posts-related')
      if (entry?.slug) {
        tags.push(`blog-post-${entry.slug}`, `blog-post-seo-${entry.slug}`)
      }
      if (entry?.documentId) {
        tags.push(`blog-post-${entry.documentId}`)
      }
      break
    }
    case 'category': {
      tags.push('categories')
      break
    }
    case 'blog-tag': {
      tags.push('blog-tags')
      break
    }
    case 'hub-page': {
      tags.push('hub-pages')
      break
    }
    case 'download-item': {
      tags.push('download-items')
      break
    }
    case 'guestbook-entry': {
      // Guestbook dung noCache nen khong can revalidate tag
      break
    }
    case 'setting': {
      tags.push('homepage-settings')
      break
    }
    case 'sidebar-config': {
      tags.push('sidebar-config')
      break
    }
    default: {
      // Unknown model — bo qua
    }
  }

  return tags
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Security: Validate the secret token ─────────────────
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Server misconfiguration: missing secret' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  if (token !== secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ── 2. Parse the Strapi webhook payload ────────────────────
  let payload: StrapiWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  const { event, model, entry } = payload

  // Xác định các cache tags cần xóa
  const tagsToInvalidate = getTagsForModel(model, entry)

  if (tagsToInvalidate.length === 0) {
    return NextResponse.json({
      revalidated: false,
      message: `No cache tags registered for model: ${model}`,
    })
  }

  // ── 4. Invalidate each tag ─────────────────────────────────
  for (const tag of tagsToInvalidate) {
    revalidateTag(tag)
  }

  return NextResponse.json({
    revalidated: true,
    model,
    event,
    tags: tagsToInvalidate,
    timestamp: new Date().toISOString(),
  })
}

// ── Health check ──────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation endpoint is active. Use POST with Strapi webhook.',
    docsUrl: 'https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation',
  })
}
