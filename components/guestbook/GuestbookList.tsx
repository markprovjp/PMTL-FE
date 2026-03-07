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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)' }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-card border border-border/50 p-6 hover:border-gold/20 transition-all duration-300"
    >
      {/* Author row */}
      <div className="flex items-start gap-4 mb-4">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-gold text-xs font-bold select-none border border-gold/30"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={entry.authorName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{initials}</span>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-foreground leading-none">{entry.authorName}</p>
            {entry.entryType === 'question' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold uppercase tracking-tight border border-amber-500/30">
                Câu Hỏi
              </span>
            )}
            {entry.questionCategory && (
              <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-medium border border-gold/30">
                {entry.questionCategory}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70">
            {entry.country && <span className="font-medium">{entry.country}</span>}
            {entry.country && ' · '}
            <time dateTime={entry.createdAt}>{timeDisplay(entry.createdAt)}</time>
          </p>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap mb-4 font-[500]">
        {entry.message}
      </p>

      {/* Admin reply — nếu isOfficialReply thì viền vàng và badge */}
      {entry.adminReply && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl transition-all duration-300 ${entry.isOfficialReply
            ? 'bg-gradient-to-r from-gold/10 to-yellow-500/5 border border-gold/30 p-4 pl-4'
            : 'bg-secondary/30 border border-border p-4 pl-4'
            }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className={`w-4 h-4 shrink-0 ${entry.isOfficialReply ? 'text-gold' : 'text-gold/50'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${entry.isOfficialReply ? 'text-gold' : 'text-muted-foreground'}`}>
              {entry.badge || (entry.isOfficialReply ? 'Ban Quản Trị' : 'Trả lời')}
            </span>
          </div>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${entry.isOfficialReply ? 'text-foreground/80 font-[500]' : 'text-muted-foreground'}`}>
            {entry.adminReply}
          </p>
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gold/5 to-yellow-500/5 border border-gold/20"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg text-foreground">Ghi lưu bút của bạn</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      Đóng
                    </motion.button>
                  </div>
                  <GuestbookForm onSuccess={handleFormSuccess} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(212, 175, 55, 0.15)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-xl border border-gold/60 bg-gradient-to-r from-gold/15 to-yellow-500/10 text-gold text-sm font-semibold hover:border-gold/80 transition-all duration-200 shadow-sm"
              >
                Ghi lưu bút
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Total count */}
      {total > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground mb-8 font-medium"
        >
          {total.toLocaleString('vi-VN')} lưu bút đã được ghi lại
        </motion.p>
      )}

      {/* Entries */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Loader2Icon className="w-8 h-8 text-gold" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-4">Đang tải...</p>
        </motion.div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 rounded-2xl bg-secondary/20 border border-border/50"
        >
          <p className="text-muted-foreground text-sm">
            Chưa có lưu bút nào{year ? ` trong tháng ${month}/${year}` : ''}. Hãy là người đầu tiên ghi lại hành trình của bạn.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.documentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <EntryCard entry={entry} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Trước
          </button>
          <span className="text-sm font-medium text-muted-foreground px-4 py-2">
            <span className="text-foreground font-semibold">{page}</span> / <span className="text-foreground font-semibold">{pageCount}</span>
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= pageCount || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Tiếp
          </button>
        </motion.div>
      )}
    </div>
  )
}
