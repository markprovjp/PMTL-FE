// ─────────────────────────────────────────────────────────────
//  lib/strapi.ts — Base Strapi fetcher
//
//  SECURITY RULES:
//  ✅ STRAPI_API_TOKEN    — server-side only (NO NEXT_PUBLIC_ prefix)
//  ✅ NEXT_PUBLIC_STRAPI_API_URL — safe to expose (URL only, no secrets)
//  ✅ All server fetches use Authorization: Bearer <token>
//  ✅ Client fetches only access published public endpoints
// ─────────────────────────────────────────────────────────────

import qs from 'qs'
import { isStrapiError } from '@/types/strapi'

export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL ?? 'http://localhost:1337'

// Server-side token — NEVER exposed to browser
function getServerToken(): string | undefined {
  if (typeof window !== 'undefined') return undefined // safety: no client leakage
  return process.env.STRAPI_API_TOKEN
}

export interface FetchOptions {
  /** Strapi populate param — default: '*' */
  populate?: string | string[] | Record<string, unknown>
  /** Strapi fields param — only fetch specific fields (performance optimization) */
  fields?: string[]
  /** Strapi filters */
  filters?: Record<string, unknown>
  /** Strapi sort e.g. ['createdAt:desc'] */
  sort?: string | string[]
  /** Pagination */
  pagination?: { page?: number; pageSize?: number }
  /** Draft & publish status */
  status?: 'published' | 'draft'
  /** Next.js fetch config for ISR */
  next?: NextFetchRequestConfig
  /** Force no-cache (for dynamic / real-time data) */
  noCache?: boolean
}

/**
 * Build full Strapi API URL with query params
 */
export function buildStrapiUrl(path: string, options: Omit<FetchOptions, 'next' | 'noCache'> = {}): string {
  const { populate, fields, filters, sort, pagination, status } = options
  const query = qs.stringify(
    { populate, fields, filters, sort, pagination, status },
    { encodeValuesOnly: true, skipNulls: true }
  )
  return `${STRAPI_URL}/api${path}${query ? `?${query}` : ''}`
}

/**
 * Server-side fetch with API token auth + ISR support.
 * ⚠️  Only call from Server Components, Server Actions, or Route Handlers.
 *     Never call from 'use client' files.
 *
 * Next.js automatically deduplicates identical fetch() calls within the
 * same render cycle — no manual cache needed.
 * Use On-Demand Revalidation via /api/revalidate for instant cache clearing.
 */
export async function strapiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { next, noCache, ...queryOptions } = options
  const url = buildStrapiUrl(path, queryOptions)


  const token = getServerToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const isDraft = queryOptions.status === 'draft'
  const cacheStrategy = (noCache || isDraft) ? 'no-store' : 'force-cache'

  try {
    const res = await fetch(url, {
      headers,
      // Default revalidate: 3600s (1h)
      next: cacheStrategy === 'no-store' ? undefined : { revalidate: next?.revalidate ?? 3600, tags: next?.tags },
      cache: cacheStrategy,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const errMsg = err?.error?.message ?? res.statusText
      console.error(`[Strapi ${res.status}] ${path}: ${errMsg}`)
      throw new StrapiAPIError(res.status, errMsg, path)
    }

    const json = await res.json()


    if (isStrapiError(json)) {
      const errMsg = json.error?.message ?? 'Unknown error'
      console.error(`[Strapi ${json.error?.status}] ${path}: ${errMsg}`)
      throw new StrapiAPIError(json.error.status, errMsg, path)
    }

    // Normalize non-standard Strapi response: {results, pagination} → {data, meta}
    if (json && typeof json === 'object' && Array.isArray(json.results) && !Array.isArray(json.data)) {
      return {
        data: json.results,
        meta: { pagination: json.pagination ?? {} },
      } as T
    }

    return json as T
  } catch (error) {
    if (error instanceof StrapiAPIError) throw error
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Strapi FATAL] ${path}: ${msg}`)
    throw new StrapiAPIError(500, msg, path)
  }
}

/**
 * Build a public asset URL from a Strapi media url field.
 * Handles both relative (/uploads/...) and absolute URLs.
 */
export function getStrapiMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

/** Legacy alias — kept for backward compat */
export const strapiImageUrl = (path: string | null | undefined) =>
  getStrapiMediaUrl(path) ?? '/images/logoo.png'

/** Custom error class for Strapi API errors */
export class StrapiAPIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path: string
  ) {
    super(`[Strapi ${status}] ${path}: ${message}`)
    this.name = 'StrapiAPIError'
  }
}

/**
 * @deprecated Use strapiFetch() instead.
 * Kept for backward compatibility only.
 */
export async function strapiGet<T = unknown>(
  path: string,
  query?: Record<string, unknown>
): Promise<{ data: T; meta?: unknown }> {
  return strapiFetch<{ data: T; meta?: unknown }>(path, {
    ...(query ?? {}),
    noCache: true,
  })
}
