// components/guestbook/GuestbookForm.tsx — Client component
'use client'

import { useEffect, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface GuestbookFormProps {
  onSuccess: () => void
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const { user } = useAuth()
  const [authorName, setAuthorName] = useState('')
  const [message, setMessage] = useState('')
  const [entryType, setEntryType] = useState<'message' | 'question'>('message')
  const [questionCategory, setQuestionCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (user) {
      setAuthorName(user.dharmaName || user.fullName || user.username || user.email || '')
    }
  }, [user])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const finalAuthorName = user
      ? (user.dharmaName || user.fullName || user.username || user.email || '').trim()
      : authorName.trim()

    if (!finalAuthorName) {
      setError('Vui lòng nhập tên của bạn.')
      return
    }
    if (!message.trim() || message.trim().length < 5) {
      setError('Lưu bút cần ít nhất 5 ký tự.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/guestbook/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorName: finalAuthorName,
            message: message.trim(),
            entryType,
            questionCategory: entryType === 'question' ? (questionCategory || 'Dharma') : undefined
          }),
        })

        if (res.status === 429) {
          setError('Bạn gửi lưu bút quá nhanh. Vui lòng thử lại sau.')
          return
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError((data as { error?: string }).error ?? 'Lỗi khi gửi. Vui lòng thử lại.')
          return
        }

        setSuccess(true)
        if (!user) {
          setAuthorName('')
        }
        setMessage('')
        setTimeout(() => {
          setSuccess(false)
          onSuccess()
        }, 3000)
      } catch {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
      }
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-gold/30 bg-gold/10 px-6 py-5 text-center"
      >
        <p className="ant-title mb-1 text-lg text-gold">Cảm ơn bạn!</p>
        <p className="text-sm text-muted-foreground">
          Lưu bút của bạn đã được ghi lại và hiển thị ngay trên trang.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="mb-6 flex w-fit gap-2 rounded-lg border border-border/50 bg-secondary/50 p-1">
        <button
          type="button"
          onClick={() => setEntryType('message')}
          className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${entryType === 'message' ? 'bg-card text-gold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Lưu Bút
        </button>
        <button
          type="button"
          onClick={() => setEntryType('question')}
          className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${entryType === 'question' ? 'bg-card text-gold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Đặt Câu Hỏi
        </button>
      </div>

      {user ? (
        <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
          <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-gold/70">Tài khoản gửi lưu bút</p>
          <p className="text-sm font-medium text-foreground">
            {user.dharmaName || user.fullName || user.username || user.email}
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="gb-name">
            Tên của bạn *
          </label>
          <input
            id="gb-name"
            type="text"
            placeholder="Tên hoặc pháp danh"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={100}
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm transition-colors focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
            disabled={isPending}
          />
        </div>
      )}

      {entryType === 'question' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
          <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="gb-cat">
            Chủ đề câu hỏi
          </label>
          <select
            id="gb-cat"
            value={questionCategory}
            onChange={(e) => setQuestionCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm transition-colors focus:border-gold/50 focus:outline-none"
          >
            <option value="">-- Chọn chủ đề --</option>
            <option value="Tu học">Tu học</option>
            <option value="Sức khoẻ">Sức khoẻ</option>
            <option value="Gia đình">Gia đình</option>
            <option value="Sự nghiệp">Sự nghiệp</option>
            <option value="Cảm ngộ">Cảm ngộ</option>
            <option value="Khác">Khác</option>
          </select>
        </motion.div>
      )}

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="gb-message">
          {entryType === 'question' ? 'Nội dung câu hỏi *' : 'Lưu bút *'}
        </label>
        <textarea
          id="gb-message"
          placeholder="Ký gửi tâm tư, cảm nhận, lời chúc, hoặc bất cứ điều gì bạn muốn chia sẻ..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full resize-none rounded-md border border-border bg-background px-4 py-2.5 text-sm transition-colors focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground/60 mt-1 text-right">{message.length}/2000</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? 'Đang gửi...' : entryType === 'question' ? 'Gửi câu hỏi' : 'Gửi lưu bút'}
      </button>
    </motion.form>
  )
}
