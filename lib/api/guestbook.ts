// ─────────────────────────────────────────────────────────────
//  lib/api/guestbook.ts — Guestbook API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { GuestbookList } from '@/types/strapi'

export async function getGuestbookEntries(page = 1, pageSize = 20): Promise<GuestbookList> {
  return strapiFetch<GuestbookList>('/guestbook-entries/list', {
    noCache: true,
  })
}

export async function getGuestbookArchive(
  year: number,
  month: number,
  page = 1,
  pageSize = 20
): Promise<GuestbookList> {
  return strapiFetch<GuestbookList>(
    `/guestbook-entries/archive/${year}/${month}?page=${page}&pageSize=${pageSize}`,
    { noCache: true }
  )
}
