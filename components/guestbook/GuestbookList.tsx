// components/guestbook/GuestbookList.tsx — Client component
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Loader2Icon, ShieldCheckIcon } from 'lucide-react'
import type { GuestbookEntry, GuestbookList as GuestbookListType } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi'
import GuestbookForm from './GuestbookForm'

interface GuestbookListProps {
  initialData: GuestbookListType
  year?: number
  month?: number
}

function timeDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function EntryCard({ entry }: { entry: GuestbookEntry }) {
  const avatarUrl = entry.avatar
    ? getStrapiMediaUrl(entry.avatar.formats?.thumbnail?.url ?? entry.avatar.url)
    : null

  const initials = entry.authorName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-card border border-border p-5 hover:shadow-sm transition-shadow"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gold/10 flex items-center justify-center text-gold text-sm font-semibold select-none">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={entry.authorName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground leading-snug">{entry.authorName}</p>
          <p className="text-xs text-muted-foreground/70">
            {entry.country && <span>{entry.country} · </span>}
            <time dateTime={entry.createdAt}>{timeDisplay(entry.createdAt)}</time>
          </p>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {entry.message}
      </p>

      {/* Admin reply */}
      {entry.adminReply && (
        <div className="mt-4 pl-4 border-l-2 border-gold/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-semibold text-gold">Chính thức</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {entry.adminReply}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function GuestbookList({ initialData, year, month }: GuestbookListProps) {
  const [data, setData] = useState<GuestbookListType>(initialData)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const buildUrl = useCallback(
    (p: number) => {
      if (year && month) {
        return `/api/guestbook/archive/${year}/${month}?page=${p}&pageSize=20`
      }
      return `/api/guestbook/list?page=${p}&pageSize=20`
    },
    [year, month]
  )

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true)
      try {
        const res = await fetch(buildUrl(p))
        if (res.ok) {
          const json: GuestbookListType = await res.json()
          setData(json)
          setPage(p)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } catch {
        // giữ nguyên dữ liệu cũ
      } finally {
        setLoading(false)
      }
    },
    [buildUrl]
  )

  const handleFormSuccess = useCallback(() => {
    setShowForm(false)
    fetchPage(1)
  }, [fetchPage])

  const { data: entries, meta } = data
  const { pageCount, total } = meta.pagination

  return (
    <div>
      {/* Write button */}
      {!year && (
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg text-foreground">Ghi lưu bút</h3>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Huỷ
                    </button>
                  </div>
                  <GuestbookForm onSuccess={handleFormSuccess} />
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 rounded-xl border border-gold/40 bg-gold/5 text-gold text-sm font-medium hover:bg-gold/10 transition-colors"
              >
                Ghi lưu bút
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Total count */}
      {total > 0 && (
        <p className="text-sm text-muted-foreground mb-6">
          {total.toLocaleString('vi-VN')} lưu bút
        </p>
      )}

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Chưa có lưu bút nào{year ? ` trong tháng ${month}/${year}` : ''}. Hãy là người đầu tiên.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {entries.map((entry) => (
              <EntryCard key={entry.documentId} entry={entry} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:border-gold/40 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {pageCount}
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= pageCount || loading}
            className="px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:border-gold/40 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  )
}
