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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-lg border border-border border-l-2 border-l-gold bg-card p-6 transition-all duration-300 before:absolute before:left-0 before:top-0 before:h-8 before:w-8 before:font-serif before:text-3xl before:leading-none before:text-gold/20 before:content-['✦'] hover:border-gold/30 md:p-8"
    >
      {/* Author row */}
      <div className="flex items-start gap-4 mb-5">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gold/40 bg-gradient-to-br from-gold/20 to-gold/5 text-[10px] font-bold text-gold select-none"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={entry.authorName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{initials}</span>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="ant-title mb-2 text-lg leading-tight text-foreground">{entry.authorName}</p>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {entry.entryType === 'question' && (
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-amber-600">
                Câu Hỏi
              </span>
            )}
            {entry.questionCategory && (
              <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
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

      {/* Message — journal page style */}
      <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6 font-[400]">
        {entry.message}
      </p>

      {/* Admin reply — nếu isOfficialReply thì viền vàng và badge */}
      {entry.adminReply && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-lg transition-all duration-300 ${entry.isOfficialReply
            ? 'border border-gold/30 bg-gold/5 p-4 pl-4'
            : 'border border-border bg-secondary/30 p-4 pl-4'
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
                className="rounded-lg border border-gold/20 bg-gold/5 p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="ant-title text-lg text-foreground">Ghi lưu bút của bạn</h3>
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
                className="rounded-md border border-gold/50 bg-gold/10 px-6 py-3 text-sm font-semibold text-gold transition-all duration-200 shadow-ant hover:border-gold/80"
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
          className="rounded-lg border border-border/50 bg-secondary/20 py-20 text-center"
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
