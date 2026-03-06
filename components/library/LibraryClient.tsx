// components/library/LibraryClient.tsx — Client component
// Nhận data từ server (Server Component), xử lý filter/search/group ở client
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  Music,
  Video,
  Archive,
  File,
  BookOpen,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Search,
  ChevronDown,
} from 'lucide-react'
import type { DownloadItem } from '@/lib/api/downloads'

interface DownloadGroup {
  label: string
  year?: number
  items: DownloadItem[]
}

interface LibraryClientProps {
  initialItems: DownloadItem[]
  categories: string[]
}

/* Icon theo loại file */
function FileIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  switch (type) {
    case 'pdf': return <FileText className={className} />
    case 'mp3': return <Music className={className} />
    case 'mp4': return <Video className={className} />
    case 'zip': return <Archive className={className} />
    case 'epub':
    case 'doc': return <BookOpen className={className} />
    default: return <File className={className} />
  }
}

/* Badge màu theo loại file — palette vàng/trầm Phật giáo */
function typeBadgeClass(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-amber-500/10 text-amber-500'
    case 'mp3': return 'bg-gold/10 text-gold'
    case 'mp4': return 'bg-amber-700/10 text-amber-600'
    case 'zip': return 'bg-stone-500/10 text-stone-400'
    default: return 'bg-secondary text-muted-foreground'
  }
}

/* DownloadCard */
function DownloadCard({ item }: { item: DownloadItem }) {
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(212, 175, 55, 0.1)' }}
      className="group flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/40 transition-all duration-200"
    >
      <motion.div
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${typeBadgeClass(item.fileType)} group-hover:scale-110`}
        whileHover={{ scale: 1.15 }}
      >
        <FileIcon type={item.fileType} className="w-5 h-5" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug">
          {item.title}
        </p>

        {item.description && (
          <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{item.description}</p>
        )}

        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${typeBadgeClass(item.fileType)}`}>
            {item.fileType.toUpperCase()}
          </span>

          {item.fileSizeMB && (
            <span className="text-[10px] text-muted-foreground/60 font-medium">
              {item.fileSizeMB}MB
            </span>
          )}

          {item.isUpdating && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">
              <RefreshCw className="w-2.5 h-2.5" /> Cập nhật
            </span>
          )}
          {item.isNew && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gold font-semibold bg-gold/10 px-2 py-1 rounded-md">
              <Sparkles className="w-2.5 h-2.5" /> Mới
            </span>
          )}

          {item.notes && (
            <span className="text-[10px] text-muted-foreground/50 italic ml-auto">{item.notes}</span>
          )}
        </div>
      </div>

      <motion.div whileHover={{ x: 2 }} className="shrink-0 mt-1">
        <ExternalLink className="w-4 h-4 text-muted-foreground/30 group-hover:text-gold transition-colors shrink-0" />
      </motion.div>
    </motion.a>
  )
}

/* DownloadGroupSection — accordion */
function DownloadGroupSection({ group }: { group: DownloadGroup }) {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      className="rounded-2xl border border-border overflow-hidden bg-card hover:border-gold/20 transition-colors"
      whileHover={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 bg-card hover:bg-secondary/50 transition-all"
      >
        <div className="flex items-center gap-4 text-left">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/10 to-amber-500/5 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Archive className="w-5 h-5 text-gold" />
          </motion.div>
          <div>
            <p className="font-semibold text-foreground text-sm">{group.label}</p>
            <p className="text-xs text-muted-foreground/70">{group.items.length} tài liệu</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-3 border-t border-gold/10 bg-secondary/20">
              {group.items.map((item, idx) => (
                <motion.div
                  key={item.documentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <DownloadCard item={item} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* Main Client Component */
export default function LibraryClient({ initialItems, categories }: LibraryClientProps) {
  const [category, setCategory] = useState('Tất cả')
  const [search, setSearch] = useState('')

  // Lọc theo category và search (client-side)
  const filtered = initialItems
    .filter((i) => {
      if (category !== 'Tất cả' && i.category !== category) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          i.title.toLowerCase().includes(q) ||
          (i.description ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })

  // Gom nhóm
  const groupMap = new Map<string, DownloadGroup>()
  for (const item of filtered) {
    const key = item.groupLabel || (item.groupYear ? String(item.groupYear) : 'Chung')
    if (!groupMap.has(key)) {
      groupMap.set(key, { label: key, year: item.groupYear ?? undefined, items: [] })
    }
    groupMap.get(key)!.items.push(item)
  }
  const groups: DownloadGroup[] = Array.from(groupMap.values())
    .sort((a, b) => {
      if (a.label === 'Chung') return 1
      if (b.label === 'Chung') return -1
      return (b.year ?? 9999) - (a.year ?? 9999)
    })

  return (
    <>
      {/* Animated Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Thư Viện Tài Liệu Miễn Phí</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Tài Liệu Tu Học</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Tổng hợp kinh điển, khai thị, audio, video và tài liệu tu học của Pháp Môn Tâm Linh.
          Tất cả được phát hành <strong className="text-foreground">hoàn toàn miễn phí</strong>.
        </p>
      </motion.div>

      {/* Info Banner — palette vàng/trầm */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-gold/5 to-amber-500/5 border border-gold/10"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">Tải Tài Liệu Miễn Phí</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tất cả tài liệu được cung cấp <strong className="text-foreground">hoàn toàn miễn phí</strong> — không bao giờ yêu cầu đóng tiền.
              Truy cập bất kỳ lúc nào để download, chia sẻ với bạn bè, và học tập.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10 p-5 rounded-2xl bg-card border border-border"
      >
        <h3 className="text-sm font-medium text-foreground mb-4">Tìm Kiếm & Lọc</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nhập tên tài liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${category === cat
                  ? 'bg-gold text-black shadow-lg shadow-gold/30'
                  : 'bg-secondary border border-border text-muted-foreground hover:border-gold/40 hover:text-gold'
                  }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 rounded-2xl bg-card border border-border"
          >
            <Download className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              {search ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu trong mục này'}
            </p>
            <p className="text-muted-foreground text-sm">
              {search ? 'Thử tìm kiếm bằng từ khóa khác' : 'Vui lòng quay lại sau'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {groups.map((group, idx) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <DownloadGroupSection group={group} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Stats Footer */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-8 border-t border-border/30 text-center"
        >
          <p className="text-xs text-muted-foreground/60">
            Hiển thị <strong className="text-foreground">{filtered.length}</strong> tài liệu trong <strong className="text-foreground">{groups.length}</strong> nhóm
          </p>
        </motion.div>
      )}
    </>
  )
}
