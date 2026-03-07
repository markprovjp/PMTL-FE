// components/hub/DownloadRow.tsx
import { ExternalLink, RefreshCw, Sparkles, FileText, Music, Video, Archive, File, BookOpen } from 'lucide-react'
import type { DownloadItem } from '@/types/strapi'

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4" />
    case 'mp3': return <Music className="w-4 h-4" />
    case 'mp4': return <Video className="w-4 h-4" />
    case 'zip': return <Archive className="w-4 h-4" />
    case 'epub':
    case 'doc': return <BookOpen className="w-4 h-4" />
    default: return <File className="w-4 h-4" />
  }
}

function typeBadgeClass(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-amber-500/10 text-amber-500'
    case 'mp3': return 'bg-gold/10 text-gold'
    case 'mp4': return 'bg-amber-700/10 text-amber-600'
    case 'zip': return 'bg-stone-500/10 text-stone-400'
    default: return 'bg-secondary text-muted-foreground'
  }
}

export default function DownloadRow({ item }: { item: DownloadItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-4 rounded-xl hover:bg-gold/5 transition-colors border-b border-border/30 last:border-b-0"
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeBadgeClass(item.fileType)} group-hover:scale-105 transition-transform`}>
        <FileIcon type={item.fileType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground group-hover:text-gold transition-colors truncate">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase ${typeBadgeClass(item.fileType)}`}>
            {item.fileType.toUpperCase()}
          </span>
          {item.fileSizeMB && (
            <span className="text-[10px] text-muted-foreground/50">{item.fileSizeMB}MB</span>
          )}
          {item.isUpdating && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
              <RefreshCw className="w-2.5 h-2.5" /> Đang cập nhật
            </span>
          )}
          {item.isNew && (
            <span className="flex items-center gap-0.5 text-[10px] text-gold font-semibold">
              <Sparkles className="w-2.5 h-2.5" /> Mới
            </span>
          )}
          {item.notes && (
            <span className="text-[10px] text-muted-foreground/50 italic">{item.notes}</span>
          )}
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-gold transition-colors shrink-0" />
    </a>
  )
}
