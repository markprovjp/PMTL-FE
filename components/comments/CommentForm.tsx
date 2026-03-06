'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  postSlug: string
  parentDocumentId?: string
  parentAuthorName?: string
  onSuccess: () => void
  onCancel?: () => void
  compact?: boolean
}

export default function CommentForm({
  postSlug,
  parentDocumentId,
  parentAuthorName,
  onSuccess,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!authorName.trim()) {
      setError('Vui lòng nhập tên của bạn.')
      return
    }
    if (!content.trim() || content.trim().length < 5) {
      setError('Bình luận phải có ít nhất 5 ký tự.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/blog-comments/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postSlug,
            content: content.trim(),
            authorName: authorName.trim(),
            parentDocumentId: parentDocumentId ?? undefined,
          }),
        })

        if (res.status === 429) {
          setError('Bạn gửi bình luận quá nhanh. Vui lòng thử lại sau một phút.')
          return
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError((data as { error?: string }).error ?? 'Lỗi khi gửi bình luận. Vui lòng thử lại.')
          return
        }

        setSuccess(true)
        setAuthorName('')
        setContent('')
        setTimeout(() => {
          setSuccess(false)
          onSuccess()
        }, 2000)
      } catch {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
      }
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gold/10 border border-gold/30 px-5 py-4 text-sm text-gold font-medium"
      >
        Cảm ơn bạn! Bình luận đang chờ duyệt và sẽ hiển thị sau khi được xét duyệt.
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={cn('space-y-3', compact && 'space-y-2')}
    >
      {parentAuthorName && (
        <p className="text-xs text-muted-foreground">
          Trả lời <span className="text-gold font-medium">{parentAuthorName}</span>
        </p>
      )}

      <div className={cn('grid gap-3', 'grid-cols-1')}>
        <input
          type="text"
          placeholder="Tên của bạn *"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={100}
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          disabled={isPending}
        />
      </div>

      <textarea
        placeholder="Chia sẻ suy nghĩ của bạn..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        rows={compact ? 3 : 4}
        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
        disabled={isPending}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Đang gửi...' : parentDocumentId ? 'Gửi trả lời' : 'Gửi bình luận'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Huỷ
          </button>
        )}
      </div>
    </motion.form>
  )
}
