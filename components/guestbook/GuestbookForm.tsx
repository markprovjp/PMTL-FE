// components/guestbook/GuestbookForm.tsx — Client component
'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GuestbookFormProps {
  onSuccess: () => void
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const [authorName, setAuthorName] = useState('')
  const [country, setCountry] = useState('')
  const [message, setMessage] = useState('')
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
            authorName: authorName.trim(),
            country: country.trim() || undefined,
            message: message.trim(),
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
        setAuthorName('')
        setCountry('')
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
        className="rounded-2xl bg-gold/10 border border-gold/30 px-6 py-5 text-center"
      >
        <p className="font-display text-lg text-gold mb-1">Cảm ơn bạn!</p>
        <p className="text-sm text-muted-foreground">
          Lưu bút của bạn đã được nhận và sẽ hiển thị sau khi được xét duyệt.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="gb-country">
            Quốc gia (tuỳ chọn)
          </label>
          <input
            id="gb-country"
            type="text"
            placeholder="Việt Nam, Hoa Kỳ, ..."
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            maxLength={100}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="gb-message">
          Lưu bút *
        </label>
        <textarea
          id="gb-message"
          placeholder="Ký gửi tâm tư, cảm nhận, lời chúc, hoặc bất cứ điều gì bạn muốn chia sẻ..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
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
        className="px-6 py-2.5 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Đang gửi...' : 'Gửi lưu bút'}
      </button>
    </motion.form>
  )
}
